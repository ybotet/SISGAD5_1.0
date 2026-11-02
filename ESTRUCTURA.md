# 📁 ESTRUCTURA.md — Estructura Objetivo del Repositorio SISGAD5_1.0

> **Propósito:** Este repositorio contiene TODO el proyecto SISGAD5: código, documentación, modelado, tesis, manuales e infraestructura.
> **Última actualización:** 2026-10-23

---

## Estructura Objetivo
SISGAD5_1.0/
│
├── AGENTS.md # Reglas de oro (auto-cargado por Kilo Code)
├── SPEC.md # Especificación técnica
├── ARCHITECTURE.md # Arquitectura del sistema
├── TASKLIST.md # Lista de tareas
├── PROMPTS.md # Prompts por fase
├── ESTRUCTURA.md # Este documento
├── CHANGELOG.md # Registro de cambios
├── CONTRIBUTING.md # Convenciones
├── memory.md # Memoria persistente
├── README.md # Punto de entrada (ES)
├── README.ru.md # Punto de entrada (RU)
├── LICENSE
├── .gitignore
├── .env.example # Plantilla (único .env versionado)
├── .prettierrc
├── docker-compose.yml
├── docker-compose.prod.yml
├── deploy.sh
├── start-local.js
├── package.json
├── package-lock.json
│
├── .agents/ # Agentes de Kilo Code
│ ├── agents/
│ │ ├── backend-developer.md
│ │ ├── consistency-fixer.md
│ │ ├── db-migration-specialist.md
│ │ ├── frontend-developer.md
│ │ ├── integration-specialist.md
│ │ ├── project-auditor.md
│ │ ├── refactor-fixer.md
│ │ ├── security-fixer.md
│ │ ├── test-initializer.md
│ │ ├── ml-engineer.md # NUEVO
│ │ └── docs-writer.md # NUEVO
│ └── skills/
│ ├── code-audit-methodology.md
│ ├── code-refactoring-tech-debt/
│ ├── gorm-performance/
│ ├── go-testing-patterns/
│ ├── jest-supertest-setup/
│ ├── microservices-saga-pattern/
│ ├── nodejs-audit.md
│ ├── report-generation.md
│ ├── security-go-middleware/
│ ├── security-jwt-hardening/
│ ├── sequelize-migrations/
│ ├── sisgad5-architecture.md
│ ├── sisgad-go-audit.md
│ ├── sisgad-microservices-audit.md
│ └── ml-modeling/ # NUEVO
│ └── SKILL.md
│
├── .kilo/ # Config de Kilo Code (opcional)
│ └── rules/
│ ├── 00-project-context.md
│ ├── 01-bilingual.md
│ └── 02-commit-conventions.md
│
├── .github/
│ ├── workflows/
│ │ ├── ci.yml
│ │ ├── cd.yml
│ │ ├── docs.yml
│ │ └── security.yml
│ ├── ISSUE_TEMPLATE/
│ │ ├── bug_report.md
│ │ ├── feature_request.md
│ │ └── task.md
│ ├── projects/
│ │ └── sisgad5-roadmap.yml
│ ├── PULL_REQUEST_TEMPLATE.md
│ └── dependabot.yml
│
├── docs/ # Documentación (bilingüe ES/RU)
│ ├── 00_index.es.md
│ ├── 00_index.ru.md
│ ├── 01_introduction.es.md
│ ├── 01_introduction.ru.md
│ ├── 02_actors.es.md
│ ├── 02_actors.ru.md
│ ├── 03_use_cases.es.md
│ ├── 03_use_cases.ru.md
│ ├── 04_glossary.es.md
│ ├── 04_glossary.ru.md
│ ├── 05_requirements.es.md
│ ├── 05_requirements.ru.md
│ ├── 06_business_rules.es.md
│ ├── 06_business_rules.ru.md
│ ├── 07_domain_model.es.md
│ ├── 07_domain_model.ru.md
│ ├── 08_sequence_diagrams.es.md
│ ├── 08_sequence_diagrams.ru.md
│ ├── 09_state_machines.es.md
│ ├── 09_state_machines.ru.md
│ ├── 10_api_contracts.es.md
│ ├── 10_api_contracts.ru.md
│ ├── 11_data_model.es.md
│ ├── 11_data_model.ru.md
│ ├── 12_rbac_matrix.es.md
│ ├── 12_rbac_matrix.ru.md
│ ├── 13_security.es.md
│ ├── 13_security.ru.md
│ ├── 14_deployment.es.md
│ ├── 14_deployment.ru.md
│ ├── 15_operations.es.md
│ ├── 15_operations.ru.md
│ ├── 16_testing.es.md
│ ├── 16_testing.ru.md
│ ├── 17_roadmap.es.md
│ ├── 17_roadmap.ru.md
│ │
│ ├── audit/
│ │ └── AUDITORIA.md
│ │
│ ├── api/
│ │ ├── gateway.yaml
│ │ ├── materials.yaml
│ │ ├── mp.yaml
│ │ └── users.yaml
│ │
│ ├── diagrams/
│ │ ├── class_diagrams/
│ │ ├── component_diagrams/
│ │ ├── deployment_diagrams/
│ │ ├── er_diagrams/
│ │ ├── sequence_diagrams/
│ │ ├── state_machines/
│ │ └── use_cases/
│ │
│ ├── manuals/
│ │ ├── manual_explotacion_general.es.md
│ │ ├── manual_explotacion_general.ru.md
│ │ ├── manual_dashboard_materiales.es.md
│ │ ├── manual_dashboard_materiales.ru.md
│ │ ├── manual_dashboard_quejas.es.md
│ │ ├── manual_dashboard_quejas.ru.md
│ │ ├── manual_administracion.es.md
│ │ ├── manual_administracion.ru.md
│ │ ├── manual_operativo.es.md
│ │ ├── manual_operativo.ru.md
│ │ ├── manual_tecnico.es.md
│ │ └── manual_tecnico.ru.md
│ │
│ ├── practices/
│ │ ├── practice_01_project_card.es.md
│ │ ├── practice_01_project_card.ru.md
│ │ ├── ... (6 prácticas × 2 idiomas)
│ │ └── curso-go/
│ │ └── Informe.md
│ │
│ └── thesis/
│ ├── 00_abstract.es.md
│ ├── 00_abstract.ru.md
│ ├── 01_introduction.es.md
│ ├── 01_introduction.ru.md
│ ├── 02_state_of_art.es.md
│ ├── 02_state_of_art.ru.md
│ ├── 03_methodology.es.md
│ ├── 03_methodology.ru.md
│ ├── 04_development.es.md
│ ├── 04_development.ru.md
│ ├── 05_results.es.md
│ ├── 05_results.ru.md
│ ├── 06_modelado_predictivo.es.md
│ ├── 06_modelado_predictivo.ru.md
│ ├── 07_conclusions.es.md
│ ├── 07_conclusions.ru.md
│ ├── 08_bibliography.es.md
│ ├── 08_bibliography.ru.md
│ ├── 09_appendices.es.md
│ ├── 09_appendices.ru.md
│ └── assets/
│
├── api-gateway/
│ ├── Dockerfile
│ ├── package.json
│ ├── .env.example
│ ├── src/
│ │ ├── server.js
│ │ ├── config/
│ │ ├── middleware/
│ │ └── routes/
│ └── tests/
│
├── backend-users/
│ ├── Dockerfile
│ ├── package.json
│ ├── .env.example
│ ├── src/
│ │ ├── config/
│ │ ├── controllers/
│ │ ├── middleware/
│ │ ├── models/
│ │ ├── routes/
│ │ ├── services/
│ │ └── utils/
│ ├── migrations/
│ ├── seeders/
│ └── tests/
│
├── backend-mp/ # ⚠️ REFACTORIZAR A FEATURE-BASED
│ ├── Dockerfile
│ ├── package.json
│ ├── .env.example
│ ├── src/
│ │ ├── features/ # NUEVO
│ │ │ ├── asignacion/
│ │ │ ├── cable/
│ │ │ ├── clave/
│ │ │ ├── clasificacion/
│ │ │ ├── clasificadorclave/
│ │ │ ├── clasifpizarra/
│ │ │ ├── grup0w/
│ │ │ ├── linea/
│ │ │ ├── mando/
│ │ │ ├── movimiento/
│ │ │ ├── pizarra/
│ │ │ ├── planta/
│ │ │ ├── propietario/
│ │ │ ├── prueba/
│ │ │ ├── queja/
│ │ │ ├── recorrido/
│ │ │ ├── resultadoprueba/
│ │ │ ├── senalizacion/
│ │ │ ├── sistema/
│ │ │ ├── telefono/
│ │ │ ├── tipolinea/
│ │ │ ├── tipomovimiento/
│ │ │ ├── tipopizarra/
│ │ │ ├── tipoqueja/
│ │ │ ├── trabajador/
│ │ │ ├── trabajo/
│ │ │ └── trabajo_trabajadores/
│ │ ├── shared/ # NUEVO
│ │ │ ├── middleware/
│ │ │ ├── utils/
│ │ │ └── config/
│ │ ├── routes/
│ │ │ └── index.js
│ │ └── server.js
│ ├── migrations/
│ ├── seeders/
│ ├── scripts/
│ └── tests/
│
├── backend-materiales-go/
│ ├── Dockerfile
│ ├── go.mod
│ ├── go.sum
│ ├── .air.toml
│ ├── cmd/
│ │ └── api/
│ │ └── main.go
│ ├── internal/
│ │ ├── config/
│ │ ├── handlers/
│ │ ├── logger/
│ │ ├── models/
│ │ ├── repositories/
│ │ │ └── postgres/
│ │ ├── services/
│ │ └── pkg/
│ ├── migrations/
│ ├── docs/ # Swagger
│ └── tests/
│
├── prediction-service/ # NUEVO (Python + FastAPI)
│ ├── Dockerfile
│ ├── requirements.txt
│ ├── .env.example
│ ├── app/
│ │ ├── main.py
│ │ ├── config.py
│ │ ├── api/
│ │ │ └── v1/
│ │ ├── core/
│ │ │ ├── features/
│ │ │ ├── models/
│ │ │ ├── training/
│ │ │ └── evaluation/
│ │ ├── db/
│ │ ├── schemas/
│ │ └── utils/
│ ├── models/ # Modelos entrenados (.pkl)
│ │ └── .gitkeep
│ ├── notebooks/
│ ├── data/ # gitignored
│ │ ├── raw/
│ │ ├── processed/
│ │ └── features/
│ ├── pipelines/
│ │ ├── airflow_dags/
│ │ └── mlflow/
│ └── tests/
│
├── frontend/
│ ├── Dockerfile
│ ├── package.json
│ ├── vite.config.ts
│ ├── tsconfig.json
│ ├── tailwind.config.js
│ ├── index.html
│ ├── public/
│ └── src/
│ ├── main.tsx
│ ├── App.tsx
│ ├── components/
│ │ ├── common/
│ │ ├── layout/
│ │ └── ui/
│ ├── contexts/
│ ├── hooks/
│ ├── i18n/
│ ├── layouts/
│ ├── locales/
│ │ ├── es/
│ │ └── ru/
│ ├── pages/
│ ├── router/
│ ├── services/
│ ├── store/
│ ├── styles/
│ ├── types/
│ └── utils/
│
├── monitoring/
│ ├── prometheus/
│ │ └── prometheus.yml
│ ├── grafana/
│ │ ├── dashboards/
│ │ └── provisioning/
│ └── loki/
│ ├── loki-config.yaml
│ └── promtail-config.yaml
│
├── scripts/
│ ├── setup-github-project.sh
│ ├── backup.sh
│ ├── restore.sh
│ ├── health-check.sh
│ ├── generate_issues.py
│ └── validate_docs.sh
│
├── tests/
│ ├── e2e/
│ └── load/
│
└── assets/
├── images/
├── logos/
└── fonts/


