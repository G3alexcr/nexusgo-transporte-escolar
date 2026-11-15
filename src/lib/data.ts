import {
  generateCtpPermitSvg,
  generateMarchamoSvg,
  generateDekraSvg,
  generateLicenseSvg,
  generateCirculacionSvg,
  generateInsPolicySvg,
  generateAssistantBadgeSvg,
  DEFAULT_BUSETA_PHOTOS,
} from './document-samples';

export type Van = {
  id: string;
  patente: string;
  chofer: string;
  ruta: string;
  colegio: string;
  horario: string;
  aBordo: number;
  cap: number;
  estado: "En ruta" | "Detenido" | "Finalizado";
  path: [number, number][];
  lat?: number | undefined;
  lng?: number | undefined;
  // Requisitos CTP & ARESEP Costa Rica
  marcaModelo?: string | undefined;
  ano?: number | undefined;
  permisoCtp?: string | undefined;
  vencimientoCtp?: string | undefined;
  dekraRtv?: string | undefined;
  dekraEstado?: ("Al día" | "Próximo a vencer" | "Vencido") | undefined;
  polizaIns?: string | undefined;
  vencimientoIns?: string | undefined;
  asistente?: string | undefined;
  cinturones?: boolean | undefined;
  rotuloEscolar?: boolean | undefined;
  extintorBotiquin?: boolean | undefined;
  puertaEmergencia?: boolean | undefined;
  // Documentación y Fotos Digitales CTP / INS / MOPT / COSEVI
  fotoBuseta?: string | undefined;
  fotoPermisoCtp?: string | undefined;
  marchamoAno?: number | undefined;
  marchamoEstado?: ("Al día" | "Pendiente") | undefined;
  fotoMarchamo?: string | undefined;
  tarjetaCirculacion?: string | undefined;
  fotoCirculacion?: string | undefined;
  fotoDekra?: string | undefined;
  fotoPolizaIns?: string | undefined;
  licenciaNumero?: string | undefined;
  licenciaTipo?: string | undefined;
  licenciaVencimiento?: string | undefined;
  fotoLicencia?: string | undefined;
  carnetAsistente?: string | undefined;
  fotoCarnetAsistente?: string | undefined;
};

