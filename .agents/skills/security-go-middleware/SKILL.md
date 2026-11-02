---
name: security-go-middleware
description: Añade middleware JWT y RBAC a servicios en Go.
---

# Middleware de Seguridad en Go

## Objetivo
Añadir validación de JWT y control de roles a un servicio Go que no tiene autenticación.

## Proceso

1. **Añade la dependencia de JWT:**
```bash
go get github.com/golang-jwt/jwt/v5
```

2. Crea el middleware de autenticación:
func AuthMiddleware(secret string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            auth := r.Header.Get("Authorization")
            if !strings.HasPrefix(auth, "Bearer ") {
                http.Error(w, "Unauthorized", http.StatusUnauthorized)
                return
            }
            tokenString := strings.TrimPrefix(auth, "Bearer ")
            token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
                return []byte(secret), nil
            })
            if err != nil || !token.Valid {
                http.Error(w, "Unauthorized", http.StatusUnauthorized)
                return
            }
            next.ServeHTTP(w, r)
        })
    }
}

3. Añade el middleware a las rutas protegidas.

4. Verifica que las rutas protegidas devuelven 401 sin token.

**Verificación**
- Sin token → 401.
- Con token inválido → 401.
- Con token válido → la ruta se ejecuta.
- El secreto se lee de variable de entorno, no está hardcodeado.