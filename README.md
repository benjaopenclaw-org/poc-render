# poc-render

Monorepo con frontend en Next.js y microservicios NestJS.

## Estructura

- `src/frontend/app`: frontend web del proyecto.
- `src/frontend/templates`: plantillas HTML descargadas desde Stitch para el CRUD de mascotas.
- `src/microservices/ms-pets`: microservicio NestJS para el CRUD de mascotas.
- `src/database/pets`: esquema MySQL del microservicio `ms-pets`.

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.
- MySQL 8 o PostgreSQL disponible.
- MCP de Google Stitch disponible para iterar UI.

## Configuración de entornos

Frontend:

1. Copiar [src/frontend/app/.env.local.example](/Users/pablo/Documents/Trabajo/CREACION/poc-render4/src/frontend/app/.env.local.example) a `src/frontend/app/.env.local`.
2. Ajustar `MS_PETS_API_URL` si el microservicio corre en otro puerto.

Microservicio:

1. Copiar [src/microservices/ms-pets/.env.example](/Users/pablo/Documents/Trabajo/CREACION/poc-render4/src/microservices/ms-pets/.env.example) a `src/microservices/ms-pets/.env`.
2. Definir `DB_PASSWORD` real para `pets_user`.
3. Si la base existente es PostgreSQL, usar `DB_TYPE=postgres` y preferir `DATABASE_URL`.

## Base de datos

Crear el esquema `pets` en MySQL con:

```bash
mysql --protocol=TCP -h "$(grep '^DB_HOST=' .env | sed 's/^DB_HOST=//' | cut -d'#' -f1 | xargs)" \
  -P "$(grep '^DB_PORT=' .env | sed 's/^DB_PORT=//' | cut -d'#' -f1 | xargs)" \
  -u "$(grep '^DB_USER=' .env | sed 's/^DB_USER=//' | cut -d'#' -f1 | xargs)" \
  -p"$(grep '^DB_PASSWORD=' .env | sed 's/^DB_PASSWORD=//' | cut -d'#' -f1 | xargs)" \
  < src/database/pets/01-schema-pets.sql
```

Cargar datos base en MySQL:

```bash
mysql --protocol=TCP -h "$(grep '^DB_HOST=' .env | sed 's/^DB_HOST=//' | cut -d'#' -f1 | xargs)" \
  -P "$(grep '^DB_PORT=' .env | sed 's/^DB_PORT=//' | cut -d'#' -f1 | xargs)" \
  -u "$(grep '^DB_USER=' .env | sed 's/^DB_USER=//' | cut -d'#' -f1 | xargs)" \
  -p"$(grep '^DB_PASSWORD=' .env | sed 's/^DB_PASSWORD=//' | cut -d'#' -f1 | xargs)" \
  < src/database/pets/02-rbac-pets.sql
```

Si la instancia existente es PostgreSQL, crear el esquema con:

```bash
psql "$DATABASE_URL" -f src/database/pets/01-schema-pets-postgres.sql
```

Cargar datos base en PostgreSQL:

```bash
psql "$DATABASE_URL" -f src/database/pets/02-seed-pets-postgres.sql
```

## Ejecución

Instalar dependencias:

```bash
npm install
```

Levantar frontend:

```bash
npm run dev:frontend
```

Levantar microservicio:

```bash
npm run dev:ms-pets
```

## Qué incluye el feature

- Pantalla única `Mascotas de la casa` con pestañas `Listado`, `Resumen` y `Cuidados`.
- Modal para crear y editar mascotas dentro de la misma pantalla.
- Proxy server-side en Next.js para reenviar requests al microservicio `ms-pets`.
- API pública en NestJS para listar, crear, editar, eliminar, resumir y listar recordatorios.
- Plantillas base de Stitch guardadas en `src/frontend/templates`.

## Deploy en Render

El repo incluye [render.yaml](/Users/pablo/Documents/Trabajo/CREACION/poc-render4/render.yaml) para desplegar:

- `poc-render-frontend`
- `poc-render-ms-pets`

Variables que debes completar en Render:

- En `poc-render-ms-pets`:
  - `FRONTEND_ORIGIN`
  - `DB_TYPE`
  - `DATABASE_URL` o alternativamente `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
  - `DB_SSL`
- En `poc-render-frontend`:
  - `MS_PETS_API_URL`