export const VANS: Van[] = [
  {
    id: "v1",
    patente: "SJ-4821",
    chofer: "Carlos Solís Morales",
    ruta: "Escazú & Santa Ana → Lincoln School",
    colegio: "Lincoln School",
    horario: "06:30 / 14:30",
    aBordo: 2,
    cap: 16,
    estado: "En ruta",
    path: [[15, 25], [35, 25], [35, 55], [70, 55], [70, 80]],
    marcaModelo: "Toyota Coaster 2022",
    ano: 2022,
    permisoCtp: "CTP-TE-2024-8841",
    vencimientoCtp: "31/12/2026",
    dekraRtv: "15/11/2026",
    dekraEstado: "Al día",
    polizaIns: "INS-RESP-CIVIL-99214",
    vencimientoIns: "31/12/2026",
    asistente: "Patricia Mora Jiménez",
    cinturones: true,
    rotuloEscolar: true,
    extintorBotiquin: true,
    puertaEmergencia: true,
    fotoBuseta: DEFAULT_BUSETA_PHOTOS[0],
    fotoPermisoCtp: generateCtpPermitSvg("SJ-4821", "CTP-TE-2024-8841", "31/12/2026", "Carlos Solís Morales"),
    marchamoAno: 2026,
    marchamoEstado: "Al día",
    fotoMarchamo: generateMarchamoSvg("SJ-4821", 2026),
    tarjetaCirculacion: "REG-CR-9924-4821",
    fotoCirculacion: generateCirculacionSvg("SJ-4821", "Toyota Coaster 2022", 2022),
    fotoDekra: generateDekraSvg("SJ-4821", "15/11/2026", "Al día"),
    fotoPolizaIns: generateInsPolicySvg("SJ-4821", "INS-RESP-CIVIL-99214", "31/12/2026"),
    licenciaNumero: "1-1142-0892",
    licenciaTipo: "C-2 Profesional",
    licenciaVencimiento: "18/04/2028",
    fotoLicencia: generateLicenseSvg("Carlos Solís Morales", "1-1142-0892", "C-2", "18/04/2028"),
    carnetAsistente: "ASIST-CTP-2024-881",
    fotoCarnetAsistente: generateAssistantBadgeSvg("Patricia Mora Jiménez", "ASIST-CTP-2024-881"),
  },
  {
    id: "v2",
    patente: "SJ-3190",
    chofer: "Marcela Fonseca Brenes",
    ruta: "Curridabat & San Pedro → Colegio Humboldt",
    colegio: "Colegio Humboldt",
    horario: "06:45 / 14:15",
    aBordo: 4,
    cap: 14,
    estado: "En ruta",
    path: [[85, 15], [85, 45], [55, 45], [55, 70], [25, 70]],
    marcaModelo: "Hyundai County 2021",
    ano: 2021,
    permisoCtp: "CTP-TE-2023-4120",
    vencimientoCtp: "30/06/2027",
    dekraRtv: "28/02/2027",
    dekraEstado: "Al día",
    polizaIns: "INS-RESP-CIVIL-88412",
    vencimientoIns: "31/12/2026",
    asistente: "Ana Lorena Vargas",
    cinturones: true,
    rotuloEscolar: true,
    extintorBotiquin: true,
    puertaEmergencia: true,
    fotoBuseta: DEFAULT_BUSETA_PHOTOS[1],
    fotoPermisoCtp: generateCtpPermitSvg("SJ-3190", "CTP-TE-2023-4120", "30/06/2027", "Marcela Fonseca Brenes"),
    marchamoAno: 2026,
    marchamoEstado: "Al día",
    fotoMarchamo: generateMarchamoSvg("SJ-3190", 2026),
    tarjetaCirculacion: "REG-CR-3190-7712",
    fotoCirculacion: generateCirculacionSvg("SJ-3190", "Hyundai County 2021", 2021),
    fotoDekra: generateDekraSvg("SJ-3190", "28/02/2027", "Al día"),
    fotoPolizaIns: generateInsPolicySvg("SJ-3190", "INS-RESP-CIVIL-88412", "31/12/2026"),
    licenciaNumero: "2-0451-0321",
    licenciaTipo: "C-2 Profesional",
    licenciaVencimiento: "10/09/2027",
    fotoLicencia: generateLicenseSvg("Marcela Fonseca Brenes", "2-0451-0321", "C-2", "10/09/2027"),
    carnetAsistente: "ASIST-CTP-2023-412",
    fotoCarnetAsistente: generateAssistantBadgeSvg("Ana Lorena Vargas", "ASIST-CTP-2023-412"),
  },
  {
    id: "v3",
    patente: "AL-7652",
    chofer: "Jorge Castro Ureña",
    ruta: "Rohrmoser & Sabana → Country Day School",
    colegio: "Country Day School",
    horario: "06:40 / 14:00",
    aBordo: 5,
    cap: 18,
    estado: "En ruta",
    path: [[20, 85], [20, 60], [50, 60], [50, 30], [80, 30]],
    marcaModelo: "Mercedes-Benz Sprinter 516 2023",
    ano: 2023,
    permisoCtp: "CTP-TE-2024-2201",
    vencimientoCtp: "05/12/2026",
    dekraRtv: "10/01/2027",
    dekraEstado: "Al día",
    polizaIns: "INS-RESP-CIVIL-77190",
    vencimientoIns: "31/12/2026",
    asistente: "Elena Castro Solano",
    cinturones: true,
    rotuloEscolar: true,
    extintorBotiquin: true,
    puertaEmergencia: true,
    fotoBuseta: DEFAULT_BUSETA_PHOTOS[2],
    fotoPermisoCtp: generateCtpPermitSvg("AL-7652", "CTP-TE-2024-2201", "31/10/2026", "Jorge Castro Ureña"),
    marchamoAno: 2026,
    marchamoEstado: "Al día",
    fotoMarchamo: generateMarchamoSvg("AL-7652", 2026),
    tarjetaCirculacion: "REG-CR-7652-9901",
    fotoCirculacion: generateCirculacionSvg("AL-7652", "Mercedes-Benz Sprinter 516 2023", 2023),
    fotoDekra: generateDekraSvg("AL-7652", "10/01/2027", "Al día"),
    fotoPolizaIns: generateInsPolicySvg("AL-7652", "INS-RESP-CIVIL-77190", "31/12/2026"),
    licenciaNumero: "1-0982-0441",
    licenciaTipo: "C-2 Profesional",
    licenciaVencimiento: "22/11/2028",
    fotoLicencia: generateLicenseSvg("Jorge Castro Ureña", "1-0982-0441", "C-2", "22/11/2028"),
    carnetAsistente: "ASIST-CTP-2024-220",
    fotoCarnetAsistente: generateAssistantBadgeSvg("Elena Castro Solano", "ASIST-CTP-2024-220"),
  },
  {
    id: "v4",
    patente: "HE-5541",
    chofer: "Esteban Vargas Rojas",
    ruta: "Heredia Centro & Belén → Pan-American School",
    colegio: "Pan-American School",
    horario: "06:35 / 14:20",
    aBordo: 3,
    cap: 15,
    estado: "En ruta",
    path: [[40, 10], [60, 30], [60, 65], [30, 85]],
    marcaModelo: "Nissan Urvan NV350 2020",
    ano: 2020,
    permisoCtp: "CTP-TE-2024-5509",
    vencimientoCtp: "30/04/2027",
    dekraRtv: "14/12/2026",
    dekraEstado: "Al día",
    polizaIns: "INS-RESP-CIVIL-66504",
    vencimientoIns: "25/11/2026",
    asistente: "Silvia Rojas Chaves",
    cinturones: true,
    rotuloEscolar: true,
    extintorBotiquin: true,
    puertaEmergencia: true,
    fotoBuseta: DEFAULT_BUSETA_PHOTOS[3],
    fotoPermisoCtp: generateCtpPermitSvg("HE-5541", "CTP-TE-2024-5509", "15/09/2026", "Esteban Vargas Rojas"),
    marchamoAno: 2026,
    marchamoEstado: "Al día",
    fotoMarchamo: generateMarchamoSvg("HE-5541", 2026),
    tarjetaCirculacion: "REG-CR-5541-3312",
    fotoCirculacion: generateCirculacionSvg("HE-5541", "Nissan Urvan NV350 2020", 2020),
    fotoDekra: generateDekraSvg("HE-5541", "14/12/2026", "Al día"),
    fotoPolizaIns: generateInsPolicySvg("HE-5541", "INS-RESP-CIVIL-66504", "31/12/2026"),
    licenciaNumero: "4-0199-0520",
    licenciaTipo: "C-2 Profesional",
    licenciaVencimiento: "05/03/2027",
    fotoLicencia: generateLicenseSvg("Esteban Vargas Rojas", "4-0199-0520", "C-2", "05/03/2027"),
    carnetAsistente: "ASIST-CTP-2024-550",
    fotoCarnetAsistente: generateAssistantBadgeSvg("Silvia Rojas Chaves", "ASIST-CTP-2024-550"),
  },
  {
    id: "v5",
    patente: "SJ-9023",
    chofer: "Carlos Solís Morales",
    ruta: "Moravia & Guadalupe → Saint Francis",
    colegio: "Saint Francis College",
    horario: "06:45 / 14:15",
    aBordo: 0,
    cap: 22,
    estado: "Detenido",
    path: [[15, 25], [35, 25], [35, 55]],
    marcaModelo: "Nissan Civilian 2021",
    ano: 2021,
    permisoCtp: "CTP-TE-2024-9023",
    vencimientoCtp: "15/05/2027",
    dekraRtv: "10/12/2026",
    dekraEstado: "Al día",
    polizaIns: "INS-RESP-CIVIL-55410",
    vencimientoIns: "31/12/2026",
    asistente: "Patricia Mora Jiménez",
    cinturones: true,
    rotuloEscolar: true,
    extintorBotiquin: true,
    puertaEmergencia: true,
    fotoBuseta: DEFAULT_BUSETA_PHOTOS[4],
    fotoPermisoCtp: generateCtpPermitSvg("SJ-9023", "CTP-TE-2024-9023", "15/05/2027", "Carlos Solís Morales"),
    marchamoAno: 2026,
    marchamoEstado: "Al día",
    fotoMarchamo: generateMarchamoSvg("SJ-9023", 2026),
    tarjetaCirculacion: "REG-CR-9023-8821",
    fotoCirculacion: generateCirculacionSvg("SJ-9023", "Nissan Civilian 2021", 2021),
    fotoDekra: generateDekraSvg("SJ-9023", "20/12/2026", "Al día"),
    fotoPolizaIns: generateInsPolicySvg("SJ-9023", "INS-RESP-CIVIL-55410", "31/12/2026"),
    licenciaNumero: "1-1142-0892",
    licenciaTipo: "C-2 Profesional",
    licenciaVencimiento: "18/04/2028",
    fotoLicencia: generateLicenseSvg("Carlos Solís Morales", "1-1142-0892", "C-2", "18/04/2028"),
    carnetAsistente: "ASIST-CTP-2024-881",
    fotoCarnetAsistente: generateAssistantBadgeSvg("Patricia Mora Jiménez", "ASIST-CTP-2024-881"),
  },
];

