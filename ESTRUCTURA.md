# 📁 ESTRUCTURA.md — Estructura del Repositorio SISGAD5_1.0

> **Propósito:** Este repositorio contiene TODO el proyecto SISGAD5:
> código de producción, documentación, modelado, tesis, manuales e infraestructura.
> **Repositorio secundario archivado:** https://github.com/ybotet/SISGAD5_doc

## Estructura de Carpetas

SISGAD5_1.0/
│
├── README.md                              # Punto de entrada (ES/RU)
├── AGENT.md                               # Reglas de oro para agentes de IA
├── SPEC.md                                # Especificación técnica completa
├── ARCHITECTURE.md                        # Arquitectura técnica del sistema
├── TASKLIST.md                            # Lista de tareas del proyecto
├── PROMPTS.md                             # Sistema de prompts por fase
├── ESTRUCTURA.md                          # Este documento (estructura del repo)
├── CHANGELOG.md                           # Registro de cambios
├── CONTRIBUTING.md                        # Convenciones de contribución
├── memory.md                              # Memoria persistente del proyecto
├── LICENSE                                # Licencia (uso académico)
├── .env.example                           # Plantilla de variables de entorno
├── .gitignore
├── .prettierrc
├── .eslintrc.json
├── docker-compose.yml                     # Stack de desarrollo
├── docker-compose.prod.yml                # Stack de producción
├── deploy.sh                              # Script de despliegue
├── start-local.js                         # Script de arranque local
├── package.json                           # Dependencias raíz (monorepo tools)
├── package-lock.json
│
├── .github/                               # CI/CD y plantillas GitHub
│   ├── workflows/
│   │   ├── ci.yml                         # Lint + Test en cada PR
│   │   ├── cd.yml                         # Deploy en merge a main
│   │   ├── security.yml                   # Auditoría de seguridad
│   │   └── docs.yml                       # Validación de documentación
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── task.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── dependabot.yml
│
├── docs/                                  # 📚 DOCUMENTACIÓN COMPLETA
│   │
│   ├── 00_index.md                        # Índice general
│   ├── 01_introduction.md                 # Introducción y contexto
│   ├── 02_actors.md                       # Actores del sistema
│   ├── 03_use_cases.md                    # Casos de uso (24)
│   ├── 04_glossary.md                     # Glosario de términos
│   ├── 05_requirements.md                 # Requisitos funcionales y no funcionales
│   ├── 06_business_rules.md               # Reglas de negocio
│   ├── 07_domain_model.md                 # Modelo de dominio
│   ├── 08_sequence_diagrams.md            # Diagramas de secuencia
│   ├── 09_state_machines.md               # Máquinas de estado
│   ├── 10_api_contracts.md                # Contratos de API (índice)
│   ├── 11_data_model.md                   # Modelo de datos (ER)
│   ├── 12_rbac_matrix.md                  # Matriz de roles y permisos
│   ├── 13_security.md                     # Estrategia de seguridad
│   ├── 14_deployment.md                   # Guía de despliegue
│   ├── 15_operations.md                   # Guía de operación
│   ├── 16_testing.md                      # Estrategia de testing
│   ├── 17_roadmap.md                      # Roadmap de evolución
│   │
│   ├── api/                               # 📋 Contratos OpenAPI
│   │   ├── users.yaml
│   │   ├── mp.yaml
│   │   ├── materials.yaml
│   │   └── gateway.yaml
│   │
│   ├── diagrams/                          # 📊 Diagramas fuente
│   │   ├── use_cases/
│   │   ├── class_diagrams/
│   │   ├── sequence_diagrams/
│   │   ├── state_machines/
│   │   ├── er_diagrams/
│   │   ├── component_diagrams/
│   │   └── deployment_diagrams/
│   │
│   ├── thesis/                            # 🎓 Documentación de tesis
│   │   ├── 00_abstract.md
│   │   ├── 01_introduction.md
│   │   ├── 02_state_of_art.md
│   │   ├── 03_methodology.md
│   │   ├── 04_development.md
│   │   ├── 05_results.md
│   │   ├── 06_conclusions.md
│   │   ├── 07_bibliography.md
│   │   ├── 08_appendices.md
│   │   └── assets/
│   │
│   ├── practices/                         # 📝 Prácticas de la disciplina
│   │   ├── practice_01_project_card.md
│   │   ├── practice_02_user_story_map.md
│   │   ├── practice_03_event_storming.md
│   │   ├── practice_04_bpmn.md
│   │   ├── practice_05_uml_static.md
│   │   └── practice_06_uml_dynamic.md
│   │
│   └── manuals/                           # 📖 Manuales de usuario
│       ├── manual_explotacion_general.md
│       ├── manual_dashboard_materiales.md
│       ├── manual_dashboard_quejas.md
│       ├── manual_administracion.md
│       └── manual_tecnico.md
│
├── api-gateway/                           # 🌐 API Gateway (Node.js + Express)
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── index.js
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── utils/
│   └── tests/
│       ├── unit/
│       └── integration/
│
├── backend-users/                         # 👤 Users Service (Node.js + Sequelize)
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/                    # Zod schemas
│   │   └── utils/
│   ├── migrations/
│   ├── seeders/
│   └── tests/
│       ├── unit/
│       └── integration/
│
├── backend-mp/                            # 📞 MP Service (Node.js + Sequelize + Zod)
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   └── utils/
│   ├── migrations/
│   ├── seeders/
│   └── tests/
│       ├── unit/
│       └── integration/
│
├── backend-materiales-go/                 # 📦 Materials Service (Go + Gin + GORM)
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   ├── cmd/
│   │   └── api/
│   │       └── main.go
│   ├── internal/
│   │   ├── config/
│   │   ├── handlers/
│   │   ├── logger/
│   │   ├── models/
│   │   ├── repositories/
│   │   │   └── postgres/
│   │   ├── services/
│   │   └── pkg/
│   ├── migrations/
│   ├── docs/                              # Swagger generado
│   └── tests/
│       ├── unit/
│       └── integration/
│
├── frontend/                              # 🖥️ Frontend (React + Vite + TS)
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── assets/
│       ├── components/
│       │   ├── common/
│       │   ├── layout/
│       │   └── ui/
│       ├── contexts/
│       ├── hooks/
│       ├── i18n/
│       ├── pages/
│       │   ├── Login/
│       │   ├── Dashboard/
│       │   ├── Telefonos/
│       │   ├── Lineas/
│       │   ├── Pizarras/
│       │   ├── Quejas/
│       │   ├── Pruebas/
│       │   ├── Trabajos/
│       │   ├── Materiales/
│       │   ├── Estadisticas/
│       │   ├── Usuarios/
│       │   └── Perfil/
│       ├── router/
│       ├── services/
│       ├── store/
│       ├── styles/
│       ├── types/
│       └── utils/
│
├── monitoring/                            # 📊 Observabilidad
│   ├── prometheus/
│   │   └── prometheus.yml
│   ├── grafana/
│   │   ├── dashboards/
│   │   └── provisioning/
│   └── loki/
│
├── scripts/                               # 🔧 Automatización
│   ├── backup.sh                          # Backup de BD
│   ├── restore.sh                         # Restaurar BD
│   ├── health-check.sh                    # Health check de servicios
│   ├── seed-all.sh                        # Seed de todas las BD
│   ├── generate_issues.py                 # Generar Issues desde TASKLIST
│   ├── validate_docs.sh                   # Validar enlaces y formato
│   └── build_pdf.sh                       # Compilar docs a PDF
│
├── tests/                                 # 🧪 Tests globales (E2E y carga)
│   ├── e2e/
│   │   └── critical-flows.spec.ts
│   └── load/
│       └── endpoints.js
│
└── assets/                                # 🎨 Recursos visuales
    ├── images/
    ├── logos/
    └── fonts/

