# 📋 BITÁCORA DE CONTROL DE CAMBIOS Y DESARROLLO — NEXUS GO COSTA RICA

> **Regla de mantenimiento:** Toda nueva entrada debe registrarse en la parte superior (orden cronológico inverso) con su fecha y hora correspondiente. Siempre se debe consultar antes de actualizar y solicitar confirmación al usuario antes de ejecutar cualquier mínimo proceso o cambio.

---

### [2026-11-15 17:08] — 🔄 Sistema de Versiones `v1.0.1`, Audio/Push Realtime, Asistencia Móvil, Campanita y Foto de Buseta
- **Sistema de Actualización de Versiones y Reset de Caché (`public/version.json`, `app-version.ts`, `version-update-modal.tsx`, `sw.js`, `__root.tsx`):**
  - Se inició el control de versiones en `v1.0.1` (`APP_VERSION` y `/version.json` excluido de caché en `sw.js`, con `CACHE_NAME = 'nexusgo-pwa-v1.0.1'`).
  - Se añadió el modal compacto `VersionUpdateModal` que verifica nuevas versiones al abrir, al volver a primer plano en móvil y cada 2 minutos, mostrando **"Nueva actualización disponible"** con el botón **Actualizar ahora** para limpiar cachés del Service Worker y recargar limpiamente.
  - Se mostró `Nexus Go v1.0.1` al pie del menú de usuario (`user-profile-menu.tsx`).
- **Audio y Push Realtime en Teléfono del Padre (`platform-provider.tsx`, `sound-effects.ts`):**
  - Se reprodujo `playNotificationSound` (`bus_approach`, `sos_alert`, `push`), `toast.info` y `showServiceWorkerNotification` en los dispositivos receptores al llegar un `INSERT` de `notices` o `notifications` por Supabase Realtime, eliminando la notificación local redundante en el dispositivo emisor y desbloqueando `AudioContext` al primer toque en iOS/Android.
- **Asistencia y Botones Móviles del Chofer (`platform-state.ts`, `driver-attendance.tsx`, `chofer.tsx`):**
  - Se corrigió `case "attendance"` en `platformReducer` para inicializar registros sin fila previa en `attendance` y actualizar estado, contador `aBordo`, `Subida`/`Bajada` y Supabase.
  - Se ajustaron los botones de **Avisos Automáticos a los Apoderados** (`whitespace-normal`, `h-auto min-h-10`, `shrink-0`) para evitar desbordamientos en móvil.
- **Campanita Solo con No Leídas y Guardado Inmediato de Foto de Buseta (`user-profile-menu.tsx`, `admin-busetas.tsx`):**
  - Se filtró la campanita para mostrar únicamente notificaciones no leídas (`!n.read`), marcando como leída al tocar cualquiera y vaciándola al pulsar **Marcar leídas**.
  - En `admin-busetas.tsx`, al subir la foto exterior o documentos CTP de una unidad existente, se persiste de inmediato en Supabase (`dispatch({ type: 'updateRoute', ... })`).
- **GitHub y Reglas (`AGENTS.md`):**
  - Se vinculó el repositorio remoto `G3alexcr/nexusgo-transporte-escolar` con Vercel (`g3-8a54/nexus-go-cr`) y se fijó en `AGENTS.md` la regla estricta de no ejecutar `git commit` ni `git push` sin instrucción explícita del usuario.
- **Verificación y Despliegue:** `npm.cmd test` (**2 archivos, 33/33 pruebas aprobadas**) y despliegue en producción en **Vercel** (`https://nexus-go-cr.vercel.app`).

---

### [2026-11-15 15:24] — 📱 TopBar & Logo Móvil, Orden de Transportistas en Supabase (`sortOrder`) y Re-despliegue en Vercel
- **Limpieza Responsiva de `TopBar` (`shared.tsx`, `user-profile-menu.tsx`):**
  - Se fijó `shrink-0` y `whitespace-nowrap` en el título **Nexus Go**, ocultando el subtítulo y el pill secundario en pantallas angostas (`< 640px`), y se retiró el botón circular de Wifi del `TopBar` para evitar recortes en móvil.
- **Logo del Transportista en Móvil (`admin-shell.tsx`):**
  - Se agregó la tarjeta compacta de flota (`md:hidden`) sobre la barra de navegación móvil mostrando el logo de la empresa y su nombre.
- **Orden de Transportistas Persistido en Supabase (`data.ts`, `superadmin-dashboard.tsx`, `supabase-sync.ts`):**
  - Se agregó `sortOrder?: number` en `Tenant` y se reemplazó el ordenamiento en `localStorage` por persistencia directa en `public.tenants` de Supabase, ordenando la carga inicial por `sortOrder`.
- **Verificación y Despliegue:** `npm.cmd test` (**2 archivos, 33/33 pruebas aprobadas**) y actualización en producción en **Vercel** (`https://nexus-go-cr.vercel.app`).

---

