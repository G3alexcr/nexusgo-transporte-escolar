-- LinkBus Costa Rica - Esquema inicial en Supabase
-- Nota: Las políticas RLS permiten lectura/escritura con la llave pública durante la fase de prototipo conectado.
-- Al implementar Autenticación y RBAC (Punto 2), estas políticas se restringirán por usuario autenticado y tenant_id.

create table if not exists public.linkbus_tenants (
  id text primary key,
  nombre text not null,
  slug text not null,
  provincia text,
  telefono text,
  sinpe_numero text,
  plan text,
  activa boolean not null default true,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.linkbus_colegios (
  id text primary key,
  tenant_id text not null default 'tenant-valle-cr',
  nombre text not null,
  canton text,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.linkbus_choferes (
  id text primary key,
  tenant_id text not null default 'tenant-valle-cr',
  nombre text not null,
  telefono text,
  estado text,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.linkbus_vans (
  id text primary key,
  tenant_id text not null default 'tenant-valle-cr',
  patente text not null,
  chofer text not null,
  ruta text not null,
  colegio text not null,
  horario text not null,
  a_bordo integer not null default 0,
  cap integer not null default 16,
  estado text not null default 'En ruta',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.linkbus_alumnos (
  id text primary key,
  tenant_id text not null default 'tenant-valle-cr',
  nombre text not null,
  colegio text not null,
  curso text,
  apoderado text not null,
  telefono_apoderado text,
  direccion text,
  pago text not null default 'Pendiente',
  monto integer not null default 0,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.linkbus_attendance (
  tenant_id text not null default 'tenant-valle-cr',
  alumno_id text not null,
  status text not null default 'Pendiente',
  subida text not null default '—',
  bajada text not null default '—',
  updated_at timestamptz not null default now(),
  primary key (tenant_id, alumno_id)
);

create table if not exists public.linkbus_payments (
  tenant_id text not null default 'tenant-valle-cr',
  alumno_id text not null,
  status text not null default 'Pendiente',
  reminders integer not null default 0,
  banco text,
  comprobante_ref text,
  comprobante_foto text,
  fecha_reporte text,
  monto_reportado integer,
  aprobado_por text,
  fecha_aprobado text,
  recibo_numero text,
  motivo_rechazo text,
  updated_at timestamptz not null default now(),
  primary key (tenant_id, alumno_id)
);

create table if not exists public.linkbus_contracts (
  tenant_id text not null default 'tenant-valle-cr',
  alumno_id text not null,
  signed boolean not null default false,
  signed_at text,
  signed_by text,
  cedula_apoderado text,
  signature_data_url text,
  folio_digital text not null,
  terminos_aceptados boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (tenant_id, alumno_id)
);

create table if not exists public.linkbus_inspections (
  tenant_id text not null default 'tenant-valle-cr',
  van_placa text not null,
  fecha_hora text not null,
  chofer_nombre text not null,
  resultado text not null,
  folio_digital text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (tenant_id, van_placa)
);

create table if not exists public.linkbus_absences (
  tenant_id text not null default 'tenant-valle-cr',
  absence_date text not null,
  mode text not null,
  updated_at timestamptz not null default now(),
  primary key (tenant_id, absence_date)
);

create table if not exists public.linkbus_notifications (
  id text primary key,
  tenant_id text not null default 'tenant-valle-cr',
  title text not null,
  body text not null,
  time text not null,
  type text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.linkbus_authorized_persons (
  id text primary key,
  tenant_id text not null default 'tenant-valle-cr',
  alumno_id text not null,
  nombre text not null,
  parentesco text not null,
  cedula text not null,
  telefono text not null,
  estado text not null default 'Autorizado',
  updated_at timestamptz not null default now()
);

create table if not exists public.linkbus_app_settings (
  tenant_id text primary key,
  company text not null,
  route_name text not null,
  active boolean not null default false,
  driver_profile jsonb not null default '{}'::jsonb,
  parent_profile jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Habilitar RLS en todas las tablas
alter table public.linkbus_tenants enable row level security;
alter table public.linkbus_colegios enable row level security;
alter table public.linkbus_choferes enable row level security;
alter table public.linkbus_vans enable row level security;
alter table public.linkbus_alumnos enable row level security;
alter table public.linkbus_attendance enable row level security;
alter table public.linkbus_payments enable row level security;
alter table public.linkbus_contracts enable row level security;
alter table public.linkbus_inspections enable row level security;
alter table public.linkbus_absences enable row level security;
alter table public.linkbus_notifications enable row level security;
alter table public.linkbus_authorized_persons enable row level security;
alter table public.linkbus_app_settings enable row level security;

-- Políticas de acceso para fase de prototipo conectado (antes de Auth/RBAC)
do $$
declare
  tbl text;
  tables text[] := array[
    'linkbus_tenants',
    'linkbus_colegios',
    'linkbus_choferes',
    'linkbus_vans',
    'linkbus_alumnos',
    'linkbus_attendance',
    'linkbus_payments',
    'linkbus_contracts',
    'linkbus_inspections',
    'linkbus_absences',
    'linkbus_notifications',
    'linkbus_authorized_persons',
    'linkbus_app_settings'
  ];
begin
  foreach tbl in array tables loop
    execute format('drop policy if exists "linkbus_prototype_all_%s" on public.%I;', tbl, tbl);
    execute format('create policy "linkbus_prototype_all_%s" on public.%I for all using (true) with check (true);', tbl, tbl);
  end loop;
end $$;
