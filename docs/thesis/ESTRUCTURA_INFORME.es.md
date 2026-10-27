# 📋 Estructura del Informe de Práctica (Proyecto-Tecnológica)

> **Propósito:** Mapeo de la estructura oficial del informe a los contenidos de SISGAD5.
> **Uso:** Checklist de redacción. Cada sección indica qué contenido usar, de dónde tomarlo y qué tarea lo cubre.
> **Idioma:** Redacción en español → revisión → traducción al ruso.
> **Última actualización:** 2026-10-27

---

## ВВЕДЕНИЕ (Introducción)

| Sección                 | Contenido para SISGAD5                                                                                | Fuente                       | Tarea       | Estado |
| ----------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------- | ----------- | ------ |
| **Постановка проблемы** | DAG5 usa "Mesa de Quejas" (Access, 2000): sin escalabilidad, trazabilidad, concurrencia ni seguridad. | `docs/01_introduction.es.md` | TASK-000-01 | ✅     |
| **Актуальность**        | Digitalización, reducción de tiempo de respuesta, decisiones proactivas (predictivas).                | `docs/01_introduction.es.md` | TASK-000-01 | ✅     |
| **Цель и задачи**       | Objetivo: DSS con microservicios + dashboards + analítica predictiva. Tareas: 6 casos de uso.         | `SPEC.md`, `TASKLIST.md`     | TASK-000-03 | ✅     |

**Acción del agente:** Redactar en español a partir de las fuentes. Revisar coherencia con el resto del informe.

---

## 1 ОБЗОР И АНАЛИЗ СУЩЕСТВУЮЩИХ РЕШЕНИЙ (Revisión y análisis)

| Sección                                           | Contenido para SISGAD5                 | Fuente                                                            | Tarea                | Estado |
| ------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------- | -------------------- | ------ |
| Análisis de GLPI, SAP ERP, SIPREC, Mesa de Quejas | Comparativa y justificación de SISGAD5 | `docs/thesis/02_state_of_art.es.md`, `docs/01_introduction.es.md` | TASK-100-01 a 100-08 | ✅     |

**Acción del agente:** Consolidar el análisis comparativo. Añadir tabla de criterios (licencia, arquitectura, concurrencia, integración, etc.).

---

## 2 РАЗРАБОТКА КОНЦЕПЦИИ ПРОЕКТА (Concepto del proyecto)

### 2.1 Анализ предметной области

| Sección                                              | Contenido para SISGAD5                                                                                  | Fuente                                                                             | Tarea            | Estado |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------- | ------ |
| **2.1.1 Социально-экономические аспекты**            | Impacto social (mejora del servicio) y económico (reducción de costos, optimización de materiales).     | Nuevo                                                                              | **TASK-1400-01** | ⏳      |
| **2.1.2 Математические модели процессов**            | Modelos predictivos (series temporales, regresión, clasificación), modelo de datos, máquina de estados. | `docs/thesis/06_modelado_predictivo.es.md` (nuevo), `docs/09_state_machines.es.md` | **TASK-1400-02** | ⏳      |
| **2.1.3 Arquitectura de microservicios** *(añadido)* | Patrones, API Gateway, 3 BD, comunicación REST.                                                         | `ARCHITECTURE.md`                                                                  | TASK-C-11        | ✅     |

### 2.2 Обеспечение и защита проекта

| Sección                                        | Contenido para SISGAD5                                                                 | Fuente                                          | Tarea            | Estado |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------- | ------ |
| **2.2.1 Устав команды и командное соглашение** | Roles (analista, backend, frontend, QA), reglas de comunicación, herramientas.         | Nuevo                                           | **TASK-1400-03** | ⏳      |
| **2.2.2 Оценка ресурсного обеспечения**        | Hardware (4 cores, 8GB RAM), software (Docker, PostgreSQL, Node, Go, Python), humanos. | Nuevo                                           | **TASK-1400-04** | ⏳      |
| **2.2.3 Управление рисками**                   | Riesgos: pérdida de datos, fallos de seguridad, dependencia SAP, retrasos. Mitigación. | Nuevo                                           | **TASK-1400-05** | ⏳      |
| **2.2.4 Seguridad y cumplimiento** *(añadido)* | RBAC, JWT, auditoría.                                                                  | `AGENTS.md` sección 8, `docs/13_security.es.md` | TASK-A-08, A-09  | ✅/⏳   |