---

## Reglas de Organización

1. **Un solo repositorio:** Todo vive en SISGAD5_1.0.
2. **Documentación bilingüe:** archivos paralelos `.es.md` / `.ru.md`.
3. **Código por features:** cada entidad tiene su carpeta con controller, routes, model, validation, service.
4. **Tests junto al código:** `tests/` en cada servicio + `tests/` global para E2E.
5. **Infraestructura separada:** `.github/`, `monitoring/`, `scripts/`.
6. **Sin duplicación:** cada archivo tiene un único lugar lógico.
7. **Secretos:** solo `.env.example` se versiona.

---

## Archivos a Eliminar (duplicados/basura)

| Archivo/Carpeta                                        | Razón                             |
| ------------------------------------------------------ | --------------------------------- |
| `docs/architecture.md`                                 | Duplica `ARCHITECTURE.md`         |
| `docs/requirements.md`                                 | Duplica `docs/05_requirements.md` |
| `docs/roadmap.md`                                      | Duplica `docs/17_roadmap.md`      |
| `docs/api/materiales_swagger.json`                     | Duplica `docs/api/materials.yaml` |
| `docs/api/materiales_swagger_index.html`               | HTML generado                     |
| `docs/api/mp_swagger.json`                             | Duplica `docs/api/mp.yaml`        |
| `docs/api/mp_reference.md`                             | Duplica `docs/api/mp.yaml`        |
| `docs/practices/hacer.txt`                             | Archivo temporal                  |
| `backup/`                                              | Basura                            |
| `Continue/`                                            | Basura                            |
| `.kilo/.gitignore`                                     | Redundante                        |
| `node_modules/` (raíz)                                 | Dependencias                      |
| `api.exe`                                              | Binario compilado                 |
| `logs/` (raíz y por servicio)                          | Logs versionados                  |
| `frontend/dist/`                                       | Build artifacts                   |
| `.env`, `.env.docker`, `.env.local`, `.env.production` | Secretos                          |
| `backend-materiales-go/.env`                           | Secretos                          |
| `backend-mp/scripts/node_modules/`                     | Dependencias                      |

---

> **Mantenido por:** Ing. Botet S.Y.
> **Última actualización:** 2026-10-23