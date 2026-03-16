# Microservices Guidelines

## Objetivo

- Esta carpeta agrupa los microservicios backend del repositorio.
- Cada carpeta dentro de `src/microservices` debe ser un backend independiente.

## Crear un microservicio desde cero

1. Crear una carpeta nueva con el nombre del microservicio en `src/microservices/<nombre>`.
2. Inicializar dentro de esa carpeta un proyecto independiente en NestJS con TypeScript.
3. Mantener la estructura base del microservicio dentro de su propio workspace:
   - `src/` para el codigo fuente.
   - `package.json` propio.
   - `tsconfig.json` y `tsconfig.build.json`.
   - Scripts independientes para desarrollo, build y arranque.
4. Registrar el workspace en el `package.json` raiz usando el patron `src/microservices/*`.
5. Mantener dependencias, configuracion y documentacion del microservicio dentro de su propia carpeta.
6. Agregar autenticacion a los microservicios.

## Reglas de implementacion

- Todo microservicio nuevo debe usar NestJS + TypeScript.
- Cada microservicio debe exponer su propia API y poder ejecutarse de forma aislada.
- No crear varios microservicios dentro del mismo proyecto.
- Si existe codigo compartido, debe extraerse a un paquete o carpeta comun explicitamente definida, no duplicarse de forma informal.
- Si se necesita documentacion especifica para agentes, agregarla dentro de `.agents/`.
- Si no se detalla infraestructura o un skill para el depliegue, asume una ejecucion local ejecutando por comando `npm run dev:<nombre>`.
- Si no se proveen instrucciones para el uso de un servicio de autenticación en particular, entonces la integracion OAuth del microservicio debe guiarse obligatoriamente con el skill `rekodi-nest-auth` dentro de `src/microservices/.agents/`.