import type { SupabaseClient } from '@supabase/supabase-js';
import type { Alumno, Chofer, Colegio, Tenant, Van, Viaje } from './data';
import type {
  AbsenceMode,
  Attendance,
  AuthorizedPerson,
  MonthlyPayment,
  PlatformAction,
  PlatformState,
  PreOpInspection,
  PushNotification,
  StudentContract,
} from './platform-state';
import { getSupabaseClient } from './supabase';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string | undefined | null): value is string {
  return Boolean(value && UUID_REGEX.test(value));
}

function ensureUuid(value: string | undefined | null): string {
  return isUuid(value) ? value : crypto.randomUUID();
}

function toTenantRow(t: Tenant) {
  return {
    id: t.id,
    nombre: t.nombre,
    slug: t.slug,
    provincia: t.provincia ?? null,
    telefono: t.telefono ?? null,
    sinpe_numero: null,
    plan: t.plan ?? null,
    activa: t.estado === 'Activo',
    data: t,
    updated_at: new Date().toISOString(),
  };
}

function toVanRow(v: Van, tenantId: string) {
  return {
    id: v.id,
    tenant_id: tenantId,
    patente: v.patente,
    chofer: v.chofer,
    ruta: v.ruta,
    colegio: v.colegio,
    horario: v.horario,
    a_bordo: v.aBordo,
    cap: v.cap,
    estado: v.estado,
    data: v,
    updated_at: new Date().toISOString(),
  };
}

function toChoferRow(c: Chofer, tenantId: string) {
  return {
    id: c.id,
    tenant_id: tenantId,
    nombre: c.nombre,
    telefono: c.telefono ?? null,
    estado: c.vinculo ?? null,
    data: c,
    updated_at: new Date().toISOString(),
  };
}

function toColegioRow(c: Colegio, tenantId: string) {
  return {
    id: c.id,
    tenant_id: tenantId,
    nombre: c.nombre,
    canton: c.canton ?? null,
    data: c,
    updated_at: new Date().toISOString(),
  };
}

function toAlumnoRow(a: Alumno, tenantId: string) {
  return {
    id: a.id,
    tenant_id: tenantId,
    nombre: a.nombre,
    colegio: a.colegio,
    curso: a.curso ?? null,
    apoderado: a.apoderado,
    telefono_apoderado: a.telefonoApoderado ?? null,
    direccion: a.direccion ?? null,
    pago: a.pago,
    monto: a.monto,
    data: a,
    updated_at: new Date().toISOString(),
  };
}

function toPaymentRow(alumnoId: string, p: MonthlyPayment, tenantId: string) {
  return {
    tenant_id: tenantId,
    alumno_id: alumnoId,
    status: p.status,
    reminders: p.reminders,
    banco: p.banco ?? null,
    comprobante_ref: p.comprobanteRef ?? null,
    comprobante_foto: p.comprobanteFoto ?? null,
    fecha_reporte: p.fechaReporte ?? null,
    monto_reportado: p.montoReportado ?? null,
    aprobado_por: p.aprobadoPor ?? null,
    fecha_aprobado: p.fechaAprobado ?? null,
    recibo_numero: p.reciboNumero ?? null,
    motivo_rechazo: p.motivoRechazo ?? null,
    updated_at: new Date().toISOString(),
  };
}

function toContractRow(alumnoId: string, c: StudentContract, tenantId: string) {
  return {
    tenant_id: tenantId,
    alumno_id: alumnoId,
    signed: c.signed,
    signed_at: c.signedAt ?? null,
    signed_by: c.signedBy ?? null,
    cedula_apoderado: c.cedulaApoderado ?? null,
    signature_data_url: c.signatureDataUrl ?? null,
    folio_digital: c.folioDigital,
    terminos_aceptados: c.terminosAceptados,
    updated_at: new Date().toISOString(),
  };
}

