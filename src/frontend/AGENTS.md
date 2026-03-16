# Frontend Guidelines

## Objetivo

- Esta carpeta agrupa la configuracion y reglas del frontend del repositorio.
- Los skills y la configuracion de agentes del frontend viven en `src/frontend/.agents`.
- El proyecto frontend real vive en `src/frontend/app`.
- Las variables de entorno del frontend viven en `src/frontend/app`, porque esa carpeta es el root del proyecto.

## Crear el frontend desde cero

1. Crear el workspace en `src/frontend/app`.
2. Inicializar un proyecto independiente en Next.js con React y TypeScript.
3. Mantener la estructura base del proyecto dentro del workspace:
   - `app/` para rutas con App Router.
   - `package.json` propio.
   - `tsconfig.json`, `next.config.*` y `next-env.d.ts`.
   - `.env` local del frontend para variables de entorno del proyecto.
4. Registrar el workspace en el `package.json` raiz para que pueda ejecutarse con los scripts globales.
5. Mantener las dependencias del frontend encapsuladas en su propio `package.json`.
6. Si no vienen instrucciones específicas acerca de como organizar el layout, entonces crea uno con un menú lateral y una cabecera con datos del usuario y boton de cerrar sesión.
7. Agregar autenticacion a la aplicacion.

## Reglas de implementacion

- El stack del frontend debe ser Next.js + React + TypeScript.
- La pagina inicial y cualquier pantalla nueva deben vivir dentro de `src/frontend/app/app`.
- Los disenos del frontend deben solicitarse a Stitch de Google usando el MCP disponible para Stitch antes de implementar o editar interfaces relevantes.
- Debes solicitar a stitch el diseño de sistema con Platform: Web, Desktop-first.
- Los disenos frontend deben guardarse como html en `src/frontend/templates` y nombrar los archivos segun la funcionalidad que implementan.
- No debes cambiar el diseño a excepcion de ajustes de formularios para adaptar a las estructuras de datos que se requiera.
- Debes siempre usar los templates proporcionados por stitch, no inventes interfaces que no estén basadas en los diseños de stitch
- Cuando se necesite generar una pantalla, iterarla o crear variantes visuales, usar el skill local de Stitch dentro de `.agents/`.
- Si no se proveen instrucciones para el uso de un servicio de autenticación en particular, entonces la integracion OAuth del frontend debe guiarse obligatoriamente con el skill `rekodi-react-auth` dentro de `src/frontend/.agents/`.
- Las integraciones con backend deben leerse desde variables de entorno del frontend.
- No mezclar codigo del frontend con `src/microservices`.
- Si se necesita documentacion especifica del frontend para agentes, agregarla dentro de `.agents/`.
- Los mantendores o features que usen CRUD debe implementar todo en un solo menú, y dentro de la pantalla para la feature manejar cada opción como pestañas dentro de la pantalla. En particular, las opciones de crear y editar deben hacerse en un modal dentro de la pantalla.
- Si no se detalla infraestructura o un skill para el depliegue, asume una ejecucion local ejecutando por comando `npm run dev:frontend`
- Revisar que los endpoints usados de los microservicios del backend sean los correctos, y sus input/output sean correctos.
