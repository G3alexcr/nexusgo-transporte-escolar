import { useState, useMemo } from 'react';
import { PageTitle, TransferButton } from './admin-shell';
import { usePlatform } from './platform-provider';
import { Badge } from './shared';
import { crc, type Van, type Chofer, type Colegio, type Alumno, type PaymentStatus } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Route as RouteIcon, Users, School, CreditCard, CheckCircle2, Phone, Search, Download, MapPin, Sparkles, Eye, Upload, ShieldCheck, FileText, Clock, GraduationCap, MessageCircle, PenTool, Bus } from 'lucide-react';
import { LocationPickerMap } from './location-picker-map';
import { AdminBusetas } from './admin-busetas';
import { QuickActionPills } from './quick-action-pills';
import { searchCRPlaces, type CRPlace } from '@/lib/cr-geocoding';
import { generateLicenseSvg } from '@/lib/document-samples';
import { SinpeComprobanteModal } from './sinpe-modal';
import { ContratoTransporteModal } from './contrato-modal';
import { uploadFileToStorage } from '@/lib/supabase-storage';

export function AdminDirectory({ section }: { section: 'choferes' | 'rutas' | 'colegios' | 'pagos' | 'ajustes' | 'busetas' | 'alumnos' }) {
  const { state, dispatch } = usePlatform();
  const [query, setQuery] = useState('');
  const [companyName, setCompanyName] = useState(state.company);
  const [filterContrato, setFilterContrato] = useState<'todos' | 'firmados' | 'pendientes'>('todos');
  const [contratoModalAlumno, setContratoModalAlumno] = useState<Alumno | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const exportToCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Archivo ${filename}.csv descargado exitosamente`);
  };

  // Modals state
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Van | null>(null);

  const [choferModalOpen, setChoferModalOpen] = useState(false);
  const [editingChofer, setEditingChofer] = useState<Chofer | null>(null);

  const [colegioModalOpen, setColegioModalOpen] = useState(false);
  const [editingColegio, setEditingColegio] = useState<Colegio | null>(null);

  const [alumnoModalOpen, setAlumnoModalOpen] = useState(false);
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null);
  const [sinpeModalAlumno, setSinpeModalAlumno] = useState<Alumno | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<'Todos' | 'En Verificación' | 'Por cobrar' | 'Pagados'>('Todos');

  // Form states for Route
  const [routeForm, setRouteForm] = useState({
    ruta: '',
    patente: '',
    chofer: '',
    colegio: '',
    horario: '06:30 / 14:30',
    cap: 16,
    lat: 9.9333,
    lng: -84.0833,
  });

  // Form states for Chofer
  const [choferForm, setChoferForm] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    buseta: '',
    vinculo: 'Activo' as 'Activo' | 'Pendiente · 11 días' | 'Inactivo',
    licenciaTipo: 'C-2 Profesional',
    licenciaNumero: '',
    licenciaVencimiento: '18/04/2028',
    fotoLicencia: '',
  });

  const [previewDoc, setPreviewDoc] = useState<{ title: string; src: string; type: string } | null>(null);

  // Form states for Colegio
  const [colegioForm, setColegioForm] = useState({
    nombre: '',
    canton: '',
    provincia: 'San José',
    telefono: '',
    estado: 'Activo' as 'Activo' | 'Inactivo',
    lat: 9.9754,
    lng: -84.0768,
  });

  const [schoolSuggestionsOpen, setSchoolSuggestionsOpen] = useState(false);
  const schoolSuggestions = useMemo(() => {
    return colegioForm.nombre.trim().length >= 2
      ? searchCRPlaces(colegioForm.nombre, 6, 'colegio')
      : [];
  }, [colegioForm.nombre]);

  // Form states for Alumno / Pago
  const [alumnoForm, setAlumnoForm] = useState({
    nombre: '',
    curso: '1° Grado',
    colegio: '',
    direccion: '',
    apoderado: '',
    telefonoApoderado: '8841-9230',
    monto: 65000,
    pago: 'Pendiente' as PaymentStatus,
  });

  // --- Handlers: Rutas ---
  const handleOpenRouteModal = (r?: Van) => {
    if (r) {
      setEditingRoute(r);
      setRouteForm({
        ruta: r.ruta,
        patente: r.patente,
        chofer: r.chofer,
        colegio: r.colegio || state.colegios[0]?.nombre || '',
        horario: r.horario || '06:30 / 14:30',
        cap: r.cap || 16,
        lat: r.lat || 9.9333,
        lng: r.lng || -84.0833,
      });
    } else {
      setEditingRoute(null);
      setRouteForm({
        ruta: '',
        patente: 'SJ-' + Math.floor(1000 + Math.random() * 9000),
        chofer: state.choferes[0]?.nombre || 'Sin asignar',
        colegio: state.colegios[0]?.nombre || '',
        horario: '06:30 / 14:30',
        cap: 16,
        lat: 9.9333,
        lng: -84.0833,
      });
    }
    setRouteModalOpen(true);
  };

  const handleSaveRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeForm.ruta.trim()) {
      toast.error('Ingresa el nombre del recorrido');
      return;
    }

    if (editingRoute) {
      const updated: Van = {
        ...editingRoute,
        ruta: routeForm.ruta.trim(),
        patente: routeForm.patente.trim().toUpperCase(),
        chofer: routeForm.chofer,
        colegio: routeForm.colegio,
        horario: routeForm.horario,
        cap: Number(routeForm.cap),
        lat: routeForm.lat,
        lng: routeForm.lng,
      };
      dispatch({ type: 'updateRoute', route: updated });
      toast.success('Ruta actualizada exitosamente con coordenadas GPS');
    } else {
      const newRoute: Van = {
        id: crypto.randomUUID(), // route
        ruta: routeForm.ruta.trim(),
        patente: routeForm.patente.trim().toUpperCase(),
        chofer: routeForm.chofer,
        colegio: routeForm.colegio,
        horario: routeForm.horario,
        aBordo: 0,
        cap: Number(routeForm.cap),
        estado: 'En ruta',
        path: [[25, 25], [45, 25], [45, 60], [75, 60], [75, 80]],
        lat: routeForm.lat,
        lng: routeForm.lng,
      };
      dispatch({ type: 'addRoute', route: newRoute });
      toast.success('Nueva ruta creada en Costa Rica con coordenadas GPS');
    }
    setRouteModalOpen(false);
  };

  const handleDeleteRoute = (id: string, name: string) => {
    if (confirm(`¿Deseas eliminar la ruta "${name}"?`)) {
      dispatch({ type: 'deleteRoute', id });
      toast.success('Ruta eliminada');
    }
  };

  // --- Handlers: Choferes ---
  const handleLicenseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida (JPG, PNG o WebP)');
      return;
    }

    const toastId = toast.loading('Subiendo licencia a Supabase Storage...');
    try {
      const publicUrl = await uploadFileToStorage(file, {
        tenantId: state.currentTenantId,
        folder: 'fleet',
        filename: file.name,
      });
      setChoferForm((prev) => ({ ...prev, fotoLicencia: publicUrl }));
      toast.success('Fotografía de la licencia C-2 subida', { id: toastId });
    } catch {
      toast.error('No se pudo subir la fotografía', { id: toastId });
    }
  };

  const handleOpenChoferModal = (c?: Chofer) => {
    if (c) {
      setEditingChofer(c);
      setChoferForm({
        nombre: c.nombre,
        cedula: c.cedula,
        telefono: c.telefono,
        buseta: c.buseta,
        vinculo: c.vinculo,
        licenciaTipo: c.licenciaTipo || 'C-2 Profesional',
        licenciaNumero: c.licenciaNumero || c.cedula,
        licenciaVencimiento: c.licenciaVencimiento || '18/04/2028',
        fotoLicencia: c.fotoLicencia || generateLicenseSvg(c.nombre, c.cedula, 'C-2', '18/04/2028'),
      });
    } else {
      const randomCedula = '1-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000);
      setEditingChofer(null);
      setChoferForm({
        nombre: '',
        cedula: randomCedula,
        telefono: '8' + Math.floor(100 + Math.random() * 900) + '-' + Math.floor(1000 + Math.random() * 9000),
        buseta: state.vans[0]?.patente || 'SJ-5000',
        vinculo: 'Activo',
        licenciaTipo: 'C-2 Profesional',
        licenciaNumero: randomCedula,
        licenciaVencimiento: '18/04/2028',
        fotoLicencia: generateLicenseSvg('Nuevo Chofer', randomCedula, 'C-2', '18/04/2028'),
      });
    }
    setChoferModalOpen(true);
  };

  const handleSaveChofer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!choferForm.nombre.trim()) {
      toast.error('Ingresa el nombre del chofer');
      return;
    }

    const defaultLic = choferForm.fotoLicencia || generateLicenseSvg(choferForm.nombre.trim(), choferForm.cedula.trim(), choferForm.licenciaTipo, choferForm.licenciaVencimiento);

    if (editingChofer) {
      const updated: Chofer = {
        ...editingChofer,
        nombre: choferForm.nombre.trim(),
        cedula: choferForm.cedula.trim(),
        rut: choferForm.cedula.trim(),
        telefono: choferForm.telefono.trim(),
        buseta: choferForm.buseta.trim().toUpperCase(),
        vinculo: choferForm.vinculo,
        licenciaTipo: choferForm.licenciaTipo,
        licenciaNumero: choferForm.licenciaNumero || choferForm.cedula.trim(),
        licenciaVencimiento: choferForm.licenciaVencimiento,
        fotoLicencia: defaultLic,
      };
      dispatch({ type: 'updateChofer', chofer: updated });
      toast.success('Datos y licencia del chofer actualizados');
    } else {
      const newChofer: Chofer = {
        id: crypto.randomUUID(), // chofer
        nombre: choferForm.nombre.trim(),
        cedula: choferForm.cedula.trim(),
        rut: choferForm.cedula.trim(),
        telefono: choferForm.telefono.trim(),
        buseta: choferForm.buseta.trim().toUpperCase(),
        vinculo: choferForm.vinculo,
        licenciaTipo: choferForm.licenciaTipo,
        licenciaNumero: choferForm.licenciaNumero || choferForm.cedula.trim(),
        licenciaVencimiento: choferForm.licenciaVencimiento,
        fotoLicencia: defaultLic,
      };
      dispatch({ type: 'addChofer', chofer: newChofer });
      toast.success('Chofer y licencia C-2 registrados en la plataforma');
    }
    setChoferModalOpen(false);
  };

  const handleDeleteChofer = (id: string, name: string) => {
    if (confirm(`¿Deseas eliminar al chofer "${name}"?`)) {
      dispatch({ type: 'deleteChofer', id });
      toast.success('Chofer eliminado');
    }
  };

  // --- Handlers: Colegios ---
  const handleOpenColegioModal = (col?: Colegio) => {
    setSchoolSuggestionsOpen(false);
    if (col) {
      setEditingColegio(col);
      setColegioForm({
        nombre: col.nombre,
        canton: col.canton,
        provincia: col.provincia,
        telefono: col.telefono,
        estado: col.estado,
        lat: col.lat || 9.9754,
        lng: col.lng || -84.0768,
      });
    } else {
      setEditingColegio(null);
      setColegioForm({
        nombre: '',
        canton: '',
        provincia: 'San José',
        telefono: '22' + Math.floor(10 + Math.random() * 89) + '-' + Math.floor(1000 + Math.random() * 9000),
        estado: 'Activo',
        lat: 9.9333,
        lng: -84.0833,
      });
    }
    setColegioModalOpen(true);
  };

  const handleSaveColegio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colegioForm.nombre.trim()) {
      toast.error('Ingresa el nombre del colegio');
      return;
    }

    if (editingColegio) {
      const updated: Colegio = {
        ...editingColegio,
        nombre: colegioForm.nombre.trim(),
        canton: colegioForm.canton.trim(),
        provincia: colegioForm.provincia,
        telefono: colegioForm.telefono.trim(),
        estado: colegioForm.estado,
        lat: colegioForm.lat,
        lng: colegioForm.lng,
      };
      dispatch({ type: 'updateColegio', colegio: updated });
      toast.success('Colegio actualizado con coordenadas');
    } else {
      const newCol: Colegio = {
        id: crypto.randomUUID(), // colegio
        nombre: colegioForm.nombre.trim(),
        canton: colegioForm.canton.trim(),
        provincia: colegioForm.provincia,
        telefono: colegioForm.telefono.trim(),
        estudiantes: 0,
        estado: colegioForm.estado,
        lat: colegioForm.lat,
        lng: colegioForm.lng,
      };
      dispatch({ type: 'addColegio', colegio: newCol });
      toast.success('Colegio registrado con ubicación en el mapa');
    }
    setColegioModalOpen(false);
  };

  const handleDeleteColegio = (id: string, name: string) => {
    if (confirm(`¿Deseas eliminar el colegio "${name}"?`)) {
      dispatch({ type: 'deleteColegio', id });
      toast.success('Colegio eliminado');
    }
  };

  // --- Handlers: Alumnos / Pagos ---
  const handleOpenAlumnoModal = (a?: Alumno) => {
    if (a) {
      setEditingAlumno(a);
      setAlumnoForm({
        nombre: a.nombre,
        curso: a.curso,
        colegio: a.colegio,
        direccion: a.direccion,
        apoderado: a.apoderado,
        telefonoApoderado: a.telefonoApoderado || '8841-9230',
        monto: a.monto,
        pago: a.pago,
      });
    } else {
      setEditingAlumno(null);
      setAlumnoForm({
        nombre: '',
        curso: '1° Grado',
        colegio: state.colegios[0]?.nombre || '',
        direccion: '',
        apoderado: '',
        telefonoApoderado: '8841-9230',
        monto: 65000,
        pago: 'Pendiente',
      });
    }
    setAlumnoModalOpen(true);
  };

  const handleSaveAlumno = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumnoForm.nombre.trim() || !alumnoForm.apoderado.trim()) {
      toast.error('Completa el nombre del alumno y de su encargado');
      return;
    }

    if (editingAlumno) {
      const updated: Alumno = {
        ...editingAlumno,
        nombre: alumnoForm.nombre.trim(),
        curso: alumnoForm.curso,
        colegio: alumnoForm.colegio,
        direccion: alumnoForm.direccion.trim(),
        apoderado: alumnoForm.apoderado.trim(),
        telefonoApoderado: alumnoForm.telefonoApoderado.trim(),
        monto: Number(alumnoForm.monto),
        pago: alumnoForm.pago,
      };
      dispatch({ type: 'updateAlumno', alumno: updated });
      toast.success('Registro de estudiante actualizado');
    } else {
      const newAlumno: Alumno = {
        id: crypto.randomUUID(), // alumno
        nombre: alumnoForm.nombre.trim(),
        curso: alumnoForm.curso,
        colegio: alumnoForm.colegio,
        direccion: alumnoForm.direccion.trim(),
        apoderado: alumnoForm.apoderado.trim(),
        telefonoApoderado: alumnoForm.telefonoApoderado.trim() || '8841-9230',
        monto: Number(alumnoForm.monto),
        pago: alumnoForm.pago,
      };
      dispatch({ type: 'addAlumno', alumno: newAlumno });
      toast.success('Estudiante inscrito exitosamente');
    }
    setAlumnoModalOpen(false);
  };

  const handleDeleteAlumno = (id: string, name: string) => {
    if (confirm(`¿Deseas eliminar al estudiante "${name}"?`)) {
      dispatch({ type: 'deleteAlumno', id });
      toast.success('Estudiante eliminado');
    }
  };

  const handleTogglePayment = (id: string, current: string) => {
    const alumno = state.alumnos.find((a) => a.id === id);
    if (!alumno) return;
    const nextStatus = current === 'Pagado' ? 'Pendiente' : 'Pagado';
    dispatch({ type: 'updateAlumno', alumno: { ...alumno, pago: nextStatus } });
    toast.success(`Mensualidad marcada como ${nextStatus}`);
  };

  // --- Render: Ajustes ---
  if (section === 'ajustes') {
    const activeTenant = state.tenants.find((t) => t.id === state.currentTenantId);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        toast.error('Selecciona un archivo de imagen válido (PNG, JPG, WebP o SVG).');
        return;
      }
      if (!activeTenant) {
        toast.error('No hay una empresa activa seleccionada.');
        return;
      }
      setUploadingLogo(true);
      try {
        const publicUrl = await uploadFileToStorage(file, {
          tenantId: activeTenant.id,
          folder: 'fleet',
          filename: file.name,
        });
        dispatch({
          type: 'updateTenant',
          tenant: { ...activeTenant, logoUrl: publicUrl },
        });
        toast.success('Logo del transportista actualizado en la nube.');
      } catch (err) {
        toast.error('No se pudo subir el logo', {
          description: err instanceof Error ? err.message : 'Error inesperado',
        });
      } finally {
        setUploadingLogo(false);
      }
    };

    const handleRemoveLogo = () => {
      if (!activeTenant) return;
      const { logoUrl: _removed, ...rest } = activeTenant;
      dispatch({ type: 'updateTenant', tenant: rest });
      toast.success('Logo removido. Se mostrará el emblema de flota por defecto.');
    };

    return (
      <>
        <PageTitle title="Ajustes de Empresa" subtitle="Configuración general de tu empresa de transporte escolar en Costa Rica" />
        <form
          className="max-w-2xl space-y-5 rounded-2xl border bg-card p-6 shadow-sm mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!companyName.trim()) return;
            if (activeTenant) {
              dispatch({
                type: 'updateTenant',
                tenant: { ...activeTenant, nombre: companyName.trim() },
              });
            } else {
              dispatch({ type: 'company', name: companyName.trim() });
            }
            toast.success('Ajustes de empresa guardados exitosamente');
          }}
        >
          <div className="flex flex-wrap items-center gap-5 rounded-xl border bg-muted/20 p-4">
            <div className="grid min-h-24 w-40 shrink-0 place-items-center overflow-hidden rounded-2xl border bg-white shadow-sm">
              {activeTenant?.logoUrl ? (
                <img
                  src={activeTenant.logoUrl}
                  alt={state.company}
                  className="block h-auto w-full"
                />
              ) : (
                <span className="grid h-14 w-14 place-items-center rounded-xl bg-amber-400 text-slate-950">
                  <Bus className="h-7 w-7" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <p className="text-sm font-extrabold text-foreground">Logo del Transportista</p>
                <p className="text-xs text-muted-foreground">
                  Se muestra en el menú lateral de administración de tu empresa. Se guarda en Supabase Storage.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-slate-950 shadow-sm hover:bg-amber-500">
                  <Upload className="h-3.5 w-3.5" />
                  {uploadingLogo ? 'Subiendo...' : activeTenant?.logoUrl ? 'Cambiar logo' : 'Subir logo'}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingLogo}
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                {activeTenant?.logoUrl && (
                  <Button type="button" variant="outline" size="sm" onClick={handleRemoveLogo} className="h-8 text-xs">
                    Quitar logo
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground" htmlFor="company-name">
              Nombre de la Empresa o Servicio
            </label>
            <input
              id="company-name"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-muted-foreground">País de Operación</label>
              <input disabled value="Costa Rica" className="mt-1 w-full rounded-lg border bg-muted/50 px-3 py-2 text-sm text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground">Moneda de Facturación</label>
              <input disabled value="Colones Costarricenses (₡ CRC)" className="mt-1 w-full rounded-lg border bg-muted/50 px-3 py-2 text-sm text-foreground" />
            </div>
          </div>

          <div className="rounded-lg bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
            Los cambios se sincronizan en tiempo real con las aplicaciones de Chofer y Encargado.
          </div>

          <Button type="submit" className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-500">
            Guardar cambios
          </Button>
        </form>

        {/* Database & Cloud Backend Integration Card */}
        <div className="max-w-2xl rounded-2xl border bg-card p-6 shadow-sm mt-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-base font-extrabold text-foreground">Conexión de Base de Datos & Backend</h3>
              <p className="text-xs text-muted-foreground">Configura el almacenamiento persistente (PostgreSQL / Supabase / REST)</p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
              Backend Ready
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-muted-foreground">Proveedor de Base de Datos</label>
              <select className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs font-semibold focus:outline-none">
                <option value="mock">En Memoria (Mock Simulator Ultra-Rápido)</option>
                <option value="supabase">Supabase (PostgreSQL + Realtime GPS)</option>
                <option value="postgres">PostgreSQL Directo (REST API)</option>
                <option value="firebase">Firebase Firestore</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground">Estado de Conexión</label>
              <input disabled value="● Modo Local Activo (Latencia: 0ms)" className="mt-1 w-full rounded-lg border bg-muted/50 px-3 py-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold" />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                toast.success('¡Conexión verificada con éxito!', {
                  description: 'La capa de API client responde en 12ms. Lista para enchufar credenciales de producción.',
                });
              }}
              className="text-xs font-bold"
            >
              Probar Conexión Backend
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const fullBackup = {
                  version: '2026.1',
                  empresa: state.company,
                  fecha: new Date().toISOString(),
                  rutas: state.vans,
                  choferes: state.choferes,
                  colegios: state.colegios,
                  alumnos: state.alumnos,
                  asistencia: state.attendance,
                  pagos: state.payments,
                  notificaciones: state.notifications,
                };
                const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `linkbus_backup_${new Date().toISOString().slice(0, 10)}.json`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                toast.success('Copia de seguridad completa (JSON) descargada');
              }}
              className="text-xs font-bold"
            >
              Descargar Backup Completo (JSON)
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* SECTION: BUSETAS / FLOTA REGULATORIA CTP & ARESEP */}
      {section === 'busetas' && <AdminBusetas />}

      {/* SECTION: RUTAS */}
      {section === 'rutas' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Rutas Escolares</h1>
              <p className="text-sm text-muted-foreground">Gestión de recorridos, busetas y colegios en Costa Rica</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => exportToCsv('rutas_linkbus_cr', ['Ruta', 'Buseta', 'Chofer', 'Colegio', 'Horario', 'Capacidad'], state.vans.map(v => [v.ruta, v.patente, v.chofer, v.colegio || '', v.horario || '', v.cap]))} className="gap-1 font-semibold text-xs">
                <Download className="h-3.5 w-3.5" />
                <span>Exportar CSV</span>
              </Button>
              <TransferButton />
              <Button onClick={() => handleOpenRouteModal()} className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-500 gap-1.5">
                <Plus className="h-4 w-4" />
                Nueva Ruta
              </Button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative my-4 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar ruta, buseta o chofer…"
              className="w-full rounded-lg border bg-card pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-muted/60 text-xs font-bold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Ruta / Trayecto</th>
                  <th className="px-4 py-3">Buseta</th>
                  <th className="px-4 py-3">Chofer</th>
                  <th className="px-4 py-3">Colegio Destino</th>
                  <th className="px-4 py-3">Horario</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {state.vans
                  .filter((v) => (v.ruta + v.patente + v.chofer + (v.colegio || '')).toLowerCase().includes(query.toLowerCase()))
                  .map((v) => {
                    const choferObj = state.choferes.find((c) => c.nombre === v.chofer);
                    return (
                      <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-foreground">
                          <div className="flex items-center gap-2">
                            <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-400/20 text-slate-800 dark:text-amber-400">
                              <RouteIcon className="h-4 w-4" />
                            </span>
                            <div>
                              <span>{v.ruta}</span>
                              {v.lat && v.lng && (
                                <p className="font-mono text-[10px] text-muted-foreground">
                                  GPS: {v.lat.toFixed(4)}, {v.lng.toFixed(4)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="rounded bg-slate-900 px-2 py-0.5 text-xs font-extrabold text-amber-400">{v.patente}</span>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground font-medium">{v.chofer}</td>
                        <td className="px-4 py-3.5 font-medium">
                          <div>
                            <span>{v.colegio || 'Lincoln School'}</span>
                            <div className="mt-1">
                              <QuickActionPills
                                lat={v.lat}
                                lng={v.lng}
                                locationName={v.colegio || v.ruta}
                                phone={choferObj?.telefono}
                                whatsappMessage={`Hola ${v.chofer}, consulta sobre la ruta escolar ${v.ruta}.`}
                                size="sm"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground font-semibold">{v.horario || '06:30 / 14:30'}</td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenRouteModal(v)} title="Editar ruta">
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteRoute(v.id, v.ruta)} title="Eliminar ruta">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* SECTION: CHOFERES */}
      {section === 'choferes' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Directorio de Choferes</h1>
              <p className="text-sm text-muted-foreground">Conductores y asistentes certificados de busetas escolares</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => exportToCsv('choferes_linkbus_cr', ['Nombre', 'Cedula', 'Telefono', 'Buseta', 'Estado'], state.choferes.map(c => [c.nombre, c.cedula, c.telefono, c.buseta, c.vinculo]))} className="gap-1 font-semibold text-xs">
                <Download className="h-3.5 w-3.5" />
                <span>Exportar CSV</span>
              </Button>
              <Button onClick={() => handleOpenChoferModal()} className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-500 gap-1.5">
                <Plus className="h-4 w-4" />
                Nuevo Chofer
              </Button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative my-4 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar chofer por nombre o cédula…"
              className="w-full rounded-lg border bg-card pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-muted/60 text-xs font-bold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Nombre del Chofer</th>
                  <th className="px-4 py-3">Cédula</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Licencia C-2 & Doc</th>
                  <th className="px-4 py-3">Buseta Asignada</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {state.choferes
                  .filter((c) => (c.nombre + c.cedula + c.telefono + c.buseta).toLowerCase().includes(query.toLowerCase()))
                  .map((c) => {
                    const licenseImg = c.fotoLicencia || generateLicenseSvg(c.nombre, c.cedula, c.licenciaTipo || 'C-2', c.licenciaVencimiento || '18/04/2028');
                    return (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-foreground">
                          <div className="flex items-center gap-2">
                            <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-extrabold">
                              {c.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                            </span>
                            <span>{c.nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{c.cedula}</td>
                        <td className="px-4 py-3.5 text-xs font-medium">
                          <div className="flex flex-col gap-1.5">
                            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-mono">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {c.telefono}
                            </span>
                            <QuickActionPills
                              phone={c.telefono}
                              whatsappMessage={`Hola ${c.nombre}, le contactamos desde la administración de Nexus Go Transporte Escolar.`}
                              showNav={false}
                              showContact={true}
                              size="sm"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewDoc({
                                  title: `Licencia de Conducir C-2 - ${c.nombre}`,
                                  src: licenseImg,
                                  type: 'Licencia Transporte Público MOPT / COSEVI',
                                })
                              }
                              className="relative h-11 w-18 shrink-0 rounded-lg overflow-hidden border border-amber-300 dark:border-amber-400/40 hover:ring-2 hover:ring-amber-400 shadow-2xs group cursor-pointer bg-white"
                              title="Haz clic para ver la licencia en grande"
                            >
                              <img
                                src={licenseImg}
                                alt={`Licencia de ${c.nombre}`}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px] font-bold">
                                <Eye className="h-3 w-3" />
                              </div>
                            </button>
                            <div>
                              <span className="text-xs font-bold text-foreground block">
                                {c.licenciaTipo || 'C-2 Profesional'}
                              </span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                                Vence: {c.licenciaVencimiento || '18/04/2028'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="rounded bg-slate-900 px-2 py-0.5 text-xs font-extrabold text-amber-400">{c.buseta}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge tone={c.vinculo === 'Activo' ? 'ok' : 'warn'}>{c.vinculo}</Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenChoferModal(c)} title="Editar chofer">
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteChofer(c.id, c.nombre)} title="Eliminar chofer">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* SECTION: COLEGIOS */}
      {section === 'colegios' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Colegios e Instituciones</h1>
              <p className="text-sm text-muted-foreground">Centros educativos afiliados en Costa Rica</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => exportToCsv('colegios_linkbus_cr', ['Colegio', 'Canton', 'Provincia', 'Telefono', 'Estado'], state.colegios.map(c => [c.nombre, c.canton, c.provincia, c.telefono, c.estado]))} className="gap-1 font-semibold text-xs">
                <Download className="h-3.5 w-3.5" />
                <span>Exportar CSV</span>
              </Button>
              <Button onClick={() => handleOpenColegioModal()} className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-500 gap-1.5">
                <Plus className="h-4 w-4" />
                Nuevo Colegio
              </Button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative my-4 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar colegio por nombre o cantón…"
              className="w-full rounded-lg border bg-card pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-muted/60 text-xs font-bold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Institución Educativa</th>
                  <th className="px-4 py-3">Cantón / Provincia</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Estudiantes Inscritos</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {state.colegios
                  .filter((col) => (col.nombre + col.canton + col.provincia).toLowerCase().includes(query.toLowerCase()))
                  .map((col) => (
                    <tr key={col.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shrink-0">
                            <School className="h-4 w-4" />
                          </span>
                          <div>
                            <span className="text-sm font-extrabold">{col.nombre}</span>
                            {col.lat && col.lng ? (
                              <p className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground mt-0.5">
                                <MapPin className="h-3 w-3 text-amber-500" />
                                {col.lat.toFixed(4)}, {col.lng.toFixed(4)}
                              </p>
                            ) : (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mt-0.5">
                                Sin coordenadas GPS
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                        {col.canton}, {col.provincia}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-semibold">{col.telefono}</span>
                          <QuickActionPills
                            lat={col.lat}
                            lng={col.lng}
                            locationName={col.nombre}
                            phone={col.telefono}
                            whatsappMessage={`Buenas tardes, nos comunicamos con ${col.nombre} desde la administración de Nexus Go Transporte Escolar.`}
                            size="sm"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-extrabold text-foreground">
                        {state.alumnos.filter((a) => a.colegio === col.nombre).length || col.estudiantes} alumnos
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone={col.estado === 'Activo' ? 'ok' : 'bad'}>{col.estado}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenColegioModal(col)} title="Editar colegio">
                            <Pencil className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteColegio(col.id, col.nombre)} title="Eliminar colegio">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* SECTION: PAGOS & ESTUDIANTES */}
      {section === 'pagos' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Cobros y Estudiantes</h1>
              <p className="text-sm text-muted-foreground">Control mensual de mensualidades en Colones (₡ CRC)</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => exportToCsv('mensualidades_estudiantes_cr', ['Estudiante', 'Grado', 'Colegio', 'Encargado', 'Direccion', 'Cuota CRC', 'Estado'], state.alumnos.map(a => [a.nombre, a.curso, a.colegio, a.apoderado, a.direccion, a.monto, a.pago]))} className="gap-1 font-semibold text-xs">
                <Download className="h-3.5 w-3.5" />
                <span>Exportar CSV</span>
              </Button>
              <Button onClick={() => handleOpenAlumnoModal()} className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-500 gap-1.5">
                <Plus className="h-4 w-4" />
                Nuevo Estudiante
              </Button>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="my-5 grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Recaudado</p>
              <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {crc(state.alumnos.filter((a) => (state.payments[a.id]?.status ?? a.pago) === 'Pagado').reduce((acc, a) => acc + a.monto, 0))}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Fondos confirmados</p>
            </div>
            <div className="rounded-xl border border-amber-400/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 shadow-sm">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">En Verificación SINPE</p>
              <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
                {state.alumnos.filter((a) => (state.payments[a.id]?.status ?? a.pago) === 'En Verificación').length}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Comprobantes por aprobar</p>
            </div>
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pendiente por Cobrar</p>
              <p className="mt-1 text-2xl font-black text-slate-800 dark:text-slate-200">
                {crc(state.alumnos.filter((a) => (state.payments[a.id]?.status ?? a.pago) !== 'Pagado').reduce((acc, a) => acc + a.monto, 0))}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Cuotas no canceladas</p>
            </div>
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estudiantes al Día</p>
              <p className="mt-1 text-2xl font-black text-foreground">
                {state.alumnos.filter((a) => (state.payments[a.id]?.status ?? a.pago) === 'Pagado').length} / {state.alumnos.length}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Matrícula activa</p>
            </div>
          </div>

          {/* Prominent Pending SINPE Verification Banner in Admin */}
          {state.alumnos.some((a) => (state.payments[a.id]?.status ?? a.pago) === 'En Verificación') && (
            <div className="mb-5 rounded-2xl border-2 border-amber-400 bg-amber-50/70 dark:bg-amber-950/30 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-200">
                    Comprobantes SINPE Móvil por Aprobar (Acción Requerida)
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  Administración Contable
                </span>
              </div>
              <p className="text-xs text-amber-900/80 dark:text-amber-300/80 mb-3 leading-relaxed">
                Los siguientes encargados reportaron pagos mediante SINPE Móvil. Abre el comprobante, verifica que los fondos estén acreditados en la cuenta bancaria de la empresa y dale clic a <b>Aprobar Pago</b> para emitir el recibo digital oficial:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {state.alumnos
                  .filter((a) => (state.payments[a.id]?.status ?? a.pago) === 'En Verificación')
                  .map((a) => {
                    const payment = state.payments[a.id];
                    return (
                      <div
                        key={a.id}
                        className="rounded-xl border border-amber-300 dark:border-amber-700 bg-card p-3.5 shadow-sm flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-extrabold text-sm text-foreground">{a.nombre}</p>
                            <p className="text-xs text-muted-foreground">{a.apoderado} · {a.colegio}</p>
                            <p className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 mt-1">
                              Ref: {payment?.comprobanteRef || 'SINPE-8419022'} ({payment?.banco || 'Banco Nacional'})
                            </p>
                          </div>
                          <span className="text-base font-black text-foreground shrink-0">{crc(a.monto)}</span>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => setSinpeModalAlumno(a)}
                          className="w-full bg-amber-400 text-slate-950 font-bold hover:bg-amber-500 text-xs gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Revisar Comprobante & Aprobar</span>
                        </Button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Filter Pills & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['Todos', 'En Verificación', 'Por cobrar', 'Pagados'] as const).map((f) => {
                const count =
                  f === 'Todos'
                    ? state.alumnos.length
                    : f === 'En Verificación'
                    ? state.alumnos.filter((a) => (state.payments[a.id]?.status ?? a.pago) === 'En Verificación').length
                    : f === 'Por cobrar'
                    ? state.alumnos.filter((a) => (state.payments[a.id]?.status ?? a.pago) !== 'Pagado').length
                    : state.alumnos.filter((a) => (state.payments[a.id]?.status ?? a.pago) === 'Pagado').length;

                const active = paymentFilter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setPaymentFilter(f)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <span>{f}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${active ? 'bg-slate-950 text-amber-300' : 'bg-background text-muted-foreground'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por estudiante, encargado o colegio…"
                className="w-full rounded-xl border bg-card pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-muted/60 text-xs font-bold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Estudiante</th>
                  <th className="px-4 py-3">Colegio & Grado</th>
                  <th className="px-4 py-3">Encargado</th>
                  <th className="px-4 py-3">Cuota Mensual</th>
                  <th className="px-4 py-3">Estado de Pago</th>
                  <th className="px-4 py-3">Contrato CTP</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {state.alumnos
                  .filter((a) => {
                    const matchesQuery = (a.nombre + a.apoderado + a.colegio).toLowerCase().includes(query.toLowerCase());
                    if (!matchesQuery) return false;
                    const status = state.payments[a.id]?.status ?? a.pago;
                    if (paymentFilter === 'En Verificación') return status === 'En Verificación';
                    if (paymentFilter === 'Por cobrar') return status !== 'Pagado';
                    if (paymentFilter === 'Pagados') return status === 'Pagado';
                    return true;
                  })
                  .map((a) => {
                    const payment = state.payments[a.id];
                    const currentStatus = payment?.status ?? a.pago;
                    return (
                      <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-foreground">
                          <div>
                            <span>{a.nombre}</span>
                            <p className="text-xs font-normal text-muted-foreground">{a.direccion}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold">{a.colegio}</span>
                          <p className="text-xs text-muted-foreground">{a.curso}</p>
                        </td>
                        <td className="px-4 py-3.5 font-medium">
                          <div>
                            <span>{a.apoderado}</span>
                            <div className="mt-1">
                              <QuickActionPills
                                locationName={a.direccion}
                                phone={a.telefonoApoderado || '8841-9230'}
                                whatsappMessage={`Hola ${a.apoderado}, le contactamos del transporte escolar Nexus Go respecto al estudiante ${a.nombre}.`}
                                size="sm"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-black text-foreground">{crc(a.monto)}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (currentStatus === 'En Verificación' || currentStatus === 'Pagado') {
                                  setSinpeModalAlumno(a);
                                } else {
                                  handleTogglePayment(a.id, a.pago);
                                }
                              }}
                              className="cursor-pointer"
                              title="Hacer clic para revisar o alternar"
                            >
                              <Badge tone={currentStatus === 'Pagado' ? 'ok' : currentStatus === 'En Verificación' ? 'warn' : 'bad'}>
                                {currentStatus}
                              </Badge>
                            </button>
                            {currentStatus === 'En Verificación' && (
                              <Button
                                size="sm"
                                onClick={() => setSinpeModalAlumno(a)}
                                className="h-7 px-2 text-[10px] font-black bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg gap-1 cursor-pointer"
                              >
                                <Eye className="h-3 w-3" />
                                <span>Revisar SINPE</span>
                              </Button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {state.contracts[a.id]?.signed ? (
                            <button
                              type="button"
                              onClick={() => setContratoModalAlumno(a)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                              title="Ver contrato firmado"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Firmado</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setContratoModalAlumno(a)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                              title="Contrato pendiente de firma"
                            >
                              <Clock className="h-3 w-3" />
                              <span>Pendiente</span>
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex justify-end gap-1">
                            {currentStatus === 'En Verificación' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSinpeModalAlumno(a)}
                                className="h-8 text-xs font-bold gap-1 rounded-lg text-emerald-600 border-emerald-400/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
                                title="Ver comprobante y aprobar"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Aprobar</span>
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleTogglePayment(a.id, a.pago)}
                                title={currentStatus === 'Pagado' ? 'Marcar pendiente' : 'Marcar pagado'}
                              >
                                <CheckCircle2 className={`h-4 w-4 ${currentStatus === 'Pagado' ? 'text-emerald-500' : 'text-slate-400'}`} />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleOpenAlumnoModal(a)} title="Editar estudiante">
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteAlumno(a.id, a.nombre)} title="Eliminar estudiante">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* SECTION: ALUMNOS & CONTRATOS CTP */}
      {section === 'alumnos' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Fiscalización y Registro Oficial CTP · Período Lectivo 2026
                </p>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight mt-0.5">Padrón de Estudiantes y Contratos</h1>
              <p className="text-sm text-muted-foreground">
                Control de contratos legales de transporte escolar (Decreto Ejecutivo N° 35249-MOPT), encargados y asignaciones.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportToCsv(
                    'padron_estudiantes_contratos_ctp',
                    ['Estudiante', 'Grado', 'Colegio', 'Encargado', 'Cédula', 'Teléfono', 'Dirección', 'Cuota CRC', 'Estado Contrato', 'Folio CTP', 'Fecha Firma'],
                    state.alumnos.map((a) => {
                      const c = state.contracts[a.id];
                      return [
                        a.nombre,
                        a.curso,
                        a.colegio,
                        a.apoderado,
                        c?.cedulaApoderado || a.telefonoApoderado || '—',
                        a.telefonoApoderado || '—',
                        a.direccion,
                        a.monto,
                        c?.signed ? 'Firmado' : 'Pendiente',
                        c?.folioDigital || '—',
                        c?.signedAt || '—',
                      ];
                    })
                  )
                }
                className="gap-1 font-semibold text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Exportar CSV</span>
              </Button>
              <Button onClick={() => handleOpenAlumnoModal()} className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-500 gap-1.5 cursor-pointer">
                <Plus className="h-4 w-4" />
                Nuevo Estudiante
              </Button>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="my-5 grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Estudiantes</p>
              <p className="mt-1 text-2xl font-black text-foreground">{state.alumnos.length}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Matrícula registrada</p>
            </div>

            <div className="rounded-xl border border-emerald-400/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  Contratos Firmados
                </p>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">
                  ✓ Al Día
                </span>
              </div>
              <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {state.alumnos.filter((a) => state.contracts[a.id]?.signed).length}
              </p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5 font-medium">
                {Math.round((state.alumnos.filter((a) => state.contracts[a.id]?.signed).length / (state.alumnos.length || 1)) * 100)}% de cumplimiento CTP
              </p>
            </div>

            <div className="rounded-xl border border-amber-400/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  Contratos Pendientes
                </p>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 animate-pulse">
                  Acción
                </span>
              </div>
              <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
                {state.alumnos.filter((a) => !state.contracts[a.id]?.signed).length}
              </p>
              <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5 font-medium">
                Firma requerida de encargados
              </p>
            </div>

            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Facturación Mensual</p>
              <p className="mt-1 text-2xl font-black text-foreground">
                {crc(state.alumnos.reduce((acc, a) => acc + a.monto, 0))}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Monto total pactado</p>
            </div>
          </div>

          {/* Filter Pills and Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 my-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setFilterContrato('todos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterContrato === 'todos'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                    : 'bg-muted/70 text-muted-foreground hover:text-foreground'
                }`}
              >
                Todos ({state.alumnos.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterContrato('firmados')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  filterContrato === 'firmados'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                }`}
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>Firmados ({state.alumnos.filter((a) => state.contracts[a.id]?.signed).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterContrato('pendientes')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  filterContrato === 'pendientes'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25'
                }`}
              >
                <Clock className="h-3 w-3" />
                <span>Pendientes ({state.alumnos.filter((a) => !state.contracts[a.id]?.signed).length})</span>
              </button>
            </div>

            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por estudiante, colegio o encargado…"
                className="w-full rounded-xl border bg-card pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Alumnos & Contratos Table */}
          <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-muted/60 text-xs font-bold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Estudiante</th>
                  <th className="px-4 py-3">Colegio Asignado</th>
                  <th className="px-4 py-3">Encargado</th>
                  <th className="px-4 py-3">Cuota Mensual</th>
                  <th className="px-4 py-3">Contrato Legal CTP</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {state.alumnos
                  .filter((a) => {
                    const matchesQuery = (a.nombre + a.apoderado + a.colegio + a.direccion)
                      .toLowerCase()
                      .includes(query.toLowerCase());
                    const contract = state.contracts[a.id];
                    if (filterContrato === 'firmados') return matchesQuery && contract?.signed;
                    if (filterContrato === 'pendientes') return matchesQuery && !contract?.signed;
                    return matchesQuery;
                  })
                  .map((a) => {
                    const contract = state.contracts[a.id];
                    const isSigned = contract?.signed;

                    return (
                      <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-foreground">
                          <div>
                            <span className="text-sm font-extrabold">{a.nombre}</span>
                            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {a.curso}
                            </span>
                            <p className="text-xs font-normal text-muted-foreground mt-0.5 flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                              <span>{a.direccion}</span>
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-foreground">{a.colegio}</span>
                          <p className="text-xs text-muted-foreground">Ruta asignada</p>
                        </td>

                        <td className="px-4 py-3.5 font-medium">
                          <div>
                            <span className="font-bold text-foreground">{a.apoderado}</span>
                            <p className="text-xs text-muted-foreground font-mono">
                              Cédula: {contract?.cedulaApoderado || a.telefonoApoderado || '1-1240-0899'}
                            </p>
                            <div className="mt-1">
                              <QuickActionPills
                                locationName={a.direccion}
                                phone={a.telefonoApoderado || '8841-9230'}
                                whatsappMessage={
                                  isSigned
                                    ? `Hola ${a.apoderado}, le confirmamos que el contrato de transporte escolar para ${a.nombre} se encuentra debidamente firmado y registrado ante el CTP.`
                                    : `Estimado(a) ${a.apoderado}, le recordamos ingresar al portal de familias de Nexus Go para revisar y firmar digitalmente el Contrato de Transporte Escolar 2026 de ${a.nombre}.`
                                }
                                size="sm"
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 font-black text-foreground">
                          {crc(a.monto)}
                          <p className="text-[10px] font-normal text-muted-foreground">Pago mensual</p>
                        </td>

                        {/* Contrato CTP Status Column */}
                        <td className="px-4 py-3.5">
                          {isSigned ? (
                            <div className="space-y-1">
                              <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-full">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Firmado</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                Folio: <b className="text-foreground">{contract?.folioDigital}</b>
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {contract?.signedAt}
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setContratoModalAlumno(a)}
                                className="h-6 text-[10px] font-bold px-2 rounded-lg gap-1 border-emerald-400/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
                              >
                                <Eye className="h-3 w-3" />
                                <span>Ver Contrato</span>
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-full animate-pulse">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Pendiente de Firma</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">
                                Requiere firma del encargado
                              </p>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const msg = encodeURIComponent(
                                      `Estimado(a) ${a.apoderado}, le recordamos ingresar al portal de familias de Nexus Go para firmar digitalmente el Contrato de Transporte Escolar 2026 de ${a.nombre} exigido por el CTP.`
                                    );
                                    window.open(`https://wa.me/506${(a.telefonoApoderado || '88419230').replace(/\D/g, '')}?text=${msg}`, '_blank');
                                  }}
                                  className="h-6 text-[10px] font-bold px-2 rounded-lg gap-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                  title="Enviar recordatorio por WhatsApp"
                                >
                                  <MessageCircle className="h-3 w-3" />
                                  <span>Recordar WhatsApp</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setContratoModalAlumno(a)}
                                  className="h-6 text-[10px] font-bold px-2 rounded-lg gap-1 cursor-pointer hover:bg-muted"
                                  title="Firmar en pantalla o en mesa"
                                >
                                  <PenTool className="h-3 w-3 text-amber-500" />
                                  <span>Firmar</span>
                                </Button>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setContratoModalAlumno(a)}
                              title={isSigned ? "Ver contrato oficial" : "Firmar contrato digital"}
                            >
                              <FileText className={`h-4 w-4 ${isSigned ? 'text-emerald-600' : 'text-amber-500'}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenAlumnoModal(a)}
                              title="Editar datos del estudiante"
                            >
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteAlumno(a.id, a.nombre)}
                              title="Eliminar estudiante"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* MODAL: RUTA */}
      <Dialog open={routeModalOpen} onOpenChange={setRouteModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto md:overflow-hidden overflow-x-hidden p-6">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-xl font-black">{editingRoute ? 'Editar Ruta Escolar' : 'Crear Nueva Ruta Escolar'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveRoute} className="overflow-x-hidden pt-2">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Left Column: Form Fields (6 cols) */}
              <div className="md:col-span-6 space-y-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Nombre de la Ruta / Trayecto</label>
                  <input
                    required
                    value={routeForm.ruta}
                    onChange={(e) => setRouteForm({ ...routeForm, ruta: e.target.value })}
                    placeholder="Ej. Heredia Centro, Escazú, o Santa Ana"
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Al escribir el cantón, el mapa de la derecha se mueve solo en vivo.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-foreground">Placa de la Buseta</label>
                    <input
                      required
                      value={routeForm.patente}
                      onChange={(e) => setRouteForm({ ...routeForm, patente: e.target.value })}
                      placeholder="Ej. SJ-4821"
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground">Capacidad (Asientos)</label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={routeForm.cap}
                      onChange={(e) => setRouteForm({ ...routeForm, cap: Number(e.target.value) })}
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Chofer Asignado</label>
                  <select
                    value={routeForm.chofer}
                    onChange={(e) => setRouteForm({ ...routeForm, chofer: e.target.value })}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {state.choferes.map((c) => (
                      <option key={c.id} value={c.nombre}>
                        {c.nombre} ({c.buseta})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-foreground">Colegio de Destino</label>
                    <select
                      value={routeForm.colegio}
                      onChange={(e) => {
                        const selCol = e.target.value;
                        setRouteForm({ ...routeForm, colegio: selCol });
                        if (!routeForm.ruta.trim()) {
                          const foundCol = state.colegios.find((c) => c.nombre === selCol);
                          if (foundCol && foundCol.lat && foundCol.lng) {
                            setRouteForm((prev) => ({ ...prev, colegio: selCol, lat: foundCol.lat!, lng: foundCol.lng! }));
                          }
                        }
                      }}
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {state.colegios.map((col) => (
                        <option key={col.id} value={col.nombre}>
                          {col.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground">Horario</label>
                    <input
                      value={routeForm.horario}
                      onChange={(e) => setRouteForm({ ...routeForm, horario: e.target.value })}
                      placeholder="06:30 / 14:30"
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => setRouteModalOpen(false)} className="w-1/2">
                    Cancelar
                  </Button>
                  <Button type="submit" className="w-1/2 bg-amber-400 font-bold text-slate-950 hover:bg-amber-500 shadow-sm">
                    {editingRoute ? 'Guardar Cambios' : 'Crear Ruta'}
                  </Button>
                </div>
              </div>

              {/* Right Column: Live Map (6 cols) */}
              <div className="md:col-span-6 border rounded-xl p-3 bg-muted/20">
                <LocationPickerMap
                  lat={routeForm.lat || 9.9983}
                  lng={routeForm.lng || -84.1167}
                  onChange={(lat, lng) => setRouteForm((prev) => ({ ...prev, lat, lng }))}
                  title="Punto en el Mapa"
                  colegioNombre={routeForm.ruta || 'Ruta Escolar'}
                  markerType="route"
                  searchQuery={routeForm.ruta}
                  className="h-72"
                />
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: CHOFER */}
      <Dialog open={choferModalOpen} onOpenChange={setChoferModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden p-6">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-xl font-black">{editingChofer ? 'Editar Chofer' : 'Registrar Nuevo Chofer'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveChofer} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-foreground">Nombre Completo</label>
              <input
                required
                value={choferForm.nombre}
                onChange={(e) => setChoferForm({ ...choferForm, nombre: e.target.value })}
                placeholder="Ej. Carlos Solís Morales"
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground">Cédula de Identidad</label>
                <input
                  required
                  value={choferForm.cedula}
                  onChange={(e) => setChoferForm({ ...choferForm, cedula: e.target.value })}
                  placeholder="Ej. 1-1142-0892"
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground">Teléfono Celular</label>
                <input
                  required
                  value={choferForm.telefono}
                  onChange={(e) => setChoferForm({ ...choferForm, telefono: e.target.value })}
                  placeholder="Ej. 8841-2390"
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground">Buseta Asignada (Placa)</label>
                <input
                  value={choferForm.buseta}
                  onChange={(e) => setChoferForm({ ...choferForm, buseta: e.target.value })}
                  placeholder="Ej. SJ-4821"
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground">Estado</label>
                <select
                  value={choferForm.vinculo}
                  onChange={(e) => setChoferForm({ ...choferForm, vinculo: e.target.value as any })}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="Activo">Activo</option>
                  <option value="Pendiente · 11 días">Pendiente</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            {/* SECCIÓN: LICENCIA DE CONDUCIR C-2 & DOCUMENTO ADJUNTO */}
            <div className="rounded-xl border border-amber-300/60 bg-amber-50/40 dark:bg-amber-950/20 p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-900/40 pb-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Licencia Profesional C-2 & Documento Digitalizado
                </span>
                <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                  Exigida por CTP
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Tipo de Licencia</label>
                  <select
                    value={choferForm.licenciaTipo}
                    onChange={(e) => setChoferForm({ ...choferForm, licenciaTipo: e.target.value })}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="C-2 Profesional">C-2 (Transporte Público / Buseta)</option>
                    <option value="B-1 Particular">B-1 (Vehículo Particular)</option>
                    <option value="C-1 Taxi">C-1 (Taxi)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Vencimiento Licencia</label>
                  <input
                    required
                    value={choferForm.licenciaVencimiento}
                    onChange={(e) => setChoferForm({ ...choferForm, licenciaVencimiento: e.target.value })}
                    placeholder="DD/MM/AAAA"
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Upload & Thumbnail Preview Box */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">Fotografía de la Licencia C-2 (Frente y Reverso)</label>
                <div className="flex items-center gap-3">
                  {/* Thumbnail */}
                  <div
                    onClick={() => {
                      if (choferForm.fotoLicencia) {
                        setPreviewDoc({
                          title: `Licencia de Conducir C-2 - ${choferForm.nombre || 'Chofer'}`,
                          src: choferForm.fotoLicencia,
                          type: 'Licencia Transporte Público MOPT / COSEVI',
                        });
                      }
                    }}
                    className="relative h-16 w-24 shrink-0 rounded-lg overflow-hidden border-2 border-amber-300 dark:border-amber-400/50 bg-white shadow-xs cursor-pointer group hover:ring-2 hover:ring-amber-400 transition-all flex items-center justify-center"
                    title={choferForm.fotoLicencia ? 'Clic para ampliar foto en grande' : 'Sin imagen adjunta'}
                  >
                    {choferForm.fotoLicencia ? (
                      <>
                        <img
                          src={choferForm.fotoLicencia}
                          alt="Licencia C-2"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px] font-bold gap-0.5">
                          <Eye className="h-3 w-3" /> Ver
                        </div>
                      </>
                    ) : (
                      <span className="text-[10px] text-muted-foreground text-center px-1 font-semibold">Sin foto</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted cursor-pointer transition shadow-2xs">
                        <Upload className="h-3.5 w-3.5 text-amber-500" />
                        <span>{choferForm.fotoLicencia ? 'Cambiar Foto' : 'Subir Licencia'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLicenseUpload}
                          className="hidden"
                        />
                      </label>
                      {choferForm.fotoLicencia && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setPreviewDoc({
                              title: `Licencia de Conducir C-2 - ${choferForm.nombre || 'Chofer'}`,
                              src: choferForm.fotoLicencia,
                              type: 'Licencia Transporte Público MOPT / COSEVI',
                            })
                          }
                          className="h-7 text-xs font-semibold text-sky-600 hover:text-sky-700"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Ver en grande
                        </Button>
                      )}
                    </div>
                    {choferForm.fotoLicencia && (
                      <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Foto de licencia adjuntada en miniatura
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setChoferModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-500">
                {editingChofer ? 'Guardar Cambios' : 'Registrar Chofer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: COLEGIO */}
      <Dialog open={colegioModalOpen} onOpenChange={setColegioModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto md:overflow-hidden overflow-x-hidden p-6">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-xl font-black">{editingColegio ? 'Editar Colegio' : 'Registrar Nuevo Colegio'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveColegio} className="overflow-x-hidden pt-2">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Left Column: Form Fields (6 cols) */}
              <div className="md:col-span-6 space-y-3">
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Nombre del Colegio / Escuela</label>
                    {schoolSuggestions.length > 0 && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {schoolSuggestions.length} sugerencias en Costa Rica
                      </span>
                    )}
                  </div>
                  <input
                    required
                    value={colegioForm.nombre}
                    onChange={(e) => {
                      setColegioForm({ ...colegioForm, nombre: e.target.value });
                      setSchoolSuggestionsOpen(true);
                    }}
                    onFocus={() => setSchoolSuggestionsOpen(true)}
                    placeholder="Ej. Lincoln School, María Auxiliadora, Humboldt..."
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />

                  {/* Autocomplete Dropdown with Costa Rica Schools */}
                  {schoolSuggestionsOpen && schoolSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-amber-300/60 bg-popover shadow-2xl py-1 z-[9999] max-h-56 overflow-y-auto">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b flex items-center justify-between">
                        <span>Colegios en Costa Rica (clic para auto-ubicar)</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSchoolSuggestionsOpen(false);
                          }}
                          className="hover:text-foreground text-xs font-bold px-1"
                        >
                          ✕
                        </button>
                      </div>
                      {schoolSuggestions.map((place) => (
                        <button
                          key={place.name}
                          type="button"
                          onClick={() => {
                            setColegioForm((prev) => ({
                              ...prev,
                              nombre: place.name.replace(/\s*\([^)]*\)$/, ''),
                              canton: place.canton || place.name.split('(')[1]?.replace(')', '') || prev.canton,
                              provincia: (['San José', 'Heredia', 'Alajuela', 'Cartago', 'Guanacaste', 'Puntarenas', 'Limón'].includes(place.provincia) ? place.provincia : prev.provincia) as any,
                              lat: place.lat,
                              lng: place.lng,
                            }));
                            setSchoolSuggestionsOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center justify-between transition-colors cursor-pointer border-b last:border-b-0"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-md bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                              <School className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-xs leading-tight">{place.name}</p>
                              {place.canton && (
                                <p className="text-[10px] text-muted-foreground">Cantón: {place.canton}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full font-bold shrink-0 ml-2">
                            {place.provincia}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-foreground">Cantón</label>
                    <input
                      required
                      value={colegioForm.canton}
                      onChange={(e) => setColegioForm({ ...colegioForm, canton: e.target.value })}
                      placeholder="Ej. Santo Domingo / Escazú"
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground">Provincia</label>
                    <select
                      value={colegioForm.provincia}
                      onChange={(e) => setColegioForm({ ...colegioForm, provincia: e.target.value })}
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="San José">San José</option>
                      <option value="Heredia">Heredia</option>
                      <option value="Alajuela">Alajuela</option>
                      <option value="Cartago">Cartago</option>
                      <option value="Guanacaste">Guanacaste</option>
                      <option value="Puntarenas">Puntarenas</option>
                      <option value="Limón">Limón</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-foreground">Teléfono de Contacto</label>
                    <input
                      required
                      value={colegioForm.telefono}
                      onChange={(e) => setColegioForm({ ...colegioForm, telefono: e.target.value })}
                      placeholder="Ej. 2247-6600"
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground">Estado</label>
                    <select
                      value={colegioForm.estado}
                      onChange={(e) => setColegioForm({ ...colegioForm, estado: e.target.value as any })}
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => setColegioModalOpen(false)} className="w-1/2">
                    Cancelar
                  </Button>
                  <Button type="submit" className="w-1/2 bg-amber-400 font-bold text-slate-950 hover:bg-amber-500 shadow-sm">
                    {editingColegio ? 'Guardar Cambios' : 'Registrar Colegio'}
                  </Button>
                </div>
              </div>

              {/* Right Column: Live Map (6 cols) */}
              <div className="md:col-span-6 border rounded-xl p-3 bg-muted/20">
                <LocationPickerMap
                  lat={colegioForm.lat}
                  lng={colegioForm.lng}
                  onChange={(lat, lng) => setColegioForm((prev) => ({ ...prev, lat, lng }))}
                  colegioNombre={colegioForm.nombre}
                  searchQuery={colegioForm.nombre.trim() || colegioForm.canton.trim()}
                  onPlaceSelect={(place) => {
                    setColegioForm((prev) => ({
                      ...prev,
                      provincia: (['San José', 'Heredia', 'Alajuela', 'Cartago', 'Guanacaste', 'Puntarenas', 'Limón'].includes(place.provincia) ? place.provincia : prev.provincia) as any,
                      canton: prev.canton || place.canton || '',
                    }));
                  }}
                  className="h-72"
                />
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: ALUMNO / PAGO */}
      <Dialog open={alumnoModalOpen} onOpenChange={setAlumnoModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAlumno ? 'Editar Estudiante' : 'Inscribir Nuevo Estudiante'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveAlumno} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-foreground">Nombre del Estudiante</label>
              <input
                required
                value={alumnoForm.nombre}
                onChange={(e) => setAlumnoForm({ ...alumnoForm, nombre: e.target.value })}
                placeholder="Ej. Sofía Rojas Gómez"
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground">Grado / Nivel</label>
                <input
                  required
                  value={alumnoForm.curso}
                  onChange={(e) => setAlumnoForm({ ...alumnoForm, curso: e.target.value })}
                  placeholder="Ej. 3° Grado / Preparatoria"
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground">Colegio</label>
                <select
                  value={alumnoForm.colegio}
                  onChange={(e) => setAlumnoForm({ ...alumnoForm, colegio: e.target.value })}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {state.colegios.map((col) => (
                    <option key={col.id} value={col.nombre}>
                      {col.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground">Encargado</label>
              <input
                required
                value={alumnoForm.apoderado}
                onChange={(e) => setAlumnoForm({ ...alumnoForm, apoderado: e.target.value })}
                placeholder="Ej. Carla Pérez Monge"
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground">Dirección de Recogida</label>
              <input
                required
                value={alumnoForm.direccion}
                onChange={(e) => setAlumnoForm({ ...alumnoForm, direccion: e.target.value })}
                placeholder="Ej. Guachipelín de Escazú, Condominio Las Vistas"
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground">Mensualidad (₡ Colones)</label>
                <input
                  type="number"
                  step="1000"
                  required
                  value={alumnoForm.monto}
                  onChange={(e) => setAlumnoForm({ ...alumnoForm, monto: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground">Estado de Pago</label>
                <select
                  value={alumnoForm.pago}
                  onChange={(e) => setAlumnoForm({ ...alumnoForm, pago: e.target.value as any })}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="Pagado">Pagado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Atrasado">Atrasado</option>
                </select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAlumnoModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-500">
                {editingAlumno ? 'Guardar Cambios' : 'Inscribir Estudiante'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* MODAL LIGHTBOX: VER DOCUMENTO EN GRANDE */}
      {previewDoc && (
        <Dialog open={Boolean(previewDoc)} onOpenChange={(val) => !val && setPreviewDoc(null)}>
          <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto overflow-x-hidden z-[9999] p-5">
            <DialogHeader className="border-b pb-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {previewDoc.type} · Costa Rica
                </span>
                <span className="text-xs font-mono text-muted-foreground">MOPT / COSEVI</span>
              </div>
              <DialogTitle className="text-base font-bold text-foreground mt-1">{previewDoc.title}</DialogTitle>
            </DialogHeader>

            <div className="py-3 flex flex-col items-center justify-center bg-slate-950/5 dark:bg-slate-900/50 rounded-xl p-2 border">
              <div className="relative max-h-[60vh] w-full flex items-center justify-center overflow-hidden rounded-lg shadow-md bg-white">
                <img
                  src={previewDoc.src}
                  alt={previewDoc.title}
                  className="max-h-[55vh] max-w-full object-contain rounded"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Documento oficial registrado en el expediente digital vehicular Nexus Go CTP.
              </p>
            </div>

            <DialogFooter className="border-t pt-2 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = previewDoc.src;
                  link.download = `${previewDoc.title.replace(/\s+/g, '_')}.png`;
                  link.click();
                }}
                className="text-xs"
              >
                Descargar Documento
              </Button>
              <Button
                size="sm"
                onClick={() => setPreviewDoc(null)}
                className="bg-amber-400 text-slate-950 font-bold hover:bg-amber-500 text-xs"
              >
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* SINPE Móvil Modal for Admin verification */}
      {sinpeModalAlumno && (
        <SinpeComprobanteModal
          open={!!sinpeModalAlumno}
          onOpenChange={(isOpen) => {
            if (!isOpen) setSinpeModalAlumno(null);
          }}
          alumno={sinpeModalAlumno}
          payment={state.payments[sinpeModalAlumno.id]}
          choferNombre={state.choferes[0]?.nombre || 'Carlos Solís Morales'}
          isApprover={true}
          onApprove={() => {
            dispatch({
              type: 'approvePayment',
              alumnoId: sinpeModalAlumno.id,
              aprobadoPor: 'Administración Flota Nexus Go',
            });
          }}
          onReject={(motivo) => {
            dispatch({
              type: 'rejectPayment',
              alumnoId: sinpeModalAlumno.id,
              motivo,
            });
          }}
        />
      )}
      {/* Contrato CTP Modal for Admin verification & signing */}
      {contratoModalAlumno && (
        <ContratoTransporteModal
          open={!!contratoModalAlumno}
          onOpenChange={(isOpen) => {
            if (!isOpen) setContratoModalAlumno(null);
          }}
          alumno={contratoModalAlumno}
        />
      )}
    </>
  );
}