### [2026-11-15 15:11] — 🔔 Notificaciones Realtime + Push en Asistencia y Despliegue a Producción en Vercel
- **Notificaciones Automáticas y Sincronización en Tiempo Real (`platform-state.ts`, `supabase-sync.ts`, `platform-provider.tsx`):**
  - Se generó notificación automática (`type: "attendance"`) al marcar **A bordo**, **Entregado** o **Ausente** en la consola del chofer, persistida en `public.notifications`.
  - Se suscribió `PlatformProvider` a **Supabase Realtime** (`postgres_changes` en `notifications`, `notices` y `attendance`) y se habilitó la publicación `supabase_realtime` en esas tablas para actualizar en vivo la app de Familias/Apoderados y disparar alertas locales + Push (`showServiceWorkerNotification`).
- **Configuración de Build SSR y Despliegue en Vercel (`vite.config.ts`):**
  - Se integró `nitro()` (`nitro/vite`) únicamente en `command === "build"` para compatibilidad SSR en Vercel sin conflictos con `vite dev` en Windows (`EBUSY`).
  - Se vinculó el proyecto en Vercel (`g3-8a54/nexus-go-cr`), se configuraron las variables públicas de Supabase en Production y se desplegó en línea en `https://nexus-go-cr.vercel.app`.

---

### [2026-11-15 14:39] — 🎨 Rebranding a Nexus Go, Logos por Transportista, Correos `@nexusgo.cr`, Ojito en Contraseñas y GPS Real Persistido
- **Rebranding Completo a Nexus Go (`src/`, `public/`):**
  - Se reemplazaron todas las referencias visibles de `LinkBus / Link Bus` por **Nexus Go** en 35 archivos (`src/` y `public/`, incluyendo `manifest.json`, `sw.js`, `favicon.svg`, `pwa-push.ts`, vistas de administración, chofer, apoderado y pruebas), manteniendo intactos los identificadores técnicos internos.
- **Logos Oficiales y Logo del Transportista en Storage (`public/logo-nexus-go.jpg`, `public/logo-nexus-go-icon.jpg`):**
  - Se integró el logo limpio de **Nexus Go** en el **SuperAdmin Hub** (`src/components/linkbus/superadmin-dashboard.tsx`), pantalla de acceso (`src/routes/login.tsx`), PWA/favicon (`src/routes/__root.tsx`, `public/manifest.json`) y cabecera tipográfica en `src/components/linkbus/shared.tsx`.
  - Se añadió soporte de `logoUrl` por empresa en `Tenant` (`src/lib/data.ts`), con subida directa al bucket `linkbus-files` de Supabase desde `/admin/ajustes` (`src/components/linkbus/admin-directory.tsx`) y renderizado completo con esquinas redondeadas (`w-full h-auto block`) en el sidebar de administración (`src/components/linkbus/admin-shell.tsx`).
- **Migración de Correos a `@nexusgo.cr` y Edición desde UI (`supabase/migrations/20261115_admin_update_email_rpc.sql`, `src/components/linkbus/admin-usuarios.tsx`):**
  - Se migraron en Supabase las 24 cuentas `@linkbus.cr` → `@nexusgo.cr` en `auth.users`, `auth.identities` y `public.user_profiles` (`remaining_linkbus: 0`), además de los correos mock en `parent-profile.tsx` y `platform-state.ts`.
  - Se creó y desplegó en Supabase el RPC seguro `public.admin_update_user_email(target_user_id, new_email)` (`SECURITY DEFINER`) y se habilitó el campo editable de correo en el modal **Editar Usuario** de `/admin/usuarios`.
- **Visibilidad de Contraseñas (`src/components/ui/password-input.tsx`):**
  - Se creó el componente reutilizable `PasswordInput` con botón mostrar/ocultar (`Eye` / `EyeOff`) y se aplicó en los 4 campos de contraseña faltantes (`admin-usuarios.tsx` crear/editar, `superadmin-dashboard.tsx` y `perfil.tsx`), logrando cobertura del 100% en la app.
- **Identidad del Transportista y GPS Real Persistido (`chofer.tsx`, `apoderado.tsx`, `fleet-map.tsx`, `platform-provider.tsx`, `supabase-sync.ts`):**
  - Se añadió el nombre y mini-logo de la empresa transportista (`state.company`) en los encabezados de **Chofer** y **Apoderado / Familia**.
  - Se corrigió `FleetMap` para inicializar y centrar la cámara en `[v.lat, v.lng]` reales cuando existen, y se habilitó la persistencia throttled (cada ~10 s) de `updateVanLocation` en Supabase (`vans`) para que Administración y Familias vean la buseta en su ubicación real.
- **Verificación:** `npm.cmd test` (`vitest run`): **2 archivos, 33/33 pruebas aprobadas**.

---

### [2026-11-15 13:25] — 🚌 Transportes Regu (Heredia) y CRUD Completo en `/admin/usuarios`
- **Nueva Empresa Transportes Regu en Supabase y Storage (`linkbus-files`):**
  - Se unificó y pobló **Transportes Regu** (`71a5328e-b70f-426a-b14b-8676e2f3ebe6`) con **Escuela Rafael Moya Murillo** (Heredia Centro), buseta **`HER-305`** (*Los Lagos – Guararí – Hospital Heredia → Escuela Rafael Moya Murillo*) con expediente completo en Storage, **2 choferes** (*Rodrigo Brenes Solís* y *Allan Villalobos Mora* con licencias C-2 en Storage), **14 estudiantes** de Preescolar (Materno, Kínder, Transición) y Primaria (1° a 6° Grado), **6 personas autorizadas** (`authorized_persons`) y **6 usuarios con roles** (`admin`, `chofer` ×2, `asistente`, `apoderado` ×2).
  - Se corrigió `activeTenantId` en `src/components/linkbus/admin-usuarios.tsx` para que `SuperAdmin` inspeccione siempre los usuarios del tenant activo (`state.currentTenantId`).
