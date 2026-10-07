---
name: sisgad-go-audit
description: Áreas críticas a auditar en proyectos Go con Gorilla/mux o Gin y GORM.
---

# Auditoría de Go

## 1. Manejo de Errores
- Busca errores ignorados con `_`.
- Verifica que los errores se propaguen con contexto (`fmt.Errorf("...: %w", err)`).
- ¿Se usan errores personalizados para casos de negocio?

## 2. Concurrencia
- **Goroutines:** ¿Hay fugas de goroutines (sin `WaitGroup` o canales de cierre)?
- **Canales:** ¿Se usan correctamente? ¿Hay riesgo de deadlock?
- **Race conditions:** ¿Se protegen los datos compartidos con mutex?

## 3. Base de Datos (GORM)
- **Transacciones:** Verifica que las operaciones críticas (descuento de materiales) usen transacciones.
- **Consultas:** ¿Hay consultas N+1 o falta de índices?
- **Migraciones:** ¿Se gestionan correctamente?

## 4. API
- ¿Se validan los datos de entrada?
- ¿Se devuelven códigos HTTP correctos?
- ¿Hay middleware de autenticación?

## 5. Calidad de Código
- ¿Sigue las convenciones idiomáticas de Go?
- ¿Hay código muerto o funciones no utilizadas?
- ¿Se usa `context.Context` para timeouts y cancelación?