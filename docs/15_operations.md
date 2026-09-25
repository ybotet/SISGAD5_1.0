# Guía de Operación - SISGAD5

> **Versión:** 1.0  
> **Fecha:** 2026-09-25

---

## 1. Monitoreo y Alertas

### 1.1 Dashboards Grafana (Acceso: `http://grafana:3001`)

| Dashboard | Descripción | Métricas Clave |
|-----------|-------------|----------------|
| **SISGAD5 - Overview** | Vista general del sistema | Uptime, RPS, Latencia p95, Error rate |
| **SISGAD5 - API Gateway** | Tráfico de entrada | Requests/s, Latencia, 4xx/5xx, Rate limit hits |
| **SISGAD5 - Users Service** | Autenticación y usuarios | Logins/s, Registros, Refresh tokens, Sesiones activas |
| **SISGAD5 - MP Service** | Operaciones MP | Quejas creadas, Trabajos cerrados, Pruebas registradas |
| **SISGAD5 - Materials Service** | Gestión materiales | Asignaciones, Consumos, Stock bajo, Saldo lógico |
| **SISGAD5 - Infrastructure** | Recursos sistema | CPU, Memoria, Disco, Red, Contenedores |
| **SISGAD5 - Database** | Bases de datos | Conexiones, Queries/s, Locks, Tamaño BD |
| **SISGAD5 - Business KPIs** | Métricas de negocio | Quejas abiertas, Tiempo resolución, Materiales consumidos |

### 1.2 Alertas Críticas (PrometheusRules)

```yaml
# monitoring/prometheus/rules/sisgad5-critical.yml
groups:
- name: sisgad5-critical
  interval: 30s
  rules:
  # Servicio caído
  - alert: ServiceDown
    expr: up{job=~"sisgad5-.*"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Servicio {{ $labels.job }} caído"
      description: "{{ $labels.job }} no responde hace 1 minuto"

  # Latencia alta
  - alert: HighLatency
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job=~"sisgad5-.*"}[5m])) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Latencia p95 alta en {{ $labels.job }}"
      description: "p95 = {{ $value }}s por 5 minutos"

  # Tasa de errores
  - alert: HighErrorRate
    expr: rate(http_requests_total{job=~"sisgad5-.*",status=~"5.."}[5m]) / rate(http_requests_total{job=~"sisgad5-.*"}[5m]) > 0.05
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "Tasa de errores 5xx > 5% en {{ $labels.job }}"

  # Base de datos: conexiones agotándose
  - alert: DBConnectionsHigh
    expr: pg_stat_database_numbackends / pg_settings_max_connections > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Conexiones BD > 80% en {{ $labels.instance }}"

  # Disco lleno
  - alert: DiskSpaceLow
    expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Disco < 10% libre en {{ $labels.instance }}"

  # Memoria alta
  - alert: HighMemoryUsage
    expr: (container_memory_usage_bytes / container_spec_memory_limit_bytes) > 0.85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Memoria > 85% en {{ $labels.container }}"

  # Stock bajo materiales
  - alert: MaterialStockLow
    expr: sisgad5_materials_stock_logico < 10
    for: 1h
    labels:
      severity: warning
    annotations:
      summary: "Stock bajo: {{ $labels.material_codigo }}"
      description: "Saldo lógico = {{ $value }} para {{ $labels.material_nombre }}"

  # Quejas sin asignar > 24h
  - alert: UnassignedComplaintsOld
    expr: sisgad5_quejas_sin_asignar_24h > 0
    for: 1h
    labels:
      severity: warning
    annotations:
      summary: "{{ $value }} quejas sin asignar hace > 24h"
```

### 1.3 Notificaciones
- **Canal Slack/Telegram:** `#sisgad5-alerts`
- **Email crítico:** `ops@dominio.cu`
- **Escalamiento:** Si no ACK en 15 min → Jefe de guardia

---

## 2. Logging

### 2.1 Acceso a Logs (Grafana Loki: `http://loki:3100`)

```logql
# Todos los logs de un servicio
{service="api-gateway"}

# Logs de error
{service="backend-users"} |= "ERROR"

# Logs por trace_id (trazabilidad distribuida)
{service=~"sisgad5-.*"} | trace_id="abc-123-def-456"

# Logs de auditoría
{service=~"sisgad5-.*"} | json | level="INFO" | action=~"quejas:.*"

# Logs de autenticación fallida
{service="backend-users"} | json | action="auth:login" | success=false
```

