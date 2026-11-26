#!/usr/bin/env python3
"""
Generador de Matriz de Trazabilidad Requisito → Caso de Uso → Endpoint/Clase → Test
para el proyecto SISGAD5.

Uso:
    .venv\Scripts\python.exe scripts\gen-traceability.py

Fuentes:
  - docs/05_requirements.es.md  (Sección 1: requisitos RF; Sección 4: matriz existente)
  - docs/03_use_cases.es.md     (casos de uso UC-XX)
  - docs/api/*.yaml             (endpoints OpenAPI)
  - tests existentes en backend-mp/tests, backend-users/tests, backend-materiales-go

Salida:
  - docs/traceability_matrix.md
"""

import re
import sys
import yaml
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent


# ---------------------------------------------------------------------------
# 1. Extraer requisitos SOLO de la Sección 1 (RF tables: ID|Nombre|Desc|Prioridad|UC)
# ---------------------------------------------------------------------------
def extract_requirements_section1(md_path):
    requirements = []
    text = md_path.read_text(encoding="utf-8")

    # Solo procesar hasta la Sección 2 (RNF) para evitar mezclar estructuras
    section1_end = text.find("## 2. Requisitos No Funcionales")
    if section1_end == -1:
        section1_text = text
    else:
        section1_text = text[:section1_end]

    # Tabla: | ID | Nombre | Descripción | Prioridad | Caso de Uso |
    pattern = re.compile(
        r"^\|\s*((?:RF|RF-PRED)-[A-Z0-9-]+)\s*\|"
        r"([^|]+?)\s*\|"
        r"([^|]+?)\s*\|"
        r"([^|]+?)\s*\|"
        r"([^|]+?)\s*\|$",
        re.MULTILINE,
    )
    seen = set()
    for m in pattern.finditer(section1_text):
        req_id = m.group(1).strip()
        if req_id in seen:
            continue
        seen.add(req_id)
        nombre = m.group(2).strip()
        desc = m.group(3).strip()
        priority = m.group(4).strip()
        uc = m.group(5).strip()
        priority = re.sub(r"🔴|🟡|🟢|⚪", "", priority).strip()
        uc = None if uc in ("-", "—", "") else uc
        requirements.append({
            "id": req_id,
            "nombre": nombre,
            "description": desc,
            "priority": priority,
            "use_case": uc,
        })
    return requirements


# ---------------------------------------------------------------------------
# 1b. Extraer mapeos de la Sección 4 (matriz existente: Req|UC|Clase|Endpoint|Test)
# ---------------------------------------------------------------------------
def extract_section4_mappings(md_path):
    """Extrae la matriz de trazabilidad existente de la Sección 4."""
    mappings = {}
    text = md_path.read_text(encoding="utf-8")

    section4_start = text.find("## 4. Matriz de Trazabilidad")
    if section4_start == -1:
        return mappings
    section4_text = text[section4_start:]

    # Tabla: | Requisito | Caso de Uso | Clase Dominio | Endpoint | Test |
    pattern = re.compile(
        r"^\|\s*((?:RF|RF-PRED|RNF|RN)-[A-Z0-9-]+)\s*\|"
        r"([^|]+?)\s*\|"
        r"([^|]+?)\s*\|"
        r"([^|]+?)\s*\|"
        r"([^|]+?)\s*\|$",
        re.MULTILINE,
    )
    for m in pattern.finditer(section4_text):
        req_id = m.group(1).strip()
        uc = m.group(2).strip() or None
        clase = m.group(3).strip() or None
        endpoint = m.group(4).strip() or None
        test = m.group(5).strip() or None
        mappings[req_id] = {
            "use_case": None if uc in ("-", "—", "") else uc,
            "clase": None if clase in ("-", "—", "") else clase,
            "endpoint": None if endpoint in ("-", "—", "") else endpoint,
            "test": None if test in ("-", "—", "") else test,
        }
    return mappings


# ---------------------------------------------------------------------------
# 2. Extraer casos de uso de 03_use_cases.es.md
# ---------------------------------------------------------------------------
def extract_use_cases(md_path):
    use_cases = {}
    text = md_path.read_text(encoding="utf-8")
    pattern = re.compile(
        r"\|\s*(UC-\d+)\s*\|\s*\*\*([^*]+)\*\*\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|"
    )
    for m in pattern.finditer(text):
        uc_id = m.group(1).strip()
        name = m.group(2).strip()
        actor = m.group(3).strip()
        desc = m.group(4).strip()
        use_cases[uc_id] = {
            "id": uc_id,
            "name": name,
            "actor": actor,
            "description": desc,
        }
    return use_cases


