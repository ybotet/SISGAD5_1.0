---
name: go-testing-patterns
description: Patrones de testing en Go con testing nativo, table-driven tests y mocks.
---

# Patrones de Testing en Go

## Objetivo
Escribir tests idiomáticos en Go para servicios críticos.

## Proceso

1. **Usa el paquete `testing` nativo:**
   ```go
   package services

   import "testing"

   func TestDescontarMaterial(t *testing.T) {
       // ...
   }
    ```

2. Usa table-driven tests para múltiples casos:
```go
func TestValidarStock(t *testing.T) {
    tests := []struct {
        name     string
        stock    int
        cantidad int
        want     bool
    }{
        {"stock suficiente", 10, 5, true},
        {"stock insuficiente", 3, 5, false},
        {"stock exacto", 5, 5, true},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := validarStock(tt.stock, tt.cantidad)
            if got != tt.want {
                t.Errorf("validarStock() = %v, want %v", got, tt.want)
            }
        })
    }
}
```

3. Usa interfaces para mocks:
```go
type Repositorio interface {
    ObtenerStock(id int) (int, error)
}
```

**Verificación**

- go test ./... pasa.
- Los tests cubren casos límite (stock 0, stock exacto, stock insuficiente).