### 2.3 Архитектурно-календарное планирование

| Sección                                     | Contenido para SISGAD5                                                      | Fuente                  | Tarea            | Estado |
| ------------------------------------------- | --------------------------------------------------------------------------- | ----------------------- | ---------------- | ------ |
| **2.3.1 Системная архитектура**             | Diagrama de componentes (Mermaid), microservicios, Gateway, BD, Prediction. | `ARCHITECTURE.md`       | TASK-C-11        | ✅     |
| **2.3.2 План реализации**                   | Diagrama de Gantt (Fases A–D + Parte II).                                   | Nuevo                   | **TASK-1400-06** | ⏳      |
| **2.3.3 Estrategia de testing** *(añadido)* | Tests unitarios, integración, E2E, carga.                                   | `docs/16_testing.es.md` | Fase 8           | ✅     |

---

## 3 РЕАЛИЗАЦИЯ ПРОЕКТА С ИСПОЛЬЗОВАНИЕМ ГИБКИХ МЕТОДОЛОГИЙ

### 3.1 Разработка алгоритмов ИС SISGAD5

| Sección                                               | Contenido para SISGAD5                   | Fuente                                     | Tarea               | Estado |
| ----------------------------------------------------- | ---------------------------------------- | ------------------------------------------ | ------------------- | ------ |
| **3.1.1 Алгоритм asignación de materiales**           | ACID + goroutines + validación de stock. | `backend-materiales-go/internal/services/` | TASK-520-05, 520-06 | ✅/⏳   |
| **3.1.2 Алгоритм cierre de queja con saga**           | MP → Materials, compensación.            | Nuevo                                      | **TASK-B-22**       | ⏳      |
| **3.1.3 Алгоритм predicción de demanda**              | Prophet/XGBoost, features, métricas.     | Nuevo                                      | **TASK-D-06**       | ⏳      |
| **3.1.4 Алгоритм detección de anomalías** *(añadido)* | Isolation Forest, Z-Score.               | Nuevo                                      | **TASK-D-08**       | ⏳      |

### 3.2 [Разработка / Модернизация] ПО ИС SISGAD5

| Sección                                                | Contenido para SISGAD5                                           | Fuente                       | Tarea            | Estado |
| ------------------------------------------------------ | ---------------------------------------------------------------- | ---------------------------- | ---------------- | ------ |
| **3.2.1 Применяемые гибкие методологии**               | Scrum adaptado (sprints 1 semana), Kanban, Conventional Commits. | Nuevo                        | **TASK-1400-07** | ⏳      |
| **3.2.2 Разработка backend**                           | Users, MP, Materials, Gateway.                                   | `backend-*/`, `api-gateway/` | Fases 3–6        | ✅     |
| **3.2.3 Разработка frontend**                          | React + dashboards.                                              | `frontend/`                  | Fase 7           | ✅/⏳   |
| **3.2.4 Desarrollo del módulo predictivo** *(añadido)* | Python + FastAPI + MLflow.                                       | Nuevo                        | **Fase D**       | ⏳      |

---

## 4 ОЦЕНКА ЭФФЕКТИВНОСТИ И ВАЛИДАЦИЯ СИСТЕМЫ (Evaluación y validación) *(añadido)*

