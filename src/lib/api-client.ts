// Universal API Client & Backend Layer
// Connected to Supabase PostgreSQL for real persistence across routes, drivers, students, attendance, payments and notifications.

import type { Van, Chofer, Alumno, Viaje } from './data';
import type { AttendanceStatus, PushNotification } from './platform-state';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

export type BackendProvider = 'mock' | 'supabase' | 'rest';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

class ApiClientService {
  private provider: BackendProvider = 'supabase';
  private baseUrl: string = '';

  constructor() {
    if (typeof import.meta !== 'undefined') {
      const envProvider = import.meta.env?.['VITE_BACKEND_PROVIDER'] as BackendProvider | undefined;
      if (envProvider) {
        this.provider = envProvider;
      } else if (isSupabaseConfigured()) {
        this.provider = 'supabase';
      }
      this.baseUrl = (import.meta.env?.['VITE_API_BASE_URL'] as string | undefined) || '/api';
    }
  }

  public getProvider(): BackendProvider {
    return this.provider;
  }

  public setProvider(provider: BackendProvider, url?: string) {
    this.provider = provider;
    if (url) this.baseUrl = url;
  }

  private getClient() {
    if (this.provider !== 'supabase') return null;
    return getSupabaseClient();
  }

  // --- RUTAS / FLEET ---
  public routes = {
    getAll: async (tenantId = 'tenant-valle-cr'): Promise<ApiResponse<Van[]>> => {
      const supabase = this.getClient();
      if (!supabase) return { data: null, error: 'Supabase no configurado', status: 503 };
      const { data, error } = await supabase.from('vans').select('data').eq('tenant_id', tenantId);
      if (error) return { data: null, error: error.message, status: 500 };
      return { data: (data ?? []).map((r) => r.data as Van), error: null, status: 200 };
    },
    create: async (route: Van, tenantId = 'tenant-valle-cr'): Promise<ApiResponse<Van>> => {
      const supabase = this.getClient();
      if (!supabase) return { data: null, error: 'Supabase no configurado', status: 503 };
      const { error } = await supabase.from('vans').upsert({
        id: route.id,
        tenant_id: tenantId,
        patente: route.patente,
        chofer: route.chofer,
        ruta: route.ruta,
        colegio: route.colegio,
        horario: route.horario,
        a_bordo: route.aBordo,
        cap: route.cap,
        estado: route.estado,
        data: route,
        updated_at: new Date().toISOString(),
      });
      if (error) return { data: null, error: error.message, status: 500 };
      return { data: route, error: null, status: 201 };
    },
    update: async (id: string, route: Partial<Van>): Promise<ApiResponse<Van>> => {
      const supabase = this.getClient();
      if (!supabase) return { data: null, error: 'Supabase no configurado', status: 503 };
      const { data: existing, error: fetchErr } = await supabase
        .from('vans')
        .select('data')
        .eq('id', id)
        .single();
      if (fetchErr || !existing) return { data: null, error: fetchErr?.message ?? 'No encontrado', status: 404 };
      const merged = { ...(existing.data as Van), ...route, id };
      const { error } = await supabase
        .from('vans')
        .update({
          patente: merged.patente,
          chofer: merged.chofer,
          ruta: merged.ruta,
          colegio: merged.colegio,
          horario: merged.horario,
          a_bordo: merged.aBordo,
          cap: merged.cap,
          estado: merged.estado,
          data: merged,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) return { data: null, error: error.message, status: 500 };
      return { data: merged, error: null, status: 200 };
    },
    delete: async (id: string): Promise<ApiResponse<boolean>> => {
      const supabase = this.getClient();
      if (!supabase) return { data: false, error: 'Supabase no configurado', status: 503 };
      const { error } = await supabase.from('vans').delete().eq('id', id);
      if (error) return { data: false, error: error.message, status: 500 };
      return { data: true, error: null, status: 200 };
    },
  };

  // --- CHOFERES ---
  public drivers = {
    getAll: async (tenantId = 'tenant-valle-cr'): Promise<ApiResponse<Chofer[]>> => {
      const supabase = this.getClient();
      if (!supabase) return { data: null, error: 'Supabase no configurado', status: 503 };
      const { data, error } = await supabase.from('choferes').select('data').eq('tenant_id', tenantId);
      if (error) return { data: null, error: error.message, status: 500 };
      return { data: (data ?? []).map((r) => r.data as Chofer), error: null, status: 200 };
    },
    create: async (chofer: Chofer, tenantId = 'tenant-valle-cr'): Promise<ApiResponse<Chofer>> => {
      const supabase = this.getClient();
      if (!supabase) return { data: null, error: 'Supabase no configurado', status: 503 };
      const { error } = await supabase.from('choferes').upsert({
        id: chofer.id,
        tenant_id: tenantId,
        nombre: chofer.nombre,
        telefono: chofer.telefono,
        estado: chofer.vinculo,
        data: chofer,
        updated_at: new Date().toISOString(),
      });
      if (error) return { data: null, error: error.message, status: 500 };
      return { data: chofer, error: null, status: 201 };
    },
    update: async (id: string, chofer: Partial<Chofer>): Promise<ApiResponse<Chofer>> => {
      const supabase = this.getClient();
      if (!supabase) return { data: null, error: 'Supabase no configurado', status: 503 };
      const { data: existing, error: fetchErr } = await supabase
        .from('choferes')
        .select('data')
        .eq('id', id)
        .single();
      if (fetchErr || !existing) return { data: null, error: fetchErr?.message ?? 'No encontrado', status: 404 };
      const merged = { ...(existing.data as Chofer), ...chofer, id };
      const { error } = await supabase
        .from('choferes')
        .update({
          nombre: merged.nombre,
          telefono: merged.telefono,
          estado: merged.vinculo,
          data: merged,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) return { data: null, error: error.message, status: 500 };
      return { data: merged, error: null, status: 200 };
    },
    delete: async (id: string): Promise<ApiResponse<boolean>> => {
      const supabase = this.getClient();
      if (!supabase) return { data: false, error: 'Supabase no configurado', status: 503 };
      const { error } = await supabase.from('choferes').delete().eq('id', id);
      if (error) return { data: false, error: error.message, status: 500 };
      return { data: true, error: null, status: 200 };
    },
  };

  // --- ESTUDIANTES / ALUMNOS ---
  public students = {
    getAll: async (tenantId = 'tenant-valle-cr'): Promise<ApiResponse<Alumno[]>> => {
      const supabase = this.getClient();
      if (!supabase) return { data: null, error: 'Supabase no configurado', status: 503 };
      const { data, error } = await supabase.from('alumnos').select('data').eq('tenant_id', tenantId);
      if (error) return { data: null, error: error.message, status: 500 };
      return { data: (data ?? []).map((r) => r.data as Alumno), error: null, status: 200 };
    },
    create: async (alumno: Alumno, tenantId = 'tenant-valle-cr'): Promise<ApiResponse<Alumno>> => {
      const supabase = this.getClient();
      if (!supabase) return { data: null, error: 'Supabase no configurado', status: 503 };
      const { error } = await supabase.from('alumnos').upsert({
        id: alumno.id,
        tenant_id: tenantId,
        nombre: alumno.nombre,
        colegio: alumno.colegio,
        curso: alumno.curso,
        apoderado: alumno.apoderado,
        telefono_apoderado: alumno.telefonoApoderado,
        direccion: alumno.direccion,
        pago: alumno.pago,
        monto: alumno.monto,
        data: alumno,
        updated_at: new Date().toISOString(),
      });
      if (error) return { data: null, error: error.message, status: 500 };
      return { data: alumno, error: null, status: 201 };
    },
    update: async (id: string, alumno: Partial<Alumno>): Promise<ApiResponse<Alumno>> => {
      const supabase = this.getClient();
      if (!supabase) return { data: null, error: 'Supabase no configurado', status: 503 };
      const { data: existing, error: fetchErr } = await supabase
        .from('alumnos')
        .select('data')
        .eq('id', id)
        .single();
      if (fetchErr || !existing) return { data: null, error: fetchErr?.message ?? 'No encontrado', status: 404 };
      const merged = { ...(existing.data as Alumno), ...alumno, id };
      const { error } = await supabase
        .from('alumnos')
        .update({
          nombre: merged.nombre,
          colegio: merged.colegio,
          curso: merged.curso,
          apoderado: merged.apoderado,
          telefono_apoderado: merged.telefonoApoderado,
          direccion: merged.direccion,
          pago: merged.pago,
          monto: merged.monto,
          data: merged,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) return { data: null, error: error.message, status: 500 };
      return { data: merged, error: null, status: 200 };
    },
    delete: async (id: string): Promise<ApiResponse<boolean>> => {
      const supabase = this.getClient();
      if (!supabase) return { data: false, error: 'Supabase no configurado', status: 503 };
      const { error } = await supabase.from('alumnos').delete().eq('id', id);
      if (error) return { data: false, error: error.message, status: 500 };
      return { data: true, error: null, status: 200 };
    },
  };

  // --- VIAJES ---
  public trips = {
    getAll: async (tenantId = 'tenant-valle-cr'): Promise<ApiResponse<Viaje[]>> => {
      const supabase = this.getClient();
      if (!supabase) return { data: null, error: 'Supabase no configurado', status: 503 };
      const { data, error } = await supabase
        .from('viajes')
        .select('id, fecha, ruta, patente, inicio, fin, desvio, estado')
        .eq('tenant_id', tenantId);
      if (error) return { data: null, error: error.message, status: 500 };
      return { data: (data ?? []) as Viaje[], error: null, status: 200 };
    },
  };

  // --- ASISTENCIA & CHECK-IN QR ---
  public attendance = {
    recordCheckIn: async (
      studentId: string,
      status: AttendanceStatus,
      time: string,
      tenantId = 'tenant-valle-cr',
    ): Promise<ApiResponse<boolean>> => {
      const supabase = this.getClient();
      if (!supabase) return { data: false, error: 'Supabase no configurado', status: 503 };
      const { error } = await supabase.from('attendance').upsert(
        {
          tenant_id: tenantId,
          alumno_id: studentId,
          status,
          subida: status === 'A bordo' ? time : '—',
          bajada: status === 'Entregado' ? time : '—',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'tenant_id,alumno_id' },
      );
      if (error) return { data: false, error: error.message, status: 500 };
      return { data: true, error: null, status: 200 };
    },
    reportAbsence: async (
      date: string,
      mode: string,
      _studentId: string,
      tenantId = 'tenant-valle-cr',
    ): Promise<ApiResponse<boolean>> => {
      const supabase = this.getClient();
      if (!supabase) return { data: false, error: 'Supabase no configurado', status: 503 };
      const { error } = await supabase.from('absences').upsert(
        {
          tenant_id: tenantId,
          absence_date: date,
          mode,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'tenant_id,absence_date' },
      );
      if (error) return { data: false, error: error.message, status: 500 };
      return { data: true, error: null, status: 200 };
    },
  };

  // --- PAGOS & RECAUDACIÓN ---
  public payments = {
    recordPayment: async (
      studentId: string,
      amount: number,
      method: string,
      tenantId = 'tenant-valle-cr',
    ): Promise<ApiResponse<boolean>> => {
      const supabase = this.getClient();
      if (!supabase) return { data: false, error: 'Supabase no configurado', status: 503 };
      const { error } = await supabase.from('payments').upsert(
        {
          tenant_id: tenantId,
          alumno_id: studentId,
          status: 'Pagado',
          banco: method,
          monto_reportado: amount,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'tenant_id,alumno_id' },
      );
      if (error) return { data: false, error: error.message, status: 500 };
      return { data: true, error: null, status: 200 };
    },
    sendReminder: async (studentId: string, tenantId = 'tenant-valle-cr'): Promise<ApiResponse<boolean>> => {
      const supabase = this.getClient();
      if (!supabase) return { data: false, error: 'Supabase no configurado', status: 503 };
      const { data: existing } = await supabase
        .from('payments')
        .select('reminders')
        .eq('tenant_id', tenantId)
        .eq('alumno_id', studentId)
        .maybeSingle();
      const nextCount = ((existing?.reminders as number | undefined) ?? 0) + 1;
      const { error } = await supabase
        .from('payments')
        .update({ reminders: nextCount, updated_at: new Date().toISOString() })
        .eq('tenant_id', tenantId)
        .eq('alumno_id', studentId);
      if (error) return { data: false, error: error.message, status: 500 };
      return { data: true, error: null, status: 200 };
    },
  };

  // --- NOTIFICACIONES PUSH & SOS ---
  public notifications = {
    sendPush: async (notification: PushNotification, tenantId = 'tenant-valle-cr'): Promise<ApiResponse<boolean>> => {
      const supabase = this.getClient();
      if (!supabase) return { data: false, error: 'Supabase no configurado', status: 503 };
      const { error } = await supabase.from('notifications').upsert({
        id: notification.id,
        tenant_id: tenantId,
        title: notification.title,
        body: notification.body,
        time: notification.time,
        type: notification.type,
        read: notification.read,
      });
      if (error) return { data: false, error: error.message, status: 500 };
      return { data: true, error: null, status: 200 };
    },
    broadcastSos: async (
      message: string,
      vanId: string,
      tenantId: string,
    ): Promise<ApiResponse<boolean>> => {
      const supabase = this.getClient();
      if (!supabase) return { data: false, error: 'Supabase no configurado', status: 503 };
      const { error } = await supabase.from('notifications').upsert({
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        title: `Alerta SOS (${vanId})`,
        body: message,
        time: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
        type: 'sos',
        read: false,
      });
      if (error) return { data: false, error: error.message, status: 500 };
      return { data: true, error: null, status: 200 };
    },
  };
}

export const api = new ApiClientService();
