# Índice General de Documentación - SISGAD5

> **Versión:** 1.0  
> **Fecha:** 2026-09-25  
> **Repositorio:** https://github.com/ybotet/SISGAD5_1.0

---

## 📚 Estructura de la Documentación

| # | Documento | Descripción |
|---|-----------|-------------|
| 00 | [00_index.md](00_index.md) | Este índice |
| 01 | [01_introduction.md](01_introduction.md) | Introducción y contexto del proyecto |
| 02 | [02_actors.md](02_actors.md) | Actores del sistema (7 roles) |
| 03 | [03_use_cases.md](03_use_cases.md) | Casos de uso (24 casos) |
| 04 | [04_glossary.md](04_glossary.md) | Glosario de términos (Ubiquitous Language) |
| 05 | [05_requirements.md](05_requirements.md) | Requisitos funcionales y no funcionales |
| 06 | [06_business_rules.md](06_business_rules.md) | Reglas de negocio |
| 07 | [07_domain_model.md](07_domain_model.md) | Modelo de dominio (28 clases, 5 contextos) |
| 08 | [08_sequence_diagrams.md](08_sequence_diagrams.md) | Diagramas de secuencia (3 escenarios críticos) |
| 09 | [09_state_machines.md](09_state_machines.md) | Máquinas de estado |
| 10 | [10_api_contracts.md](10_api_contracts.md) | Contratos de API (índice) |
| 11 | [11_data_model.md](11_data_model.md) | Modelo de datos (ER consolidado 3 BD) |
| 12 | [12_rbac_matrix.md](12_rbac_matrix.md) | Matriz de roles y permisos (RBAC) |
| 13 | [13_security.md](13_security.md) | Estrategia de seguridad (JWT + Refresh) |
| 14 | [14_deployment.md](14_deployment.md) | Guía de despliegue |
| 15 | [15_operations.md](15_operations.md) | Guía de operación |
| 16 | [16_testing.md](16_testing.md) | Estrategia de testing |
| 17 | [17_roadmap.md](17_roadmap.md) | Roadmap de evolución |

---

## 📋 Contratos OpenAPI

| Servicio | Archivo |
|----------|---------|
| Users Service | [api/users.yaml](api/users.yaml) |
| MP Service | [api/mp.yaml](api/mp.yaml) |
| Materials Service | [api/materials.yaml](api/materials.yaml) |
| API Gateway | [api/gateway.yaml](api/gateway.yaml) |

---

## 📊 Diagramas Fuente

```
docs/diagrams/
├── use_cases/          # Diagramas de casos de uso
├── class_diagrams/     # Diagramas de clases
├── sequence_diagrams/  # Diagramas de secuencia
├── state_machines/     # Máquinas de estado
├── er_diagrams/        # Diagramas Entidad-Relación
├── component_diagrams/ # Diagramas de componentes
└── deployment_diagrams/ # Diagramas de despliegue
```

---

## 🎓 Documentación de Tesis

```
docs/thesis/
├── 00_abstract.md
├── 01_introduction.md
├── 02_state_of_art.md
├── 03_methodology.md
├── 04_development.md
├── 05_results.md
├── 06_conclusions.md
├── 07_bibliography.md
├── 08_appendices.md
└── assets/
```

---

## 📝 Prácticas de la Disciplina

```
docs/practices/
├── practice_01_project_card.md
├── practice_02_user_story_map.md
├── practice_03_event_storming.md
├── practice_04_bpmn.md
├── practice_05_uml_static.md
├── practice_06_uml_dynamic.md
├── 01_setup_inicial.md
├── hacer.txt
└── curso-go/
    └── Informe.md
```

---

## 📖 Manuales de Usuario

```
docs/manuals/
├── manual_explotacion_general.md
├── manual_dashboard_materiales.md
├── manual_dashboard_quejas.md
├── manual_administracion.md
└── manual_tecnico.md
```

---

## 🔗 Enlaces Rápidos

- **Repositorio principal:** https://github.com/ybotet/SISGAD5_1.0
- **Repositorio archivado (SISGAD5_doc):** https://github.com/ybotet/SISGAD5_doc
- **Especificación técnica:** [SPEC.md](../SPEC.md)
- **Arquitectura:** [ARCHITECTURE.md](../ARCHITECTURE.md)
- **Lista de tareas:** [TASKLIST.md](../TASKLIST.md)
- **Prompts por fase:** [PROMPTS.md](../PROMPTS.md)
- **Memoria del proyecto:** [memory.md](../memory.md)