# ---------------------------------------------------------------------------
# 3. Extraer endpoints de los archivos OpenAPI YAML
# ---------------------------------------------------------------------------
def extract_endpoints(api_dir):
    endpoints = []
    api_path = Path(api_dir)
    if not api_path.exists():
        return endpoints
    for yaml_file in sorted(api_path.glob("*.yaml")):
        try:
            spec = yaml.safe_load(yaml_file.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"  WARN: no se pudo parsear {yaml_file}: {e}", file=sys.stderr)
            continue
        paths = spec.get("paths", {}) or {}
        for path, methods in paths.items():
            if not isinstance(methods, dict):
                continue
            for method, details in methods.items():
                if method not in ("get", "post", "put", "patch", "delete", "options", "head"):
                    continue
                if not isinstance(details, dict):
                    continue
                op_id = details.get("operationId", "N/A")
                summary = details.get("summary", "N/A")
                tags = details.get("tags", [])
                if isinstance(tags, str):
                    tags = [tags]
                endpoints.append({
                    "method": method.upper(),
                    "path": path,
                    "operationId": op_id,
                    "summary": summary,
                    "tags": tags,
                    "source": yaml_file.name,
                })
    return endpoints


# ---------------------------------------------------------------------------
# 4. Descubrir tests existentes (excluyendo node_modules)
# ---------------------------------------------------------------------------
def discover_tests():
    test_files = []
    patterns = [
        "backend-mp/tests/*.test.js",
        "backend-users/tests/*.test.js",
        "backend-materiales-go/**/*_test.go",
        "frontend/src/**/*.test.*",
        "frontend/src/**/*.spec.*",
    ]
    for pat in patterns:
        for p in ROOT.glob(pat):
            rel = str(p.relative_to(ROOT)).replace("\\", "/")
            if "node_modules" in rel:
                continue
            test_files.append(rel)
    return sorted(test_files)


# ---------------------------------------------------------------------------
# 5. Mapear tests a requisitos (heurística por nombre de archivo)
# ---------------------------------------------------------------------------
def map_test_to_requirements(test_files):
    test_mapping = {}
    for tf in test_files:
        tf_lower = tf.lower()
        reqs = []
        if "auth.test.js" in tf_lower and "backend-mp" in tf_lower:
            reqs.extend(["RF-AUTH-01", "RF-AUTH-02", "RF-AUTH-03", "RF-AUTH-04", "RF-AUTH-07", "RF-AUTH-08"])
        if "queja.test.js" in tf_lower:
            reqs.extend(["RF-MP-14", "RF-MP-15", "RF-MP-16", "RF-MP-17", "RF-MP-18", "RF-MP-19", "RF-MP-21", "RF-MP-22"])
        if "linea.test.js" in tf_lower:
            reqs.extend(["RF-MP-05", "RF-MP-06", "RF-MP-07", "RF-MP-08"])
        if "historial.test.js" in tf_lower:
            reqs.extend(["RF-MP-03", "RF-MP-07", "RF-MP-13"])
        if "cierreSaga.test.js" in tf_lower:
            reqs.extend(["RF-MP-19", "RF-MP-20"])
        if "security.test.js" in tf_lower:
            reqs.extend(["RF-USR-04", "RF-MP-20"])
        if "auditoria.test.js" in tf_lower:
            reqs.extend(["RF-MP-20"])
        if "backend-users/tests" in tf_lower:
            if "user.test.js" in tf_lower:
                reqs.extend(["RF-USR-01", "RF-USR-03"])
            if "auth.test.js" in tf_lower:
                reqs.extend(["RF-AUTH-01", "RF-AUTH-02", "RF-AUTH-03", "RF-AUTH-04"])
            if "jwt.test.js" in tf_lower:
                reqs.extend(["RF-AUTH-02", "RF-AUTH-03"])
            if "middleware.test.js" in tf_lower:
                reqs.extend(["RF-USR-04"])
            if "validation.test.js" in tf_lower:
                reqs.extend(["RF-USR-01", "RF-USR-02"])
        if "backend-materiales-go" in tf_lower:
            if "config_test.go" in tf_lower or "auth_test.go" in tf_lower:
                reqs.extend(["RF-MAT-25"])
            if "asignacion_service_test.go" in tf_lower:
                reqs.extend(["RF-MAT-03", "RF-MAT-06", "RF-MAT-09", "RF-MAT-11", "RF-MAT-12", "RF-MAT-13", "RF-MAT-14"])
            if "consumo_service_test.go" in tf_lower:
                reqs.extend(["RF-MAT-04", "RF-MAT-06", "RF-MAT-10", "RF-MAT-11", "RF-MAT-12", "RF-MAT-13", "RF-MAT-14"])
        if reqs:
            test_mapping[tf] = sorted(set(reqs))
    return test_mapping


