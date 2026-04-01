# SISGAD5 API - Backend MP

API para gestión de quejas, pruebas y trabajos en telecomunicaciones

## Version: 1.0.0

**Contact information:**  
Yaisel Botet  
yaiselbotet@gmail.com

### Servers

| URL                          | Description      |
| ---------------------------- | ---------------- |
| http://localhost:5002/api/mp | Desarrollo local |

### Available authorizations

#### bearerAuth (HTTP, bearer)

Token JWT: Bearer <token>  
Bearer format: JWT

---

## Quejas

Gestión de quejas de telecomunicaciones

### [GET] /queja

**Listar quejas con paginación**

#### Parameters

| Name      | Located in | Description            | Required | Schema                                                                                                  |
| --------- | ---------- | ---------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| page      | query      | Número de página       | No       | integer, <br>**Default:** 1                                                                             |
| limit     | query      | Registros por página   | No       | integer, <br>**Default:** 10                                                                            |
| sortBy    | query      |                        | No       | string, <br>**Available values:** "fecha", "num_reporte", "prioridad", "estado", <br>**Default:** fecha |
| sortOrder | query      |                        | No       | string, <br>**Available values:** "ASC", "DESC", <br>**Default:** DESC                                  |
| search    | query      | Buscar por num_reporte | No       | string                                                                                                  |
| estado    | query      |                        | No       | string, <br>**Available values:** "Abierta", "En Proceso", "Pendiente", "Resuelto", "Cerrada"           |

#### Responses

| Code | Description     | Schema                                                                                                                                                                                                    |
| ---- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 200  | Lista de quejas | **application/json**: { **"success"**: boolean, **"data"**: [ [Queja](#queja-schema) ], **"pagination"**: { **"page"**: integer, **"limit"**: integer, **"total"**: integer, **"pages"**: integer } }<br> |
| 401  | No autorizado   | **application/json**: [Error](#error-schema)<br>                                                                                                                                                          |
| 500  | Error interno   | **application/json**: [Error](#error-schema)<br>                                                                                                                                                          |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearerAuth      |        |

### [POST] /queja

**Crear nueva queja de telecomunicaciones**

#### Request Body

| Required | Schema                                                                                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Yes      | **application/json**: { **"id_telefono"**: integer or null, **"id_linea"**: integer or null, **"id_pizarra"**: integer or null, **"id_tipoqueja"**: integer, **"reportado_por"**: string, **"prioridad"**: integer }<br> |

#### Responses

| Code | Description               | Schema                                                                                                          |
| ---- | ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 201  | Queja creada exitosamente | **application/json**: { **"success"**: boolean, **"message"**: string, **"data"**: [Queja](#queja-schema) }<br> |
| 400  | Datos inválidos           | **application/json**: [Error](#error-schema)<br>                                                                |
| 401  | No autorizado             | **application/json**: [Error](#error-schema)<br>                                                                |
| 409  | Reporte duplicado         | **application/json**: [Error](#error-schema)<br>                                                                |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearerAuth      |        |

### [GET] /queja/{id}

**Obtener detalles de una queja por ID**

#### Parameters

| Name | Located in | Description          | Required | Schema  |
| ---- | ---------- | -------------------- | -------- | ------- |
| id   | path       | ID único de la queja | Yes      | integer |

#### Responses

| Code | Description                        | Schema                                                                                                                                                                                    |
| ---- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 200  | Detalles de la queja con historial | **application/json**: { **"success"**: boolean, **"data"**: { **"queja"**: [Queja](#queja-schema), **"pruebas"**: [ object ], **"trabajos"**: [ object ], **"flujo"**: [ object ] } }<br> |
| 401  | No autorizado                      | **application/json**: [Error](#error-schema)<br>                                                                                                                                          |
| 404  | Queja no encontrada                | **application/json**: [Error](#error-schema)<br>                                                                                                                                          |
| 500  | Error interno                      | **application/json**: [Error](#error-schema)<br>                                                                                                                                          |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearerAuth      |        |

### [PUT] /queja/{id}

**Actualizar estado o datos de una queja**

#### Parameters

| Name | Located in | Description                       | Required | Schema  |
| ---- | ---------- | --------------------------------- | -------- | ------- |
| id   | path       | ID único de la queja a actualizar | Yes      | integer |

#### Request Body

| Required | Schema                                                                                                                                                                                                                                                         |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No       | **application/json**: { **"estado"**: string, <br>**Available values:** "Abierta", "En Proceso", "Pendiente", "Resuelto", "Cerrada", **"prioridad"**: integer, **"id_tipoqueja"**: integer, **"reportado_por"**: string, **"id_clave"**: integer or null }<br> |

#### Responses

| Code | Description                                         | Schema                                                                                                          |
| ---- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 200  | Queja actualizada exitosamente                      | **application/json**: { **"success"**: boolean, **"message"**: string, **"data"**: [Queja](#queja-schema) }<br> |
| 400  | Datos inválidos o transición de estado no permitida | **application/json**: [Error](#error-schema)<br>                                                                |
| 401  | No autorizado                                       | **application/json**: [Error](#error-schema)<br>                                                                |
| 404  | Queja no encontrada con el ID proporcionado         | **application/json**: [Error](#error-schema)<br>                                                                |
| 500  | Error interno del servidor                          | **application/json**: [Error](#error-schema)<br>                                                                |

##### Security

| Security Schema | Scopes |
| --------------- | ------ |
| bearerAuth      |        |

---

### Schemas

#### Queja Schema

| Name         | Type                                                                                          | Description                                                                                             | Required |
| ------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------- |
| id_queja     | integer                                                                                       | _Example:_ `20234`                                                                                      | No       |
| num_reporte  | integer                                                                                       | _Example:_ `100001`                                                                                     | No       |
| id_telefono  | integer or null                                                                               |                                                                                                         | No       |
| id_linea     | integer or null                                                                               |                                                                                                         | No       |
| id_pizarra   | integer or null                                                                               |                                                                                                         | No       |
| id_tipoqueja | integer                                                                                       | _Example:_ `63`                                                                                         | No       |
| estado       | string, <br>**Available values:** "Abierta", "En Proceso", "Pendiente", "Resuelto", "Cerrada" | _Enum:_ `"Abierta"`, `"En Proceso"`, `"Pendiente"`, `"Resuelto"`, `"Cerrada"`<br>_Example:_ `"Abierta"` | No       |
| prioridad    | integer                                                                                       | _Example:_ `3`                                                                                          | No       |
| fecha        | dateTime                                                                                      |                                                                                                         | No       |
| createdAt    | dateTime                                                                                      |                                                                                                         | No       |
| updatedAt    | dateTime                                                                                      |                                                                                                         | No       |

#### Error Schema

| Name       | Type     | Description                          | Required |
| ---------- | -------- | ------------------------------------ | -------- |
| success    | boolean  | _Example:_ `false`                   | No       |
| error      | string   | _Example:_ `"ERROR.QUEJA.NOT_FOUND"` | No       |
| statusCode | integer  | _Example:_ `404`                     | No       |
| timestamp  | dateTime |                                      | No       |