### 2.2 Estructura de Log (JSON)
```json
{
  "timestamp": "2026-09-25T10:30:00.123Z",
  "level": "INFO",
  "service": "mp-service",
  "trace_id": "abc-123-def-456",
  "span_id": "span-789",
  "user_id": "uuid-usuario",
  "action": "quejas:cambiar_estado",
  "resource": "quejas",
  "resource_id": 12345,
  "details": {
    "estado_anterior": "Asignada",
    "estado_nuevo": "Pendiente"
  },
  "ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "success": true,
  "duration_ms": 45
}
```

### 2.3 Retención
- **Logs aplicación:** 30 días
- **Logs auditoría:** 7 años (requisito legal)
- **Logs acceso (nginx):** 90 días

---

## 3. Operaciones Diarias

### 3.1 Checklist Mañana (08:00)
- [ ] Verificar dashboards Overview (todos verdes)
- [ ] Revisar alertas activas en Grafana/Alertmanager
- [ ] Verificar backups nocturnos completados
- [ ] Verificar espacio en disco (> 20% libre)
- [ ] Verificar réplicas BD sincronizadas
- [ ] Revisar quejas sin asignar > 24h

### 3.2 Checklist Tarde (16:00)
- [ ] Verificar métricas de negocio (KPIs)
- [ ] Revisar logs de errores del día
- [ ] Verificar certificados SSL (expiración > 30 días)
- [ ] Confirmar próximo backup programado

### 3.3 Checklist Semanal (Lunes)
- [ ] Ejecutar `docker system prune -f` (limpiar imágenes no usadas)
- [ ] Revisar dependencias actualizables (Dependabot PRs)
- [ ] Verificar capacidad de almacenamiento Loki/Prometheus
- [ ] Probar restore de backup (mensual)

---

## 4. Procedimientos de Incidente

### 4.1 Servicio No Responde (ServiceDown)
```bash
# 1. Verificar contenedor
docker compose ps | grep <servicio>

# 2. Ver logs recientes
docker compose logs --tail=100 <servicio>

# 3. Reiniciar servicio
docker compose restart <servicio>

# 4. Si persiste, verificar BD
docker compose exec postgres-<servicio> pg_isready

# 5. Escalar a Kubernetes si aplica
kubectl rollout restart deployment/<servicio> -n sisgad5-prod
```

### 4.2 Base de Datos Lenta
```bash
# 1. Ver queries activas
docker compose exec postgres-<servicio> psql -U postgres -d <bd> -c "
  SELECT pid, now() - pg_stat_activity.query_start AS duration, 
         query, state 
  FROM pg_stat_activity 
  WHERE state = 'active' 
  AND now() - pg_stat_activity.query_start > interval '5 seconds';"

# 2. Ver locks
docker compose exec postgres-<servicio> psql -U postgres -d <bd> -c "
  SELECT blocked_locks.pid AS blocked_pid,
         blocked_activity.query AS blocked_query,
         blocking_locks.pid AS blocking_pid,
         blocking_activity.query AS blocking_query
  FROM pg_catalog.pg_locks blocked_locks
  JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
  JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
  JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_pids.pid
  WHERE NOT blocked_locks.granted;"

# 3. Matar query problemática (último recurso)
docker compose exec postgres-<servicio> psql -U postgres -d <bd> -c "SELECT pg_terminate_backend(<pid>);"
```

### 4.3 Fuga de Memoria
```bash
# 1. Ver uso memoria contenedor
docker stats <contenedor> --no-stream

# 2. Reiniciar contenedor
docker compose restart <servicio>

# 3. Analizar heap dump (Node.js)
# En código: process.on('exit', () => { require('heapdump').writeSnapshot(); })
```

### 4.4 Certificado SSL Expirado
```bash
# Renovar (Let's Encrypt + certbot)
certbot renew --nginx

# Verificar
openssl x509 -in /etc/letsencrypt/live/sisgad5.dominio.cu/fullchain.pem -text -noout | grep "Not After"
```

---

## 5. Backup y Restore

### 5.1 Scripts de Backup (`scripts/`)

#### backup.sh (Diario, 02:00 AM)
```bash
#!/bin/bash
# scripts/backup.sh
set -e

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/${DATE}"
mkdir -p ${BACKUP_DIR}

# Backup BD Users
docker compose exec -T postgres-users pg_dump -U postgres bd_users | gzip > ${BACKUP_DIR}/bd_users_${DATE}.sql.gz

# Backup BD MP
docker compose exec -T postgres-mp pg_dump -U postgres bd_mp | gzip > ${BACKUP_DIR}/bd_mp_${DATE}.sql.gz

# Backup BD Materials
docker compose exec -T postgres-materials pg_dump -U postgres bd_materiales | gzip > ${BACKUP_DIR}/bd_materiales_${DATE}.sql.gz

# Backup volúmenes Docker (uploads, etc.)
tar -czf ${BACKUP_DIR}/volumes_${DATE}.tar.gz /var/lib/docker/volumes/sisgad5_*

# Subir a almacenamiento remoto (S3/MinIO/GCS)
aws s3 cp ${BACKUP_DIR} s3://sisgad5-backups/${DATE}/ --recursive

# Limpiar backups locales > 7 días
find /backups -type d -mtime +7 -exec rm -rf {} \;

echo "Backup completado: ${BACKUP_DIR}"
```

