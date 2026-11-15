-- LinkBus Costa Rica - Supabase Storage Bucket & RLS Policies

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'linkbus-files',
  'linkbus-files',
  true,
  10485760, -- 10 MB max per file
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'application/pdf']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 10485760;

-- Lectura pública para mostrar imágenes, comprobantes y firmas en <img> / contratos
drop policy if exists "linkbus_files_public_read" on storage.objects;
create policy "linkbus_files_public_read" on storage.objects
  for select using (bucket_id = 'linkbus-files');

-- Usuarios autenticados pueden subir, actualizar y eliminar archivos en linkbus-files
drop policy if exists "linkbus_files_auth_insert" on storage.objects;
create policy "linkbus_files_auth_insert" on storage.objects
  for insert with check (bucket_id = 'linkbus-files' and auth.role() = 'authenticated');

drop policy if exists "linkbus_files_auth_update" on storage.objects;
create policy "linkbus_files_auth_update" on storage.objects
  for update using (bucket_id = 'linkbus-files' and auth.role() = 'authenticated');

drop policy if exists "linkbus_files_auth_delete" on storage.objects;
create policy "linkbus_files_auth_delete" on storage.objects
  for delete using (bucket_id = 'linkbus-files' and auth.role() = 'authenticated');
