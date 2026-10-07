---
name: microservices-audit
description: Áreas críticas a auditar en sistemas de microservicios. Aplica cuando el proyecto tenga múltiples servicios comunicándose.
---

# Auditoría de Microservicios

## 1. Consistencia de Contratos de API
- Verifica que las rutas del **API Gateway** coincidan con las rutas reales de cada microservicio.
- Busca discrepancias en formatos de respuesta entre servicios.
- Revisa consistencia de códigos HTTP y mensajes de error.

## 2. Comunicación entre Servicios
- ¿Cómo se comunican los servicios? (HTTP directo, colas, BD compartida).
- ¿Hay manejo de fallos cuando un servicio downstream no responde?
- ¿Existen timeouts y retries configurados?
- ¿Hay acoplamiento excesivo entre servicios?

## 3. Transacciones Distribuidas
- ¿Cómo se mantiene la integridad de datos entre servicios? (ej. descuento de materiales al cerrar un trabajo).
- ¿Se usan transacciones o compensaciones (Saga pattern)?
- ¿Hay riesgo de condiciones de carrera?

## 4. Seguridad en la Frontera
- ¿Cada servicio valida el JWT por sí mismo, o confía ciegamente en el Gateway?
- ¿Los servicios internos son accesibles directamente desde fuera de la red?
- ¿Los roles RBAC se validan en cada servicio o solo en el Gateway?

## 5. Observabilidad
- ¿Cada servicio expone health checks que verifican dependencias reales?
- ¿Los logs están correlacionados entre servicios (trace ID)?
- ¿Hay métricas de rendimiento por servicio?

## 6. Independencia de Despliegue
- ¿Cada servicio tiene su propio `package.json` / `go.mod`?
- ¿Se pueden desplegar de forma independiente?
- ¿Comparten código de forma que crea acoplamiento?