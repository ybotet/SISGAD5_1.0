# Backend MP Microservicio

Contenido

- Descripción del proyecto
- Arquitectura
- Tecnologías
- Estructura del proyecto
- Instalación y ejecución

## Descripción del proyecto

Microservicio que gestiona la lógica y datos del módulo MP.

## Arquitectura

Construido con Node.js y Express, interactúa con una base de datos para persistir información.

## Tecnologías

- Node.js
- Express
- Base de datos (configurable mediante variables de entorno)

## Estructura del proyecto

- `src/`: código fuente del servidor con `controllers/`, `models/`, `routes/`, etc.
- `config/`: archivos de configuración como la base de datos.
- `package.json`: dependencias y scripts.

## Instalación y ejecución

```bash
npm install
npm run dev       # desarrollo
npm run start     # producción
```

Asegúrate de establecer las variables de entorno (por ejemplo, para la conexión a la base de datos) antes de ejecutar el servicio.
