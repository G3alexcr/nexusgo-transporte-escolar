-- LinkBus Costa Rica - Gestión de Usuarios y Roles por Transportista (Tenant Admin)

-- Agregar columna opcional para roles personalizados creados por el transportista
alter table public.user_profiles
  add column if not exists custom_role text;

-- Ampliar constraint de rol base para incluir 'asistente' (Asistente de Chofer)
alter table public.user_profiles
  drop constraint if exists user_profiles_role_check;

alter table public.user_profiles
  add constraint user_profiles_role_check
  check (role in ('superadmin', 'admin', 'chofer', 'asistente', 'apoderado'));

-- Permitir que el administrador de un transportista vea los perfiles de su propio tenant
drop policy if exists "profiles_select_tenant_admin" on public.user_profiles;
create policy "profiles_select_tenant_admin" on public.user_profiles
  for select using (
    public.current_user_role() = 'admin'
    and tenant_id = public.current_user_tenant_id()
  );

-- Permitir que el administrador de un transportista actualice rol, custom_role y vínculos dentro de su propio tenant
-- (nunca puede escalar a superadmin ni mover usuarios a otro tenant)
drop policy if exists "profiles_update_tenant_admin" on public.user_profiles;
create policy "profiles_update_tenant_admin" on public.user_profiles
  for update using (
    public.current_user_role() = 'admin'
    and tenant_id = public.current_user_tenant_id()
    and role <> 'superadmin'
  )
  with check (
    public.current_user_role() = 'admin'
    and tenant_id = public.current_user_tenant_id()
    and role in ('admin', 'chofer', 'asistente', 'apoderado')
  );

-- Permitir que superadmin actualice cualquier perfil de usuario
drop policy if exists "profiles_update_superadmin" on public.user_profiles;
create policy "profiles_update_superadmin" on public.user_profiles
  for update using (public.current_user_role() = 'superadmin')
  with check (public.current_user_role() = 'superadmin');

-- Actualizar trigger handle_new_user() para aceptar 'asistente', custom_role, chofer_id y alumno_id
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
  safe_role text;
  meta_custom_role text;
  meta_tenant uuid;
  meta_chofer uuid;
  meta_alumno uuid;
begin
  requested_role := coalesce(new.raw_user_meta_data->>'role', 'apoderado');
  if requested_role in ('admin', 'chofer', 'asistente', 'apoderado') then
    safe_role := requested_role;
  else
    safe_role := 'apoderado';
  end if;

  meta_custom_role := nullif(trim(coalesce(new.raw_user_meta_data->>'custom_role', '')), '');

  begin
    meta_tenant := (new.raw_user_meta_data->>'tenant_id')::uuid;
  exception when others then
    meta_tenant := null;
  end;

  begin
    meta_chofer := (new.raw_user_meta_data->>'chofer_id')::uuid;
  exception when others then
    meta_chofer := null;
  end;

  begin
    meta_alumno := (new.raw_user_meta_data->>'alumno_id')::uuid;
  exception when others then
    meta_alumno := null;
  end;

  insert into public.user_profiles (id, email, full_name, role, custom_role, tenant_id, chofer_id, alumno_id)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    safe_role,
    meta_custom_role,
    meta_tenant,
    meta_chofer,
    meta_alumno
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(excluded.full_name, ''), public.user_profiles.full_name),
        custom_role = coalesce(excluded.custom_role, public.user_profiles.custom_role),
        chofer_id = coalesce(excluded.chofer_id, public.user_profiles.chofer_id),
        alumno_id = coalesce(excluded.alumno_id, public.user_profiles.alumno_id),
        updated_at = now();

  return new;
end;
$$;
