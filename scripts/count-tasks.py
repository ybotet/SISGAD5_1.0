#!/usr/bin/env python3
"""Recalcula conteos de TASKLIST.md por fase a partir de las filas de tabla."""
import re
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

PATH = r"C:\Users\ybotet\Documentos\Programación\Sisgad5_1.0\TASKLIST.md"
text = open(PATH, encoding="utf-8").read()

# Detectar filas de tarea: | <estado> | TASK-XXX-NN | ...
row_re = re.compile(r"^\|\s*(✅|🔄|⏳|❌|🚫)\s*[^|]*\|\s*(TASK-[0-9A-Z-]+)\s*\|", re.MULTILINE)

# Mapear TASK-ID -> fase por prefijo
def fase_de(tid):
    # TASK-000 -> 0, TASK-100/110 -> 1, 200/210/220 -> 2, 300/310 -> 3,
    # 400/410/420/430/440/450/460 -> 4, 500/510/520/530/540/550 -> 5,
    # 600 -> 6, 700/710/720 -> 7, 800/810/820 -> 8, 900/910 -> 9,
    # 1000 -> 10, 1100 -> 11, 1200 -> 12
    m = re.match(r"TASK-(\d+)", tid)
    if not m:
        return None
    n = int(m.group(1))
    if n == 0:
        return 0
    if 100 <= n < 200:
        return 1
    if 200 <= n < 300:
        return 2
    if 300 <= n < 400:
        return 3
    if 400 <= n < 500:
        return 4
    if 500 <= n < 600:
        return 5
    if 600 <= n < 700:
        return 6
    if 700 <= n < 800:
        return 7
    if 800 <= n < 900:
        return 8
    if 900 <= n < 1000:
        return 9
    if 1000 <= n < 1100:
        return 10
    if 1100 <= n < 1200:
        return 11
    if 1200 <= n < 1300:
        return 12
    return None

counts = {}  # fase -> dict
for m in row_re.finditer(text):
    estado = m.group(1)
    tid = m.group(2)
    f = fase_de(tid)
    if f is None:
        continue
    c = counts.setdefault(f, {"✅": 0, "🔄": 0, "⏳": 0, "❌": 0, "🚫": 0, "total": 0})
    c[estado] += 1
    c["total"] += 1

# Forzar fases 0..12
tot = {"✅": 0, "🔄": 0, "⏳": 0, "❌": 0, "🚫": 0, "total": 0}
print(f"{'Fase':<5} {'Total':>5} {'✅':>4} {'🔄':>4} {'⏳':>4} {'❌':>4} {'%pond':>8}")
for f in range(13):
    c = counts.get(f, {"✅": 0, "🔄": 0, "⏳": 0, "❌": 0, "🚫": 0, "total": 0})
    for k in ("✅", "🔄", "⏳", "❌", "🚫", "total"):
        tot[k] += c[k]
    base = c["total"] - c["❌"] - c["🚫"]
    pond = (c["✅"] + 0.5 * c["🔄"]) / base * 100 if base else 0
    print(f"{f:<5} {c['total']:>5} {c['✅']:>4} {c['🔄']:>4} {c['⏳']:>4} {c['❌']:>4} {pond:>7.1f}%")

base = tot["total"] - tot["❌"] - tot["🚫"]
pond = (tot["✅"] + 0.5 * tot["🔄"]) / base * 100 if base else 0
print("-" * 40)
print(f"TOTAL {tot['total']:>5} {tot['✅']:>4} {tot['🔄']:>4} {tot['⏳']:>4} {tot['❌']:>4} {pond:>7.1f}%  (base efectiva={base})")