package config

import (
	"os"
	"testing"

	"github.com/stretchr/testify/require"
)

// TestValidarEnv_Valida verifica que ValidarEnv retorna nil cuando JWT_SECRET es válido.
func TestValidarEnv_Valida(t *testing.T) {
	os.Setenv("JWT_SECRET", "clave_secreta_para_validar_jwt_de_prueba_min_32_chars")
	defer os.Unsetenv("JWT_SECRET")
	require.NoError(t, ValidarEnv())
}

// TestValidarEnv_Faltante verifica que ValidarEnv retorna error cuando JWT_SECRET falta.
func TestValidarEnv_Faltante(t *testing.T) {
	os.Unsetenv("JWT_SECRET")
	err := ValidarEnv()
	require.Error(t, err)
	require.Contains(t, err.Error(), "no está definida")
}

// TestValidarEnv_DemasiadoCorta verifica que ValidarEnv retorna error cuando JWT_SECRET es muy corta.
func TestValidarEnv_DemasiadoCorta(t *testing.T) {
	os.Setenv("JWT_SECRET", "secreto")
	defer os.Unsetenv("JWT_SECRET")
	err := ValidarEnv()
	require.Error(t, err)
	require.Contains(t, err.Error(), "al menos 32 caracteres")
}

// TestGetJWTSecret verifica que GetJWTSecret retorna el valor correcto.
func TestGetJWTSecret(t *testing.T) {
	expected := "clave_secreta_para_validar_jwt_de_prueba_min_32_chars"
	os.Setenv("JWT_SECRET", expected)
	defer os.Unsetenv("JWT_SECRET")
	require.Equal(t, expected, GetJWTSecret())
}
