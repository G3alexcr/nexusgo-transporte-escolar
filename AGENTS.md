## Application structure
- Administration uses `/admin` as an Outlet layout with separate child routes so each sidebar screen has its own URL.
- Mock workflows use a root-scoped in-memory reducer/provider so role navigation retains shared changes without pretending to persist or authenticate users.
- Fleet maps dynamically import Leaflet after hydration so browser-only map code never executes during SSR.
- Driver operational preferences and monthly collection records use the shared mock reducer, not authentication roles; this keeps simulator changes consistent across mobile and administration views without implying real permissions or payments.

## Protocolo Obligatorio de Bitácora y Autorización de Procesos
- **Control y Mantenimiento de Bitácora (`BITACORA.md`):**
  - Se debe llevar un registro estricto de cada cambio, arreglo o funcionalidad en el archivo `BITACORA.md` ubicado en la raíz del proyecto.
  - Toda nueva entrada debe añadirse de **primero arriba** (orden cronológico inverso) con su fecha y hora local exacta.
  - **Consulta previa obligatoria:** Antes de actualizar o modificar la bitácora, el agente debe **consultar primero con el usuario** qué se va a asentar.
- **Autorización Previa para Cualquier Proceso:**
  - El agente debe **SIEMPRE PREGUNTAR y pedir confirmación al usuario antes de ejecutar cualquier mínimo proceso**, cambio de código, creación de archivos, refactorización o ejecución de tareas operativas. No realizar acciones de manera arbitraria o desatendida sin validación explícita del usuario.
- **Confidencialidad Absoluta de Credenciales y Llaves:**
  - **NUNCA** mostrar, imprimir, copiar, citar ni pasar contraseñas, tokens de acceso, llaves privadas o credenciales (como claves de `.env`, tokens de Supabase, API keys, etc.) en el chat, respuestas, logs visibles o archivos de bitácora. Referenciar únicamente el nombre de la variable o el archivo donde reside.

## Git, GitHub y Despliegue (Vercel)
- **Repositorio remoto (`origin`):** `https://github.com/G3alexcr/nexusgo-transporte-escolar.git`
- **Rama principal:** `main`
- **Bitácora (`BITACORA.md`), Commit y Push (Solo bajo orden explícita):**
  - El agente **NUNCA** debe hacer `git commit`, `git push` ni actualizar `BITACORA.md` por iniciativa propia, **ni preguntar o proponer hacerlo** después de cada cambio.
  - **Únicamente cuando el usuario lo pida de forma explícita** se actualizará `BITACORA.md`, se hará `commit` o se hará `push` a `main`.
- **Despliegue en Vercel:** Desplegar únicamente cuando el usuario lo solicite o autorice expresamente.
