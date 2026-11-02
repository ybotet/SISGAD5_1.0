# Diagramas de Clases — SISGAD5

| Archivo | Descripción | Fuente documental |
|---|---|---|
| `domain_model_classes.puml` | Diagrama UML de clases del modelo de dominio completo (v2.1): 39 entidades en 6 contextos delimitados + Shared Kernel. Incluye agregados raíz, entidades, value objects y relaciones. | [`docs/07_domain_model.es.md`](../../07_domain_model.es.md) §9.1 |
| `assets/domain_model_classes.svg` | Render SVG generado desde el `.puml`, versionado para visualización directa en GitHub (embebido en `docs/07_domain_model.es.md`). | — |

## Cómo visualizar

**En GitHub:** el diagrama se muestra renderizado embebido en [`docs/07_domain_model.es.md`](../../07_domain_model.es.md) (§9.1) apuntando a `assets/domain_model_classes.svg`. También puede abrirse el SVG directamente.

**Opción 1 — VS Code:** extensión *PlantUML* (`jebbs.plantuml`) → abrir el `.puml` y `Alt+D` para vista previa.

**Opción 2 — CLI (sin instalar servidor):**
```bash
docker run --rm -v "$PWD":/data plantuml/plantuml -tsvg domain_model_classes.puml
# luego mover el .svg generado a assets/ y hacer commit
```

**Opción 3 — Online:** pegar el contenido en https://www.plantuml.com/plantuml/uml

> ⚠️ Si editas el `.puml`, regenera el SVG (opción 2 o 3) y actualiza `assets/domain_model_classes.svg` para mantener la vista de GitHub sincronizada con la fuente.

## Convenciones
- Colores de paquete = color coding usado en los diagramas ASCII de `07_domain_model`.
- `<<VO>>` = Value Object del Shared Kernel; `<<pivot>>` = tablas relacionales RBAC.
- Las ACL externas (SAP ERP, GLPI) se documentan como nota: son adaptadores planificados, no clases de dominio actuales.