- **CRUD Completo en `/admin/usuarios` (`src/components/linkbus/admin-usuarios.tsx`, `supabase/migrations/20261115_admin_user_crud_rpc.sql`):**
  - Se creó y aplicó en Supabase el RPC seguro `public.admin_delete_user(target_user_id uuid)` (`SECURITY DEFINER`) para dar de baja cuentas de `auth.users` / `user_profiles` con aislamiento por `tenant_id` y protección contra auto-eliminación o cuentas `superadmin`.
  - Se añadieron buscador de usuarios, edición de `full_name`, rol/rol personalizado y vínculo operativo, y confirmación de eliminación en la tabla de usuarios.
- **Auditoría CRUD:** Se verificó la presencia de operaciones Crear/Leer/Editar/Eliminar en `admin-directory.tsx` (Alumnos, Choferes, Rutas, Colegios), `admin-busetas.tsx` (Busetas/Flota) y `admin-usuarios.tsx`.
- **Verificación:** `vitest run` (`2` archivos, `33/33` pruebas en verde).

---

### [2026-11-15 13:03] — 🗄️ Supabase Storage (`linkbus-files`) y Expedientes Digitales Completos en BD
- **Bucket y Políticas RLS (`supabase/migrations/20261115_storage_buckets.sql`, `src/lib/supabase-storage.ts`):**
  - Se creó y aplicó en Supabase el bucket **`linkbus-files`** (lectura pública para visualización y escritura autenticada por RLS) junto con el helper `uploadFileToStorage` / `uploadCanvasToStorage` (organizado en `<tenantId>/sinpe`, `<tenantId>/fleet`, `<tenantId>/contracts`) y respaldo automático a Data URL sin conexión.
- **Migración de Subidas desde Base64 a Storage:**
  - Se actualizaron `src/components/linkbus/sinpe-modal.tsx` (comprobantes SINPE), `src/components/linkbus/admin-busetas.tsx` y `src/components/linkbus/admin-directory.tsx` (fotos de busetas, documentos CTP/Dekra/INS/Marchamo y licencias C-2) y `src/components/linkbus/contrato-modal.tsx` (firmas de `<canvas>` en PNG).
- **Expedientes Digitales en Storage y PostgreSQL (`public.vans`, `public.choferes`):**
  - Se subieron al bucket `linkbus-files` y se guardaron en Supabase todas las imágenes y datos regulatorios de `HER-101`, `ALJ-201`, `ALJ-202`, `ALJ-203`, así como cédulas, vínculos, vencimientos y fotos de licencia C-2 de los 5 choferes de Alajuela y Heredia.
- **Verificación:** `vitest run` (`2` archivos, `33/33` pruebas en verde).

---

### [2026-11-15 12:29] — ✏️ Nombres Completos sin Truncar (`...`) y Matrícula Exacta de Estudiantes
- **Visualización Completa de Nombres (`src/components/linkbus/admin-shell.tsx`, `src/components/linkbus/superadmin-dashboard.tsx`, `src/components/linkbus/shared.tsx`):**
  - Se eliminó la clase `truncate` / `max-w-[180px]` en el sidebar de `/admin`, en la tabla/tarjetas de `/superadmin` y en el `TopBar`, permitiendo leer siempre los nombres completos de cada transportista sin puntos suspensivos (`...`).
- **Matrícula Exacta en Supabase (`public.alumnos`):**
  - Se completaron los registros reales de estudiantes y apoderados para coincidir exactamente con los totales de flota: **Busetas del Sol Heredia S.A.** (`17`), **Transportes Alajuela & San Pedro** (`42`) y **Transportes Escolares del Valle CR** (`14`).
- **Verificación:** `vitest run` (`2` archivos, `33/33` pruebas en verde).

---

### [2026-11-15 12:16] — 👥 Módulo Usuarios y Roles (`/admin/usuarios`), Hidratación de Mapa y Poblado Multi-Tenant
- **Gestión de Usuarios y Roles por Transportista (`src/components/linkbus/admin-usuarios.tsx`, `src/routes/admin.usuarios.tsx`, `src/components/linkbus/admin-shell.tsx`, `src/lib/supabase.ts`, `src/components/linkbus/auth-provider.tsx`, `src/routes/chofer.tsx`):**
  - Se creó la sección `/admin/usuarios` con `createEphemeralSupabaseClient()` (`persistSession: false`) para registrar cuentas sin cerrar la sesión del administrador.
  - Se añadió el rol **`asistente`** (*Asistente de Chofer*) a `UserRole`, a `AuthGuard` de `/chofer` y a los selectores de rol, junto con la opción de **roles personalizados** (`custom_role`) y vínculo operativo a `chofer_id` o `alumno_id`.
