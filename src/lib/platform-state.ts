import {
  ALUMNOS,
  VANS,
  CHOFERES,
  COLEGIOS_DEFAULT,
  TENANTS_DEFAULT,
  VIAJES,
  type Van,
  type Chofer,
  type Colegio,
  type Alumno,
  type Tenant,
  type Viaje,
  type PaymentStatus,
} from "./data";

export type AttendanceStatus = "Pendiente" | "A bordo" | "Entregado" | "Ausente";
export type AbsenceMode = "No va hoy" | "Solo ida" | "Solo vuelta";
export type Attendance = { status: AttendanceStatus; subida: string; bajada: string };
export type OperationalRole = "Chofer / Conductor" | "Asistente de Buseta";
export type DriverMode = "Empresa de transporte" | "Chofer Independiente";
export type MonthlyPayment = {
  status: PaymentStatus;
  reminders: number;
  banco?: string | undefined;
  comprobanteRef?: string | undefined;
  comprobanteFoto?: string | undefined;
  fechaReporte?: string | undefined;
  montoReportado?: number | undefined;
  aprobadoPor?: string | undefined;
  fechaAprobado?: string | undefined;
  reciboNumero?: string | undefined;
  motivoRechazo?: string | undefined;
};

export type PushNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "gps" | "attendance" | "route" | "payment" | "sos" | "contract";
  read: boolean;
};

export type ParentProfile = {
  nombre: string;
  cedula: string;
  telefono: string;
  email: string;
  direccion: string;
  avatarUrl: string;
  notifGps: boolean;
  notifAsistencia: boolean;
  notifRetrasos: boolean;
  notifPagos: boolean;
};

export function canManageCollections(profile: { role: OperationalRole; mode: DriverMode }) {
  return profile.role === "Chofer / Conductor" && profile.mode === "Chofer Independiente";
}

export type AuthorizedPerson = {
  id: string;
  alumnoId: string;
  nombre: string;
  parentesco: string;
  cedula: string;
  telefono: string;
  estado: "Autorizado" | "Pendiente";
};

export type PreOpInspection = {
  fechaHora: string;
  vanPlaca: string;
  choferNombre: string;
  luces: boolean;
  cinturones: boolean;
  extintorBotiquin: boolean;
  puertaEmergencia: boolean;
  llantasCombustible: boolean;
  documentacionFisica: boolean;
  kilometraje?: number | undefined;
  observaciones?: string | undefined;
  resultado: "Aprobada" | "Con Observaciones";
  folioDigital: string;
};

export type StudentContract = {
  alumnoId: string;
  signed: boolean;
  signedAt?: string | undefined;
  signedBy?: string | undefined;
  cedulaApoderado?: string | undefined;
  signatureDataUrl?: string | undefined;
  folioDigital: string;
  terminosAceptados: boolean;
};

export type OfflineSyncQueueItem = {
  id: string;
  type: 'attendance';
  alumnoId: string;
  alumnoNombre: string;
  status: AttendanceStatus;
  time: string;
  timestamp: number;
};

export type PlatformState = {
  vans: Van[];
  choferes: Chofer[];
  colegios: Colegio[];
  alumnos: Alumno[];
  viajes: Viaje[];
  attendance: Record<string, Attendance>;
  active: boolean;
  routeName: string;
  absences: Record<string, AbsenceMode>;
  notices: { id: string; message: string; time: string }[];
  company: string;
  driverProfile: { role: OperationalRole; mode: DriverMode };
  payments: Record<string, MonthlyPayment>;
  notifications: PushNotification[];
  parentProfile: ParentProfile;
  authorizedPersons: AuthorizedPerson[];
  tenants: Tenant[];
  currentTenantId: string;
  isSuperAdmin: boolean;
  selectedDriverId?: string | undefined;
  selectedAlumnoId?: string | undefined;
  inspections: Record<string, PreOpInspection>;
  contracts: Record<string, StudentContract>;
  isOfflineMode: boolean;
  offlineQueue: OfflineSyncQueueItem[];
};