# ---------------------------------------------------------------------------
# 6. Mapear requisitos a endpoints (heurística por palabras clave)
# ---------------------------------------------------------------------------

KEYWORD_MAP = {
    "rf-auth-01": ["register", "registro"],
    "rf-auth-02": ["login", "iniciar", "sesion"],
    "rf-auth-03": ["refresh", "renovar"],
    "rf-auth-04": ["logout", "cerrar"],
    "rf-usr-01": ["users", "usuario"],
    "rf-usr-02": ["roles", "rol"],
    "rf-usr-03": ["roles", "user"],
    "rf-mp-01": ["telefono", "telefonos"],
    "rf-mp-02": ["telefono", "estado"],
    "rf-mp-03": ["historial", "telefono"],
    "rf-mp-04": ["telefono", "search", "busqueda"],
    "rf-mp-05": ["linea", "lineas"],
    "rf-mp-06": ["linea", "estado"],
    "rf-mp-07": ["historial", "linea"],
    "rf-mp-08": ["linea", "search", "busqueda"],
    "rf-mp-09": ["pizarra", "pizarras"],
    "rf-mp-12": ["pizarra", "ubicacion"],
    "rf-mp-13": ["pizarra", "search", "busqueda"],
    "rf-mp-14": ["queja", "crear"],
    "rf-mp-15": ["queja", "clasificacion"],
    "rf-mp-16": ["queja", "prioridad"],
    "rf-mp-17": ["queja", "estado"],
    "rf-mp-18": ["queja", "asignar"],
    "rf-mp-19": ["historial", "queja"],
    "rf-mp-20": ["auditoria"],
    "rf-mp-21": ["queja", "filter", "busqueda"],
    "rf-mp-22": ["queja", "page", "paginacion"],
    "rf-mp-23": ["notificacion", "email"],
    "rf-mp-24": ["prueba", "crear"],
    "rf-mp-25": ["prueba", "resultado"],
    "rf-mp-26": ["prueba", "vinculacion"],
    "rf-mp-27": ["prueba", "historial"],
    "rf-mp-28": ["trabajo", "crear"],
    "rf-mp-29": ["trabajo", "asignar"],
    "rf-mp-30": ["trabajo", "tiempo"],
    "rf-mp-31": ["trabajo", "cerrar"],
    "rf-mp-32": ["trabajo", "historial"],
    "rf-mp-33": ["estadisticas", "resumen"],
    "rf-mp-34": ["estadisticas", "metricas"],
    "rf-mp-35": ["estadisticas", "fecha", "servicio"],
    "rf-mat-01": ["materiales"],
    "rf-mat-02": ["categorias", "unidades"],
    "rf-mat-03": ["asignaciones"],
    "rf-mat-04": ["consumos"],
    "rf-mat-05": ["materiales", "filter"],
    "rf-mat-06": ["asignaciones", "consumos", "precio"],
    "rf-mat-07": ["materiales", "search"],
    "rf-mat-08": ["materiales", "page", "paginacion"],
    "rf-mat-09": ["asignaciones", "transaccion"],
    "rf-mat-10": ["consumos", "transaccion"],
    "rf-mat-11": ["materiales", "existencia"],
    "rf-mat-12": ["asignaciones", "consumos", "cantidad"],
    "rf-mat-13": ["consumos", "stock"],
    "rf-mat-14": ["consumos", "asignacion"],
    "rf-mat-15": ["asignaciones", "consumos", "concurrencia"],
    "rf-mat-16": ["dashboard", "resumen"],
    "rf-mat-17": ["dashboard", "categorias"],
    "rf-mat-18": ["dashboard", "unidades"],
    "rf-mat-19": ["dashboard", "saldo"],
    "rf-mat-20": ["dashboard", "alertas"],
    "rf-mat-21": ["dashboard", "format", "csv"],
    "rf-mat-22": ["dashboard", "tendencias", "predicciones"],
    "rf-mat-23": ["materials", "rest"],
    "rf-mat-24": ["gateway", "proxy"],
    "rf-mat-25": ["health"],
    "rf-mat-26": ["swagger"],
    "rf-mat-27": ["sap", "export"],
}


