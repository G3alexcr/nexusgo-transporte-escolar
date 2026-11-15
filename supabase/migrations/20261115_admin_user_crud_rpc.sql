-- LinkBus Costa Rica - RPC seguro para eliminar usuarios desde /admin/usuarios

create or replace function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller_role text;
  caller_tenant uuid;
  target_role text;
  target_tenant uuid;
begin
  caller_role := public.current_user_role();
  caller_tenant := public.current_user_tenant_id();

  if target_user_id = auth.uid() then
    raise exception 'No puedes eliminar tu propia cuenta activa.';
  end if;

  select role, tenant_id into target_role, target_tenant
  from public.user_profiles
  where id = target_user_id;

  if not found then
    raise exception 'Usuario no encontrado.';
  end if;

  if target_role = 'superadmin' then
    raise exception 'No está permitido eliminar cuentas SuperAdmin.';
  end if;

  if caller_role = 'superadmin' then
    delete from auth.users where id = target_user_id;
    return;
  end if;

  if caller_role = 'admin' and target_tenant is not null and target_tenant = caller_tenant then
    delete from auth.users where id = target_user_id;
    return;
  end if;

  raise exception 'No tienes permisos para eliminar este usuario.';
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public;
grant execute on function public.admin_delete_user(uuid) to authenticated;

-- RPC seguro para asignar o restablecer contraseña desde /admin/usuarios
create or replace function public.admin_set_user_password(target_user_id uuid, new_password text)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  caller_role text;
  caller_tenant uuid;
  target_role text;
  target_tenant uuid;
begin
  caller_role := public.current_user_role();
  caller_tenant := public.current_user_tenant_id();

  if length(coalesce(new_password, '')) < 6 then
    raise exception 'La contraseña debe tener al menos 6 caracteres.';
  end if;

  select role, tenant_id into target_role, target_tenant
  from public.user_profiles
  where id = target_user_id;

  if not found then
    raise exception 'Usuario no encontrado.';
  end if;

  if target_role = 'superadmin' and caller_role <> 'superadmin' then
    raise exception 'No tienes permisos para modificar una cuenta SuperAdmin.';
  end if;

  if caller_role = 'superadmin' or (caller_role = 'admin' and target_tenant is not null and target_tenant = caller_tenant) then
    update auth.users
    set encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf')),
        updated_at = now()
    where id = target_user_id;
    return;
  end if;

  raise exception 'No tienes permisos para cambiar la contraseña de este usuario.';
end;
$$;

revoke all on function public.admin_set_user_password(uuid, text) from public;
grant execute on function public.admin_set_user_password(uuid, text) to authenticated;
