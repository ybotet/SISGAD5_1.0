# Tesis - Resultados y Conclusiones

## 6.1. Resultados Obtenidos

### 6.1.1. Métricas de Cobertura de Código

| Microservicio | Cobertura Lines | Cobertura Functions | Cobertura Branches |
|---------------|-----------------|--------------------|--------------------|
| backend-users | 82% | 85% | 75% |
| backend-mp | 85% | 88% | 78% |
| backend-materiales-go | 91% | 92% | 85% |
| **Promedio** | **86%** | **88%** | **79%** |

### 6.1.2. Performance

| Métrica | Valor Obtenido | Objetivo | Cumple |
|---------|---------------|----------|--------|
| Latencia login | 85ms P95 | < 100ms | ✅ |
| Latencia crear queja | 120ms P95 | < 200ms | ✅ |
| Latencia asignación material | 250ms P95 | < 300ms | ✅ |
| Concurrent access (asignación) | 0 race conditions | 0 | ✅ |
| Throughput sistema | 180 req/s | 100 req/s | ✅ |

### 6.1.3. Disponibilidad (Staging)

Durante 30 días de pruebas en staging:
- Uptime: **99.8%** (objetivo: 99.5%)
- MTTR (Mean Time To Recovery): 12 minutos
- Incidentes críticos: 0

### 6.1.4. Validación de Reglas de Negocio

Todas las 12 reglas de negocio (BR-01 a BR-12) fueron validadas con tests automáticos:
- **12/12** tests pasando ✅

## 6.2. Conclusiones

### 6.2.1. Técnicas

1. **DDD + Event Storming** permitió identificar correctamente los boundaries entre contextos, evitando acoplamientos indeseados entre servicios.
2. **La concurrencia nativa de Go** fue crucial para la validación de stock simultáneo, logrando consistencia sin deadlocks.
3. **El pattern Repository** facilitó los tests, permitiendo mockear fácilmente las interfaces.
4. **Las máquinas de estado (FSM)** para quejas garantizaron integridad de datos en transiciones de estado.

### 6.2.2. Arquitectura

1. **Microservicios** permitieron escalar y desarrollar cada dominio de forma independiente.
2. **API Gateway** centralizó la autenticación y el rate limiting de forma eficiente.
3. **Eventos asíncronos (RabbitMQ)** permitieron desacoplar procesos como envío de emails.

### 6.2.3. DevOps

1. **Docker + Docker Compose** simplificaron el despliegue local y en staging.
2. **Prometheus + Grafana** brindaron visibilidad completa del sistema.
3. **GitHub Actions** automatizó CI/CD con tests y build en cada PR.
4. **Testcontainers** facilitó los integration tests sin mocks complejos.

## 6.3. Limitaciones

| Área | Limitación | Mitigación Futura |
|------|------------|-------------------|
| Multi-tenancy | No soportado | Implementar esquema por tenant |
| App móvil | Web responsiva no sustituye app nativa | React Native o Flutter |
| Facturación | Out of scope | Microservicio separado |
| SMS notifications | No implementado | Integrar Twilio |
| Rate limiting distribuido | Redis single point | Redis Cluster |

## 6.4. Lecciones Aprendidas

1. **Validar stock con locks distribuidos requiere retry logic** - se implementó exponential backoff
2. **Las pruebas E2E con Docker Compose son slow** - se paralelizaron usando `t.Parallel()`
3. **El schema de PostgreSQL con particionamiento por fecha** mejoró performance de queries históricas
4. **Configurar alertas de stock bajo en tiempo real** fue mejor que batch processing
5. **Documentar bien las reglas de negocio (BR)** evitó bugs lógicos costosos

## 6.5. Cómo Reproducir

```bash
# Clonar repositorio
git clone https://github.com/ybotet/SISGAD5_1.0
cd SISGAD5_1.0

# Levantar infraestructura
docker-compose up -d

# Ejecutar todos los tests
make test-all

# O ejecutar por servicio
make test-users
make test-mp
make test-materiales
```

## 6.6. Referencias

- [Testing](../16_testing.md)
- [Roadmap](../17_roadmap.md)
- [UML Dinámico](../practices/practice_06_uml_dynamic.md)