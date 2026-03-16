# Repository Template Guidelines

## Objetivo

- Este `AGENTS.md` raiz debe poder usarse como plantilla para crear un proyecto desde cero.
- La aplicacion siempre debe dividirse en dos dominios principales: `frontend` y `backend`.
- Todo el codigo fuente del proyecto debe vivir dentro de `src/`.
- No debes modificar ningun archivo `AGENTS.md` o archivos dentro de carpetas `.agents` a menos que se te solicite.
- Cuando no se den instrucciones explicitas de cuales capas crear, siempre crea el frontend, backend y esquema de base de datos.

## Estructura base esperada

- `src/frontend` debe existir como area reservada para el frontend del proyecto.
- `src/microservices` debe existir como area reservada para el backend del proyecto.
- `src/database` debe existir como area reservada para los scripts de definicion y creacion de los esquemas de base de datos proyecto que serán usados por los microservices dentro del backend.
- El frontend, el backend y la database deben mantenerse separados como proyectos independientes.
- No se debe mezclar codigo de frontend o database dentro de `src/microservices`.
- No se debe mezclar codigo de backend o database dentro de `src/frontend`.
- No se debe mezclar codigo de backend o frontend dentro de `src/database`.

## Delegacion de instrucciones

- Este archivo solo define la organizacion general y la separacion obligatoria entre database, frontend y backend.
- Las instrucciones especificas de como crear, estructurar e implementar el frontend deben vivir en `src/frontend/AGENTS.md` y en el resto de archivos de Codex dentro de `src/frontend/.agents/`.
- Las instrucciones especificas de como crear, estructurar e implementar la database deben vivir en `src/database/AGENTS.md` y en el resto de archivos de Codex dentro de `src/database/.agents/`.
- Las instrucciones especificas de como crear, estructurar e implementar los microservicios backend deben vivir en `src/microservices/AGENTS.md` y en el resto de archivos de Codex dentro de `src/microservices/.agents/`.
- Si un proyecto nuevo requiere mas detalle operativo, ese detalle debe agregarse en los `AGENTS.md` locales o en archivos dentro de sus carpetas `.agents`, no en este archivo raiz.

## Regla de arranque

- Al crear un proyecto nuevo desde cero, primero se debe definir la separacion entre `src/frontend`, `src/database` y `src/microservices`.
- Despues de crear esa estructura base, la implementacion concreta de cada lado debe seguir las reglas documentadas en sus respectivos `AGENTS.md` y archivos auxiliares de Codex.


## Regla post implementacion

- Al terminar de implementar un feature, debes actualizar el README.md de la raiz del proyecto para incluir la forma de ejecución del sistema en caso de ser necesario, por ejemplo, si se agrega un microservicios incluir el comando de ejecucion de node para levantarlo.