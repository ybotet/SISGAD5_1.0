#!/usr/bin/env bash

## validate_docs.sh — Verificar enlaces internos en documentación SISGAD5
##
## Verifica que todos los enlaces markdown dentro de `docs/` usen el sufijo
## correcto del idioma (`.es.md` o `.ru.md`) y que los archivos referenciados existan.
##
## Uso:
##   bash scripts/validate_docs.sh         # Verificar todo docs/
##   bash scripts/validate_docs.sh --es    # Solo español
##   bash scripts/validate_docs.sh --ru    # Solo ruso
##
## Código de salida:
##   0 — No se encontraron enlaces rotos
##   1 — Enlaces rotos detectados

set -euo pipefail

DOCS_DIR="${1:-docs}"

echo "🔍 Validando documentación en: $DOCS_DIR"
echo "============================================================"
echo ""

ERRORS=0

## Función para validar enlaces en archivos de un idioma específico
validate_links() {
    local suffix="$1"
    local label="$2"
    
    echo "=== Verificando enlaces en archivos *${suffix} ==="
    
    while IFS= read -r -d '' file; do
        local filename
        filename=$(basename "$file")
        local broken=0
        
        ## Extraer todos los enlaces markdown [text](path) del archivo
        while IFS= read -r link; do
            # Extraer solo la parte de la ruta (dentro de paréntesis)
            local target
            target=$(echo "$link" | grep -oP '(?<=\()[^\)]+(?=\))')
            
            # Saltar enlaces externos (http/https), anchors (#), y emails
            if [[ "$target" =~ ^https?:// ]] || \
               [[ "$target" =~ ^# ]] || \
               [[ "$target" =~ ^mailto: ]] || \
               [[ "$target" =~ ^[a-zA-Z]+:// ]]; then
                continue
            fi
            
            # Determinar directorio base del archivo actual
            local filedir
            filedir=$(dirname "$file")
            
            # Resolver ruta relativa
            local fullpath="${filedir}/${target}"
            
            # Normalizar la ruta (resolver .. y .)
            local resolved
            resolved=$(realpath -m "$fullpath" 2>/dev/null || echo "$fullpath")
            
            if [[ ! -f "$resolved" ]]; then
                # Verificar si es un enlace a un archivo que debería existir
                # pero podría ser un anchor (#algo)
                if [[ "$target" == *".md"* ]] || [[ "$target" == *".es.md"* ]] || [[ "$target" == *".ru.md"* ]]; then
                    echo "  ❌ ROTURA: $filename → $target (no existe: $resolved)"
                    broken=1
                    ERRORS=$((ERRORS + 1))
                fi
            fi
        done < <(grep -oP '\[[^\]]*\]\([^)]+\)' "$file" 2>/dev/null || true)
        
        if [[ $broken -eq 0 ]]; then
            :
        fi
    done < <(find "$DOCS_DIR" -type f -name "*${suffix}" -print0 2>/dev/null)
    
    echo "  ✅ Verificación completada para *${suffix}"
    echo ""
}

## Función para detectar enlaces con sufijo incorrecto
validate_suffix() {
    local current_suffix="$1"
    local wrong_suffix="$2"
    local label="$3"
    
    echo "=== Verificando sufijo: archivos *${current_suffix} deben referenciar *${current_suffix}, NO *${wrong_suffix} ==="
    
    local matches=0
    
    while IFS= read -r -d '' file; do
        local filename
        filename=$(basename "$file")
        
        ## Buscar enlaces que referencien archivos .md sin el sufijo correcto
        local wrong
        wrong=$(grep -nP "\[.*?\]\([^)]*\.[a-z_]+\.${wrong_suffix}\)" "$file" 2>/dev/null || true)
        
        if [[ -n "$wrong" ]]; then
            echo "  ⚠️  SUFIJO INCORRECTO en: $filename"
            echo "$wrong" | while IFS= read -r line; do
                echo "    → $line"
            done
            matches=$((matches + 1))
        fi
        
        ## También buscar enlaces a .md sin sufijo de idioma (NN_filename.md)
        local nosuffix
        nosuffix=$(grep -oP "\[.*?\]\([0-9][0-9a-z_]*\.md\)" "$file" 2>/dev/null || true)
        
        if [[ -n "$nosuffix" ]]; then
            echo "  ⚠️  ENLACE SIN SUFIJO en: $filename"
            echo "$nosuffix" | while IFS= read -r line; do
                echo "    → $line"
            done
            matches=$((matches + 1))
        fi
    done < <(find "$DOCS_DIR" -type f -name "*${current_suffix}" -print0 2>/dev/null)
    
    if [[ $matches -eq 0 ]]; then
        echo "  ✅ Todos los enlaces usan el sufijo correcto"
    else
        ERRORS=$((ERRORS + matches))
    fi
    echo ""
}

## Ejecutar validaciones

validate_links ".es.md" "ESPAÑOL"
validate_links ".ru.md" "RUSO"

validate_suffix ".es.md" ".ru.md" "ESPAÑOL → RUSO"
validate_suffix ".ru.md" ".es.md" "RUSO → ESPAÑOL"

## Resumen de archivos

echo "============================================================"
echo "📊 Resumen de archivos:"
echo ""
echo "  Español (.es.md):  $(find "$DOCS_DIR" -type f -name "*.es.md" 2>/dev/null | wc -l) archivos"
echo "  Ruso (.ru.md):     $(find "$DOCS_DIR" -type f -name "*.ru.md" 2>/dev/null | wc -l) archivos"
echo ""

## Resultado final

echo "============================================================"
if [[ $ERRORS -eq 0 ]]; then
    echo "✅ VALIDACIÓN EXITOSA: 0 enlaces rotos detectados"
    echo ""
    exit 0
else
    echo "❌ VALIDACIÓN FALLIDA: $ERRORS enlaces rotos/enlaces con error detectados"
    echo ""
    exit 1
fi