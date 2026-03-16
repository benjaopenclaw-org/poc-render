# Database Guidelines

## Objetivo

- Esta carpeta agrupa los scripts para la creacion y definición de base de datos para los microservicios de la carpeta `src/microservices`.
- Cada microservicios de la carpeta `src/microservices` debe tener su propio esquema con su usuario de base de datos.
- Cada carpeta dentro de `src/database` debe ser para definir el esquema de base de datos de un microservicio.

## Crear un esquema de database desde cero

1. Crear una carpeta nueva con el nombre del esquema de base de datos en `src/database/<nombre>`.
2. Crear dentro de la carpeta de ese esquema 3 archivos con un prefijo y el nombre del esquema:
    - `01-schema-<nombre>.sql` para el DDL con la creacion de esquema, tablas, usuario con los permisos necesario.
    - `02-rbac-<nombre>.sql` para la carga inicial de datos de las tablas del esquema.
    - `03-mermaid-<nombre>.txt` para para mantener un modelo de entidad relacion en mermaid.
3. Actualizar el README.md del microservicio asociado a este esquema para indicar dejar especificado que este esquema es el repositorio propio del microservicio.
4. Debes usar las creadenciales root de base de datos que estan en el archivo .env en la raiz del proyecto para conectarte a la base de datos y crear los esquemas para los microservicios en la conexion que se te proporciona.

## Reglas de implementacion
- Todo nombre de esquema debe ser el mismo nombre del microservicio asociado, pero sin el prefijo "ms-" si es que se usa el prefijo.
- Todo esquema debe ser en Mysql8 y usar TypeORM para el mapping de las entidades.
- No crear varios esquemas en una misma carpeta de database.
- Todo microservicio debe tener un solo esquema de base de datos y sus propias tablas en el esquema.
- En caso de que un microservicio necesite usar datos de otro microservicio, entonces se usaran GRANTs de base de datos que pemitan hacer select a tablas de otros esquemas, y llaves foraneas a tablas de otros esquemas.
- Todo DDL de creación de tabla debe tener comentarios explicando el proposito de la tabla, y cada columna debe tener comentarios del propósito de la columna.
- Debes crear el esquema <nombre> en la base de datos, para eso usa las credenciales que estan en el .env de la raiz del proyecto.