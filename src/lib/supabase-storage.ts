import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

export type StorageFolder = "sinpe" | "fleet" | "contracts" | "avatars";

const BUCKET_NAME = "linkbus-files";

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Error leyendo archivo"));
    reader.readAsDataURL(blob);
  });
}

function getExtension(file: Blob, filename?: string): string {
  if (filename && filename.includes(".")) {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext && /^[a-z0-9]{1,5}$/.test(ext)) return ext;
  }
  const mime = file.type.toLowerCase();
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("svg")) return "svg";
  if (mime.includes("pdf")) return "pdf";
  return "jpg";
}

/**
 * Sube un File o Blob a Supabase Storage (`linkbus-files/<tenantId>/<folder>/<uuid>.<ext>`)
 * y retorna su URL pública para renderizar directamente en <img> o documentos.
 * Si Supabase no está configurado o falla la red, usa Data URL como respaldo local.
 */
export async function uploadFileToStorage(
  file: Blob,
  {
    tenantId,
    folder,
    filename,
  }: {
    tenantId?: string | undefined;
    folder: StorageFolder;
    filename?: string | undefined;
  },
): Promise<string> {
  if (!isSupabaseConfigured()) {
    return readAsDataUrl(file);
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return readAsDataUrl(file);
  }

  const safeTenant = (tenantId || "default").replace(/[^a-zA-Z0-9_-]/g, "");
  const ext = getExtension(file, filename);
  const path = `${safeTenant}/${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, file, {
    contentType: file.type || "image/png",
    upsert: false,
  });

  if (error) {
    console.warn("[Nexus Go Storage] Upload fallback to Data URL:", error.message);
    return readAsDataUrl(file);
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Exporta un <canvas> a PNG Blob y lo sube a Supabase Storage.
 */
export async function uploadCanvasToStorage(
  canvas: HTMLCanvasElement,
  options: { tenantId?: string | undefined; folder: StorageFolder; filename?: string | undefined },
): Promise<string> {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/png"),
  );

  if (!blob) {
    return canvas.toDataURL("image/png");
  }

  return uploadFileToStorage(blob, { ...options, filename: options.filename ?? "signature.png" });
}