export type PaymentStatus = "Pagado" | "Pendiente" | "Atrasado" | "En Verificación";

export type Alumno = {
  id: string;
  nombre: string;
  curso: string;
  colegio: string;
  direccion: string;
  lat?: number;
  lng?: number;
  apoderado: string;
  telefonoApoderado: string;
  pago: PaymentStatus;
  monto: number;
};

export const ALUMNOS: Alumno[] = [
  { id: "a1", nombre: "Sofía Rojas Gómez", curso: "3° Grado", colegio: "Lincoln School", direccion: "Guachipelín, Escazú", lat: 9.9452, lng: -84.1528, apoderado: "Carla Pérez Monge", telefonoApoderado: "8841-9230", pago: "Pagado", monto: 65000 },
  { id: "a2", nombre: "Mateo González Soto", curso: "5° Grado", colegio: "Lincoln School", direccion: "Pozos de Santa Ana", lat: 9.9560, lng: -84.1812, apoderado: "Rodrigo González", telefonoApoderado: "8712-4091", pago: "Pendiente", monto: 65000 },
  { id: "a3", nombre: "Agustina Silva Mora", curso: "1° Grado", colegio: "Colegio Humboldt", direccion: "Freses, Curridabat", lat: 9.9214, lng: -84.0389, apoderado: "Fernanda Silva", telefonoApoderado: "8390-1188", pago: "Pagado", monto: 58000 },
  { id: "a4", nombre: "Benjamín Torres Vega", curso: "7° Grado", colegio: "Country Day School", direccion: "La Sabana, San José", lat: 9.9365, lng: -84.1030, apoderado: "Luis Torres", telefonoApoderado: "8833-2210", pago: "Atrasado", monto: 72000 },
  { id: "a5", nombre: "Emilia Contreras Alvarado", curso: "2° Grado", colegio: "Colegio Humboldt", direccion: "Barrio Dent, San Pedro", lat: 9.9320, lng: -84.0550, apoderado: "Paula Contreras", telefonoApoderado: "8650-7744", pago: "Pagado", monto: 58000 },
  { id: "a6", nombre: "Tomás Fuentes Salazar", curso: "4° Grado", colegio: "Lincoln School", direccion: "Bello Horizonte, Escazú", lat: 9.9288, lng: -84.1350, apoderado: "Andrés Fuentes", telefonoApoderado: "8911-3450", pago: "Pendiente", monto: 65000 },
];

