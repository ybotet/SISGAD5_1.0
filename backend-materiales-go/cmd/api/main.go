package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"

	// Importar nuestros paquetes internos
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/handlers"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/repositories/postgres"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/services"
)

func main() {
    // ========================================
    // 1. INICIALIZACIÓN DEL LOGGER
    // ========================================
    logger := log.New(os.Stdout, "[materiales] ", log.LstdFlags|log.Lshortfile)
    logger.Println("Iniciando servicio de materiales...")

    // ========================================
    // 2. CARGAR VARIABLES DE ENTORNO
    // ========================================
    if err := godotenv.Load(); err != nil {
        logger.Println("⚠️  Archivo .env no encontrado, usando variables del sistema")
    }

    // ========================================
    // 3. CONEXIÓN A LA BASE DE DATOS
    // ========================================
    logger.Println("📦 Conectando a PostgreSQL...")
    if err := postgres.InitDB(); err != nil {
        logger.Fatal("❌ Error conectando a BD:", err)
    }
    defer func() {
        if err := postgres.CloseDB(); err != nil {
            logger.Println("⚠️  Error cerrando BD:", err)
        } else {
            logger.Println("✅ Conexión a BD cerrada correctamente")
        }
    }()

    // ========================================
    // 4. CREAR REPOSITORIOS
    // ========================================
    logger.Println("📁 Inicializando repositorios...")
    materialRepo := postgres.NewMaterialRepository()
    asignacionRepo := postgres.NewAsignacionRepository()
    consumoRepo := postgres.NewConsumoRepository()

    // ========================================
    // 5. CREAR SERVICIOS (inyección de dependencias)
    // ========================================
    logger.Println("⚙️  Inicializando servicios...")
    materialService := services.NewMaterialService(materialRepo)
    asignacionService := services.NewAsignacionService(asignacionRepo, materialRepo)
    consumoService := services.NewConsumoService(consumoRepo, materialRepo, asignacionRepo)

    // ========================================
    // 6. CREAR HANDLERS
    // ========================================
    logger.Println("🎮 Inicializando handlers...")
    materialHandler := handlers.NewMaterialHandler(materialService)
    asignacionHandler := handlers.NewAsignacionHandler(asignacionService)
    consumoHandler := handlers.NewConsumoHandler(consumoService)
    dashboardHandler := handlers.NewDashboardHandler(consumoService, materialService)

    // ========================================
    // 7. CONFIGURAR RUTAS (ROUTER)
    // ========================================
    logger.Println("🛣️  Configurando rutas...")
    r := mux.NewRouter()

    // Middleware de logging (muestra cada petición)
    r.Use(func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            start := time.Now()
            logger.Printf("→ %s %s", r.Method, r.URL.Path)
            next.ServeHTTP(w, r)
            logger.Printf("← %s %s (%v)", r.Method, r.URL.Path, time.Since(start))
        })
    })

    // Middleware de recuperación (evita que el servidor caiga por pánicos)
    r.Use(func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            defer func() {
                if err := recover(); err != nil {
                    logger.Printf("🔥 PANIC: %v", err)
                    http.Error(w, "Internal Server Error", http.StatusInternalServerError)
                }
            }()
            next.ServeHTTP(w, r)
        })
    })

    // Health check (sin autenticación)
    r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusOK)
        w.Write([]byte(`{
            "status": "ok",
            "service": "materiales",
            "timestamp": "` + time.Now().Format(time.RFC3339) + `",
            "version": "1.0.0"
        }`))
    }).Methods("GET")

    // API v1
    api := r.PathPrefix("/api/materiales").Subrouter()

    // --- Rutas de materiales ---
    api.HandleFunc("/materiales", materialHandler.Listar).Methods("GET")
    api.HandleFunc("/materiales/{id:[0-9]+}", materialHandler.Obtener).Methods("GET")
    api.HandleFunc("/materiales", materialHandler.Crear).Methods("POST")
    api.HandleFunc("/materiales/{id:[0-9]+}", materialHandler.Actualizar).Methods("PUT")
    api.HandleFunc("/materiales/{id:[0-9]+}", materialHandler.Eliminar).Methods("DELETE")

    // --- Rutas de asignaciones ---
    api.HandleFunc("/asignaciones", asignacionHandler.CrearAsignacion).Methods("POST")
    api.HandleFunc("/asignaciones/trabajador/{id:[0-9]+}", asignacionHandler.ListarPorTrabajador).Methods("GET")
    api.HandleFunc("/asignaciones/{id:[0-9]+}", asignacionHandler.ObtenerAsignacion).Methods("GET")
    api.HandleFunc("/asignaciones/{id:[0-9]+}", asignacionHandler.ActualizarAsignacion).Methods("PUT")
    api.HandleFunc("/asignaciones/{id:[0-9]+}", asignacionHandler.EliminarAsignacion).Methods("DELETE")

    // --- Rutas de consumos ---
    api.HandleFunc("/consumos", consumoHandler.CrearConsumo).Methods("POST")
    api.HandleFunc("/consumos/trabajo/{id:[0-9]+}", consumoHandler.ListarPorTrabajo).Methods("GET")
    api.HandleFunc("/consumos/trabajador/{id:[0-9]+}", consumoHandler.ListarPorTrabajador).Methods("GET")
    api.HandleFunc("/consumos/{id:[0-9]+}", consumoHandler.ObtenerConsumo).Methods("GET")
    api.HandleFunc("/consumos/{id:[0-9]+}", consumoHandler.ActualizarConsumo).Methods("PUT")
    api.HandleFunc("/consumos/{id:[0-9]+}", consumoHandler.EliminarConsumo).Methods("DELETE")

    // --- Rutas de dashboard ---
    // api.HandleFunc("/dashboard/trabajador/{id:[0-9]+}", dashboardHandler.ResumenTrabajador).Methods("GET")
    api.HandleFunc("/dashboard/materiales", dashboardHandler.ResumenMateriales).Methods("GET")
    api.HandleFunc("/dashboard/alertas", dashboardHandler.AlertasGlobales).Methods("GET")
    api.HandleFunc("/dashboard/general", dashboardHandler.ResumenGeneral).Methods("GET")

    // ========================================
    // 8. CONFIGURAR CORS (para que React pueda llamar)
    // ========================================
    logger.Println("🌐 Configurando CORS...")
    c := cors.New(cors.Options{
        AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:5000"},
        AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders:   []string{"Content-Type", "Authorization"},
        AllowCredentials: true,
        Debug:            false,
    })

    handler := c.Handler(r)

    // ========================================
    // 9. CONFIGURAR SERVIDOR HTTP
    // ========================================
    port := os.Getenv("PORT")
    if port == "" {
        port = "5003"
        logger.Println("⚠️  PORT no definido, usando 5003 por defecto")
    }

    server := &http.Server{
        Addr:         ":" + port,
        Handler:      handler,
        ReadTimeout:  10 * time.Second,    // Tiempo reducido para lectura
        WriteTimeout: 10 * time.Second,    // Tiempo reducido para escritura
        IdleTimeout:  30 * time.Second,    // Tiempo reducido para inactividad
    }

    // ========================================
    // 10. INICIAR SERVIDOR (con graceful shutdown)
    // ========================================
    logger.Printf("✅ Servicio de Materiales listo en puerto %s", port)
    logger.Println("📚 Endpoints disponibles en /api/v1/")

    // Canal para escuchar señales de terminación (Ctrl+C, SIGTERM)
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

    // Iniciar servidor en una goroutine
    go func() {
        if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            logger.Fatalf("❌ Error iniciando servidor: %v", err)
        }
    }()

    logger.Println("🟢 Servidor corriendo. Presiona Ctrl+C para detener.")

    // Esperar señal de terminación
    <-quit
    logger.Println("🛑 Señal de terminación recibida. Deteniendo servidor...")

    // Dar tiempo para que las peticiones en curso terminen (30 segundos máximo)
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := server.Shutdown(ctx); err != nil {
        logger.Fatalf("❌ Error en shutdown: %v", err)
    }

    logger.Println("✅ Servidor detenido correctamente")
}