export async function seedInitialDatabase(supabase: SupabaseClient, state: PlatformState): Promise<void> {
  // Generar UUIDs reales para todos los registros y mantener integridad referencial
  const tenantUuidMap = new Map<string, string>();
  const tenantsWithUuid: Tenant[] = state.tenants.map((t) => {
    const id = ensureUuid(t.id);
    tenantUuidMap.set(t.id, id);
    return { ...t, id };
  });

  const activeTenantId = tenantUuidMap.get(state.currentTenantId) ?? tenantsWithUuid[0]?.id ?? crypto.randomUUID();

  const colegiosWithUuid: Colegio[] = state.colegios.map((c) => ({ ...c, id: ensureUuid(c.id) }));
  const choferesWithUuid: Chofer[] = state.choferes.map((c) => ({ ...c, id: ensureUuid(c.id) }));
  const vansWithUuid: Van[] = state.vans.map((v) => ({ ...v, id: ensureUuid(v.id) }));
  const viajesWithUuid: Viaje[] = state.viajes.map((v) => ({ ...v, id: ensureUuid(v.id) }));

  const alumnoUuidMap = new Map<string, string>();
  const alumnosWithUuid: Alumno[] = state.alumnos.map((a) => {
    const id = ensureUuid(a.id);
    alumnoUuidMap.set(a.id, id);
    return { ...a, id };
  });

  const { error: tErr } = await supabase.from('tenants').upsert(tenantsWithUuid.map(toTenantRow), { onConflict: 'id' });
  if (tErr) throw new Error(`linkbus_tenants: ${tErr.message}`);

  const results = await Promise.all([
    supabase.from('colegios').upsert(colegiosWithUuid.map((c) => toColegioRow(c, activeTenantId)), { onConflict: 'id' }),
    supabase.from('choferes').upsert(choferesWithUuid.map((c) => toChoferRow(c, activeTenantId)), { onConflict: 'id' }),
    supabase.from('vans').upsert(vansWithUuid.map((v) => toVanRow(v, activeTenantId)), { onConflict: 'id' }),
    supabase.from('alumnos').upsert(alumnosWithUuid.map((a) => toAlumnoRow(a, activeTenantId)), { onConflict: 'id' }),
    supabase.from('viajes').upsert(
      viajesWithUuid.map((v) => ({ ...v, tenant_id: activeTenantId, updated_at: new Date().toISOString() })),
      { onConflict: 'id' },
    ),
    supabase.from('inspections').upsert(
      Object.entries(state.inspections).map(([vanPlaca, ins]) => ({
        tenant_id: activeTenantId,
        van_placa: vanPlaca,
        fecha_hora: ins.fechaHora,
        chofer_nombre: ins.choferNombre,
        resultado: ins.resultado,
        folio_digital: ins.folioDigital,
        data: ins,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'tenant_id,van_placa' },
    ),
    supabase.from('absences').upsert(
      Object.entries(state.absences).map(([absenceDate, mode]) => ({
        tenant_id: activeTenantId,
        absence_date: absenceDate,
        mode,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'tenant_id,absence_date' },
    ),
    supabase.from('notifications').upsert(
      state.notifications.map((n) => ({
        id: ensureUuid(n.id),
        tenant_id: activeTenantId,
        alumno_id: n.alumnoId && isUuid(n.alumnoId) ? n.alumnoId : null,
        title: n.title,
        body: n.body,
        time: n.time,
        type: n.type,
        read: n.read,
      })),
      { onConflict: 'id' },
    ),
    supabase.from('app_settings').upsert(
      {
        tenant_id: activeTenantId,
        company: state.company,
        route_name: state.routeName,
        active: state.active,
        driver_profile: state.driverProfile,
        parent_profile: state.parentProfile,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'tenant_id' },
    ),
  ]);

  for (const r of results) {
    if (r.error) throw new Error(r.error.message);
  }

  // Tablas con FK hacia linkbus_alumnos
  const studentRelResults = await Promise.all([
    supabase.from('attendance').upsert(
      Object.entries(state.attendance).map(([oldId, att]) => ({
        tenant_id: activeTenantId,
        alumno_id: alumnoUuidMap.get(oldId) ?? ensureUuid(oldId),
        status: att.status,
        subida: att.subida,
        bajada: att.bajada,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'tenant_id,alumno_id' },
    ),
    supabase.from('payments').upsert(
      Object.entries(state.payments).map(([oldId, p]) =>
        toPaymentRow(alumnoUuidMap.get(oldId) ?? ensureUuid(oldId), p, activeTenantId),
      ),
      { onConflict: 'tenant_id,alumno_id' },
    ),
    supabase.from('contracts').upsert(
      Object.entries(state.contracts).map(([oldId, c]) => {
        const realAlumnoId = alumnoUuidMap.get(oldId) ?? ensureUuid(oldId);
        return toContractRow(realAlumnoId, { ...c, alumnoId: realAlumnoId }, activeTenantId);
      }),
      { onConflict: 'tenant_id,alumno_id' },
    ),
    supabase.from('authorized_persons').upsert(
      state.authorizedPersons.map((p) => ({
        id: ensureUuid(p.id),
        tenant_id: activeTenantId,
        alumno_id: alumnoUuidMap.get(p.alumnoId) ?? ensureUuid(p.alumnoId),
        nombre: p.nombre,
        parentesco: p.parentesco,
        cedula: p.cedula,
        telefono: p.telefono,
        estado: p.estado,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'id' },
    ),
  ]);

  for (const r of studentRelResults) {
    if (r.error) throw new Error(r.error.message);
  }
}

export async function loadPlatformStateFromSupabase(
  requestedTenantId: string,
): Promise<Partial<PlatformState> | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: tenantsRows, error: tenantsErr } = await supabase
    .from('tenants')
    .select('id, data');

  if (tenantsErr) {
    console.warn('[Nexus Go] Error consultando Supabase:', tenantsErr.message);
    return null;
  }

  const tenants = (tenantsRows ?? [])
    .map((r) => ({ ...(r.data as Tenant), id: r.id as string }))
    .sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER));
  const activeTenant = isUuid(requestedTenantId)
    ? tenants.find((t) => t.id === requestedTenantId) ?? tenants[0]
    : tenants[0];

  if (!activeTenant) {
    return { tenants: [] };
  }

  const tenantId = activeTenant.id;

  const [
    colegiosRes,
    choferesRes,
    vansRes,
    alumnosRes,
    viajesRes,
    attendanceRes,
    paymentsRes,
    contractsRes,
    inspectionsRes,
    absencesRes,
    notificationsRes,
    authorizedRes,
    noticesRes,
    settingsRes,
  ] = await Promise.all([
    supabase.from('colegios').select('id, data').eq('tenant_id', tenantId),
    supabase.from('choferes').select('id, data').eq('tenant_id', tenantId),
    supabase.from('vans').select('id, data').eq('tenant_id', tenantId),
    supabase.from('alumnos').select('id, data').eq('tenant_id', tenantId),
    supabase.from('viajes').select('id, fecha, ruta, patente, inicio, fin, desvio, estado').eq('tenant_id', tenantId),
    supabase.from('attendance').select('alumno_id, status, subida, bajada').eq('tenant_id', tenantId),
    supabase.from('payments').select('*').eq('tenant_id', tenantId),
    supabase.from('contracts').select('*').eq('tenant_id', tenantId),
    supabase.from('inspections').select('van_placa, data').eq('tenant_id', tenantId),
    supabase.from('absences').select('absence_date, mode').eq('tenant_id', tenantId),
    supabase.from('notifications').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
    supabase.from('authorized_persons').select('*').eq('tenant_id', tenantId),
    supabase.from('notices').select('id, message, time').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
    supabase.from('app_settings').select('*').eq('tenant_id', tenantId).maybeSingle(),
  ]);

  const choferes = (choferesRes.data ?? []).map((r) => ({ ...(r.data as Chofer), id: r.id as string }));
  const alumnos = (alumnosRes.data ?? []).map((r) => ({ ...(r.data as Alumno), id: r.id as string }));

  const attendance: Record<string, Attendance> = {};
  for (const r of attendanceRes.data ?? []) {
    attendance[r.alumno_id as string] = {
      status: r.status as Attendance['status'],
      subida: r.subida as string,
      bajada: r.bajada as string,
    };
  }

  const payments: Record<string, MonthlyPayment> = {};
  for (const r of paymentsRes.data ?? []) {
    payments[r.alumno_id as string] = {
      status: r.status as MonthlyPayment['status'],
      reminders: (r.reminders as number) ?? 0,
      banco: (r.banco as string | null) ?? undefined,
      comprobanteRef: (r.comprobante_ref as string | null) ?? undefined,
      comprobanteFoto: (r.comprobante_foto as string | null) ?? undefined,
      fechaReporte: (r.fecha_reporte as string | null) ?? undefined,
      montoReportado: (r.monto_reportado as number | null) ?? undefined,
      aprobadoPor: (r.aprobado_por as string | null) ?? undefined,
      fechaAprobado: (r.fecha_aprobado as string | null) ?? undefined,
      reciboNumero: (r.recibo_numero as string | null) ?? undefined,
      motivoRechazo: (r.motivo_rechazo as string | null) ?? undefined,
    };
  }

  const contracts: Record<string, StudentContract> = {};
  for (const r of contractsRes.data ?? []) {
    contracts[r.alumno_id as string] = {
      alumnoId: r.alumno_id as string,
      signed: Boolean(r.signed),
      signedAt: (r.signed_at as string | null) ?? undefined,
      signedBy: (r.signed_by as string | null) ?? undefined,
      cedulaApoderado: (r.cedula_apoderado as string | null) ?? undefined,
      signatureDataUrl: (r.signature_data_url as string | null) ?? undefined,
      folioDigital: r.folio_digital as string,
      terminosAceptados: Boolean(r.terminos_aceptados),
    };
  }

  const inspections: Record<string, PreOpInspection> = {};
  for (const r of inspectionsRes.data ?? []) {
    inspections[r.van_placa as string] = r.data as PreOpInspection;
  }

  const absences: Record<string, AbsenceMode> = {};
  for (const r of absencesRes.data ?? []) {
    absences[r.absence_date as string] = r.mode as AbsenceMode;
  }

  const patch: Partial<PlatformState> = {
    currentTenantId: tenantId,
    company: activeTenant.nombre,
    tenants,
    colegios: (colegiosRes.data ?? []).map((r) => ({ ...(r.data as Colegio), id: r.id as string })),
    choferes,
    vans: (vansRes.data ?? []).map((r) => ({ ...(r.data as Van), id: r.id as string })),
    alumnos,
    viajes: (viajesRes.data ?? []) as Viaje[],
    attendance,
    payments,
    contracts,
    inspections,
    absences,
    notifications: (notificationsRes.data ?? []).map((r) => ({
      id: r.id as string,
      title: r.title as string,
      body: r.body as string,
      time: r.time as string,
      type: r.type as PushNotification['type'],
      read: Boolean(r.read),
      alumnoId: (r.alumno_id as string | null) ?? undefined,
    })),
    authorizedPersons: (authorizedRes.data ?? []).map((r) => ({
      id: r.id as string,
      alumnoId: r.alumno_id as string,
      nombre: r.nombre as string,
      parentesco: r.parentesco as string,
      cedula: r.cedula as string,
      telefono: r.telefono as string,
      estado: r.estado as AuthorizedPerson['estado'],
    })),
    notices: (noticesRes.data ?? []).map((r) => ({
      id: r.id as string,
      message: r.message as string,
      time: r.time as string,
    })),
    selectedDriverId: choferes[0]?.id ?? '',
    selectedAlumnoId: alumnos[0]?.id ?? '',
  };

  if (settingsRes.data) {
    const s = settingsRes.data;
    patch.company = s.company as string;
    patch.routeName = s.route_name as string;
    patch.active = Boolean(s.active);
    patch.recordGpsRoutes = Boolean(s.record_gps_routes);
    if (s.driver_profile && Object.keys(s.driver_profile as object).length > 0) {
      patch.driverProfile = s.driver_profile as PlatformState['driverProfile'];
    }
    if (s.parent_profile && Object.keys(s.parent_profile as object).length > 0) {
      patch.parentProfile = s.parent_profile as PlatformState['parentProfile'];
    }
  }

  return patch;
}

export async function syncActionToSupabase(
  action: PlatformAction,
  nextState: PlatformState,
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const tenantId = nextState.currentTenantId;
  if (!isUuid(tenantId)) return;

  const syncSettings = async () => {
    await supabase.from('app_settings').upsert(
      {
        tenant_id: tenantId,
        company: nextState.company,
        route_name: nextState.routeName,
        active: nextState.active,
        driver_profile: nextState.driverProfile,
        parent_profile: nextState.parentProfile,
        record_gps_routes: Boolean(nextState.recordGpsRoutes),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'tenant_id' },
    );
  };

  try {
    switch (action.type) {
      case 'hydrateFromRemote':
      case 'setOfflineMode':
      case 'clearOfflineQueue':
      case 'selectDriver':
      case 'selectAlumno':
      case 'setSuperAdmin':
      case 'switchTenant':
        return;

      case 'attendance': {
        const att = nextState.attendance[action.id];
        if (att && isUuid(action.id)) {
          await supabase.from('attendance').upsert(
            {
              tenant_id: tenantId,
              alumno_id: action.id,
              status: att.status,
              subida: att.subida,
              bajada: att.bajada,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'tenant_id,alumno_id' },
          );
        }
        const firstVan = nextState.vans[0];
        if (firstVan && isUuid(firstVan.id)) {
          await supabase.from('vans').upsert(toVanRow(firstVan, tenantId), { onConflict: 'id' });
        }
        const latestAttNotif = nextState.notifications[0];
        if (latestAttNotif && latestAttNotif.type === 'attendance') {
          await supabase.from('notifications').upsert(
            {
              id: ensureUuid(latestAttNotif.id),
              tenant_id: tenantId,
              alumno_id: latestAttNotif.alumnoId && isUuid(latestAttNotif.alumnoId) ? latestAttNotif.alumnoId : null,
              title: latestAttNotif.title,
              body: latestAttNotif.body,
              time: latestAttNotif.time,
              type: latestAttNotif.type,
              read: latestAttNotif.read,
            },
            { onConflict: 'id' },
          );
        }
        return;
      }

      case 'syncOfflineQueue': {
        await supabase.from('attendance').upsert(
          Object.entries(nextState.attendance)
            .filter(([alumnoId]) => isUuid(alumnoId))
            .map(([alumnoId, att]) => ({
              tenant_id: tenantId,
              alumno_id: alumnoId,
              status: att.status,
              subida: att.subida,
              bajada: att.bajada,
              updated_at: new Date().toISOString(),
            })),
          { onConflict: 'tenant_id,alumno_id' },
        );
        const firstVan = nextState.vans[0];
        if (firstVan && isUuid(firstVan.id)) {
          await supabase.from('vans').upsert(toVanRow(firstVan, tenantId), { onConflict: 'id' });
        }
        const latestNotif = nextState.notifications[0];
        if (latestNotif) {
          await supabase.from('notifications').upsert(
            {
              id: ensureUuid(latestNotif.id),
              tenant_id: tenantId,
              alumno_id: latestNotif.alumnoId && isUuid(latestNotif.alumnoId) ? latestNotif.alumnoId : null,
              title: latestNotif.title,
              body: latestNotif.body,
              time: latestNotif.time,
              type: latestNotif.type,
              read: latestNotif.read,
            },
            { onConflict: 'id' },
          );
        }
        return;
      }

      case 'queueOfflineAttendance':
        return;

      case 'start':
      case 'finish':
      case 'company':
      case 'driverProfile':
      case 'updateParentProfile':
      case 'setRecordGpsRoutes':
        await syncSettings();
        return;

      case 'transfer':
      case 'addRoute':
      case 'updateRoute': {
        const van =
          action.type === 'transfer'
            ? nextState.vans.find((v) => v.id === action.vanId)
            : action.route;
        if (van) {
          await supabase.from('vans').upsert(toVanRow({ ...van, id: ensureUuid(van.id) }, tenantId), { onConflict: 'id' });
        }
        return;
      }
      case 'deleteRoute':
        if (isUuid(action.id)) await supabase.from('vans').delete().eq('id', action.id);
        return;

      case 'addChofer':
      case 'updateChofer':
        await supabase.from('choferes').upsert(toChoferRow({ ...action.chofer, id: ensureUuid(action.chofer.id) }, tenantId), { onConflict: 'id' });
        return;
      case 'deleteChofer':
        if (isUuid(action.id)) await supabase.from('choferes').delete().eq('id', action.id);
        return;

      case 'addColegio':
      case 'updateColegio':
        await supabase.from('colegios').upsert(toColegioRow({ ...action.colegio, id: ensureUuid(action.colegio.id) }, tenantId), { onConflict: 'id' });
        return;
      case 'deleteColegio':
        if (isUuid(action.id)) await supabase.from('colegios').delete().eq('id', action.id);
        return;

      case 'addAlumno':
      case 'updateAlumno': {
        const alumno = nextState.alumnos.find((a) => a.id === action.alumno.id) ?? action.alumno;
        const alumnoId = ensureUuid(alumno.id);
        await supabase.from('alumnos').upsert(toAlumnoRow({ ...alumno, id: alumnoId }, tenantId), { onConflict: 'id' });
        if (action.type === 'addAlumno') {
          const att = nextState.attendance[alumno.id];
          const pay = nextState.payments[alumno.id];
          const ctr = nextState.contracts[alumno.id];
          await Promise.all([
            att &&
              supabase.from('attendance').upsert(
                {
                  tenant_id: tenantId,
                  alumno_id: alumnoId,
                  status: att.status,
                  subida: att.subida,
                  bajada: att.bajada,
                },
                { onConflict: 'tenant_id,alumno_id' },
              ),
            pay &&
              supabase.from('payments').upsert(toPaymentRow(alumnoId, pay, tenantId), {
                onConflict: 'tenant_id,alumno_id',
              }),
            ctr &&
              supabase.from('contracts').upsert(toContractRow(alumnoId, { ...ctr, alumnoId }, tenantId), {
                onConflict: 'tenant_id,alumno_id',
              }),
          ]);
        }
        return;
      }
      case 'deleteAlumno':
        if (isUuid(action.id)) {
          await supabase.from('alumnos').delete().eq('id', action.id);
        }
        return;

      case 'absence':
        await supabase.from('absences').upsert(
          {
            tenant_id: tenantId,
            absence_date: action.date,
            mode: action.mode,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'tenant_id,absence_date' },
        );
        return;
      case 'removeAbsence':
        await supabase
          .from('absences')
          .delete()
          .eq('tenant_id', tenantId)
          .eq('absence_date', action.date);
        return;

      case 'payment':
      case 'paymentReminder':
      case 'reportSinpePayment':
      case 'approvePayment':
      case 'rejectPayment': {
        const targetId =
          action.type === 'payment' || action.type === 'paymentReminder'
            ? action.id
            : action.alumnoId;
        if (!isUuid(targetId)) return;
        const pay = nextState.payments[targetId];
        const alumno = nextState.alumnos.find((a) => a.id === targetId);
        await Promise.all([
          pay &&
            supabase.from('payments').upsert(toPaymentRow(targetId, pay, tenantId), {
              onConflict: 'tenant_id,alumno_id',
            }),
          alumno &&
            supabase.from('alumnos').upsert(toAlumnoRow(alumno, tenantId), { onConflict: 'id' }),
        ]);
        return;
      }

      case 'savePreOpInspection':
        await supabase.from('inspections').upsert(
          {
            tenant_id: tenantId,
            van_placa: action.inspection.vanPlaca,
            fecha_hora: action.inspection.fechaHora,
            chofer_nombre: action.inspection.choferNombre,
            resultado: action.inspection.resultado,
            folio_digital: action.inspection.folioDigital,
            data: action.inspection,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'tenant_id,van_placa' },
        );
        if (action.startRoute) {
          await syncSettings();
        }
        return;

      case 'signStudentContract':
      case 'resetStudentContract': {
        if (!isUuid(action.alumnoId)) return;
        const ctr = nextState.contracts[action.alumnoId];
        if (ctr) {
          await supabase.from('contracts').upsert(toContractRow(action.alumnoId, ctr, tenantId), {
            onConflict: 'tenant_id,alumno_id',
          });
        }
        return;
      }

      case 'notice': {
        const latestNotice = nextState.notices[0];
        const latestNotif = nextState.notifications[0];
        await Promise.all([
          latestNotice &&
            supabase.from('notices').upsert(
              {
                id: ensureUuid(latestNotice.id),
                tenant_id: tenantId,
                message: latestNotice.message,
                time: latestNotice.time,
              },
              { onConflict: 'id' },
            ),
          latestNotif &&
            supabase.from('notifications').upsert(
              {
                id: ensureUuid(latestNotif.id),
                tenant_id: tenantId,
                title: latestNotif.title,
                body: latestNotif.body,
                time: latestNotif.time,
                type: latestNotif.type,
                read: latestNotif.read,
              },
              { onConflict: 'id' },
            ),
        ]);
        return;
      }

      case 'addNotification': {
        const latest = nextState.notifications[0];
        if (latest) {
          await supabase.from('notifications').upsert(
            {
              id: ensureUuid(latest.id),
              tenant_id: tenantId,
              title: latest.title,
              body: latest.body,
              time: latest.time,
              type: latest.type,
              read: latest.read,
            },
            { onConflict: 'id' },
          );
        }
        return;
      }
      case 'markNotificationRead':
        if (isUuid(action.id)) {
          await supabase.from('notifications').update({ read: true }).eq('id', action.id);
        }
        return;
      case 'markAllNotificationsRead':
        await supabase.from('notifications').update({ read: true }).eq('tenant_id', tenantId);
        return;
      case 'clearNotifications':
        await supabase.from('notifications').delete().eq('tenant_id', tenantId);
        return;

      case 'addAuthorizedPerson':
        if (!isUuid(action.person.alumnoId)) return;
        await supabase.from('authorized_persons').upsert(
          {
            id: ensureUuid(action.person.id),
            tenant_id: tenantId,
            alumno_id: action.person.alumnoId,
            nombre: action.person.nombre,
            parentesco: action.person.parentesco,
            cedula: action.person.cedula,
            telefono: action.person.telefono,
            estado: action.person.estado,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' },
        );
        return;
      case 'deleteAuthorizedPerson':
        if (isUuid(action.id)) {
          await supabase.from('authorized_persons').delete().eq('id', action.id);
        }
        return;

      case 'updateVanLocation': {
        const van = nextState.vans.find((v) => v.id === action.vanId);
        if (van && isUuid(van.id)) {
          await supabase.from('vans').upsert(toVanRow(van, tenantId), { onConflict: 'id' });
        }
        return;
      }

      case 'addTenant':
      case 'updateTenant':
        await supabase.from('tenants').upsert(toTenantRow({ ...action.tenant, id: ensureUuid(action.tenant.id) }), { onConflict: 'id' });
        return;
      case 'deleteTenant':
        if (isUuid(action.id)) {
          await supabase.from('tenants').delete().eq('id', action.id);
        }
        return;
    }
  } catch (error) {
    console.warn('[Nexus Go] Error sincronizando con Supabase:', error);
  }
}