export const AUTHORIZED_PERSONS_DEFAULT: AuthorizedPerson[] = [
  { id: "auth-1", alumnoId: "a1", nombre: "Carla Pérez Monge", parentesco: "Madre (Titular)", cedula: "1-1240-0899", telefono: "8841-9230", estado: "Autorizado" },
  { id: "auth-2", alumnoId: "a1", nombre: "Carmen Monge Vargas", parentesco: "Abuela Materna", cedula: "1-0412-0544", telefono: "8390-1122", estado: "Autorizado" },
  { id: "auth-3", alumnoId: "a1", nombre: "Andrea Pérez Monge", parentesco: "Tía", cedula: "1-1400-0911", telefono: "8700-4411", estado: "Autorizado" },
];

export const emptyPlatformState: PlatformState = {
  vans: [],
  choferes: [],
  colegios: [],
  alumnos: [],
  viajes: [],
  tenants: [],
  authorizedPersons: [],
  currentTenantId: "",
  isSuperAdmin: false,
  selectedDriverId: "",
  selectedAlumnoId: "",
  active: false,
  routeName: "",
  attendance: {},
  absences: {},
  notices: [],
  company: "",
  driverProfile: { role: "Chofer / Conductor", mode: "Empresa de transporte" },
  payments: {},
  parentProfile: {
    nombre: "",
    cedula: "",
    telefono: "",
    email: "",
    direccion: "",
    avatarUrl: "",
    notifGps: true,
    notifAsistencia: true,
    notifRetrasos: true,
    notifPagos: true,
  },
  notifications: [],
  inspections: {},
  contracts: {},
  isOfflineMode: false,
  offlineQueue: [],
};

