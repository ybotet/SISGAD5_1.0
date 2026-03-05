# frontend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# IMPORTANTE: Las variables de entorno se pasarán desde docker-compose
# No necesitas copiar .env aquí porque docker-compose las inyectará

EXPOSE 5173

# Modifica el comando para asegurar que escuche en todas las interfaces
CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0 --port 5173"]