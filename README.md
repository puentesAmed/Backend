# API Node.js + Express + MongoDB Atlas + Cloudinary — III_PROYECTO/Backend

Guía de uso y referencia del proyecto.

---

## Índice
- [Descripción](#descripción)
- [Stack](#stack)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Semilla de datos](#semilla-de-datos)
- [Modelos](#modelos)
- [Autenticación](#autenticación)
- [Roles y permisos](#roles-y-permisos)
- [Subida de imágenes y borrado en Cloudinary](#subida-de-imágenes-y-borrado-en-cloudinary)
- [Endpoints](#endpoints)
- [Ejemplos de uso (cURL)](#ejemplos-de-uso-curl)
- [Validación y manejo de errores](#validación-y-manejo-de-errores)
- [Checklist de evaluación](#checklist-de-evaluación)

---

## Descripción

**Contexto del repo**
- **Nombre**: III_PROYECTO/Backend
- **Gestor**: npm

API REST que gestiona usuarios y una colección relacionada (ej. `Item`).

- Usuarios se crean **siempre** con rol `user`.
- Solo **admin** puede cambiar el rol de otros usuarios.
- Un usuario puede **eliminar solo su propia cuenta**; admin puede eliminar cualquier cuenta.
- Usuarios tienen campo `image` subido a **Cloudinary**; al eliminar el usuario se borra su imagen en Cloudinary.
- El array `related` en `User` se gestiona con `$addToSet` y `$pull` para **evitar duplicados** y no pisar datos previos.

## Stack
- **Runtime**: Node.js 20+
- **Servidor**: Express
- **DB**: MongoDB Atlas (Mongoose)
- **Auth**: JWT + cookies httpOnly
- **Ficheros**: Multer + Cloudinary SDK
- **Validación**: express-validator

## Estructura del proyecto
```
src/
  app.js
  server.js
  config/
    db.js
    cloudinary.js
  models/
    User.js
    Item.js
  middlewares/
    auth.js
    role.js
    upload.js
    validators.js
  controllers/
    auth.controller.js
    user.controller.js
    item.controller.js
  routes/
    auth.routes.js
    user.routes.js
    item.routes.js
  seed/
    seed.js
    data.json
.env
README.md
```

## Variables de entorno
Crea un `.env` en la raíz:
```ini
PORT=3000
MONGODB_URI=<tu_cadena_de_Atlas>
JWT_SECRET=<secreto_fuerte>
CLOUDINARY_CLOUD_NAME=<tu_nombre>
CLOUDINARY_API_KEY=<tu_api_key>
CLOUDINARY_API_SECRET=<tu_api_secret>


1. **Clonar e instalar**
   ```bash
   npm i
   ```
   Dependencias mínimas:
   ```bash
   npm i express mongoose bcrypt jsonwebtoken cookie-parser cors dotenv multer express-validator morgan
   ```
   Cloudinary **(elige una opción)**:
   - **Opción A — SDK v2 por stream (recomendada)**
     ```bash
     npm i cloudinary
     ```
     *Multer usa `memoryStorage()` y subes con `cloudinary.uploader.upload_stream`.*
   - **Opción B — multer-storage-cloudinary**
     ```bash
     npm i cloudinary@^1 multer-storage-cloudinary
     ```
     *Esta opción exige Cloudinary v1 por compatibilidad de peer dependencies.*

2. **Dev**
   ```bash
   npm i -D nodemon
   npm run dev
   ```

3. **Prod**
   ```bash
   npm start
   ```

## Semilla de datos
- Archivo: `src/seed/data.json`
- Script: `src/seed/seed.js`
- Ejecutar:
  ```bash
  npm run seed
  ```

## Modelos
### User
```js
{
  email: String (unique, required),
  password: String (hash),
  role: 'user' | 'admin' (default: 'user'),
  image: { public_id: String, url: String },
  related: [ObjectId -> Item]
}
```
- Hook `pre('save')`: hash de contraseña (bcrypt).
- Método `comparePassword` para login.

### Item
```js
{
  title: String (required),
  description: String,
  owner: ObjectId -> User
}
```

## Autenticación
- **Registro** fuerza `role='user'`, ignora cualquier `role` del body.
- **Login** emite JWT y lo devuelve también en cookie httpOnly.
- Middleware `auth` valida JWT y rellena `req.user`.

## Roles y permisos
- Primer admin se crea **manualmente** editando en MongoDB Atlas el campo `role` de un usuario.
- Solo **admin** puede `PATCH /users/:id/role`.
- Un `user` **no** puede cambiar roles (ni el suyo ni el de otros).
- **Eliminar usuario**:
  - `user`: solo el suyo (`DELETE /users/:id`).
  - `admin`: cualquiera.

## Subida de imágenes y borrado en Cloudinary
- Registro y actualización aceptan `multipart/form-data` con `image`.
- Se guarda `{ public_id, url }` en `user.image`.
- Al **eliminar** usuario se llama `cloudinary.uploader.destroy(public_id)` antes de borrar el documento.

## Endpoints
> Base URL: `http://localhost:3000`

### Auth
| Método | Ruta           | Auth | Descripción |
|-------:|----------------|------|-------------|
| POST   | /auth/register | -    | Crea usuario (role forzado a `user`). Acepta imagen. |
| POST   | /auth/login    | -    | Login. Devuelve JWT y cookie. |
| GET    | /auth/me       | ✅   | Perfil del usuario autenticado. |

### Users
| Método | Ruta                      | Auth          | Descripción |
|-------:|---------------------------|---------------|-------------|
| GET    | /users                    | ✅ admin      | Lista usuarios. |
| GET    | /users/:id                | ✅ owner/admin| Detalle de usuario. |
| PATCH  | /users/:id                | ✅ owner      | Actualiza email/password/imagen del propio usuario. |
| DELETE | /users/:id                | ✅ owner/admin| Elimina usuario. Borra imagen en Cloudinary. |
| PATCH  | /users/:id/role           | ✅ admin      | Cambia rol (`user`/`admin`). |
| PATCH  | /users/:id/related        | ✅ owner      | Añade relacionados con `$addToSet` (sin duplicar). |
| DELETE | /users/:id/related/:itemId| ✅ owner      | Quita relacionado con `$pull`. |

### Items
| Método | Ruta        | Auth        | Descripción |
|-------:|-------------|-------------|-------------|
| GET    | /items      | -           | Lista items. |
| GET    | /items/:id  | -           | Detalle item. |
| POST   | /items      | ✅ auth     | Crea item. `owner = req.user._id`. |
| PATCH  | /items/:id  | ✅ owner/admin | Actualiza item. |
| DELETE | /items/:id  | ✅ owner/admin | Elimina item. |

---

## Validación y manejo de errores
- `express-validator` valida emails, contraseñas y `:id` (MongoId).
- Middleware de auth devuelve `401` si no hay token o es inválido.
- Autorización devuelve `403` cuando el rol/propiedad no cumple la regla.
- Errores de Mongoose devuelven `400/404` según el caso.
- Respuestas de error: `{ message, errors? }`.

## Checklist de evaluación
- [ ] 2 modelos (`User`, `Item`) y 1 relación (`User.related`).
- [ ] Roles y permisos: `user` vs `admin`. Cambios de rol solo por admin.
- [ ] Auth JWT funcionando.
- [ ] Subida a Cloudinary en alta/edición y **borrado** al eliminar usuario.
- [ ] Semilla ejecutable (`npm run seed`).
- [ ] CRUD completo en `users` e `items`.
- [ ] `related` sin duplicados con `$addToSet` y borrado con `$pull`.
- [ ] README claro con setup, rutas y ejemplos.

---