- **Migración SQL y RLS en Supabase (`supabase/migrations/20261115_admin_user_management.sql`):**
  - Se agregó la columna `custom_role`, se amplió el `CHECK` de `user_profiles.role` para incluir `'asistente'`, se crearon políticas RLS para `admin` del tenant y `superadmin`, y se actualizó `handle_new_user()`. Migración ejecutada en Supabase.
- **Hidratación de Marcadores en `FleetMap` (`src/components/linkbus/fleet-map.tsx`):**
  - Se corrigió la creación dinámica de marcadores, polilíneas y destinos cuando `state.vans` llega de forma asíncrona desde Supabase, y se agregó centrado automático al seleccionar una buseta en `/admin/dashboard`.
- **Poblado Multi-Tenant en Supabase:**
  - **Transportes Escolares del Valle CR** (Colegios Privados): 2 busetas, 5 choferes, 6 colegios, 7 alumnos y 5 usuarios con roles.
  - **Transportes Alajuela & San Pedro** (Colegios Públicos): 3 busetas (`ALJ-201`, `ALJ-202`, `ALJ-203`), 3 choferes, 3 colegios públicos, 6 alumnos y 8 usuarios (incluyendo rol personalizado *Coordinadora de Ruta*).
  - **Busetas del Sol Heredia S.A.** (Colegios Públicos): 1 buseta (`HER-101`), 2 choferes compartiendo la misma placa (`Esteban Vargas Rojas` y `Marco Antonio Brenes`), 2 colegios públicos, 3 alumnos y 5 usuarios con roles.
- **Verificación:** `vitest run` (`2` archivos, `33/33` pruebas en verde).

---

### [2026-11-15 11:48] — 📡 Telemetría GPS en Tiempo Real (Chofer → Apoderado / Admin)
- **Servicio de Telemetría Efímera (`src/lib/realtime-telemetry.ts`):**
  - Se creó `publishVanTelemetry` y `subscribeVanTelemetry` usando **Supabase Realtime Broadcast** (`linkbus-telemetry:<tenantId>`) con respaldo automático mediante `BroadcastChannel` del navegador para pruebas locales entre pestañas, sin almacenar historial de geolocalización en base de datos.
  - Se creó el hook `useDriverGpsBroadcast` con `navigator.geolocation.watchPosition` (`enableHighAccuracy: true`) y throttle de `1.5s` mientras el viaje está activo.
- **Estado y Proveedor (`src/lib/platform-state.ts`, `src/components/linkbus/platform-provider.tsx`):**
  - Se añadió la acción efímera `updateVanLocation` en `platformReducer` para actualizar `lat`/`lng` en memoria (limpiando coordenadas al ejecutar `finish`) y se conectó la suscripción en tiempo real en `PlatformProvider` excluyéndola de la persistencia en Supabase DB.
- **Vista Chofer y Mapa de Flota (`src/routes/chofer.tsx`, `src/components/linkbus/fleet-map.tsx`):**
  - Se integró `useDriverGpsBroadcast` en `/chofer` con indicador visual de estado de señal GPS.
  - Se actualizó `FleetMap` para posicionar marcadores en las coordenadas reales (`v.lat`, `v.lng`) cuando hay telemetría activa en `/apoderado` y `/admin/dashboard`, manteniendo `pointOnPath` únicamente como respaldo cuando no hay señal GPS.
- **Verificación:** `vitest run` (`2` archivos, `33/33` pruebas en verde).

---

### [2026-11-14 23:49] — 🔧 Prioridad de Busetas y Alumnos Editados en SuperAdmin
- **Conteo en Vivo y Edición de Transportistas (`src/components/linkbus/superadmin-dashboard.tsx`):**
  - Se corrigieron `getLiveVansCount(t)` y `getLiveAlumnosCount(t)` para priorizar los valores editados y guardados en el transportista (`t.busetasActivas > 0` y `t.estudiantesTotales > 0`), usando las tablas `vans` y `alumnos` de Supabase como respaldo cuando el valor del transportista es `0`.
  - Se actualizaron la columna **Busetas / Alumnos**, los KPIs (**Flota Nacional**, **Alumnos Conectados**, **MRR**), `handleOpenModal` y `handleApplyPricingToAll` para mantener consistencia inmediata al crear o editar cualquier transportista.
- **Verificación:** `tsc --noEmit` (código `0`) y `vitest run` (`2` archivos, `33/33` pruebas en verde).

---

### [2026-11-14 23:33] — 📷 Cámara Real en Escáner QR, Perfil de Usuario (`/perfil`) y Tabla Progresiva SaaS
- **Escáner QR con Cámara Real (`src/components/linkbus/qr-checkin.tsx`):**
  - Se conectó `getUserMedia` (cámara trasera) y `BarcodeDetector` (`qr_code`) en `DriverQrScannerModal`, manteniendo la lista de check-in rápido manual como respaldo.