| Sección                                 | Contenido para SISGAD5            | Fuente | Tarea            | Estado |
| --------------------------------------- | --------------------------------- | ------ | ---------------- | ------ |
| **4.1 Métricas de rendimiento**         | Latencia, throughput, benchmarks. | Nuevo  | **TASK-1400-08** | ⏳      |
| **4.2 Métricas de modelos predictivos** | MAE, RMSE, F1, Precision/Recall.  | Nuevo  | **TASK-1400-08** | ⏳      |
| **4.3 Evaluación de usabilidad**        | SUS, Lighthouse, accesibilidad.   | Nuevo  | **TASK-1400-08** | ⏳      |
| **4.4 Validación con el cliente**       | Pruebas de aceptación con DAG5.   | Nuevo  | **TASK-1400-09** | ⏳      |

---

## ЗАКЛЮЧЕНИЕ (Conclusión)

| Sección                               | Contenido para SISGAD5                                                  | Fuente                | Tarea            | Estado |
| ------------------------------------- | ----------------------------------------------------------------------- | --------------------- | ---------------- | ------ |
| **Практическая значимость**           | Reducción de tiempo, optimización de materiales, decisiones proactivas. | Nuevo                 | **TASK-1200-01** | ⏳      |
| **Перспективы дальнейшей разработки** | SAP, LDAP, Kubernetes, deep learning.                                   | `TASKLIST.md` Fase 13 | **TASK-1200-01** | ⏳      |

---

## СПИСОК ИСПОЛЬЗОВАННЫХ ИСТОЧНИКОВ (Fuentes)

| Sección      | Contenido       | Fuente                              | Tarea        | Estado |
| ------------ | --------------- | ----------------------------------- | ------------ | ------ |
| Bibliografía | ГОСТ 7.0.5-2008 | `docs/thesis/07_bibliography.es.md` | TASK-1200-01 | ✅     |

---

## ПРИЛОЖЕНИЕ А КОДОВАЯ БАЗА ПРОЕКТА (Anexo A: Código)

| Sección       | Contenido                                          | Fuente | Tarea        | Estado |
| ------------- | -------------------------------------------------- | ------ | ------------ | ------ |
| Código fuente | Repositorio `SISGAD5_1.0` + capturas de estructura | Repo   | TASK-1200-01 | ✅     |

---

## ПРИЛОЖЕНИЕ Б … (Anexos opcionales)

| Sección                      | Contenido             | Fuente           | Tarea            | Estado |
| ---------------------------- | --------------------- | ---------------- | ---------------- | ------ |
| Anexo B: Diagramas           | Mermaid exportados    | `docs/diagrams/` | TASK-C-01 a C-10 | ✅     |
| Anexo C: Manuales            | Manuales de usuario   | `docs/manuals/`  | TASK-D-16        | ✅     |
| Anexo D: Resultados de tests | Reportes de cobertura | `tests/`         | Fase 8           | ⏳      |

---

## 📊 Resumen de secciones y estado

| Sección                   | Estado | Tareas pendientes     |
| ------------------------- | ------ | --------------------- |
| ВВЕДЕНИЕ                  | ✅     | —                     |
| 1. Обзор                  | ✅     | —                     |
| 2.1.1 Socioeconómico      | ⏳      | TASK-1400-01          |
| 2.1.2 Modelos matemáticos | ⏳      | TASK-1400-02          |
| 2.2.1 Acta de equipo      | ⏳      | TASK-1400-03          |
| 2.2.2 Recursos            | ⏳      | TASK-1400-04          |
| 2.2.3 Riesgos             | ⏳      | TASK-1400-05          |
| 2.3.2 Gantt               | ⏳      | TASK-1400-06          |
| 3.2.1 Metodologías ágiles | ⏳      | TASK-1400-07          |
| 4. Evaluación             | ⏳      | TASK-1400-08, 1400-09 |
| ЗАКЛЮЧЕНИЕ                | ⏳      | TASK-1200-01          |
| Fuentes                   | ✅     | —                     |
| Anexos                    | ✅/⏳   | —                     |

---

> **Mantenido por:** Ing. Botet S.Y.
> **Licencia:** Uso académico — Tesis de Maestría RTU MIREA