-- Aislar notificaciones por estudiante (alumno_id) para que los avisos de asistencia
-- (A bordo, Entregado, Ausente) lleguen únicamente al encargado del estudiante correspondiente.

alter table public.notifications
  add column if not exists alumno_id uuid references public.alumnos(id) on delete cascade;

create index if not exists notifications_tenant_alumno_idx
  on public.notifications(tenant_id, alumno_id);

drop policy if exists "tenant_isolation_select_notifications" on public.notifications;
drop policy if exists "tenant_isolation_write_notifications" on public.notifications;
drop policy if exists "notifications_select_rbac" on public.notifications;
drop policy if exists "notifications_insert_rbac" on public.notifications;
drop policy if exists "notifications_update_rbac" on public.notifications;
drop policy if exists "notifications_delete_rbac" on public.notifications;

create policy "notifications_select_rbac" on public.notifications
  for select using (
    public.current_user_role() = 'superadmin'
    or (
      tenant_id = public.current_user_tenant_id()
      and public.current_user_role() in ('admin', 'chofer', 'asistente')
    )
    or (
      tenant_id = public.current_user_tenant_id()
      and public.current_user_role() = 'apoderado'
      and (
        alumno_id is null
        or public.current_user_alumno_id() is null
        or alumno_id = public.current_user_alumno_id()
      )
    )
  );

create policy "notifications_insert_rbac" on public.notifications
  for insert with check (
    public.current_user_role() = 'superadmin'
    or (
      tenant_id = public.current_user_tenant_id()
      and public.current_user_role() in ('admin', 'chofer', 'asistente', 'apoderado')
    )
  );

create policy "notifications_update_rbac" on public.notifications
  for update using (
    public.current_user_role() = 'superadmin'
    or (
      tenant_id = public.current_user_tenant_id()
      and public.current_user_role() in ('admin', 'chofer', 'asistente')
    )
    or (
      tenant_id = public.current_user_tenant_id()
      and public.current_user_role() = 'apoderado'
      and (
        alumno_id is null
        or public.current_user_alumno_id() is null
        or alumno_id = public.current_user_alumno_id()
      )
    )
  )
  with check (
    public.current_user_role() = 'superadmin'
    or (
      tenant_id = public.current_user_tenant_id()
      and public.current_user_role() in ('admin', 'chofer', 'asistente', 'apoderado')
    )
  );

create policy "notifications_delete_rbac" on public.notifications
  for delete using (
    public.current_user_role() = 'superadmin'
    or (
      tenant_id = public.current_user_tenant_id()
      and public.current_user_role() in ('admin', 'chofer', 'asistente')
    )
  );

notify pgrst, 'reload schema';
