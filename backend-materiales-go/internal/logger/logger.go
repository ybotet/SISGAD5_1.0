package logger

import (
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
)

var (
    informacion *log.Logger
    alerta      *log.Logger
    errorLog    *log.Logger
)

func Init(serviceName string) error {
    if serviceName == "" {
        serviceName = "materiales"
    }

    baseDir := filepath.Join(".", "logs")
    if err := os.MkdirAll(baseDir, 0o755); err != nil {
        return fmt.Errorf("error creando directorio de logs: %w", err)
    }

    serviceFile, err := os.OpenFile(filepath.Join(baseDir, serviceName+".log"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o644)
    if err != nil {
        return fmt.Errorf("error abriendo archivo de logs de servicio: %w", err)
    }

    systemFile, err := os.OpenFile(filepath.Join(baseDir, "system.log"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o644)
    if err != nil {
        return fmt.Errorf("error abriendo archivo de logs del sistema: %w", err)
    }

    multi := io.MultiWriter(os.Stdout, serviceFile, systemFile)

    informacion = log.New(multi, "[INFORMACION] ", log.LstdFlags|log.Lshortfile)
    alerta = log.New(multi, "[ALERTA] ", log.LstdFlags|log.Lshortfile)
    errorLog = log.New(multi, "[ERROR] ", log.LstdFlags|log.Lshortfile)

    return nil
}

func Informacion(v ...interface{}) {
    if informacion != nil {
        informacion.Println(v...)
    }
}

func Informacionf(format string, v ...interface{}) {
    if informacion != nil {
        informacion.Output(2, fmt.Sprintf(format, v...))
    }
}

func Alerta(v ...interface{}) {
    if alerta != nil {
        alerta.Println(v...)
    }
}

func Error(v ...interface{}) {
    if errorLog != nil {
        errorLog.Println(v...)
    }
}

func Errorf(format string, v ...interface{}) {
    if errorLog != nil {
        errorLog.Output(2, fmt.Sprintf(format, v...))
    }
}