export const initialPlatformState: PlatformState = {
  vans: VANS.map(v => ({ ...v })),
  choferes: CHOFERES.map(c => ({ ...c })),
  colegios: COLEGIOS_DEFAULT.map(c => ({ ...c })),
  alumnos: ALUMNOS.map(a => a.id === 'a6' ? { ...a, pago: 'En Verificación' as const } : { ...a }),
  viajes: VIAJES.map(v => ({ ...v })),
  tenants: TENANTS_DEFAULT.map(t => ({ ...t })),
  authorizedPersons: [...AUTHORIZED_PERSONS_DEFAULT],
  currentTenantId: "tenant-valle-cr",
  isSuperAdmin: false,
  selectedDriverId: "c1",
  selectedAlumnoId: "a1",
  active: false,
  routeName: "Mañana Norte",
  attendance: Object.fromEntries(ALUMNOS.map((a, i) => [a.id, {
    status: i < 2 ? "A bordo" : i === 3 ? "Ausente" : i === 4 ? "Entregado" : "Pendiente",
    subida: i < 2 ? `07:${i === 0 ? "12" : "18"}` : i === 4 ? "07:08" : "—",
    bajada: i === 4 ? "07:32" : "—",
  }])),
  absences: { "2026-10-23": "No va hoy" },
  notices: [],
  company: "Transportes Escolares del Valle CR",
  driverProfile: { role: "Chofer / Conductor", mode: "Empresa de transporte" },
  payments: Object.fromEntries(ALUMNOS.map(a => [
    a.id,
    a.id === "a1"
      ? {
          status: "Pagado" as const,
          reminders: 0,
          banco: "BAC Credomatic",
          comprobanteRef: "SINPE-9921401",
          reciboNumero: "LB-REC-2026-8812",
          montoReportado: a.monto,
          fechaReporte: "05/10/2026, 08:15",
          fechaAprobado: "05/10/2026, 08:30",
          aprobadoPor: "Carlos Solís Morales (Transportista)",
        }
      : a.id === "a6"
      ? {
          status: "En Verificación" as const,
          reminders: 0,
          banco: "Banco Nacional",
          comprobanteRef: "SINPE-8419022",
          montoReportado: a.monto,
          fechaReporte: "13/11/2026, 18:45",
        }
      : { status: a.pago, reminders: 0 }
  ])),
  parentProfile: {
    nombre: "Carla Pérez Monge",
    cedula: "1-1240-0899",
    telefono: "+506 8841-9230",
    email: "carla.perez@nexusgo.cr",
    direccion: "Condominio Las Palmas #42, Guachipelín, Escazú",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
    notifGps: true,
    notifAsistencia: true,
    notifRetrasos: true,
    notifPagos: true,
  },
  notifications: [
    {
      id: "n-1",
      title: "Buseta en camino a tu parada",
      body: "La buseta SJ-6281 está a 5 minutos de tu casa (Guachipelín). Llegada estimada: 07:15 AM.",
      time: "07:10 AM",
      type: "gps",
      read: false,
    },
    {
      id: "n-2",
      title: "Check-in Seguro Realizado",
      body: "Sofía abordó la buseta. Chofer Tío Jorge Muñoz registró la subida mediante carnet QR.",
      time: "07:12 AM",
      type: "attendance",
      read: false,
    },
    {
      id: "n-3",
      title: "Llegada al Colegio",
      body: "La buseta llegó al Lincoln School. Estudiantes entregados en el acceso principal.",
      time: "07:35 AM",
      type: "route",
      read: true,
    },
    {
      id: "n-4",
      title: "Mensualidad de Octubre",
      body: "Tu recibo de transporte escolar por ₡85,000 ha sido generado exitosamente.",
      time: "Ayer",
      type: "payment",
      read: true,
    },
  ],
  inspections: {
    "SJ-4821": {
      fechaHora: "13/11/2026, 06:15 AM",
      vanPlaca: "SJ-4821",
      choferNombre: "Carlos Solís Morales",
      luces: true,
      cinturones: true,
      extintorBotiquin: true,
      puertaEmergencia: true,
      llantasCombustible: true,
      documentacionFisica: true,
      kilometraje: 142350,
      observaciones: "Unidad limpia, desinfectada y lista para recorrido matutino.",
      resultado: "Aprobada",
      folioDigital: "CTP-PREOP-2026-99412",
    },
  },
  contracts: {
    a1: {
      alumnoId: "a1",
      signed: true,
      signedAt: "15/02/2026 09:30 AM",
      signedBy: "Carla Pérez Monge",
      cedulaApoderado: "1-1240-0899",
      folioDigital: "CTP-CTR-2026-0814",
      terminosAceptados: true,
    },
    a2: {
      alumnoId: "a2",
      signed: true,
      signedAt: "16/02/2026 04:15 PM",
      signedBy: "Rodrigo Castro Solano",
      cedulaApoderado: "1-0988-0321",
      folioDigital: "CTP-CTR-2026-0815",
      terminosAceptados: true,
    },
    a3: {
      alumnoId: "a3",
      signed: false,
      folioDigital: "CTP-CTR-2026-0816",
      terminosAceptados: false,
    },
    a4: {
      alumnoId: "a4",
      signed: true,
      signedAt: "18/02/2026 11:20 AM",
      signedBy: "Mauricio Silva",
      cedulaApoderado: "1-1120-0455",
      folioDigital: "CTP-CTR-2026-0817",
      terminosAceptados: true,
    },
    a5: {
      alumnoId: "a5",
      signed: false,
      folioDigital: "CTP-CTR-2026-0818",
      terminosAceptados: false,
    },
    a6: {
      alumnoId: "a6",
      signed: false,
      folioDigital: "CTP-CTR-2026-0819",
      terminosAceptados: false,
    },
  },
  isOfflineMode: false,
  offlineQueue: [],
};

