-- Tablas adicionales para eliminar 100% de datos estáticos en frontend: viajes y avisos

create table if not exists public.linkbus_viajes (
  id text primary key,
  tenant_id text not null default 'tenant-valle-cr',
  fecha text not null,
  ruta text not null,
  patente text not null,
  inicio text not null,
  fin text not null,
  desvio text not null,
  estado text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.linkbus_notices (
  id integer primary key,
  tenant_id text not null default 'tenant-valle-cr',
  message text not null,
  time text not null,
  created_at timestamptz not null default now()
);

alter table public.linkbus_viajes enable row level security;
alter table public.linkbus_notices enable row level security;

drop policy if exists "linkbus_prototype_all_linkbus_viajes" on public.linkbus_viajes;
create policy "linkbus_prototype_all_linkbus_viajes" on public.linkbus_viajes for all using (true) with check (true);

drop policy if exists "linkbus_prototype_all_linkbus_notices" on public.linkbus_notices;
create policy "linkbus_prototype_all_linkbus_notices" on public.linkbus_notices for all using (true) with check (true);
