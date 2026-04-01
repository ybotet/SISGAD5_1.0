# SISGAD5 - Arquitectura de Microservicios

Este proyecto ha sido refactorizado para usar una arquitectura de microservicios con Docker.

## Arquitectura

- **API Gateway** (Puerto 5000): Punto de entrada único que enruta las solicitudes a los microservicios apropiados.
- **Microservicio de Usuarios** (Puerto 5001): Maneja autenticación, usuarios, roles y permisos.
- **Microservicio de Servicios** (Puerto 5002): Maneja toda la lógica de negocio (cables, líneas, etc.).
- **PostgreSQL** (Puerto 5432): Base de datos compartida.

## Estructura del Proyecto

```
sisgad5/
├── api-gateway/          # API Gateway
├── backend-users/        # Microservicio de Usuarios
├── backend-services/     # Microservicio de Servicios
├── frontend/            # Frontend (sin cambios)
├── docker-compose.yml   # Orquestación de contenedores
└── README.md
```

## Inicio Rápido

1. **Clonar y configurar:**

   ```bash
   cd sisgad5
   cp backend-users/.env.example backend-users/.env
   cp backend-services/.env.example backend-services/.env
   cp api-gateway/.env.example api-gateway/.env
   ```

2. **Editar los archivos .env con tus configuraciones.**

3. **Levantar los servicios con Docker:**

   ```bash
   docker-compose up --build
   ```

4. **Acceder a la aplicación:**
   - API Gateway: http://localhost:5000
   - Frontend: http://localhost:5004 (configurar para apuntar al gateway)

## Desarrollo Local

Para desarrollo local sin Docker:

1. **Instalar dependencias en cada servicio:**

   ```bash
   cd backend-users && npm install
   cd ../backend-services && npm install
   cd ../api-gateway && npm install
   ```

2. **Configurar PostgreSQL local.**

3. **Ejecutar servicios:**

   ```bash
   # Terminal 1 - Usuarios
   cd backend-users && npm run dev

   # Terminal 2 - Servicios
   cd backend-services && npm run dev

   # Terminal 3 - Gateway
   cd api-gateway && npm run dev
   ```

## API Endpoints

### Autenticación (Microservicio Usuarios)

### Módulo Autenticación (Users Service)

| Método | Ruta                 | Descripción                       | Auth             |
| ------ | -------------------- | --------------------------------- | ---------------- |
| `POST` | `/api/auth/login`    | Iniciar sesión y obtener JWT      | ❌ Público       |
| `POST` | `/api/auth/register` | Registrar nuevo usuario           | ❌ Público       |
| `GET`  | `/api/auth/perfil`   | Obtener perfil del usuario actual | ✅ JWT           |
| `POST` | `/api/auth/refresh`  | Renovar token JWT expirado        | ✅ Refresh Token |

### Usuarios (Microservicio Usuarios)

- `GET /api/user` - Listar usuarios
- `POST /api/user` - Crear usuario
- `PUT /api/user/:id` - Actualizar usuario
- `DELETE /api/user/:id` - Eliminar usuario

### MP (Microservicio MP)

#### Módulo Quejas

| Método   | Ruta                | Descripción                             | Auth   |
| -------- | ------------------- | --------------------------------------- | ------ |
| `GET`    | `/api/mp/queja`     | Listar quejas con paginación y filtros  | ✅ JWT |
| `GET`    | `/api/mp/queja/:id` | Obtener detalles de queja + historial   | ✅ JWT |
| `POST`   | `/api/mp/queja`     | Crear nueva queja de telecomunicaciones | ✅ JWT |
| `PUT`    | `/api/mp/queja/:id` | Actualizar estado o datos de queja      | ✅ JWT |
| `DELETE` | `/api/mp/queja/:id` | Eliminar queja (soft delete)            | ✅ JWT |

- `GET /api/cable` - Operaciones con cables
- `GET /api/linea` - Operaciones con líneas
- etc.

## Notas Importantes

- La base de datos es compartida entre los microservicios.
- El JWT se verifica en cada microservicio.
- El API Gateway maneja el enrutamiento basado en la URL.
- Para producción, considera usar un registro de servicios como Consul o Eureka.

## Próximos Pasos

- Implementar comunicación entre microservicios si es necesaria.
- Agregar logs centralizados.
- Configurar CI/CD.
- Implementar health checks avanzados.
- Considerar separación de bases de datos si crece el proyecto.
