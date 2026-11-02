# Diagramas de Clases — SISGAD5

| Archivo | Descripción | Fuente documental |
|---|---|---|
| `domain_model_classes.puml` | Diagrama UML de clases del modelo de dominio completo (v2.1): 39 entidades en 6 contextos delimitados + Shared Kernel. Incluye agregados raíz, entidades, value objects y relaciones. | [`docs/07_domain_model.es.md`](../../07_domain_model.es.md) |

## Cómo visualizar

**Opción 1 — VS Code:** extensión *PlantUML* (`jebbs.plantuml`) → abrir el `.puml` y `Alt+D` para vista previa.

**Opción 2 — CLI (sin instalar servidor):**
```bash
docker run --rm -v "$PWD":/data plantuml/plantuml -tpng domain_model_classes.puml
```

**Opción 3 — Online:** pegar el contenido en https://www.plantuml.com/plantuml/uml

## Convenciones
- Colores de paquete = color coding usado en los diagramas ASCII de `07_domain_model`.
- `<<VO>>` = Value Object del Shared Kernel; `<<pivot>>` = tablas relacionales RBAC.
- Las ACL externas (SAP ERP, GLPI) se documentan como nota: son adaptadores planificados, no clases de dominio actuales.
