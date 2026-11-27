package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/getsentry/sentry-go"
)

var sentryInitialized bool

// InitSentry inicializa Sentry SOLO si SENTRY_DSN_MATERIALS está definida.
// Es no-op si falta el DSN o la dependencia (no rompe el arranque).
func InitSentry() {
	dsn := os.Getenv("SENTRY_DSN_MATERIALS")
	if dsn == "" {
		sentryInitialized = false
		return
	}
	env := os.Getenv("SENTRY_ENVIRONMENT")
	if env == "" {
		env = os.Getenv("APP_ENV")
	}
	if env == "" {
		env = "development"
	}
	release := os.Getenv("SENTRY_RELEASE")
	if release == "" {
		release = os.Getenv("GIT_SHA")
	}
	if release == "" {
		release = "unknown"
	}
	isProd := env == "production"
	traces := 0.0
	if v := os.Getenv("SENTRY_TRACES_SAMPLE_RATE"); v != "" {
		if f, err := strconv.ParseFloat(v, 64); err == nil {
			traces = f
		}
	} else if isProd {
		traces = 0.1
	}

	err := sentry.Init(sentry.ClientOptions{
		Dsn:              dsn,
		Environment:      env,
		Release:          release,
		TracesSampleRate: traces,
		BeforeSend: func(event *sentry.Event, hint *sentry.EventHint) *sentry.Event {
			return scrubEvent(event)
		},
	})
	if err != nil {
		fmt.Printf("[sentry] No se pudo inicializar (materiales): %v\n", err)
		sentryInitialized = false
		return
	}
	sentryInitialized = true
	fmt.Println("[sentry] Inicializado (materiales)")
}

// scrubEvent elimina PII (headers Authorization/Cookie, query, email).
func scrubEvent(event *sentry.Event) *sentry.Event {
	if event == nil {
		return event
	}
	if event.Request != nil {
		if event.Request.Headers != nil {
			delete(event.Request.Headers, "Authorization")
			delete(event.Request.Headers, "Cookie")
			delete(event.Request.Headers, "X-User-Email")
		}
		event.Request.Cookies = ""
		event.Request.QueryString = ""
	}
	if event.User.Email != "" {
		event.User.Email = ""
	}
	if event.User.IPAddress != "" {
		event.User.IPAddress = ""
	}
	return event
}

// FlushSentry espera a que se envíen los eventos pendientes (llamar en shutdown).
func FlushSentry() {
	if sentryInitialized {
		sentry.Flush(2 * time.Second)
	}
}

// SentryMiddleware captura panics y errores 5xx. Va DESPUÉS del logger.
type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (r *statusRecorder) WriteHeader(code int) {
	r.status = code
	r.ResponseWriter.WriteHeader(code)
}

func SentryMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Recuperar panics y capturarlos en Sentry.
		defer func() {
			if rec := recover(); rec != nil {
				if sentryInitialized {
					sentry.CurrentHub().Recover(rec)
					sentry.Flush(2 * time.Second)
				}
				// Re-lanzar para que el servidor cierre la conexión (no dejar colgado).
				panic(rec)
			}
		}()

		rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(rec, r)

		// Capturar errores 5xx (excepto 501 Not Implemented).
		if sentryInitialized && rec.status >= 500 && rec.status != http.StatusNotImplemented {
			sentry.WithScope(func(scope *sentry.Scope) {
				scope.SetTag("http.method", r.Method)
				scope.SetTag("http.path", r.URL.Path)
				scope.SetLevel(sentry.LevelError)
				sentry.CaptureMessage(fmt.Sprintf("HTTP %d en %s %s", rec.status, r.Method, r.URL.Path))
			})
		}
	})
}