export type Chofer = {
  id: string;
  nombre: string;
  cedula: string;
  rut?: string | undefined;
  telefono: string;
  buseta: string;
  vinculo: "Activo" | "Pendiente · 11 días" | "Inactivo";
  licenciaTipo?: string | undefined;
  licenciaNumero?: string | undefined;
  licenciaVencimiento?: string | undefined;
  licenciaPuntos?: number | undefined;
  fotoLicencia?: string | undefined;
};

export const CHOFERES: Chofer[] = [
  { id: "c1", nombre: "Carlos Solís Morales", cedula: "1-1142-0892", rut: "1-1142-0892", telefono: "8841-2390", buseta: "SJ-4821", vinculo: "Activo", licenciaTipo: "C-2 Profesional", licenciaNumero: "1-1142-0892", licenciaVencimiento: "18/04/2028", licenciaPuntos: 0, fotoLicencia: generateLicenseSvg("Carlos Solís Morales", "1-1142-0892", "C-2", "18/04/2028") },
  { id: "c2", nombre: "Marcela Fonseca Brenes", cedula: "2-0451-0321", rut: "2-0451-0321", telefono: "8712-4450", buseta: "SJ-3190", vinculo: "Activo", licenciaTipo: "C-2 Profesional", licenciaNumero: "2-0451-0321", licenciaVencimiento: "10/09/2027", licenciaPuntos: 0, fotoLicencia: generateLicenseSvg("Marcela Fonseca Brenes", "2-0451-0321", "C-2", "10/09/2027") },
  { id: "c3", nombre: "Jorge Castro Ureña", cedula: "1-0982-0441", rut: "1-0982-0441", telefono: "8390-1122", buseta: "AL-7652", vinculo: "Activo", licenciaTipo: "C-2 Profesional", licenciaNumero: "1-0982-0441", licenciaVencimiento: "22/11/2028", licenciaPuntos: 0, fotoLicencia: generateLicenseSvg("Jorge Castro Ureña", "1-0982-0441", "C-2", "22/11/2028") },
  { id: "c4", nombre: "Esteban Vargas Rojas", cedula: "4-0199-0520", rut: "4-0199-0520", telefono: "8833-9011", buseta: "HE-5541", vinculo: "Activo", licenciaTipo: "C-2 Profesional", licenciaNumero: "4-0199-0520", licenciaVencimiento: "05/03/2027", licenciaPuntos: 0, fotoLicencia: generateLicenseSvg("Esteban Vargas Rojas", "4-0199-0520", "C-2", "05/03/2027") },
  { id: "c5", nombre: "Patricia Mora Jiménez", cedula: "1-1432-0775", rut: "1-1432-0775", telefono: "8650-2911", buseta: "SJ-9023", vinculo: "Pendiente · 11 días", licenciaTipo: "C-2 Profesional", licenciaNumero: "1-1432-0775", licenciaVencimiento: "15/05/2027", licenciaPuntos: 0, fotoLicencia: generateLicenseSvg("Patricia Mora Jiménez", "1-1432-0775", "C-2", "15/05/2027") },
];