- **Barra Superior, Menú de Avatar y Página `/perfil` (`src/components/linkbus/user-profile-menu.tsx`, `src/routes/perfil.tsx`, `src/components/linkbus/shared.tsx`):**
  - Se creó `UserUtilityBar` y `UserProfileMenu` con estado de red, tema, notificaciones, acceso a **Mi Perfil** (`/perfil`) y cierre de sesión; el selector de cambio de vista/rol aparece **exclusivamente** para `superadmin`.
  - Se creó la ruta `/perfil` con foto editable sincronizada, pestañas `MIS DATOS` (guardado en Supabase `user_profiles` y `auth.updateUser`) y `MI CARNET` (QR), preferencias Push (`pwa-push.ts`) y cambio de contraseña.
- **Métricas en Vivo y Tabla Progresiva SaaS (`src/components/linkbus/superadmin-dashboard.tsx`, `MODELO_COBROS_MRR.md`, Supabase):**
  - Se sincronizaron en vivo `vans`, `alumnos` y `contracts` (refresco al cambiar de sección, enfocar ventana y botón **Actualizar**), reflejando `2/3` contratos firmados (`66.7%`) y `2` busetas reales.
  - Se implementó la tabla progresiva con descuento lineal de **₡500/buseta** (`₡15,000` base hasta piso `₡10,500` en `10+` busetas; preset configurable para público `₡10,000 → ₡7,000`), actualizando `MODELO_COBROS_MRR.md` y Supabase (`Transportes Escolares del Valle CR`: 2 busetas → **₡29,000/mes**).
- **Verificación:** `tsc --noEmit` (0 errores) y `vitest run` (2 archivos, 33 pruebas en verde).

---

### [2026-11-14 22:44] — 📶 Persistencia Offline en IndexedDB y PWA Service Worker (`sw.js`) con Push Notifications
- **Cola Offline en IndexedDB (`src/lib/offline-idb.ts`, `src/lib/platform-state.ts`, `src/components/linkbus/platform-provider.tsx`):**
  - Se creó `offline-idb.ts` (`linkbus_offline_db` / `offline_queue`) para persistir los registros de asistencia pendientes cuando el chofer pierde cobertura y restaurarlos al recargar o reabrir la app (`hydrateOfflineQueue`), sin reemplazar a Supabase PostgreSQL como fuente principal.
  - Se actualizó `hydrateFromRemote` para conservar la cola offline pendiente hasta que `syncOfflineQueue` la envíe a Supabase PostgreSQL y limpie IndexedDB.
- **PWA, Caché Offline y Push (`public/sw.js`, `src/lib/pwa-push.ts`, `src/routes/__root.tsx`):**
  - Se creó `public/sw.js` con precaché del App Shell (`/`, `/manifest.json`, `/favicon.svg`), estrategia *Network-First* para navegación/estáticos sin cachear peticiones de API/Supabase, y listeners `push` + `notificationclick`.
  - Se creó `src/lib/pwa-push.ts` para registrar el Service Worker en `__root.tsx`, gestionar permisos de `Notification`, preparar `PushManager.subscribe` con `VITE_VAPID_PUBLIC_KEY` y disparar notificaciones nativas desde `PlatformProvider`.
- **Verificación:** `tsc --noEmit` (0 errores) y `vitest run` (2 archivos, 33 pruebas en verde).

---

### [2026-11-14 22:36] — 💵 Tarifa Directa por Buseta Activa (₡15,000/buseta/mes) y Recálculo en Supabase
- **Tarifa Unitaria Editable (`src/components/linkbus/superadmin-dashboard.tsx`):**
  - Se simplificó el panel **Tarifas & Facturación** al modelo directo por unidad (**₡15,000 por buseta activa / mes** por defecto, editable en `localStorage`), con vista previa automática (`1 → ₡15,000`, `2 → ₡30,000`, `3 → ₡45,000`, `5 → ₡75,000`).
  - El botón **Aplicar según busetas reales** y el modal de afiliación calculan ahora `busetas × tarifaPorBuseta` automáticamente.
- **Documentación y Base de Datos (`MODELO_COBROS_MRR.md`, Supabase `tenants`):**
  - Se actualizó `MODELO_COBROS_MRR.md` con la regla oficial de **₡15,000 / buseta activa / mes**.
  - Se recalcularon los 3 transportistas actuales en Supabase (`Transportes Escolares del Valle CR`: 5 busetas → ₡75,000/mes; `Busetas del Sol Heredia S.A.`: 0 busetas → ₡0; `Transportes Alajuela & San Pedro`: 0 busetas → ₡0).
- **Verificación:** `tsc --noEmit` (0 errores) y `vitest run` (2 archivos, 32 pruebas en verde).

---

### [2026-11-14 22:32] — 📄 Documentación del Modelo de Cobros SaaS, Tarifas y MRR
- **Documentación (`MODELO_COBROS_MRR.md`):**
  - Se creó el documento raíz `MODELO_COBROS_MRR.md` detallando el cálculo en vivo del MRR (`Activo` vs. `En prueba` y `Suspendido`), las tarifas recomendadas para Costa Rica (**Independiente:** ₡18,000/mes, **Empresa:** ₡55,000/mes, **Flota:** ₡120,000/mes y alternativa de ₡15,000/buseta), el ciclo de cobro mensual (15–30 días de prueba y cobro días 1–5) y el uso operativo desde el Sidebar del SuperAdmin.

