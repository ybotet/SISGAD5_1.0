package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

const SERVICE_NAME = "backend-materiales"

var (
	HttpRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total de peticiones HTTP al servicio de materiales",
		},
		[]string{"service", "route", "method", "status"},
	)

	HttpRequestDurationSeconds = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "Duración de peticiones HTTP al servicio de materiales en segundos",
			Buckets: prometheus.ExponentialBucketsRange(0.005, 10, 10),
		},
		[]string{"service", "route", "method"},
	)

	ConsumosRegistradosTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "consumos_registrados_total",
			Help: "Total de consumos registrados",
		},
		[]string{"service"},
	)

	AsignacionesTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "asignaciones_total",
			Help: "Total de asignaciones creadas",
		},
		[]string{"service"},
	)
)

func IncConsumos() {
	ConsumosRegistradosTotal.WithLabelValues(SERVICE_NAME).Inc()
}

func IncAsignaciones() {
	AsignacionesTotal.WithLabelValues(SERVICE_NAME).Inc()
}