## Reglas de Organización

1. **Un solo repositorio:** Todo vive en SISGAD5_1.0.
2. **Documentación centralizada:** Todo en `docs/` con subcarpetas por tipo.
3. **Código separado por servicio:** Cada microservicio es independiente.
4. **Patrón de capas:** `controllers → services → repositories → models`.
5. **Tests junto al código:** `tests/` en cada servicio + `tests/` global.
6. **Infraestructura separada:** `.github/`, `monitoring/`, `scripts/`.
7. **Sin duplicación:** Cada archivo tiene un único lugar lógico.
8. **Trazabilidad académica:** `docs/thesis/` y `docs/practices/` mantienen el vínculo con la disciplina.

## Convenciones de Nombres

| Tipo                      | Convención                      | Ejemplo                         |
| ------------------------- | ------------------------------- | ------------------------------- |
| Carpetas                  | snake_case                      | `backend-materiales-go`         |
| Archivos Markdown         | snake_case con prefijo numérico | `01_introduction.md`            |
| Archivos de código JS/TS  | camelCase                       | `asignacionService.js`          |
| Archivos de código Go     | snake_case                      | `asignacion_service.go`         |
| Archivos de configuración | kebab-case                      | `docker-compose.yml`            |
| Tests                     | `*.test.js` / `*_test.go`       | `auth.test.js` / `auth_test.go` |