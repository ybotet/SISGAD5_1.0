package postgres

import (
	"fmt"
	"log"
	"os"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

var DB *sqlx.DB

func InitDB() error {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	sslmode := os.Getenv("DB_SSLMODE")

	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s", user, password, host, port, dbname, sslmode)
	var err error
	DB, err = sqlx.Connect("postgres", connStr)
	if err != nil {
		return fmt.Errorf("Error conectando a la base de datos: %w", err)
	}
	
	err = DB.Ping()
	if err != nil {
		return fmt.Errorf("Error haciendo ping a la base de datos: %w", err)
	}

	log.Println("Conexión a la base de datos exitosa")
	return nil
}

// CloseDB cierra la conexión (útil para graceful shutdown)
func CloseDB() error {
    if DB != nil {
        return DB.Close()
    }
    return nil
}