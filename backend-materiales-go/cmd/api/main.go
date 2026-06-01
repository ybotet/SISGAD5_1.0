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
	slog "github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/logger"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/repositories/postgres"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/services"
)

func main() {
    // ========================================
    // 1. INICIALIZACIÓN DEL LOGGER
    // ========================================
    if err := slog.Init(os.Getenv("SERVICE_NAME")); err != nil {
        log.Fatalf("error inicializando logger: %v", err)
    }
    slog.Informacion("Iniciando servicio de materiales...")

    // ========================================
    // 2. CARGAR VARIABLES DE ENTORNO
    // ========================================
    if err := godotenv.Load(); err != nil {
        slog.Alerta("⚠️  Archivo .env no encontrado, usando variables del sistema")
    }

    // ========================================
    // 3. CONEXIÓN A LA BASE DE DATOS
    // ========================================
    slog.Informacion("📦 Conectando a PostgreSQL...")
    if err := postgres.InitDB(); err != nil {
        slog.Errorf("❌ Error conectando a BD: %v", err)
        os.Exit(1)
    }
    defer func() {
        if err := postgres.CloseDB(); err != nil {
            slog.Errorf("⚠️  Error cerrando BD: %v", err)
        } else {
            slog.Informacion("✅ Conexión a BD cerrada correctamente")
        }
    }()

    // ========================================
    // 4. CREAR REPOSITORIOS
    // ========================================
    slog.Informacion("📁 Inicializando repositorios...")
    materialRepo := postgres.NewMaterialRepository()
    asignacionRepo := postgres.NewAsignacionRepository(materialRepo)
    consumoRepo := postgres.NewConsumoRepository()
    unidadMedidaRepo := postgres.NewUnidadMedidaRepository()
    categoriaMaterialRepo := postgres.NewCategoriaMaterialRepository()

    // ========================================
    // 5. CREAR SERVICIOS (inyección de dependencias)
    // ========================================
    slog.Informacion("⚙️  Inicializando servicios...")
    materialService := services.NewMaterialService(materialRepo)
    asignacionService := services.NewAsignacionService(asignacionRepo, materialRepo)
    consumoService := services.NewConsumoService(consumoRepo, materialRepo, asignacionRepo)
    stockService := services.NewStockService(asignacionService, consumoService, materialService)
    unidadMedidaService := services.NewUnidadMedidaService(unidadMedidaRepo)
    categoriaMaterialService := services.NewCategoriaMaterialService(categoriaMaterialRepo) 
    
    // 6. CREAR HANDLERS
    // ========================================
    slog.Informacion("🎮 Inicializando handlers...")
    materialHandler := handlers.NewMaterialHandler(materialService)
    asignacionHandler := handlers.NewAsignacionHandler(asignacionService)
    consumoHandler := handlers.NewConsumoHandler(consumoService)
    dashboardHandler := handlers.NewDashboardHandler(consumoService, materialService, asignacionService, stockService)
    unidadMedidaHandler := handlers.NewUnidadMedidaHandler(unidadMedidaService)
    categoriaMaterialHandler := handlers.NewCategoriaMaterialHandler(categoriaMaterialService)

    // ========================================
    // 7. CONFIGURAR RUTAS (ROUTER)
    // ========================================
    slog.Informacion("🛣️  Configurando rutas...")
    r := mux.NewRouter()

    // Middleware de logging (muestra cada petición)
    r.Use(func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            start := time.Now()
            slog.Informacionf("→ %s %s", r.Method, r.URL.Path)
            next.ServeHTTP(w, r)
            slog.Informacionf("← %s %s (%v)", r.Method, r.URL.Path, time.Since(start))
        })
    })

    // Middleware de recuperación (evita que el servidor caiga por pánicos)
    r.Use(func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            defer func() {
                if err := recover(); err != nil {
                    slog.Errorf("🔥 PANIC: %v", err)
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
    api.HandleFunc("/materiales/todos", materialHandler.ListarTodos).Methods("GET")

    // --- Rutas de asignaciones ---
    api.HandleFunc("/asignaciones", asignacionHandler.ListarAsignaciones).Methods("GET")
    api.HandleFunc("/asignaciones", asignacionHandler.CrearAsignacion).Methods("POST")
    api.HandleFunc("/asignaciones/trabajador/{id:[0-9]+}", asignacionHandler.ListarPorTrabajador).Methods("GET")
    api.HandleFunc("/asignaciones/{id:[0-9]+}", asignacionHandler.ObtenerAsignacion).Methods("GET")
    api.HandleFunc("/asignaciones/{id:[0-9]+}", asignacionHandler.ActualizarAsignacion).Methods("PUT")
    api.HandleFunc("/asignaciones/{id:[0-9]+}", asignacionHandler.EliminarAsignacion).Methods("DELETE")

    // --- Rutas de consumos ---
    api.HandleFunc("/consumos", consumoHandler.ListarConsumos).Methods("GET")
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
    api.HandleFunc("/dashboard/stock-trabajadores", dashboardHandler.StockTrabajadores).Methods("GET")

    // --- Rutas de nomencladores (unidades de medida) ---
    // Aquí podríamos agregar rutas para gestionar unidades de medida, tipos de materiales, etc.
    api.HandleFunc("/unidades-medida", unidadMedidaHandler.Listar).Methods("GET")
    api.HandleFunc("/unidades-medida/{id:[0-9]+}", unidadMedidaHandler.Obtener).Methods("GET")
    api.HandleFunc("/unidades-medida", unidadMedidaHandler.Crear).Methods("POST")
    api.HandleFunc("/unidades-medida/{id:[0-9]+}", unidadMedidaHandler.Actualizar).Methods("PUT")
    api.HandleFunc("/unidades-medida/{id:[0-9]+}", unidadMedidaHandler.Eliminar).Methods("DELETE")

    // --- Rutas de nomencladores (categorías de material) ---
    api.HandleFunc("/categorias-material/paginated", categoriaMaterialHandler.ListarPaginado).Methods("GET")
    api.HandleFunc("/categorias-material", categoriaMaterialHandler.Listar).Methods("GET")
    api.HandleFunc("/categorias-material/{id:[0-9]+}", categoriaMaterialHandler.Obtener).Methods("GET")
    api.HandleFunc("/categorias-material", categoriaMaterialHandler.Crear).Methods("POST")
    api.HandleFunc("/categorias-material/{id:[0-9]+}", categoriaMaterialHandler.Actualizar).Methods("PUT")
    api.HandleFunc("/categorias-material/{id:[0-9]+}", categoriaMaterialHandler.Eliminar).Methods("DELETE")


    // ========================================
    // 8. CONFIGURAR CORS (para que React pueda llamar)
    // ========================================
    slog.Informacion("🌐 Configurando CORS...")
    c := cors.New(cors.Options{
        AllowedOrigins:   []string{"http://localhost:5004", "http://localhost:5000"},
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
        slog.Alerta("⚠️  PORT no definido, usando 5003 por defecto")
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
    slog.Informacionf("✅ Servicio de Materiales listo en puerto %s", port)
    slog.Informacion("📚 Endpoints disponibles en /api/v1/")

    // Canal para escuchar señales de terminación (Ctrl+C, SIGTERM)
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

    // Iniciar servidor en una goroutine
    go func() {
        if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            slog.Errorf("❌ Error iniciando servidor: %v", err)
            os.Exit(1)
        }
    }()

    slog.Informacion("🟢 Servidor corriendo. Presiona Ctrl+C para detener.")

    // Esperar señal de terminación
    <-quit
    slog.Informacion("🛑 Señal de terminación recibida. Deteniendo servidor...")

    // Dar tiempo para que las peticiones en curso terminen (30 segundos máximo)
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := server.Shutdown(ctx); err != nil {
        slog.Errorf("❌ Error en shutdown: %v", err)
    }

    slog.Informacion("✅ Servidor detenido correctamente")
}