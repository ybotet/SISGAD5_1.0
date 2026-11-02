# Диаграммы последовательностей - SISGAD5 (русский/испанский)

> **Versión:** 2.1 — ⚠️ Документ объединён и перемещён el 2026-11-02
> **Новый канонический файл:** [`diagrams/sequence_diagrams/sequence_diagrams.md`](diagrams/sequence_diagrams/sequence_diagrams.md)

Этот документ был **объединён** с `docs/diagrams/sequence_diagrams/sequence_diagrams.md` для устранения дублирования диаграмм последовательностей. Каноническая версия содержит **7 сценариев** (6 критических + 1 дополнительный), включая все сценарии из этого файла:

| Исходный раздел (v1.0) | Новый сценарий в каноническом документе |
|-------------------------|------------------------------------------|
| §1 Полный поток жалобы | [Escenario 1](diagrams/sequence_diagrams/sequence_diagrams.md#escenario-1-flujo-completo-de-queja-(abierta--cerrada)) |
| §2 Назначение и расход материалов | [Escenario 4](diagrams/sequence_diagrams/sequence_diagrams.md#escenario-4-asignación-de-materiales-con-validación-de-stock) y [Escenario 5](diagrams/sequence_diagrams/sequence_diagrams.md#escenario-5-consumo-de-materiales-(validación-vs-asignación)) |
| §3 Аутентификация и доступ к защищённому ресурсу | [Escenario 2](diagrams/sequence_diagrams/sequence_diagrams.md#escenario-2-login-y-autenticación-con-jwt-(-refresh-rotativo)) y [Escenario 3](diagrams/sequence_diagrams/sequence_diagrams.md#escenario-3-acceso-a-recurso-protegido-(claims-vía-gateway)) |

ASCII-диаграммы версии 1.0 были преобразованы в **Mermaid** (нативный рендеринг на GitHub).

## Ссылки

- [Варианты использования](03_use_cases.ru.md)
- [Модель домена](07_domain_model.ru.md)
- [Машины состояний](09_state_machines.ru.md)
- [Стратегия безопасности](13_security.ru.md)