---

### [2026-11-14 22:28] — 🧭 Sidebar Lateral en el Centro de Mando SuperAdmin
- **Navegación y Estructura (`src/components/linkbus/superadmin-dashboard.tsx`):**
  - Se reorganizó el Centro de Mando de SuperAdmin con un Sidebar fijo en escritorio y menú lateral deslizable en móvil.
  - Se dividió la consola en 4 secciones: **Resumen & KPIs**, **Transportistas**, **Tarifas & Facturación** y **Cumplimiento CTP** (con conteo real de busetas `Al día`, `Próximo a vencer` y `Vencido`).
  - Se centralizaron en el Sidebar las acciones rápidas (`Afiliar Transportista`, `Exportar CSV`), acceso directo al Panel de Flota (`/admin/dashboard`) y `Cerrar Sesión`.
- **Verificación:** `tsc --noEmit` (0 errores) y `vitest run` (2 archivos, 32 pruebas en verde).

---

### [2026-11-14 22:24] — 🌐 Separación de Landing Page, Rediseño de Login y Tarifas SaaS Configurables en SuperAdmin
- **Login y Cierre de Sesión (`src/routes/login.tsx`, `src/components/linkbus/superadmin-dashboard.tsx`):**
  - Se simplificó `/login` a 2 pestañas (`Iniciar sesión` y `Registrarse` con selector de tipo de cuenta: Empresa de Transporte, Padre / Apoderado o Chofer), se eliminaron menciones técnicas del backend (`ACCESO SEGURO`) y se centró el botón para mostrar/ocultar contraseña.
  - Se corrigió el botón `Cerrar Sesión SuperAdmin` para ejecutar `signOut()` real y redirigir a `/login`.
- **Separación de Landing Page (`d:\AntigravitDev\transporteEscolar-landing`):**
  - Se extrajo la landing page pública a un proyecto independiente en `transporteEscolar-landing` (puerto `3051`), dejando la ruta `/` de la aplicación (`src/routes/index.tsx`) como redireccionador limpio hacia `/login` o el portal autorizado.
- **Métricas Reales y Tarifas Configurables en SuperAdmin (`src/components/linkbus/superadmin-dashboard.tsx`):**
  - Se conectaron los KPIs de Flota Nacional, Alumnos Conectados, Cumplimiento CTP (%) y MRR (solo cuentas `Activo`) a conteos reales en Supabase (`vans`, `alumnos`, `tenants`).
  - Se agregó el panel editable **Tarifas SaaS por Buseta Activa / Mes** (`Independiente 1 buseta`, `Empresa 2–5 busetas`, `Flota +5 busetas`) con persistencia en `localStorage`, botón para aplicar tarifas según las busetas reales de cada cuenta, edición rápida en línea del costo mensual por transportista y selector directo de estado (`Activo`, `En prueba`, `Suspendido`).
- **Verificación:** `tsc --noEmit` (0 errores) y `vitest run` (2 archivos, 32 pruebas en verde).

---

### [2026-11-14 21:39] — 🔐 Autenticación Supabase Auth, RBAC/RLS y Persistencia 100% en PostgreSQL (UUIDs)
- **Seguridad y Reglas:**
  - Se agregó en `AGENTS.md` la regla de **Confidencialidad Absoluta de Credenciales y Llaves** (prohibición estricta de exponer contraseñas, tokens o llaves en chat, logs o bitácora).
  - Se protegieron `.env` y `.env.*` en `.gitignore` y se trasladó `SUPABASE_ACCESS_TOKEN` a `.env.local`.
- **Persistencia 100% en Supabase PostgreSQL (Punto 1):**
  - Se instaló `@supabase/supabase-js` y se creó el cliente `src/lib/supabase.ts`.
  - Se ejecutaron migraciones SQL (`supabase/migrations/`) para crear las 15 tablas operativas (`tenants`, `colegios`, `choferes`, `vans`, `alumnos`, `viajes`, `attendance`, `payments`, `contracts`, `inspections`, `absences`, `notifications`, `authorized_persons`, `notices`, `app_settings`) con llaves primarias y foráneas nativas `uuid`.
  - Se poblaron todas las tablas con UUIDs reales y se conectaron `PlatformProvider` (`src/components/linkbus/platform-provider.tsx`), `src/lib/supabase-sync.ts` y `src/lib/api-client.ts`, eliminando los datos hardcodeados en la interfaz (`index.tsx`, `admin.viajes.tsx`, `admin-shell.tsx`, `driver-tools.tsx`).
- **Autenticación, Sesiones y Control de Acceso RBAC (Punto 2):**
  - Se creó la tabla `user_profiles`, el trigger `handle_new_user()` y políticas RLS por `tenant_id` y `alumno_id` (`supabase/migrations/20261114_auth_rbac.sql`).
  - Se implementaron `AuthProvider` (`src/components/linkbus/auth-provider.tsx`), `AuthGuard` (`src/components/linkbus/auth-guard.tsx`) y la ruta `/login` (`src/routes/login.tsx`) con inicio de sesión, registro de empresa y registro de familia/chofer.
  - Se protegieron `/admin/*`, `/chofer`, `/apoderado` y `/superadmin`, conectando el cierre de sesión real en `TopBar` y los enlaces de `src/routes/index.tsx` hacia `/login`.
