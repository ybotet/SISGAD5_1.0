#!/bin/bash

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Iniciando despliegue en VPS...${NC}"

# Verificar que existe .env.production
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: No existe .env.production${NC}"
    echo "Crea el archivo .env.production con las variables necesarias"
    exit 1
fi

# Cargar variables
export $(grep -v '^#' .env.production | xargs)

# Verificar variables críticas
if [ -z "$DB_PASSWORD" ] || [ -z "$JWT_SECRET" ]; then
    echo -e "${RED}❌ Error: Faltan variables críticas en .env.production${NC}"
    exit 1
fi

# Detener contenedores actuales
echo -e "${YELLOW}🛑 Deteniendo contenedores actuales...${NC}"
docker-compose -f docker-compose.prod.yml down

# Limpiar recursos no utilizados (opcional)
echo -e "${YELLOW}🧹 Limpiando recursos Docker no utilizados...${NC}"
docker system prune -f

# Construir y levantar servicios
echo -e "${YELLOW}🏗️  Construyendo servicios...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

echo -e "${YELLOW}🚀 Levantando servicios...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Verificar que los servicios estén funcionando
echo -e "${YELLOW}🔍 Verificando servicios...${NC}"
sleep 10

# Health check
if curl -s -f http://localhost:5000/health > /dev/null; then
    echo -e "${GREEN}✅ API Gateway funcionando correctamente${NC}"
else
    echo -e "${RED}❌ API Gateway no responde${NC}"
    docker-compose -f docker-compose.prod.yml logs api-gateway --tail=50
    exit 1
fi

# Construir frontend estático
echo -e "${YELLOW}🎨 Construyendo frontend estático...${NC}"
cd frontend

# Usar las variables de producción para el build
export VITE_API_URL=$VITE_API_URL
export VITE_FRONT_URL=$VITE_FRONT_URL

npm ci
npm run build
cd ..

# Crear directorio si no existe
sudo mkdir -p /var/www/sisgad5/frontend/dist

# Copiar archivos al directorio de nginx
echo -e "${YELLOW}📦 Copiando archivos frontend...${NC}"
sudo cp -r frontend/dist/* /var/www/sisgad5/frontend/dist/

# Ajustar permisos
sudo chown -R www-data:www-data /var/www/sisgad5

# Verificar configuración de nginx
echo -e "${YELLOW}🔧 Verificando configuración de nginx...${NC}"
sudo nginx -t

if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx recargado correctamente${NC}"
else
    echo -e "${RED}❌ Error en configuración de nginx${NC}"
    exit 1
fi

# Mostrar estado de los contenedores
echo -e "${YELLOW}📊 Estado de los contenedores:${NC}"
docker-compose -f docker-compose.prod.yml ps

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Despliegue completado con éxito!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "Frontend: ${GREEN}https://yaiselbotet.fvds.ru/sisgad5${NC}"
echo -e "API: ${GREEN}https://yaiselbotet.fvds.ru/api_sisgad5${NC}"
echo -e "Health: ${GREEN}https://yaiselbotet.fvds.ru/api_sisgad5/health${NC}"

# Mostrar últimos logs
echo -e "${YELLOW}📝 Últimos logs:${NC}"
docker-compose -f docker-compose.prod.yml logs --tail=20