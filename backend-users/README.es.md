# Backend Users Microservicio

Contenido

- Descripción del proyecto
- Arquitectura
- Tecnologías
- Estructura del proyecto
- Instalación y ejecución

## Descripción del proyecto

Microservicio encargado de la autenticación y gestión de usuarios.

## Arquitectura

Implementado con Node.js y Express, expone un API REST y almacena datos en una base de datos.

## Tecnologías

- Node.js
- Express
- Base de datos (configurable mediante variables de entorno)

## Estructura del proyecto

- `src/`: código fuente con `controllers/`, `models/`, `routes/`.
- `config/`: configuración de base de datos y otros ajustes.
- `package.json`: dependencias y scripts.

## Instalación y ejecución

```bash
npm install
npm run dev       # desarrollo
npm run start     # producción
```

Define las variables de entorno necesarias para la base de datos y la seguridad antes de ejecutar el servicio.
