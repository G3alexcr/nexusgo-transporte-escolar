-- Nexus Go Costa Rica - RPC seguro para actualizar el correo de un usuario en auth.users, auth.identities y user_profiles

create or replace function public.admin_update_user_email(target_user_id uuid, new_email text)
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
  normalized_email text;
begin
  caller_role := public.current_user_role();
  caller_tenant := public.current_user_tenant_id();
  normalized_email := lower(trim(coalesce(new_email, '')));

  if normalized_email = '' or normalized_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Ingresa un correo electrónico válido.';
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

  if not (
    caller_role = 'superadmin'
    or (caller_role = 'admin' and target_tenant is not null and target_tenant = caller_tenant)
  ) then
    raise exception 'No tienes permisos para cambiar el correo de este usuario.';
  end if;

  if exists (
    select 1
    from auth.users
    where lower(email) = normalized_email
      and id <> target_user_id
  ) then
    raise exception 'Ya existe otro usuario registrado con ese correo.';
  end if;

  update auth.users
  set email = normalized_email,
      raw_user_meta_data = case
        when raw_user_meta_data is null then jsonb_build_object('email', normalized_email)
        else jsonb_set(raw_user_meta_data, '{email}', to_jsonb(normalized_email), true)
      end,
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      updated_at = now()
  where id = target_user_id;

  update auth.identities
  set identity_data = jsonb_set(coalesce(identity_data, '{}'::jsonb), '{email}', to_jsonb(normalized_email), true),
      updated_at = now()
  where user_id = target_user_id
    and provider = 'email';

  update public.user_profiles
  set email = normalized_email,
      updated_at = now()
  where id = target_user_id;
end;
$$;

revoke all on function public.admin_update_user_email(uuid, text) from public;
grant execute on function public.admin_update_user_email(uuid, text) to authenticated;