#### restore.sh
```bash
#!/bin/bash
# scripts/restore.sh
# Uso: ./restore.sh <backup_date> [bd_users|bd_mp|bd_materiales]

BACKUP_DATE=$1
TARGET_DB=$2
BACKUP_DIR="/backups/${BACKUP_DATE}"

if [ ! -d "${BACKUP_DIR}" ]; then
  # Descargar de remoto
  aws s3 cp s3://sisgad5-backups/${BACKUP_DATE}/ ${BACKUP_DIR} --recursive
fi

case $TARGET_DB in
  bd_users)
    gunzip -c ${BACKUP_DIR}/bd_users_${BACKUP_DATE}.sql.gz | docker compose exec -T postgres-users psql -U postgres bd_users
    ;;
  bd_mp)
    gunzip -c ${BACKUP_DIR}/bd_mp_${BACKUP_DATE}.sql.gz | docker compose exec -T postgres-mp psql -U postgres bd_mp
    ;;
  bd_materiales)
    gunzip -c ${BACKUP_DIR}/bd_materiales_${BACKUP_DATE}.sql.gz | docker compose exec -T postgres-materials psql -U postgres bd_materiales
    ;;
  *)
    echo "Uso: $0 <fecha> <bd_users|bd_mp|bd_materiales>"
    exit 1
    ;;
esac

echo "Restore completado para ${TARGET_DB} desde ${BACKUP_DATE}"
```

### 5.2 Programación (cron)
```bash
# En host o Kubernetes CronJob
0 2 * * * /opt/sisgad5/scripts/backup.sh >> /var/log/sisgad5-backup.log 2>&1
```

---

## 6. Mantenimiento Programado

### 6.1 Ventana de Mantenimiento
- **Horario:** Domingos 02:00 - 06:00 (hora local)
- **Notificación:** 48h antes por email/Slack
- **Rollback plan:** Documentado por cada cambio

### 6.2 Tareas Mensuales
- [ ] Actualizar dependencias (Dependabot PRs → merge tras CI pass)
- [ ] Rotar logs antiguos
- [ ] Verificar integridad backups (test restore)
- [ ] Revisar y limpiar sesiones expiradas en BD
- [ ] Actualizar imágenes base Docker (security patches)

### 6.3 Tareas Trimestrales
- [ ] Rotar claves JWT (generar nuevas, deploy rolling)
- [ ] Revisar certificados SSL
- [ ] Prueba de disaster recovery completa
- [ ] Auditoría de accesos (usuarios, roles, permisos)

---

## 7. Escalado de Capacidad

### 7.1 Escalado Horizontal (Kubernetes)
```bash
# Manual
kubectl scale deployment/api-gateway --replicas=5 -n sisgad5-prod

# Automático (HPA ya configurado)
# Ver: k8s/prod/hpa/
```

### 7.2 Escalado Vertical (Docker Compose)
```yaml
# docker-compose.prod.yml
services:
  backend-users:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### 7.3 Base de Datos
- **Read Replicas:** Para queries de solo lectura (dashboard, reportes)
- **Connection Pooling:** PgBouncer (transaction mode)
- **Particionado:** Tablas grandes por fecha (audit_logs, flujo_estado_queja)

---

## 8. Contactos y Escalamiento

| Rol | Nombre | Contacto | Disponibilidad |
|-----|--------|----------|----------------|
| **DevOps Principal** | Yaisel Botet | yaiselbotet@gmail.com | 24/7 (guardia) |
| **DBA** | - | - | Horario laboral |
| **Seguridad** | - | security@dominio.cu | 24/7 |
| **Infraestructura Cloud** | - | cloud@dominio.cu | Horario laboral |

### Matriz de Escalamiento
| Severidad | Tiempo Respuesta | Escalamiento |
|-----------|------------------|--------------|
| **Crítico (P1)** | 15 min | DevOps → DBA → Infra Cloud |
| **Alto (P2)** | 1 hora | DevOps → DBA |
| **Medio (P3)** | 4 horas | DevOps |
| **Bajo (P4)** | 24 horas | Backlog |

---

## 9. Referencias

- [Despliegue](14_deployment.md)
- [Monitoreo](../monitoring/)
- [Scripts](../scripts/)
- [Testing](16_testing.md)
- [Arquitectura](../ARCHITECTURE.md)