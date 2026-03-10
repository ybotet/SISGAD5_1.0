#!/bin/bash

echo "🚀 Iniciando despliegue en VPS..."

# Cargar variables de producción
export $(grep -v '^#' .env.production | xargs)

# 1. Construir frontend
echo "📦 Construyendo frontend..."
cd frontend
npm ci
npm run build
cd ..

# 2. Copiar frontend al directorio de nginx
echo "📋 Copiando frontend a /var/www/sisgad5/frontend..."
sudo mkdir -p /var/www/sisgad5/frontend
sudo cp -r frontend/dist/* /var/www/sisgad5/frontend/

# 3. Detener contenedores actuales
echo "🛑 Deteniendo contenedores..."
docker-compose -f docker-compose.prod.yml down

# 4. Construir y levantar backends
echo "🐳 Construyendo imágenes backend..."
docker-compose -f docker-compose.prod.yml build

echo "🐳 Levantando contenedores backend..."
docker-compose -f docker-compose.prod.yml up -d

# 5. Verificar que los backends funcionan
echo "🔍 Verificando API Gateway..."
sleep 5
if curl -s http://localhost:5000/health > /dev/null; then
    echo "✅ API Gateway OK"
else
    echo "❌ Error: API Gateway no responde"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

# 6. Recargar nginx
echo "🔄 Recargando nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Despliegue completado!"
echo "📊 Frontend: https://yaiselbotet.fvds.ru/sisgad5"
echo "🔌 API: https://yaiselbotet.fvds.ru/api_sisgad5"