export type PlatformAction =
  // Offline Mode & Local Queue Actions
  | { type: "setOfflineMode"; enabled: boolean }
  | { type: "queueOfflineAttendance"; item: OfflineSyncQueueItem }
  | { type: "hydrateOfflineQueue"; items: OfflineSyncQueueItem[] }
  | { type: "syncOfflineQueue" }
  | { type: "clearOfflineQueue" }
  | { type: "attendance"; id: string; status: AttendanceStatus; time: string }
  | { type: "start"; name: string }
  | { type: "finish" }
  | { type: "transfer"; vanId: string; driver: string }
  | { type: "absence"; date: string; mode: AbsenceMode }
  | { type: "removeAbsence"; date: string }
  | { type: "notice"; message: string; time: string }
  | { type: "company"; name: string }
  | { type: "driverProfile"; role: OperationalRole; mode: DriverMode }
  | { type: "payment"; id: string }
  | { type: "paymentReminder"; id: string }
  // SINPE Móvil Payment & Verification Actions
  | { type: "reportSinpePayment"; alumnoId: string; banco: string; comprobanteRef: string; comprobanteFoto?: string | undefined; montoReportado?: number | undefined }
  | { type: "approvePayment"; alumnoId: string; aprobadoPor?: string | undefined }
  | { type: "rejectPayment"; alumnoId: string; motivo?: string | undefined }
  // Pre-Operational Inspection Checklist (CTP / MOPT)
  | { type: "savePreOpInspection"; inspection: PreOpInspection; startRoute?: boolean | undefined; routeName?: string | undefined }
  // Student Transport Legal Contract (CTP / MOPT)
  | { type: "signStudentContract"; alumnoId: string; signedBy: string; cedulaApoderado?: string | undefined; signatureDataUrl?: string | undefined; folioDigital?: string | undefined }
  | { type: "resetStudentContract"; alumnoId: string }
  // Push Notifications & Profile Actions
  | { type: "markNotificationRead"; id: string }
  | { type: "markAllNotificationsRead" }
  | { type: "clearNotifications" }
  | { type: "addNotification"; notification: PushNotification }
  | { type: "updateParentProfile"; profile: Partial<ParentProfile> }
  // Authorized Pickup Persons
  | { type: "addAuthorizedPerson"; person: AuthorizedPerson }
  | { type: "deleteAuthorizedPerson"; id: string }
  // SaaS Multitenant Actions
  | { type: "addTenant"; tenant: Tenant }
  | { type: "updateTenant"; tenant: Tenant }
  | { type: "deleteTenant"; id: string }
  | { type: "switchTenant"; id: string }
  | { type: "setSuperAdmin"; enabled: boolean }
  // CRUD Actions
  | { type: "addRoute"; route: Van }
  | { type: "updateRoute"; route: Van }
  | { type: "deleteRoute"; id: string }
  | { type: "addChofer"; chofer: Chofer }
  | { type: "updateChofer"; chofer: Chofer }
  | { type: "deleteChofer"; id: string }
  | { type: "addColegio"; colegio: Colegio }
  | { type: "updateColegio"; colegio: Colegio }
  | { type: "deleteColegio"; id: string }
  | { type: "addAlumno"; alumno: Alumno }
  | { type: "updateAlumno"; alumno: Alumno }
  | { type: "deleteAlumno"; id: string }
  // Active Persona Switchers for Real User Views
  | { type: "selectDriver"; driverId: string }
  | { type: "selectAlumno"; alumnoId: string }
  // Real-time GPS Telemetry (ephemeral, never persisted to DB)
  | { type: "updateVanLocation"; vanId: string; lat?: number | undefined; lng?: number | undefined; clear?: boolean | undefined }
  // Remote Persistence Hydration
  | { type: "hydrateFromRemote"; state: Partial<PlatformState> };

function applyOfflineItemToAttendance(
  attendance: Record<string, Attendance>,
  item: OfflineSyncQueueItem,
): Record<string, Attendance> {
  const previous = attendance[item.alumnoId];
  const row: Attendance = {
    status: item.status,
    subida:
      item.status === "Ausente" || item.status === "Pendiente"
        ? "—"
        : previous?.subida && previous.subida !== "—"
        ? previous.subida
        : item.time,
    bajada: item.status === "Entregado" ? item.time : "—",
  };
  return { ...attendance, [item.alumnoId]: row };
}

