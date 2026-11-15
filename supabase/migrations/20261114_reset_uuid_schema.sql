-- LinkBus Costa Rica - Esquema 100% UUID en Supabase PostgreSQL
-- Todas las llaves primarias y foráneas utilizan el tipo nativo uuid.

drop table if exists public.linkbus_notices cascade;
drop table if exists public.linkbus_viajes cascade;
drop table if exists public.linkbus_app_settings cascade;
drop table if exists public.linkbus_authorized_persons cascade;
drop table if exists public.linkbus_notifications cascade;
drop table if exists public.linkbus_absences cascade;
drop table if exists public.linkbus_inspections cascade;
drop table if exists public.linkbus_contracts cascade;
drop table if exists public.linkbus_payments cascade;
drop table if exists public.linkbus_attendance cascade;
drop table if exists public.linkbus_alumnos cascade;
drop table if exists public.linkbus_vans cascade;
drop table if exists public.linkbus_choferes cascade;
drop table if exists public.linkbus_colegios cascade;
drop table if exists public.linkbus_tenants cascade;

create table public.linkbus_tenants (
  id uuid primary key default gen_random_uuid(),
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

create table public.linkbus_colegios (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.linkbus_tenants(id) on delete cascade,
  nombre text not null,
  canton text,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.linkbus_choferes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.linkbus_tenants(id) on delete cascade,
  nombre text not null,
  telefono text,
  estado text,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.linkbus_vans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.linkbus_tenants(id) on delete cascade,
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

create table public.linkbus_alumnos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.linkbus_tenants(id) on delete cascade,
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

create table public.linkbus_viajes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.linkbus_tenants(id) on delete cascade,
  fecha text not null,
  ruta text not null,
  patente text not null,
  inicio text not null,
  fin text not null,
  desvio text not null,
  estado text not null,
  updated_at timestamptz not null default now()
);

create table public.linkbus_attendance (
  tenant_id uuid not null references public.linkbus_tenants(id) on delete cascade,
  alumno_id uuid not null references public.linkbus_alumnos(id) on delete cascade,
  status text not null default 'Pendiente',
  subida text not null default '—',
  bajada text not null default '—',
  updated_at timestamptz not null default now(),
  primary key (tenant_id, alumno_id)
);

create table public.linkbus_payments (
  tenant_id uuid not null references public.linkbus_tenants(id) on delete cascade,
  alumno_id uuid not null references public.linkbus_alumnos(id) on delete cascade,
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

create table public.linkbus_contracts (
  tenant_id uuid not null references public.linkbus_tenants(id) on delete cascade,
  alumno_id uuid not null references public.linkbus_alumnos(id) on delete cascade,
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

create table public.linkbus_inspections (
  tenant_id uuid not null references public.linkbus_tenants(id) on delete cascade,
  van_placa text not null,
  fecha_hora text not null,
  chofer_nombre text not null,
  resultado text not null,
  folio_digital text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (tenant_id, van_placa)
);

create table public.linkbus_absences (
  tenant_id uuid not null references public.linkbus_tenants(id) on delete cascade,
  absence_date text not null,
  mode text not null,
  updated_at timestamptz not null default now(),
  primary key (tenant_id, absence_date)
);

create table public.linkbus_notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.linkbus_tenants(id) on delete cascade,
  title text not null,
  body text not null,
  time text not null,
  type text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.linkbus_authorized_persons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.linkbus_tenants(id) on delete cascade,
  alumno_id uuid not null references public.linkbus_alumnos(id) on delete cascade,
  nombre text not null,
  parentesco text not null,
  cedula text not null,
  telefono text not null,
  estado text not null default 'Autorizado',
  updated_at timestamptz not null default now()
);

create table public.linkbus_notices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.linkbus_tenants(id) on delete cascade,
  message text not null,
  time text not null,
  created_at timestamptz not null default now()
);

create table public.linkbus_app_settings (
  tenant_id uuid primary key references public.linkbus_tenants(id) on delete cascade,
  company text not null,
  route_name text not null,
  active boolean not null default false,
  driver_profile jsonb not null default '{}'::jsonb,
  parent_profile jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Habilitar RLS y políticas de acceso en fase de prototipo conectado
do $$
declare
  tbl text;
  tables text[] := array[
    'linkbus_tenants',
    'linkbus_colegios',
    'linkbus_choferes',
    'linkbus_vans',
    'linkbus_alumnos',
    'linkbus_viajes',
    'linkbus_attendance',
    'linkbus_payments',
    'linkbus_contracts',
    'linkbus_inspections',
    'linkbus_absences',
    'linkbus_notifications',
    'linkbus_authorized_persons',
    'linkbus_notices',
    'linkbus_app_settings'
  ];
begin
  foreach tbl in array tables loop
    execute format('alter table public.%I enable row level security;', tbl);
    execute format('drop policy if exists "linkbus_prototype_all_%s" on public.%I;', tbl, tbl);
    execute format('create policy "linkbus_prototype_all_%s" on public.%I for all using (true) with check (true);', tbl, tbl);
  end loop;
end $$;