export type Colegio = {
  id: string;
  nombre: string;
  canton: string;
  provincia: string;
  telefono: string;
  estudiantes: number;
  estado: "Activo" | "Inactivo";
  lat?: number;
  lng?: number;
};

export const COLEGIOS_DEFAULT: Colegio[] = [
  { id: "col1", nombre: "Lincoln School", canton: "Santo Domingo", provincia: "Heredia", telefono: "2247-6600", estudiantes: 14, estado: "Activo", lat: 9.9754, lng: -84.0768 },
  { id: "col2", nombre: "Colegio Humboldt", canton: "Pavas", provincia: "San José", telefono: "2232-1455", estudiantes: 9, estado: "Activo", lat: 9.9392, lng: -84.1167 },
  { id: "col3", nombre: "Country Day School", canton: "San Rafael", provincia: "Alajuela", telefono: "2289-0900", estudiantes: 11, estado: "Activo", lat: 9.9421, lng: -84.1952 },
  { id: "col4", nombre: "Saint Francis College", canton: "Moravia", provincia: "San José", telefono: "2297-1704", estudiantes: 8, estado: "Activo", lat: 9.9575, lng: -84.0483 },
  { id: "col5", nombre: "Colegio Británico de CR", canton: "Rohrmoser", provincia: "San José", telefono: "2220-0131", estudiantes: 6, estado: "Activo", lat: 9.9431, lng: -84.1189 },
  { id: "col6", nombre: "Pan-American School", canton: "Belén", provincia: "Heredia", telefono: "2293-7393", estudiantes: 7, estado: "Activo", lat: 9.9822, lng: -84.1789 },
];

export const COLEGIOS = COLEGIOS_DEFAULT.map(c => c.nombre);

export type Viaje = {
  id: string;
  fecha: string;
  ruta: string;
  patente: string;
  inicio: string;
  fin: string;
  desvio: string;
  estado: string;
};

export const VIAJES: Viaje[] = [
  { id: "t1", fecha: "Hoy", ruta: "Escazú → Lincoln School", patente: "SJ-4821", inicio: "06:30", fin: "—", desvio: "+1 min", estado: "En curso" },
  { id: "t2", fecha: "Hoy", ruta: "Curridabat → Humboldt", patente: "SJ-3190", inicio: "06:45", fin: "—", desvio: "0 min", estado: "En curso" },
  { id: "t3", fecha: "Ayer", ruta: "Escazú → Lincoln School", patente: "SJ-4821", inicio: "06:28", fin: "07:25", desvio: "+3 min", estado: "Finalizado" },
  { id: "t4", fecha: "Ayer", ruta: "Rohrmoser → Country Day", patente: "AL-7652", inicio: "06:35", fin: "07:30", desvio: "-2 min", estado: "Finalizado" },
];

export type TenantStatus = "Activo" | "En prueba" | "Suspendido";
export type TenantPlan = "Básico (1-3 busetas)" | "Profesional (4-10 busetas)" | "Flota Enterprise (+10 busetas)";

