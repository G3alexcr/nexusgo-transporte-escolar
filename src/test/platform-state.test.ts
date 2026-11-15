import { describe, expect, it } from 'vitest';
import { initialPlatformState, platformReducer } from '@/lib/platform-state';
describe('Nexus Go mock flows',()=>{
 for(const role of ['Chofer / Conductor','Asistente de Buseta'] as const)it(`selects operational role ${role}`,()=>{expect(platformReducer(initialPlatformState,{type:'driverProfile',role,mode:'Empresa de transporte'}).driverProfile.role).toBe(role)});
 it('allows an independent conductor to register a monthly payment',()=>{const state=platformReducer(initialPlatformState,{type:'driverProfile',role:'Chofer / Conductor',mode:'Chofer Independiente'});const result=platformReducer(state,{type:'payment',id:'a2'});expect(result.payments['a2']?.status).toBe('Pagado');expect(result.payments['a4']?.status).toBe('Atrasado')});
 it('does not expose collection actions for company conductors',()=>{expect(platformReducer(initialPlatformState,{type:'payment',id:'a2'})).toBe(initialPlatformState)});
 it('does not expose collection actions for assistants',()=>{const state=platformReducer(initialPlatformState,{type:'driverProfile',role:'Asistente de Buseta',mode:'Chofer Independiente'});expect(platformReducer(state,{type:'payment',id:'a2'})).toBe(state)});
 it('records a mock collection reminder for an unpaid monthly fee',()=>{const state=platformReducer(initialPlatformState,{type:'driverProfile',role:'Chofer / Conductor',mode:'Chofer Independiente'});expect(platformReducer(state,{type:'paymentReminder',id:'a2'}).payments['a2']?.reminders).toBe(1)});
 it('lets assistants mark attendance with a single action during the route',()=>{const profile=platformReducer(initialPlatformState,{type:'driverProfile',role:'Asistente de Buseta',mode:'Empresa de transporte'});const start=platformReducer(profile,{type:'start',name:'Mañana Norte'});expect(platformReducer(start,{type:'attendance',id:'a6',status:'A bordo',time:'07:35'}).attendance['a6']?.status).toBe('A bordo')});
 it('does not mark attendance before starting a route',()=>{expect(platformReducer(initialPlatformState,{type:'attendance',id:'a1',status:'Ausente',time:'07:35'})).toBe(initialPlatformState)});
 it('records boarding time and counts students aboard',()=>{const start=platformReducer(initialPlatformState,{type:'start',name:'Mañana Norte'});const result=platformReducer(start,{type:'attendance',id:'a6',status:'A bordo',time:'07:35'});expect(result.attendance['a6']).toEqual({status:'A bordo',subida:'07:35',bajada:'—'});expect(result.vans[0]?.aBordo).toBe(3)});
 it('records delivery and decreases occupancy',()=>{const start=platformReducer(initialPlatformState,{type:'start',name:'Mañana Norte'});const result=platformReducer(start,{type:'attendance',id:'a1',status:'Entregado',time:'07:40'});expect(result.attendance['a1']).toEqual({status:'Entregado',subida:'07:12',bajada:'07:40'});expect(result.vans[0]?.aBordo).toBe(1)});
 it('marks absence without boarding or delivery times',()=>{const start=platformReducer(initialPlatformState,{type:'start',name:'Mañana Norte'});expect(platformReducer(start,{type:'attendance',id:'a1',status:'Ausente',time:'07:35'}).attendance['a1']).toEqual({status:'Ausente',subida:'—',bajada:'—'})});
 it('reassigns only the selected active buseta',()=>{const result=platformReducer(initialPlatformState,{type:'transfer',vanId:'v1',driver:'Ana Vergara'});expect(result.vans[0]?.chofer).toBe('Ana Vergara');expect(result.vans[1]?.chofer).toBe(initialPlatformState.vans[1]?.chofer)});
 for(const mode of ['No va hoy','Solo ida','Solo vuelta'] as const)it(`saves ${mode} on the selected calendar day`,()=>{expect(platformReducer(initialPlatformState,{type:'absence',date:'2026-10-20',mode}).absences['2026-10-20']).toBe(mode)});
 it('shares sent notices in the app state',()=>{expect(platformReducer(initialPlatformState,{type:'notice',message:'Buseta aproximándose',time:'07:35'}).notices[0]?.message).toBe('Buseta aproximándose')});
 it('switches active tenant in multitenant mode',()=>{
   const result = platformReducer(initialPlatformState, { type: 'switchTenant', id: 'tenant-heredia-sol' });
   expect(result.currentTenantId).toBe('tenant-heredia-sol');
   expect(result.company).toBe('Busetas del Sol Heredia S.A.');
 });
 it('registers a new tenant affiliation',()=>{
   const newTenant = {
     id: 'tenant-test',
     slug: 'belen-escolar',
     nombre: 'Transportes Belén Escolar',
     tipo: 'Empresa de Transporte' as const,
     cedulaJuridica: '3-101-998877',
     contactoTitular: 'Carlos Alvarado',
     telefono: '8877-6655',
     email: 'info@belenescolar.cr',
     provincia: 'Heredia',
     canton: 'Belén',
     permisoCtp: 'CTP-BEL-001',
     plan: 'Profesional (4-10 busetas)' as const,
     montoMensualSaaS: 85000,
     estado: 'Activo' as const,
     fechaRegistro: '13/11/2026',
     busetasActivas: 4,
     estudiantesTotales: 68,
   };
   const result = platformReducer(initialPlatformState, { type: 'addTenant', tenant: newTenant });
   expect(result.tenants.some(t => t.id === 'tenant-test')).toBe(true);
 });
 it('validates CTP, Dekra RTV and INS requirements in busetas fleet',()=>{
   expect(initialPlatformState.vans.length).toBeGreaterThan(0);
   const van = initialPlatformState.vans[0]!;
   expect(van.permisoCtp).toMatch(/^CTP-/);
   expect(van.dekraRtv).toBeDefined();
   expect(van.polizaIns).toMatch(/^INS-/);
   expect(van.cinturones).toBe(true);
   expect(van.rotuloEscolar).toBe(true);
   expect(van.extintorBotiquin).toBe(true);
   expect(van.fotoBuseta).toBeDefined();
   expect(van.fotoPermisoCtp).toBeDefined();
   expect(van.fotoMarchamo).toBeDefined();
 });
 it('manages digital student transport contracts under CTP regulations',()=>{
   expect(initialPlatformState.contracts['a1']?.signed).toBe(true);
   expect(initialPlatformState.contracts['a3']?.signed).toBe(false);

   const signedState = platformReducer(initialPlatformState, {
     type: 'signStudentContract',
     alumnoId: 'a3',
     signedBy: 'Fernanda Solís Mora',
     cedulaApoderado: '1-0844-0129',
   });

   expect(signedState.contracts['a3']?.signed).toBe(true);
   expect(signedState.contracts['a3']?.signedBy).toBe('Fernanda Solís Mora');
   expect(signedState.contracts['a3']?.folioDigital).toMatch(/^CTP-CTR-2026/);
   expect(signedState.notifications.some(n => n.type === 'contract')).toBe(true);

   const resetState = platformReducer(signedState, {
     type: 'resetStudentContract',
     alumnoId: 'a3',
   });
   expect(resetState.contracts['a3']?.signed).toBe(false);
  });
  it("generates an official CTP passenger manifest for road transit police checkpoints", async () => {
    const { generatePassengerManifestSvg } = await import("../lib/document-samples");
    const van = initialPlatformState.vans[0]!;
    const alumnos = initialPlatformState.alumnos.filter(a => a.colegio === van.colegio);
    const svgData = generatePassengerManifestSvg("CTP-MAN-2026-991", van, alumnos, "14/11/2026 06:45 AM");
    expect(svgData).toContain("data:image/svg+xml");
    const decoded = decodeURIComponent(svgData);
    expect(decoded).toContain("CONSEJO DE TRANSPORTE PÚBLICO (CTP)");
    expect(decoded).toContain("MANIFIESTO OFICIAL DE ESTUDIANTES TRANSPORTADOS");
    expect(decoded).toContain(van.patente);
    expect(decoded).toContain(van.chofer);
  });
  it("manages offline attendance queuing and automatic synchronization", () => {
    expect(initialPlatformState.isOfflineMode).toBe(false);
    expect(initialPlatformState.offlineQueue).toHaveLength(0);

    const offlineState = platformReducer(initialPlatformState, { type: "setOfflineMode", enabled: true });
    expect(offlineState.isOfflineMode).toBe(true);

    const queuedState = platformReducer(offlineState, {
      type: "queueOfflineAttendance",
      item: {
        id: "off-1",
        type: "attendance",
        alumnoId: "a1",
        alumnoNombre: "Sofía Rojas",
        status: "A bordo",
        time: "07:15",
        timestamp: Date.now(),
      },
    });
    expect(queuedState.offlineQueue).toHaveLength(1);
    expect(queuedState.attendance["a1"]?.status).toBe("A bordo");

    const syncedState = platformReducer(queuedState, { type: "syncOfflineQueue" });
    expect(syncedState.isOfflineMode).toBe(false);
    expect(syncedState.offlineQueue).toHaveLength(0);
    expect(syncedState.notifications.some(n => n.id.startsWith("offline-sync"))).toBe(true);
  });

  it("hydrates offline queue from IndexedDB and preserves it during remote hydration", () => {
    const pendingItem = {
      id: "off-idb-1",
      type: "attendance" as const,
      alumnoId: "a1",
      alumnoNombre: "Sofía Rojas",
      status: "Entregado" as const,
      time: "14:20",
      timestamp: Date.now(),
    };

    const hydratedOffline = platformReducer(initialPlatformState, {
      type: "hydrateOfflineQueue",
      items: [pendingItem],
    });
    expect(hydratedOffline.offlineQueue).toHaveLength(1);
    expect(hydratedOffline.attendance["a1"]?.status).toBe("Entregado");

    const afterRemote = platformReducer(hydratedOffline, {
      type: "hydrateFromRemote",
      state: {
        attendance: {
          a1: { status: "Pendiente", subida: "—", bajada: "—" },
        },
      },
    });
    expect(afterRemote.offlineQueue).toHaveLength(1);
    expect(afterRemote.attendance["a1"]?.status).toBe("Entregado");
  });
});
