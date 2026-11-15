-- Renombrar tablas eliminando el prefijo innecesario linkbus_

alter table if exists public.linkbus_tenants rename to tenants;
alter table if exists public.linkbus_colegios rename to colegios;
alter table if exists public.linkbus_choferes rename to choferes;
alter table if exists public.linkbus_vans rename to vans;
alter table if exists public.linkbus_alumnos rename to alumnos;
alter table if exists public.linkbus_viajes rename to viajes;
alter table if exists public.linkbus_attendance rename to attendance;
alter table if exists public.linkbus_payments rename to payments;
alter table if exists public.linkbus_contracts rename to contracts;
alter table if exists public.linkbus_inspections rename to inspections;
alter table if exists public.linkbus_absences rename to absences;
alter table if exists public.linkbus_notifications rename to notifications;
alter table if exists public.linkbus_authorized_persons rename to authorized_persons;
alter table if exists public.linkbus_notices rename to notices;
alter table if exists public.linkbus_app_settings rename to app_settings;

notify pgrst, 'reload schema';