- **Verificación:** `tsc --noEmit` (0 errores) y `vitest run` (2 archivos, 32 pruebas en verde).

---

### [2026-11-13 20:35] — 🔒 Aislamiento de Funciones: Eliminación de Cobros en la App del Chofer y Centralización en Admin
- **Decisión operativa:** El chofer no debe gestionar cobros, dineros ni comprobantes bancarios; su foco exclusivo es la conducción y asistencia de los estudiantes.
- **Acciones ejecutadas:**
  - Se eliminó por completo la pestaña *"Cobros & SINPE"* y el botón superior de *"Cobros"* de la consola del chofer (`/chofer`).
  - Se removió el acceso a recaudaciones en el perfil del conductor (`DriverProfile`).
  - Se centralizó el 100% de la gestión de cobros, revisión de comprobantes SINPE Móvil, emisión de recibos digitales y filtros de estado en el panel de Administración (`/admin/pagos`).

---

### [2026-11-13 20:20] — 📊 Reporte Oficial para Junta de Educación & 📴 Modo Offline para Chofer
- **Reporte Oficial Junta de Educación / MEP:** Generador de informe mensual oficial con métricas de puntualidad, asistencia por ruta, cumplimiento de pólizas INS y CTP, e impresión directa/descarga para entregar a la Dirección del centro educativo.
- **Modo Fuera de Línea (Offline) Chofer:** Capacidad de operar sin cobertura celular en zonas rurales o de montaña, almacenando lista de asistencia y escaneos QR en cola local con sincronización automática en lote al restablecerse la señal.

---

### [2026-11-13 20:12] — 🛠️ Corrección de Jerarquía Visual (z-index) en Modales de Fiscalización CTP
- **Problema resuelto:** Al pulsar sobre *"Manifiesto CTP"* desde la Ficha Técnica Vehicular, el modal se desplegaba por detrás del expediente debido a una colisión de elevaciones (`z-[100]` de la ficha vs `z-50` predeterminado).
- **Acciones ejecutadas:**
  - Se actualizó el componente base de diálogos (`src/components/ui/dialog.tsx`) para sincronizar automáticamente la propiedad `z-index` del contenido con el fondo oscuro (`DialogOverlay`).
  - Se elevó el modal del Manifiesto (`src/components/linkbus/manifiesto-pasajeros-modal.tsx`) a `z-[200]` y el visor de impresión a `z-[300]`.
  - Se blindaron también los modales de Contrato Digital, Checklist Pre-Operativo y Reporte SINPE Móvil a `z-[200]`.
- **Verificación:** 0 errores de compilación TypeScript y 31 pruebas unitarias/de enrutamiento en verde.

---

### [2026-11-13 19:48] — 🖨️ Implementación del Manifiesto / Lista Oficial de Pasajeros CTP (Retenes de Tránsito)
- **Marco normativo:** Decreto Ejecutivo N° 35249-MOPT y Ley de Tránsito N° 9078 para control de transporte escolar en carretera.
- **Acciones ejecutadas:**
  - Se creó el generador gráfico SVG oficial (`src/lib/document-samples.ts`) con formato formal del Consejo de Transporte Público (CTP):
    - Folio digital de fiscalización con sello de fecha y hora.
    - Datos de la buseta: Placa CR, capacidad autorizada, Permiso CTP, Dekra semestral y Póliza Colectiva INS.
    - Tripulación reglamentaria: Chofer con licencia profesional C-2 y Asistente/Acompañante con carné CTP.
    - Lista nominal de estudiantes: Cédula de menor/TIM, apoderado, teléfono de emergencia, dirección/parada y estado a bordo.
    - Firmas digitales y sello circular de inspección *"CTP Fiscalizado / Tránsito OK"*.
  - Se creó el modal interactivo `ManifiestoPasajerosModal` con opciones de:
    - Impresión directa optimizada (`window.print()`).
    - Descarga en formato SVG/PDF de alta fidelidad.
    - Envío inmediato de la lista oficial vía WhatsApp al oficial de tránsito o dirección escolar.
  - Se integró el acceso en la consola del chofer (`/chofer` en top bar, inicio y rutas), en administración de viajes (`/admin/viajes`) y en la ficha técnica vehicular (`/admin/busetas`).

---

### [2026-11-13 19:15] — ⚠️ Semáforo de Vencimientos CTP (Alertas Preventivas en Panel de Control)
- **Objetivo:** Evitar retenciones de unidades o retiro de placas por parte de la Policía de Tránsito.
- **Acciones ejecutadas:**
  - Se desarrolló el componente `ExpirationAlertsWidget` (`src/components/linkbus/expiration-alerts-widget.tsx`).
  - Sistema de clasificación automática:
    - 🔴 **Alerta Crítica:** Vencimiento en menos de 15 días (Dekra RTV, Póliza INS o Permiso Especial CTP).
    - 🟡 **Alerta Preventiva:** Vencimiento entre 15 y 30 días.
    - 🟢 **Al Día:** Vigencia superior a 30 días.
  - Enlaces directos a gestión de renovación ante Dekra, CTP e INS, y apertura de la ficha vehicular.
  - Integrado en el panel principal (`/admin/dashboard`) y en la sección de flota (`/admin/busetas`).

