# Индекс документации - SISGAD5

> **Версия:** 1.0  
> **Дата:** 2026-09-25  
> **Репозиторий:** https://github.com/ybotet/SISGAD5_1.0

---

## 📚 Структура документации

| # | Документ | Описание |
|---|----------|----------|
| 00 | [00_index.ru.md](00_index.ru.md) | Этот индекс |
| 01 | [01_introduction.ru.md](01_introduction.ru.md) | Введение и контекст проекта |
| 02 | [02_actors.ru.md](02_actors.ru.md) | Актеры системы (7 ролей) |
| 03 | [03_use_cases.ru.md](03_use_cases.ru.md) | Варианты использования (24 случая) |
| 04 | [04_glossary.ru.md](04_glossary.ru.md) | Глоссарий терминов (убикуозный язык) |
| 05 | [05_requirements.ru.md](05_requirements.ru.md) | Функциональные и нефункциональные требования |
| 06 | [06_business_rules.ru.md](06_business_rules.ru.md) | Бизнес-правила |
| 07 | [07_domain_model.ru.md](07_domain_model.ru.md) | Доменная модель (28 классов, 5 контекстов) |
| 08 | [08_sequence_diagrams.ru.md](08_sequence_diagrams.ru.md) | Диаграммы последовательностей (3 критических сценария) |
| 09 | [09_state_machines.ru.md](09_state_machines.ru.md) | Конечные автоматы |
| 10 | [10_api_contracts.ru.md](10_api_contracts.ru.md) | Контракты API (индекс) |
| 11 | [11_data_model.ru.md](11_data_model.ru.md) | Модель данных (ER-диаграмма, 3 БД) |
| 12 | [12_rbac_matrix.ru.md](12_rbac_matrix.ru.md) | Матрица ролей и разрешений (RBAC) |
| 13 | [13_security.ru.md](13_security.ru.md) | Стратегия безопасности (JWT + Refresh) |
| 14 | [14_deployment.ru.md](14_deployment.ru.md) | Руководство по развертыванию |
| 15 | [15_operations.ru.md](15_operations.ru.md) | Руководство по эксплуатации |
| 16 | [16_testing.ru.md](16_testing.ru.md) | Стратегия тестирования |
| 17 | [17_roadmap.ru.md](17_roadmap.ru.md) | Дорожная карта развития |

---

## 📋 OpenAPI контракты

| Сервис | Файл |
|--------|------|
| Users Service | [api/users.yaml](api/users.yaml) |
| MP Service | [api/mp.yaml](api/mp.yaml) |
| Materials Service | [api/materials.yaml](api/materials.yaml) |
| API Gateway | [api/gateway.yaml](api/gateway.yaml) |

---

## 📊 Исходные диаграммы

```
docs/diagrams/
├── use_cases/          # Диаграммы вариантов использования
├── class_diagrams/     # Диаграммы классов
├── sequence_diagrams/  # Диаграммы последовательностей
├── state_machines/     # Конечные автоматы
├── er_diagrams/        # ER-диаграммы
├── component_diagrams/ # Диаграммы компонентов
└── deployment_diagrams/ # Диаграммы развертывания
```

---

## 🎓 Дипломная документация

```
docs/thesis/
├── 00_abstract.ru.md
├── 01_introduction.ru.md
├── 02_state_of_art.ru.md
├── 03_methodology.ru.md
├── 04_development.ru.md
├── 05_results.ru.md
├── 06_conclusions.ru.md
├── 07_bibliography.ru.md
├── 08_appendices.ru.md
└── assets/
```

---

## 📝 Учебные практики

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

## 📖 Руководства пользователя

```
docs/manuals/
├── manual_explotacion_general.md
├── manual_dashboard_materiales.md
├── manual_dashboard_quejas.md
├── manual_administracion.md
└── manual_tecnico.md
```

---

## 🔗 Быстрые ссылки

- **Основной репозиторий:** https://github.com/ybotet/SISGAD5_1.0
- **Архивный репозиторий (SISGAD5_doc):** https://github.com/ybotet/SISGAD5_doc
- **Техническое задание:** [SPEC.md](../SPEC.md)
- **Архитектура:** [ARCHITECTURE.md](../ARCHITECTURE.md)
- **Список задач:** [TASKLIST.md](../TASKLIST.md)
- **Промпты по фазам:** [PROMPTS.md](../PROMPTS.md)
- **Память проекта:** [memory.md](../memory.md)