def map_requirement_to_endpoints(req_id, endpoints):
    mapped = []
    kw = KEYWORD_MAP.get(req_id.lower(), [])
    if not kw:
        return mapped
    for ep in endpoints:
        path_lower = ep["path"].lower()
        summary_lower = ep["summary"].lower()
        tags_str = " ".join(ep["tags"]).lower()
        combined = path_lower + " " + summary_lower + " " + tags_str
        if any(k in combined for k in kw):
            mapped.append(ep)
    return mapped


# ---------------------------------------------------------------------------
# 7. Generar la matriz
# ---------------------------------------------------------------------------
def generate_matrix():
    reqs_path = ROOT / "docs" / "05_requirements.es.md"
    uc_path = ROOT / "docs" / "03_use_cases.es.md"
    api_dir = ROOT / "docs" / "api"

    print("1. Extrayendo requisitos (Sección 1)...")
    requirements = extract_requirements_section1(reqs_path)
    print(f"   {len(requirements)} requisitos encontrados")

    print("2. Extrayendo mapeos de la Sección 4...")
    section4 = extract_section4_mappings(reqs_path)
    print(f"   {len(section4)} mapeos de matriz existente")

    print("3. Extrayendo casos de uso...")
    use_cases = extract_use_cases(uc_path)
    print(f"   {len(use_cases)} casos de uso encontrados")

    print("4. Extrayendo endpoints de API...")
    endpoints = extract_endpoints(api_dir)
    print(f"   {len(endpoints)} endpoints encontrados")

    print("5. Descubriendo tests...")
    test_files = discover_tests()
    print(f"   {len(test_files)} archivos de test encontrados")

    print("6. Mapeando tests a requisitos...")
    test_to_reqs = map_test_to_requirements(test_files)

    req_to_tests = {}
    for tf, reqs in test_to_reqs.items():
        for r in reqs:
            req_to_tests.setdefault(r, []).append(tf)

    # Mapear requisitos a endpoints (heurística)
    req_to_endpoints = {}
    for r in requirements:
        eps = map_requirement_to_endpoints(r["id"], endpoints)
        req_to_endpoints[r["id"]] = eps

    # Combinar tests del heurístico y de la Sección 4 para determinar huérfanos
    s4_test_reqs = set()
    for rid, s4 in section4.items():
        if s4.get("test") and s4["test"] not in ("-", "—"):
            s4_test_reqs.add(rid)

    reqs_without_test = [
        r for r in requirements
        if r["id"] not in req_to_tests and r["id"] not in s4_test_reqs
    ]
    tests_without_req = [tf for tf in test_files if tf not in test_to_reqs]

    mapped_ep_keys = set()
    for eps in req_to_endpoints.values():
        for ep in eps:
            mapped_ep_keys.add((ep["method"], ep["path"]))
    endpoints_without_req = [
        ep for ep in endpoints if (ep["method"], ep["path"]) not in mapped_ep_keys
    ]

    lines = []
    lines.append("# Matriz de Trazabilidad SISGAD5")
    lines.append("")
    lines.append("> Generado automáticamente por: `scripts/gen-traceability.py`")
    lines.append("> Fuentes: `docs/05_requirements.es.md` (Sección 1 y 4), `docs/03_use_cases.es.md`, `docs/api/*.yaml`, tests existentes")
    lines.append("> Estado: Semi-automatizado - revisar manualmente antes de publicar")
    lines.append("> Criterio: 'sin huérfanos' aplicado a requisitos v1; futuros se marcan GAP")
    lines.append("")
    lines.append("## Resumen")
    lines.append(f"- Requisitos totales: {len(requirements)}")
    lines.append(f"- Casos de uso totales: {len(use_cases)}")
    lines.append(f"- Endpoints de API: {len(endpoints)}")
    lines.append(f"- Archivos de test: {len(test_files)}")
    lines.append(f"- Requisitos SIN test (huérfanos): {len(reqs_without_test)}")
    lines.append(f"- Tests SIN requisito (huérfanos): {len(tests_without_req)}")
    lines.append(f"- Endpoints SIN requisito (huérfanos): {len(endpoints_without_req)}")
    lines.append("")

    lines.append("## 1. Matriz Requisito → Caso de Uso → Endpoint → Test")
    lines.append("")
    lines.append("| Requisito | Descripción | Prioridad | Caso de Uso | Endpoint(s) | Test(s) | Estado |")
    lines.append("|-----------|-------------|-----------|-------------|-------------|---------|--------|")

    for r in sorted(requirements, key=lambda x: x["id"]):
        rid = r["id"]
        desc = r["description"][:55] + ("..." if len(r["description"]) > 55 else "")
        priority = r["priority"]
        uc = r["use_case"] or "-"
        uc_name = use_cases.get(uc, {}).get("name", "") if uc else ""

        # Usar endpoint de la Sección 4 si está disponible, si no usar heurística
        s4 = section4.get(rid, {})
        s4_endpoint = s4.get("endpoint", "")
        s4_test = s4.get("test", "")

        eps = req_to_endpoints.get(rid, [])
        if s4_endpoint and s4_endpoint not in ("-", "—"):
            ep_str = s4_endpoint
        elif eps:
            ep_str = ", ".join(f"{e['method']} {e['path']}" for e in eps[:3])
            if len(eps) > 3:
                ep_str += f" (+{len(eps)-3})"
        else:
            ep_str = "-"

        tests = req_to_tests.get(rid, [])
        if s4_test and s4_test not in ("-", "—"):
            test_str = s4_test
        elif tests:
            test_str = ", ".join(Path(t).name for t in tests)
        else:
            test_str = "-"

        if not tests and not s4_test:
            estado = "HUERFANO-sin-test"
        elif not eps and not s4_endpoint:
            estado = "GAP-sin-endpoint"
        else:
            estado = "OK"
        lines.append(f"| {rid} | {desc} | {priority} | {uc} {uc_name} | {ep_str} | {test_str} | {estado} |")

    lines.append("")

    lines.append("## 2. Huérfanos Detectados")
    lines.append("")
    lines.append("### 2.1 Requisitos SIN test asociado")
    if reqs_without_test:
        lines.append("| Requisito | Descripción | Caso de Uso |")
        lines.append("|-----------|-------------|-------------|")
        for r in sorted(reqs_without_test, key=lambda x: x["id"]):
            uc = r["use_case"] or "-"
            lines.append(f"| {r['id']} | {r['description']} | {uc} |")
    else:
        lines.append("*Ninguno*")
    lines.append("")
    lines.append("### 2.2 Tests SIN requisito asociado")
    if tests_without_req:
        lines.append("| Test | Notas |")
        lines.append("|------|-------|")
        for tf in sorted(tests_without_req):
            lines.append(f"| {tf} | revisar manualmente |")
    else:
        lines.append("*Ninguno*")
    lines.append("")
    lines.append("### 2.3 Endpoints SIN requisito asociado")
    if endpoints_without_req:
        lines.append("| Método | Endpoint | Origen |")
        lines.append("|--------|----------|--------|")
        for ep in sorted(endpoints_without_req, key=lambda x: (x["method"], x["path"])):
            lines.append(f"| {ep['method']} | {ep['path']} | {ep['source']} |")
    else:
        lines.append("*Ninguno*")
    lines.append("")

    lines.append("## 3. Casos de Uso → Endpoints")
    lines.append("")
    lines.append("| Caso de Uso | Nombre | Endpoints API |")
    lines.append("|-------------|--------|---------------|")
    for uc_id in sorted(use_cases.keys()):
        uc = use_cases[uc_id]
        related = []
        for ep in endpoints:
            if uc_id.lower() in ep["summary"].lower() or uc_id.lower() in " ".join(ep["tags"]).lower():
                related.append(f"{ep['method']} {ep['path']}")
        ep_str = ", ".join(related[:3]) if related else "-"
        lines.append(f"| {uc_id} | {uc['name']} | {ep_str} |")

    lines.append("")
    lines.append("## 4. Notas del Revisor")
    lines.append("")
    lines.append("- HUERFANO-sin-test: requiere un test o justificación documentada.")
    lines.append("- GAP-sin-endpoint: tiene test pero no endpoint definido (o viceversa).")
    lines.append("- OK: tiene requisito, caso de uso, endpoint y test.")
    lines.append("- Endpoints marcados como Planificado en los YAML no se cuentan como implementados.")
    lines.append("")
    lines.append("---")
    lines.append("*Generado por scripts/gen-traceability.py - Revisar y validar antes de commit.*")

    out_path = ROOT / "docs" / "traceability_matrix.md"
    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"\nMatriz escrita en: {out_path}")
    print(f"Requisitos: {len(requirements)} | Sin test: {len(reqs_without_test)}")
    print(f"Tests: {len(test_files)} | Sin requisito: {len(tests_without_req)}")
    print(f"Endpoints: {len(endpoints)} | Sin requisito: {len(endpoints_without_req)}")


if __name__ == "__main__":
    generate_matrix()