export type Tenant = {
  id: string;
  slug: string;
  nombre: string;
  tipo: "Empresa de Transporte" | "Chofer Independiente";
  cedulaJuridica: string;
  contactoTitular: string;
  telefono: string;
  email: string;
  provincia: string;
  canton: string;
  permisoCtp: string;
  plan: TenantPlan;
  montoMensualSaaS: number;
  estado: TenantStatus;
  busetasActivas: number;
  estudiantesTotales: number;
  fechaRegistro: string;
  logoUrl?: string;
  sortOrder?: number;
};

export const TENANTS_DEFAULT: Tenant[] = [
  {
    id: "tenant-valle-cr",
    slug: "valle-cr",
    nombre: "Transportes Escolares del Valle CR",
    tipo: "Empresa de Transporte",
    cedulaJuridica: "3-101-789234",
    contactoTitular: "Carolina Morales Vega",
    telefono: "8841-9230",
    email: "carolina@vallecr.com",
    provincia: "San José",
    canton: "Escazú",
    permisoCtp: "CTP-TE-2024-8841",
    plan: "Profesional (4-10 busetas)",
    montoMensualSaaS: 85000,
    estado: "Activo",
    busetasActivas: 5,
    estudiantesTotales: 64,
    fechaRegistro: "15/01/2026",
  },
  {
    id: "tenant-heredia-sol",
    slug: "heredia-sol",
    nombre: "Busetas del Sol Heredia S.A.",
    tipo: "Empresa de Transporte",
    cedulaJuridica: "3-101-654921",
    contactoTitular: "Esteban Vargas Rojas",
    telefono: "8833-9011",
    email: "operaciones@busetasdelsol.cr",
    provincia: "Heredia",
    canton: "Belén",
    permisoCtp: "CTP-TE-2023-4120",
    plan: "Flota Enterprise (+10 busetas)",
    montoMensualSaaS: 145000,
    estado: "Activo",
    busetasActivas: 8,
    estudiantesTotales: 112,
    fechaRegistro: "02/02/2026",
  },
  {
    id: "tenant-alajuela-norte",
    slug: "alajuela-norte",
    nombre: "Transportes Alajuela & San Pedro",
    tipo: "Empresa de Transporte",
    cedulaJuridica: "3-101-443901",
    contactoTitular: "Jorge Castro Ureña",
    telefono: "8390-1122",
    email: "jcastro@transportesalajuela.cr",
    provincia: "Alajuela",
    canton: "Alajuela Central",
    permisoCtp: "CTP-TE-2024-2201",
    plan: "Básico (1-3 busetas)",
    montoMensualSaaS: 55000,
    estado: "Activo",
    busetasActivas: 3,
    estudiantesTotales: 42,
    fechaRegistro: "10/03/2026",
  },
  {
    id: "tenant-curridabat-exp",
    slug: "curridabat-exp",
    nombre: "Microbuses Curridabat Express",
    tipo: "Empresa de Transporte",
    cedulaJuridica: "3-101-812304",
    contactoTitular: "Marcela Fonseca Brenes",
    telefono: "8712-4450",
    email: "mfonseca@curridabatexpress.com",
    provincia: "San José",
    canton: "Curridabat",
    permisoCtp: "CTP-TE-2024-5509",
    plan: "Profesional (4-10 busetas)",
    montoMensualSaaS: 85000,
    estado: "Activo",
    busetasActivas: 4,
    estudiantesTotales: 56,
    fechaRegistro: "18/04/2026",
  },
  {
    id: "tenant-don-jorge",
    slug: "don-jorge",
    nombre: "Servicio Estudiantil Don Jorge",
    tipo: "Chofer Independiente",
    cedulaJuridica: "1-0876-0234",
    contactoTitular: "Jorge Muñoz Sánchez",
    telefono: "8841-2390",
    email: "jorge.munoz@gmail.com",
    provincia: "Cartago",
    canton: "Paraíso",
    permisoCtp: "CTP-TE-2025-0112",
    plan: "Básico (1-3 busetas)",
    montoMensualSaaS: 25000,
    estado: "En prueba",
    busetasActivas: 1,
    estudiantesTotales: 16,
    fechaRegistro: "01/10/2026",
  },
];

export const crc = (n: number) => "₡" + n.toLocaleString("es-CR");
export const clp = crc;

export function pointOnPath(path: [number, number][], t: number): [number, number] {
  const segs = path.length - 1;
  const x = Math.min(Math.max(t, 0), 0.9999) * segs;
  const i = Math.floor(x);
  const f = x - i;
  const a = path[i]; const b = path[i + 1];
  if (!a) return [0, 0];
  if (!b) return a;
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}