---

### [2026-11-13 18:40] — 📄 Contrato de Transporte Escolar y Panel de Firma Digital
- **Marco normativo:** Regulaciones CTP para el servicio remunerado de transporte de estudiantes.
- **Acciones ejecutadas:**
  - Se implementó `ContratoTransporteModal` y `ContratoViewerModal` (`src/components/linkbus/contrato-modal.tsx`) con cláusulas legales completas (paradas, tarifas, seguros, emergencias y retiros).
  - Panel interactivo de firma manuscrita digital (soporte para pantalla táctil en móvil y ratón en escritorio).
  - Descarga del contrato firmado en PDF/SVG con folio digital y sello de verificación.
  - En el portal de familias (`/apoderado`), botón para "Ver y Firmar Contrato Digital" en la tarjeta de gestión y en el perfil familiar.
  - Se creó la ruta `/admin/alumnos` (`src/routes/admin.alumnos.tsx`) con tabla de estudiantes, filtro por estado de contrato (Todos, Firmados, Pendientes), envío de recordatorios de firma por WhatsApp y exportación CSV.
  - Columna de estado de contrato agregada en `/admin/pagos`.
  - Acciones `signStudentContract` y `resetStudentContract` agregadas al reducer global (`src/lib/platform-state.ts`).

---

### [2026-11-13 18:05] — 📋 Checklist Pre-Operativo Matutino de la Buseta CTP / Tránsito
- **Objetivo:** Cumplimiento de la inspección técnica diaria previa a iniciar la ruta escolar matutina.
- **Acciones ejecutadas:**
  - Se creó `PreOpChecklistModal` (`src/components/linkbus/pre-op-checklist-modal.tsx`) con validación de:
    - ✅ Luces y direccionales funcionales.
    - ✅ Cinturones de 3 puntos (100% de asientos).
    - ✅ Extintor ABC vigente y botiquín de primeros auxilios.
    - ✅ Salida / puerta de emergencia rotulada.
    - ✅ Estado de llantas (> 2mm) y nivel de combustible.
    - ✅ Documentación reglamentaria a bordo (CTP, Dekra, INS, Marchamo).
  - Emisión de constancia digital de inspección con folio único, fecha/hora exacta, kilometraje y código QR.
  - Bloqueo preventivo en la consola del chofer (`/chofer`) que recuerda completar la inspección antes de iniciar el recorrido matutino.
  - Visualización de la constancia digital en la Ficha Técnica de la Buseta.

---

### [2026-11-13 17:25] — 📲 Flujo de Pago por SINPE Móvil con Comprobante y Recibo Digital
- **Objetivo:** Conciliación bancaria costarricense para familias y transportistas.
- **Acciones ejecutadas:**
  - En `/apoderado` (pestaña Mensualidades): Botón *"Reportar Pago SINPE Móvil"* que permite adjuntar la captura del banco/SMS, seleccionar el banco emisor (BAC, BNCR, BCR, Popular, Promerica, Davivienda, Scotiabank, etc.) y registrar el número de comprobante.
  - Transición de estado a *"En Verificación"*.
  - En la consola del chofer (`/chofer` pestaña Cobros) y en administración (`/admin/pagos`):
    - Visualización del comprobante adjunto.
    - Botón para *"Aprobar Pago"*, emitiendo de forma instantánea el Recibo Digital Oficial y pasando el estado a *"Pagado"*.
    - Opción de rechazo con notificación a la familia.
  - Generador gráfico SVG de comprobantes bancarios y recibos digitales oficiales con timbres y folios.

---

### [2026-11-13 16:30] — 🎨 Eliminación de Carcasas Móviles y Rediseño Responsive Completo
- **Acciones ejecutadas:**
  - Se eliminó el marco de teléfono simulado a solicitud del usuario en las vistas de Apoderado (`/apoderado`) y Chofer (`/chofer`).
  - Ambas interfaces ahora operan con diseño responsive nativo a pantalla completa: adaptándose limpiamente tanto a pantallas de escritorio (desktop) como a tabletas y teléfonos móviles reales.
  - Barra superior rediseñada con aislamiento estricto de roles (las familias solo ven opciones de familia, los choferes solo opciones operativas, etc.).

---

### [2026-11-13 15:45] — 🗺️ Arquitectura Base y Reducer Global en Memoria
- **Acciones ejecutadas:**
  - Configuración de TanStack Router con diseño de Outlet para `/admin` y rutas hijas independientes (`/admin/dashboard`, `/admin/busetas`, `/admin/viajes`, `/admin/alumnos`, `/admin/pagos`, `/admin/configuracion`).
  - Reducer global en memoria (`PlatformProvider`) que mantiene sincronizado el estado entre vistas sin persistencia simulada de roles.
  - Carga dinámica e hidratación segura de mapas Leaflet para evitar errores en entornos SSR.
  - Soporte multitenant para consorcios y empresas de transporte escolar costarricenses.
