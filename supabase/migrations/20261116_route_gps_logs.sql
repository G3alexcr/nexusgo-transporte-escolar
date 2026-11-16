-- Grabación opcional de recorridos GPS por el chofer (solo habilitable, visible y borrable por Admin)

alter table public.app_settings
  add column if not exists record_gps_routes boolean not null default false;

create table if not exists public.route_gps_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  van_id uuid references public.vans(id) on delete set null,
  van_patente text not null,
  route_name text not null,
  driver_name text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  points jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists route_gps_logs_tenant_started_idx
  on public.route_gps_logs(tenant_id, started_at desc);

alter table public.route_gps_logs enable row level security;

drop policy if exists "route_gps_logs_select_admin" on public.route_gps_logs;
drop policy if exists "route_gps_logs_insert_op" on public.route_gps_logs;
drop policy if exists "route_gps_logs_update_op" on public.route_gps_logs;
drop policy if exists "route_gps_logs_delete_admin" on public.route_gps_logs;

create policy "route_gps_logs_select_admin" on public.route_gps_logs
  for select using (
    public.current_user_role() = 'superadmin'
    or (
      tenant_id = public.current_user_tenant_id()
      and public.current_user_role() = 'admin'
    )
  );

create policy "route_gps_logs_insert_op" on public.route_gps_logs
  for insert with check (
    public.current_user_role() = 'superadmin'
    or (
      tenant_id = public.current_user_tenant_id()
      and public.current_user_role() in ('admin', 'chofer', 'asistente')
    )
  );

create policy "route_gps_logs_update_op" on public.route_gps_logs
  for update using (
    public.current_user_role() = 'superadmin'
    or (
      tenant_id = public.current_user_tenant_id()
      and public.current_user_role() in ('admin', 'chofer', 'asistente')
    )
  )
  with check (
    public.current_user_role() = 'superadmin'
    or (
      tenant_id = public.current_user_tenant_id()
      and public.current_user_role() in ('admin', 'chofer', 'asistente')
    )
  );

create policy "route_gps_logs_delete_admin" on public.route_gps_logs
  for delete using (
    public.current_user_role() = 'superadmin'
    or (
      tenant_id = public.current_user_tenant_id()
      and public.current_user_role() = 'admin'
    )
  );

notify pgrst, 'reload schema';
