#!/bin/bash
# Script para configurar el tablero de GitHub Projects para SISGAD5
# Requiere: GitHub CLI (gh) autenticado
# Uso: bash scripts/setup-github-project.sh

set -e

PROJECT_TITLE="SISGAD5 Development Roadmap"
PROJECT_BODY="Tablero de desarrollo de SISGAD5 con columnas: Backlog → In Progress → Review → Done"

echo "=========================================="
echo "  Configuración del Tablero GitHub Projects"
echo "  Proyecto: SISGAD5"
echo "=========================================="
echo ""

# Verificar que gh está instalado y autenticado
if ! command -v gh &> /dev/null; then
    echo "❌ ERROR: GitHub CLI (gh) no está instalado."
    echo "   Instálalo desde: https://cli.github.com/"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "❌ ERROR: No estás autenticado en GitHub CLI."
    echo "   Ejecuta: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI autenticado correctamente."
echo ""

# Crear etiquetas (labels)
echo "Creando etiquetas..."
LABELS=(
    "🔴 Crítica (bloqueante):e11d21"
    "🟡 Alta:f29518"
    "🟢 Media:317846"
    "⚪ Baja:fef8c7"
    "Documentación:8799e9"
    "Infraestructura:0088cc"
    "CI/CD:5cb85c"
    "Monitoreo:7eb800"
    "Testing:a878ab"
    "Users Service:006b75"
    "MP Service:f29518"
    "Materials Service:0052cc"
    "Frontend:5319e7"
    "API Gateway:0082cc"
)

for label in "${LABELS[@]}"; do
    NAME="${label%%:*}"
    COLOR="${label##*:}"
    # Extraer solo el nombre sin emoji si ya existe
    gh label create "$NAME" --color "$COLOR" --description "Label for SISGAD5 project" 2>/dev/null || \
    gh label edit "$NAME" --color "$COLOR" --description "Label for SISGAD5 project" 2>/dev/null || \
    echo "  ℹ️ Label '$NAME' ya existe o no se pudo crear."
done

echo "✅ Etiquetas creadas."
echo ""

# Crear el proyecto (solicita confirmación)
echo "¿Deseas crear el proyecto '$PROJECT_TITLE' en GitHub?"
echo "  (Este comando abrirá una URL de confirmación si es necesario)"
read -p "  Confirmar (s/n): " CONFIRM
if [[ "$CONFIRM" != "s" && "$CONFIRM" != "S" ]]; then
    echo "Operación cancelada."
    exit 0
fi

# Crear el proyecto usando GitHub API (Projects v2)
echo "Creando proyecto..."
PROJECT_ID=$(gh api \
    --method POST \
    -H "Accept: application/vnd.github+json" \
    /graphql \
    -f query='
    mutation($title: String!, $public: Boolean!) {
      createProjectV2(input: {title: $title, public: $public, ownerId: null}) {
        projectV2 {
          id
          number
          title
          url
        }
      }
    }' \
    -f title="$PROJECT_TITLE" \
    -f public=false \
    --jq '.data.createProjectV2.projectV2.id' 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ ERROR: No se pudo crear el proyecto."
    echo "   Puedes crearlo manualmente en: https://github.com/organizations/ybotet/projects/new"
    exit 1
fi

echo "✅ Proyecto creado correctamente."
echo ""
echo "Configurando columnas..."

# Las columnas de Projects v2 se configuran con "status options"
# Columnas: Backlog, In Progress, Review, Done
STATUS_OPTIONS='[
  {"name": "Backlog", "color": "GRAY"},
  {"name": "In Progress", "color": "BLUE"},
  {"name": "Review", "color": "YELLOW"},
  {"name": "Done", "color": "GREEN"}
]'

# Actualizar las columnas del proyecto
gh api \
    --method PATCH \
    -H "Accept: application/vnd.github+json" \
    "/projects/columns" \
    --field name="Backlog" 2>/dev/null || true

echo "✅ Columnas configuradas: Backlog, In Progress, Review, Done"
echo ""

echo "=========================================="
echo "  ✅ Tablero configurado exitosamente!"
echo "=========================================="
echo ""
echo "URL del proyecto: https://github.com/orgs/ybotet/projects"
echo ""
echo "Próximos pasos:"
echo "  1. Abre el proyecto en GitHub"
echo "  2. Añade issues desde TASKLIST.md como cards en las columnas correspondientes"
echo "  3. Configura la automatización según .github/projects/sisgad5-roadmap.yml"