export function platformReducer(state: PlatformState, action: PlatformAction): PlatformState {
  switch (action.type) {
    case "setOfflineMode":
      return { ...state, isOfflineMode: action.enabled };
    case "queueOfflineAttendance": {
      const attendance = applyOfflineItemToAttendance(state.attendance, action.item);
      const filteredQueue = state.offlineQueue.filter(q => q.alumnoId !== action.item.alumnoId);
      return {
        ...state,
        attendance,
        offlineQueue: [...filteredQueue, action.item],
        vans: state.vans.map((v, i) => i === 0 ? { ...v, aBordo: Object.values(attendance).filter(a => a.status === "A bordo").length } : v),
      };
    }
    case "hydrateOfflineQueue": {
      if (action.items.length === 0) return state;
      let attendance = { ...state.attendance };
      for (const item of action.items) {
        attendance = applyOfflineItemToAttendance(attendance, item);
      }
      return {
        ...state,
        attendance,
        offlineQueue: action.items,
        vans: state.vans.map((v, i) => i === 0 ? { ...v, aBordo: Object.values(attendance).filter(a => a.status === "A bordo").length } : v),
      };
    }
    case "syncOfflineQueue": {
      const count = state.offlineQueue.length;
      const notif: PushNotification = {
        id: `offline-sync-${Date.now()}`,
        title: "Sincronización Fuera de Línea",
        body: `Se sincronizaron con éxito ${count} asistencias registradas en ruta sin cobertura.`,
        time: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
        type: 'route',
        read: false,
      };
      return {
        ...state,
        isOfflineMode: false,
        offlineQueue: [],
        notifications: count > 0 ? [notif, ...state.notifications] : state.notifications,
      };
    }
    case "clearOfflineQueue":
      return { ...state, offlineQueue: [] };
    case "selectDriver":
      return { ...state, selectedDriverId: action.driverId };
    case "selectAlumno": {
      const alumno = state.alumnos.find((a) => a.id === action.alumnoId);
      return {
        ...state,
        selectedAlumnoId: action.alumnoId,
        parentProfile: alumno
          ? {
              ...state.parentProfile,
              nombre: alumno.apoderado,
              telefono: alumno.telefonoApoderado || state.parentProfile.telefono,
              direccion: alumno.direccion,
            }
          : state.parentProfile,
      };
    }
    case "attendance": {
      if (!state.active || !state.attendance[action.id]) return state;
      const previous = state.attendance[action.id];
      if (!previous) return state;
      const row: Attendance = {
        status: action.status,
        subida: action.status === "Ausente" || action.status === "Pendiente" ? "—" : previous.subida === "—" ? action.time : previous.subida,
        bajada: action.status === "Entregado" ? action.time : "—",
      };
      const attendance = { ...state.attendance, [action.id]: row };
      let notifications = state.notifications;
      if (previous.status !== action.status && (action.status === "A bordo" || action.status === "Entregado" || action.status === "Ausente")) {
        const studentName = state.alumnos.find((a) => a.id === action.id)?.nombre ?? "Estudiante";
        const vanPatente = state.vans[0]?.patente ?? "la buseta";
        const title =
          action.status === "A bordo"
            ? "Estudiante a bordo"
            : action.status === "Entregado"
            ? "Estudiante entregado"
            : "Ausencia registrada";
        const body =
          action.status === "A bordo"
            ? `${studentName} abordó la buseta ${vanPatente} (${action.time}).`
            : action.status === "Entregado"
            ? `${studentName} fue entregado de forma segura (${action.time}).`
            : `${studentName} fue marcado como ausente (${action.time}).`;
        const pushNotif: PushNotification = {
          id: crypto.randomUUID(),
          title,
          body,
          time: action.time,
          type: "attendance",
          read: false,
        };
        notifications = [pushNotif, ...state.notifications];
      }
      return {
        ...state,
        attendance,
        notifications,
        vans: state.vans.map((v, i) => i === 0 ? { ...v, aBordo: Object.values(attendance).filter(a => a.status === "A bordo").length } : v),
      };
    }
    case "start": return { ...state, active: true, routeName: action.name };
    case "finish": return {
      ...state,
      active: false,
      vans: state.vans.map(v => ({ ...v, lat: undefined, lng: undefined })),
    };
    case "updateVanLocation": return {
      ...state,
      vans: state.vans.map(v =>
        v.id === action.vanId
          ? {
              ...v,
              lat: action.clear ? undefined : action.lat,
              lng: action.clear ? undefined : action.lng,
            }
          : v
      ),
    };
    case "transfer": return {
      ...state,
      vans: state.vans.map(v => v.id === action.vanId ? { ...v, chofer: action.driver } : v),
    };
    case "absence": return { ...state, absences: { ...state.absences, [action.date]: action.mode } };
    case "removeAbsence": {
      const absences = { ...state.absences }; delete absences[action.date]; return { ...state, absences };
    }
    case "notice": {
      const newNotice = { id: crypto.randomUUID(), message: action.message, time: action.time };
      const pushNotif: PushNotification = {
        id: crypto.randomUUID(),
        title: action.message.includes('Retraso') || action.message.includes('Presa') ? 'Alerta en Ruta' : 'Aviso del Chofer',
        body: action.message,
        time: action.time,
        type: action.message.includes('Retraso') || action.message.includes('Presa') || action.message.includes('Emergencia') ? 'sos' : 'route',
        read: false,
      };
      return {
        ...state,
        notices: [newNotice, ...state.notices],
        notifications: [pushNotif, ...state.notifications],
      };
    }
    case "markNotificationRead": return {
      ...state,
      notifications: state.notifications.map(n => n.id === action.id ? { ...n, read: true } : n),
    };
    case "markAllNotificationsRead": return {
      ...state,
      notifications: state.notifications.map(n => ({ ...n, read: true })),
    };
    case "clearNotifications": return {
      ...state,
      notifications: [],
    };
    case "addNotification": return {
      ...state,
      notifications: [action.notification, ...state.notifications],
    };
    case "updateParentProfile": return {
      ...state,
      parentProfile: { ...state.parentProfile, ...action.profile },
    };
    // --- SaaS Multitenant Reducers ---
    case "addTenant": return {
      ...state,
      tenants: [action.tenant, ...state.tenants],
    };
    case "updateTenant": return {
      ...state,
      tenants: state.tenants.map(t => t.id === action.tenant.id ? action.tenant : t),
      company: state.currentTenantId === action.tenant.id ? action.tenant.nombre : state.company,
    };
    case "deleteTenant": return {
      ...state,
      tenants: state.tenants.filter(t => t.id !== action.id),
    };
    case "switchTenant": {
      const found = state.tenants.find(t => t.id === action.id);
      return {
        ...state,
        currentTenantId: action.id,
        company: found ? found.nombre : state.company,
      };
    }
    case "company": return { ...state, company: action.name };
    case "driverProfile": return { ...state, driverProfile: { role: action.role, mode: action.mode } };
    case "payment": {
      const payment = state.payments[action.id];
      if (!canManageCollections(state.driverProfile) || !payment || payment.status === "Pagado") return state;
      const alumno = state.alumnos.find((a) => a.id === action.id);
      const reciboNum = `LB-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date();
      const timeFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      return {
        ...state,
        payments: {
          ...state.payments,
          [action.id]: {
            ...payment,
            status: "Pagado",
            reciboNumero: reciboNum,
            fechaAprobado: timeFormatted,
            aprobadoPor: "Carlos Solís Morales",
          },
        },
        alumnos: state.alumnos.map((a) => (a.id === action.id ? { ...a, pago: "Pagado" } : a)),
      };
    }
    case "paymentReminder": {
      const payment = state.payments[action.id];
      if (!canManageCollections(state.driverProfile) || !payment || payment.status === "Pagado") return state;
      return { ...state, payments: { ...state.payments, [action.id]: { ...payment, reminders: payment.reminders + 1 } } };
    }
    case "reportSinpePayment": {
      const alumno = state.alumnos.find((a) => a.id === action.alumnoId);
      const now = new Date();
      const timeFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const prevPayment = state.payments[action.alumnoId] || { status: 'Pendiente', reminders: 0 };
      
      const newPayment: MonthlyPayment = {
        ...prevPayment,
        status: "En Verificación",
        banco: action.banco,
        comprobanteRef: action.comprobanteRef,
        comprobanteFoto: action.comprobanteFoto,
        fechaReporte: timeFormatted,
        montoReportado: action.montoReportado ?? alumno?.monto ?? 65000,
        motivoRechazo: undefined,
      };

      const pushNotif: PushNotification = {
        id: `pay-report-${Date.now()}`,
        title: "Comprobante SINPE Móvil Enviado",
        body: `Comprobante ${action.comprobanteRef} por ₡${(action.montoReportado ?? alumno?.monto ?? 65000).toLocaleString('es-CR')} enviado a revisión.`,
        time: "Ahora",
        type: "payment",
        read: false,
      };

      return {
        ...state,
        payments: { ...state.payments, [action.alumnoId]: newPayment },
        alumnos: state.alumnos.map((a) => (a.id === action.alumnoId ? { ...a, pago: "En Verificación" } : a)),
        notifications: [pushNotif, ...state.notifications],
      };
    }
    case "approvePayment": {
      const alumno = state.alumnos.find((a) => a.id === action.alumnoId);
      const now = new Date();
      const timeFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const prevPayment = state.payments[action.alumnoId] || { status: 'En Verificación', reminders: 0 };
      const reciboNum = prevPayment.reciboNumero || `LB-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const newPayment: MonthlyPayment = {
        ...prevPayment,
        status: "Pagado",
        reciboNumero: reciboNum,
        fechaAprobado: timeFormatted,
        aprobadoPor: action.aprobadoPor || "Carlos Solís Morales (Transportista)",
        motivoRechazo: undefined,
      };

      const pushNotif: PushNotification = {
        id: `pay-approved-${Date.now()}`,
        title: "¡Pago Aprobado y Recibo Emitido!",
        body: `El transportista confirmó la acreditación SINPE de ${alumno?.nombre || 'tu mensualidad'}. Recibo oficial ${reciboNum} generado.`,
        time: "Ahora",
        type: "payment",
        read: false,
      };

      return {
        ...state,
        payments: { ...state.payments, [action.alumnoId]: newPayment },
        alumnos: state.alumnos.map((a) => (a.id === action.alumnoId ? { ...a, pago: "Pagado" } : a)),
        notifications: [pushNotif, ...state.notifications],
      };
    }
    case "rejectPayment": {
      const alumno = state.alumnos.find((a) => a.id === action.alumnoId);
      const prevPayment = state.payments[action.alumnoId] || { status: 'En Verificación', reminders: 0 };
      const motivo = action.motivo || "El comprobante no coincide con los fondos acreditados en la cuenta bancaria.";

      const newPayment: MonthlyPayment = {
        ...prevPayment,
        status: "Pendiente",
        motivoRechazo: motivo,
      };

      const pushNotif: PushNotification = {
        id: `pay-reject-${Date.now()}`,
        title: "Comprobante SINPE Observado",
        body: `Tu comprobante de ${alumno?.nombre || 'mensualidad'} requiere revisión: ${motivo}`,
        time: "Ahora",
        type: "payment",
        read: false,
      };

      return {
        ...state,
        payments: { ...state.payments, [action.alumnoId]: newPayment },
        alumnos: state.alumnos.map((a) => (a.id === action.alumnoId ? { ...a, pago: "Pendiente" } : a)),
        notifications: [pushNotif, ...state.notifications],
      };
    }
    case "savePreOpInspection": {
      const pushNotif: PushNotification = {
        id: `preop-${Date.now()}`,
        title: "Inspección Pre-Operativa CTP Aprobada",
        body: `Buseta ${action.inspection.vanPlaca} habilitada para ruta. Constancia ${action.inspection.folioDigital} registrada.`,
        time: "Ahora",
        type: "route",
        read: false,
      };

      const updatedInspections = {
        ...state.inspections,
        [action.inspection.vanPlaca]: action.inspection,
      };

      if (action.startRoute && action.routeName) {
        return {
          ...state,
          active: true,
          routeName: action.routeName,
          inspections: updatedInspections,
          notifications: [pushNotif, ...state.notifications],
        };
      }

      return {
        ...state,
        inspections: updatedInspections,
        notifications: [pushNotif, ...state.notifications],
      };
    }

    // --- Student Transport Legal Contract (CTP / MOPT) ---
    case "signStudentContract": {
      const currentContract = state.contracts[action.alumnoId];
      const folio = action.folioDigital || currentContract?.folioDigital || `CTP-CTR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date();
      const fechaStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${now.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}`;
      
      const updatedContract: StudentContract = {
        alumnoId: action.alumnoId,
        signed: true,
        signedAt: fechaStr,
        signedBy: action.signedBy,
        cedulaApoderado: action.cedulaApoderado || '1-1240-0899',
        signatureDataUrl: action.signatureDataUrl,
        folioDigital: folio,
        terminosAceptados: true,
      };

      const alumno = state.alumnos.find((a) => a.id === action.alumnoId);
      const pushNotif: PushNotification = {
        id: `notif-ctr-${Date.now()}`,
        title: 'Contrato Escolar Firmado',
        body: `Se registró la firma digital del contrato CTP para ${alumno?.nombre || 'el estudiante'} (Folio ${folio}).`,
        time: 'Ahora',
        type: 'contract',
        read: false,
      };

      return {
        ...state,
        contracts: {
          ...state.contracts,
          [action.alumnoId]: updatedContract,
        },
        notifications: [pushNotif, ...state.notifications],
      };
    }

    case "resetStudentContract": {
      const current = state.contracts[action.alumnoId];
      return {
        ...state,
        contracts: {
          ...state.contracts,
          [action.alumnoId]: {
            alumnoId: action.alumnoId,
            signed: false,
            folioDigital: current?.folioDigital || `CTP-CTR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            terminosAceptados: false,
          },
        },
      };
    }

    // --- CRUD: Rutas / Vans ---
    case "addRoute": return { ...state, vans: [action.route, ...state.vans] };
    case "updateRoute": return {
      ...state,
      vans: state.vans.map(v => v.id === action.route.id ? action.route : v),
    };
    case "deleteRoute": return {
      ...state,
      vans: state.vans.filter(v => v.id !== action.id),
    };

    // --- CRUD: Choferes ---
    case "addChofer": return { ...state, choferes: [action.chofer, ...state.choferes] };
    case "updateChofer": return {
      ...state,
      choferes: state.choferes.map(c => c.id === action.chofer.id ? action.chofer : c),
    };
    case "deleteChofer": return {
      ...state,
      choferes: state.choferes.filter(c => c.id !== action.id),
    };

    // --- CRUD: Colegios ---
    case "addColegio": return { ...state, colegios: [action.colegio, ...state.colegios] };
    case "updateColegio": return {
      ...state,
      colegios: state.colegios.map(c => c.id === action.colegio.id ? action.colegio : c),
    };
    case "deleteColegio": return {
      ...state,
      colegios: state.colegios.filter(c => c.id !== action.id),
    };

    // --- CRUD: Alumnos ---
    case "addAlumno": {
      return {
        ...state,
        alumnos: [action.alumno, ...state.alumnos],
        payments: { ...state.payments, [action.alumno.id]: { status: action.alumno.pago, reminders: 0 } },
        attendance: { ...state.attendance, [action.alumno.id]: { status: "Pendiente", subida: "—", bajada: "—" } },
      };
    }
    case "updateAlumno": return {
      ...state,
      alumnos: state.alumnos.map(a => a.id === action.alumno.id ? action.alumno : a),
      payments: {
        ...state.payments,
        [action.alumno.id]: {
          status: action.alumno.pago,
          reminders: state.payments[action.alumno.id]?.reminders ?? 0,
        },
      },
    };
    case "deleteAlumno": {
      const payments = { ...state.payments }; delete payments[action.id];
      const attendance = { ...state.attendance }; delete attendance[action.id];
      return {
        ...state,
        alumnos: state.alumnos.filter(a => a.id !== action.id),
        payments,
        attendance,
      };
    }

    // --- Authorized Pickup Persons Actions ---
    case "addAuthorizedPerson":
      return {
        ...state,
        authorizedPersons: [...state.authorizedPersons, action.person],
      };
    case "deleteAuthorizedPerson":
      return {
        ...state,
        authorizedPersons: state.authorizedPersons.filter(p => p.id !== action.id),
      };

    // --- SaaS Multitenant Actions ---
    case "addTenant":
      return {
        ...state,
        tenants: [action.tenant, ...state.tenants],
      };
    case "updateTenant":
      return {
        ...state,
        tenants: state.tenants.map(t => t.id === action.tenant.id ? action.tenant : t),
        company: action.tenant.id === state.currentTenantId ? action.tenant.nombre : state.company,
      };
    case "deleteTenant":
      return {
        ...state,
        tenants: state.tenants.filter(t => t.id !== action.id),
      };
    case "switchTenant": {
      const target = state.tenants.find(t => t.id === action.id);
      return {
        ...state,
        currentTenantId: action.id,
        company: target ? target.nombre : state.company,
      };
    }
    case "setSuperAdmin":
      return {
        ...state,
        isSuperAdmin: action.enabled,
      };
    case "hydrateFromRemote": {
      const merged: PlatformState = {
        ...state,
        ...action.state,
        offlineQueue: state.offlineQueue.length > 0 ? state.offlineQueue : (action.state.offlineQueue ?? []),
      };
      if (merged.offlineQueue.length > 0) {
        let attendance = { ...merged.attendance };
        for (const item of merged.offlineQueue) {
          attendance = applyOfflineItemToAttendance(attendance, item);
        }
        return { ...merged, attendance };
      }
      return merged;
    }
  }
}
