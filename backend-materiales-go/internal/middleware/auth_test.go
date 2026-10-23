package middleware

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/require"
)

const testSecret = "clave_secreta_para_validar_jwt_de_prueba_min_32_chars"

// TestAuthMiddleware_SinToken verifica que sin token se devuelve 401.
func TestAuthMiddleware_SinToken(t *testing.T) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	wrapped := AuthMiddleware(testSecret)(handler)

	req := httptest.NewRequest("GET", "/api/test", nil)
	rr := httptest.NewRecorder()
	wrapped.ServeHTTP(rr, req)

	require.Equal(t, http.StatusUnauthorized, rr.Code)
}

// TestAuthMiddleware_TokenInvalido verifica que con un token inválido se devuelve 401.
func TestAuthMiddleware_TokenInvalido(t *testing.T) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	wrapped := AuthMiddleware(testSecret)(handler)

	req := httptest.NewRequest("GET", "/api/test", nil)
	req.Header.Set("Authorization", "Bearer token_invalido_12345")
	rr := httptest.NewRecorder()
	wrapped.ServeHTTP(rr, req)

	require.Equal(t, http.StatusUnauthorized, rr.Code)
}

// TestAuthMiddleware_TokenValido verifica que con un token válido la ruta se ejecuta (200).
func TestAuthMiddleware_TokenValido(t *testing.T) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.RegisteredClaims{
		Subject: "1",
	})
	tokenString, err := token.SignedString([]byte(testSecret))
	require.NoError(t, err)

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})
	wrapped := AuthMiddleware(testSecret)(handler)

	req := httptest.NewRequest("GET", "/api/test", nil)
	req.Header.Set("Authorization", "Bearer "+tokenString)
	rr := httptest.NewRecorder()
	wrapped.ServeHTTP(rr, req)

	require.Equal(t, http.StatusOK, rr.Code)
	require.Equal(t, `{"status":"ok"}`, strings.TrimSpace(rr.Body.String()))
}

// TestAuthMiddleware_HeaderMalFormado verifica que un header Authorization sin "Bearer " devuelve 401.
func TestAuthMiddleware_HeaderMalFormado(t *testing.T) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	wrapped := AuthMiddleware(testSecret)(handler)

	req := httptest.NewRequest("GET", "/api/test", nil)
	req.Header.Set("Authorization", "token_sin_bearer")
	rr := httptest.NewRecorder()
	wrapped.ServeHTTP(rr, req)

	require.Equal(t, http.StatusUnauthorized, rr.Code)
}
