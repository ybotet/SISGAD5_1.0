# Dockerfile para backend-mp
FROM node:22-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY src/ ./src/

# Exponer puerto
EXPOSE 5002

# Comando para ejecutar
CMD ["npm", "start"]