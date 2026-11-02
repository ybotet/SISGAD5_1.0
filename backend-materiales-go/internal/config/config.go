package config

import (
	"fmt"
	"os"
)

// GetJWTSecret retorna el secreto JWT desde las variables de entorno.
func GetJWTSecret() string {
	return os.Getenv("JWT_SECRET")
}

// ValidarEnv verifica que las variables de entorno críticas estén definidas
// y cumplan con los requisitos mínimos de seguridad.
// Falla al arranque si JWT_SECRET falta o tiene menos de 32 caracteres.
func ValidarEnv() error {
	jwtSecret := GetJWTSecret()
	if jwtSecret == "" {
		return fmt.Errorf("JWT_SECRET no está definida en las variables de entorno")
	}
	if len(jwtSecret) < 32 {
		return fmt.Errorf("JWT_SECRET debe tener al menos 32 caracteres (tiene %d)", len(jwtSecret))
	}
	return nil
}
