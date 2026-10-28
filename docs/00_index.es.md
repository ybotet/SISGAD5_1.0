# Índice General de Documentación - SISGAD5

> **Versión:** 1.0  
> **Fecha:** 2026-09-25  
> **Repositorio:** https://github.com/ybotet/SISGAD5_1.0

---

## 📚 Estructura de la Documentación

| # | Documento | Descripción |
|---|-----------|-------------|
| 00 | [00_index.md](00_index.es.md) | Este índice |
| 01 | [01_introduction.md](01_introduction.es.md) | Introducción y contexto del proyecto |
| 02 | [02_actors.md](02_actors.es.md) | Actores del sistema (7 roles) |
| 03 | [03_use_cases.md](03_use_cases.es.md) | Casos de uso (24 casos) |
| 04 | [04_glossary.md](04_glossary.es.md) | Glosario de términos (Ubiquitous Language) |
| 05 | [05_requirements.md](05_requirements.es.md) | Requisitos funcionales y no funcionales |
| 06 | [06_business_rules.md](06_business_rules.es.md) | Reglas de negocio |
| 07 | [07_domain_model.md](07_domain_model.es.md) | Modelo de dominio (28 clases, 5 contextos) |
| 08 | [08_sequence_diagrams.md](08_sequence_diagrams.es.md) | Diagramas de secuencia (3 escenarios críticos) |
| 09 | [09_state_machines.md](09_state_machines.es.md) | Máquinas de estado |
| 10 | [10_api_contracts.md](10_api_contracts.es.md) | Contratos de API (índice) |
| 11 | [11_data_model.md](11_data_model.es.md) | Modelo de datos (ER consolidado 3 BD) |
| 12 | [12_rbac_matrix.md](12_rbac_matrix.es.md) | Matriz de roles y permisos (RBAC) |
| 13 | [13_security.md](13_security.es.md) | Estrategia de seguridad (JWT + Refresh) |
| 14 | [14_deployment.md](14_deployment.es.md) | Guía de despliegue |
| 15 | [15_operations.md](15_operations.es.md) | Guía de operación |
| 16 | [16_testing.md](16_testing.es.md) | Estrategia de testing |
| 17 | [17_roadmap.md](17_roadmap.es.md) | Roadmap de evolución |

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
├── practice_01_project_card.es.md
├── practice_02_user_story_map.es.md
├── practice_03_event_storming.es.md
├── practice_04_bpmn.es.md
├── practice_05_uml_static.es.md
├── practice_06_uml_dynamic.es.md
├── practice_07_system_architecture.es.md
├── practice_08_deployment_diagram.es.md
├── practice_09_dfd.es.md
├── practice_10_security_model.es.md
├── 01_setup_inicial.es.md
├── hacer.txt
└── curso-go/
    └── Informe.md
```

---

## 📖 Manuales de Usuario

```
docs/manuals/
├── manual_explotacion_general.es.md
├── manual_dashboard_materiales.es.md
├── manual_dashboard_quejas.es.md
├── manual_administracion.es.md
├── manual_tecnico.es.md
└── manual_operativo.es.md
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