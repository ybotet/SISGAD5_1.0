# API Gateway Microservicio

Contenido

- Descripción del proyecto
- Arquitectura
- Tecnologías
- Estructura del proyecto
- Instalación y ejecución

## Descripción del proyecto

Puerta de enlace que enruta las solicitudes hacia los demás microservicios y gestiona tareas comunes como autenticación y registro.

## Arquitectura

Construido en Node.js, recibe peticiones externas y las redirige a los servicios adecuados.

## Tecnologías

- Node.js
- Express (u otro framework similar)

## Estructura del proyecto

- `src/` con `server.js` como punto de entrada.
- `package.json` con dependencias y scripts.

## Instalación y ejecución

```bash
npm install
npm run dev
npm run start
```
