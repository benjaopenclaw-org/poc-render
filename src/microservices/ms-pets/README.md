# ms-pets

Microservicio NestJS para mantener la lista de mascotas del hogar.

## Esquema asociado

Este microservicio usa el esquema MySQL `pets`, definido en [src/database/pets/01-schema-pets.sql](/Users/pablo/Documents/Trabajo/CREACION/poc-render4/src/database/pets/01-schema-pets.sql).

## Variables de entorno

Usa como base [src/microservices/ms-pets/.env.example](/Users/pablo/Documents/Trabajo/CREACION/poc-render4/src/microservices/ms-pets/.env.example).

Puntos relevantes:

- `PORT=3002`
- `DB_NAME=pets`
- `OAUTH2_ISSUER=http://oauth2:8080`
- `OAUTH2_JWKS_URL=http://localhost:8082/oauth2/jwks`

## Ejecución

```bash
npm run dev:ms-pets
```
