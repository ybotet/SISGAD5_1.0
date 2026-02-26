# Dockerfile para el frontend (desarrollo con Vite)
FROM node:22-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto de Vite
EXPOSE 5173

# Comando para ejecutar en desarrollo
CMD ["npm", "run", "dev"]