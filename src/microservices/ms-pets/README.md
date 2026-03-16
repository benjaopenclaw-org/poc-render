# ms-pets

Microservicio NestJS para mantener la lista de mascotas del hogar.

## Esquema asociado

Este microservicio usa el esquema `pets` y puede correr sobre:

- MySQL, usando [01-schema-pets.sql](/Users/pablo/Documents/Trabajo/CREACION/poc-render4/src/database/pets/01-schema-pets.sql)
- PostgreSQL, usando [01-schema-pets-postgres.sql](/Users/pablo/Documents/Trabajo/CREACION/poc-render4/src/database/pets/01-schema-pets-postgres.sql)

## Variables de entorno

Usa como base [src/microservices/ms-pets/.env.example](/Users/pablo/Documents/Trabajo/CREACION/poc-render4/src/microservices/ms-pets/.env.example).

Puntos relevantes:

- `PORT=3002`
- `DB_NAME=pets`
- `DB_TYPE=mysql` por defecto
- `DATABASE_URL` opcional para usar connection string completa
- `DB_SSL=false` por defecto

## Ejecución

```bash
npm run dev:ms-pets
```
