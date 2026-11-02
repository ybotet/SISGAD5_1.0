package postgres

import (
	"fmt"
	"os"
	"time"

	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/logger"
	// No importes los modelos aquí si no los necesitas para AutoMigrate

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() error {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	sslmode := os.Getenv("DB_SSLMODE")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=UTC",
		host, user, password, dbname, port, sslmode)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		SkipDefaultTransaction: true,
		// Deshabilitar logging de GORM para que no interfiera
		Logger: nil,
	})
	if err != nil {
		return fmt.Errorf("Error conectando a la base de datos: %w", err)
	}

	// Obtener la conexión SQL subyacente
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("Error obteniendo conexión subyacente: %w", err)
	}

	// Configurar pool de conexiones
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Verificar conexión
	err = sqlDB.Ping()
	if err != nil {
		return fmt.Errorf("Error haciendo ping a la base de datos: %w", err)
	}

	logger.Informacion("Conexión a la base de datos exitosa (GORM)")
	logger.Informacion("⚠️ Auto-migración DESHABILITADA - usando esquema existente")
	return nil
}

// CloseDB cierra la conexión
func CloseDB() error {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err != nil {
			return err
		}
		return sqlDB.Close()
	}
	return nil
}