-- LinkBus Costa Rica - Autenticación, Perfiles y Control de Acceso (RBAC + RLS por Tenant/Familia)

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'apoderado' check (role in ('superadmin', 'admin', 'chofer', 'apoderado')),
  tenant_id uuid references public.tenants(id) on delete set null,
  alumno_id uuid references public.alumnos(id) on delete set null,
  chofer_id uuid references public.choferes(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

-- Funciones auxiliares para RLS (security definer para evitar recursión)
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_profiles where id = auth.uid() limit 1;
$$;

create or replace function public.current_user_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from public.user_profiles where id = auth.uid() limit 1;
$$;

create or replace function public.current_user_alumno_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select alumno_id from public.user_profiles where id = auth.uid() limit 1;
$$;

-- Trigger para crear perfil automáticamente al registrarse en auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
  safe_role text;
  meta_tenant uuid;
begin
  requested_role := coalesce(new.raw_user_meta_data->>'role', 'apoderado');
  -- Nunca permitir escalación a superadmin desde registro público
  if requested_role in ('admin', 'chofer', 'apoderado') then
    safe_role := requested_role;
  else
    safe_role := 'apoderado';
  end if;

  begin
    meta_tenant := (new.raw_user_meta_data->>'tenant_id')::uuid;
  exception when others then
    meta_tenant := null;
  end;

  insert into public.user_profiles (id, email, full_name, role, tenant_id)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    safe_role,
    meta_tenant
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(excluded.full_name, ''), public.user_profiles.full_name),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Políticas para user_profiles
drop policy if exists "profiles_select_own" on public.user_profiles;
create policy "profiles_select_own" on public.user_profiles
  for select using (auth.uid() = id or public.current_user_role() = 'superadmin');

drop policy if exists "profiles_update_own" on public.user_profiles;
create policy "profiles_update_own" on public.user_profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.user_profiles;
create policy "profiles_insert_own" on public.user_profiles
  for insert with check (auth.uid() = id);

-- Políticas RLS reales por tenant y rol (reemplazando políticas abiertas de prototipo)
drop policy if exists "linkbus_prototype_all_tenants" on public.tenants;
create policy "tenants_read_authenticated_or_landing" on public.tenants
  for select using (
    auth.role() = 'anon'
    or public.current_user_role() = 'superadmin'
    or id = public.current_user_tenant_id()
  );
create policy "tenants_insert_authenticated" on public.tenants
  for insert with check (auth.role() = 'authenticated');
create policy "tenants_update_admin" on public.tenants
  for update using (
    public.current_user_role() = 'superadmin'
    or (public.current_user_role() = 'admin' and id = public.current_user_tenant_id())
  );
create policy "tenants_delete_superadmin" on public.tenants
  for delete using (public.current_user_role() = 'superadmin');

-- Tablas operativas por tenant_id
do $$
declare
  tbl text;
  tenant_tables text[] := array[
    'colegios',
    'choferes',
    'vans',
    'viajes',
    'inspections',
    'absences',
    'notifications',
    'notices',
    'app_settings'
  ];
begin
  foreach tbl in array tenant_tables loop
    execute format('drop policy if exists "linkbus_prototype_all_linkbus_%s" on public.%I;', tbl, tbl);
    execute format('drop policy if exists "tenant_isolation_select_%s" on public.%I;', tbl, tbl);
    execute format('drop policy if exists "tenant_isolation_write_%s" on public.%I;', tbl, tbl);
    execute format(
      'create policy "tenant_isolation_select_%s" on public.%I for select using (public.current_user_role() = ''superadmin'' or tenant_id = public.current_user_tenant_id());',
      tbl, tbl
    );
    execute format(
      'create policy "tenant_isolation_write_%s" on public.%I for all using (public.current_user_role() = ''superadmin'' or tenant_id = public.current_user_tenant_id()) with check (public.current_user_role() = ''superadmin'' or tenant_id = public.current_user_tenant_id());',
      tbl, tbl
    );
  end loop;
end $$;

-- Alumnos, asistencia, pagos, contratos y autorizados: aislamiento por tenant y por familia (apoderado)
drop policy if exists "linkbus_prototype_all_linkbus_alumnos" on public.alumnos;
create policy "alumnos_select_rbac" on public.alumnos
  for select using (
    public.current_user_role() = 'superadmin'
    or (tenant_id = public.current_user_tenant_id() and public.current_user_role() in ('admin', 'chofer'))
    or (tenant_id = public.current_user_tenant_id() and public.current_user_role() = 'apoderado' and (public.current_user_alumno_id() is null or id = public.current_user_alumno_id()))
  );
create policy "alumnos_write_admin" on public.alumnos
  for all using (
    public.current_user_role() = 'superadmin'
    or (tenant_id = public.current_user_tenant_id() and public.current_user_role() = 'admin')
  )
  with check (
    public.current_user_role() = 'superadmin'
    or (tenant_id = public.current_user_tenant_id() and public.current_user_role() = 'admin')
  );

do $$
declare
  tbl text;
  student_tables text[] := array['attendance', 'payments', 'contracts', 'authorized_persons'];
begin
  foreach tbl in array student_tables loop
    execute format('drop policy if exists "linkbus_prototype_all_linkbus_%s" on public.%I;', tbl, tbl);
    execute format('drop policy if exists "student_rbac_all_%s" on public.%I;', tbl, tbl);
    execute format(
      'create policy "student_rbac_all_%s" on public.%I for all using (
        public.current_user_role() = ''superadmin''
        or (tenant_id = public.current_user_tenant_id() and public.current_user_role() in (''admin'', ''chofer''))
        or (tenant_id = public.current_user_tenant_id() and public.current_user_role() = ''apoderado'' and (public.current_user_alumno_id() is null or alumno_id = public.current_user_alumno_id()))
      ) with check (
        public.current_user_role() = ''superadmin''
        or (tenant_id = public.current_user_tenant_id() and public.current_user_role() in (''admin'', ''chofer'', ''apoderado''))
      );',
      tbl, tbl
    );
  end loop;
end $$;

-- Permitir lectura pública limitada de vans en landing (solo si no hay sesión)
drop policy if exists "vans_landing_anon_read" on public.vans;
create policy "vans_landing_anon_read" on public.vans
  for select using (auth.role() = 'anon');

notify pgrst, 'reload schema';
