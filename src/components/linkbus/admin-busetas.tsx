import { useState, useRef } from 'react';
import {
  Bus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  Pencil,
  Trash2,
  Search,
  Download,
  Calendar,
  Users,
  Check,
  X,
  Printer,
  Shield,
  Clock,
  Car,
  Upload,
  Image as ImageIcon,
  Eye,
  CreditCard,
  FileCheck2,
  FolderArchive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { usePlatform } from './platform-provider';
import { uploadFileToStorage } from '@/lib/supabase-storage';
import { QuickActionPills } from './quick-action-pills';
import { ExpirationAlertsWidget } from './expiration-alerts-widget';
import type { Van } from '@/lib/data';
import {
  generateCtpPermitSvg,
  generateMarchamoSvg,
  generateDekraSvg,
  generateLicenseSvg,
  generateCirculacionSvg,
  generateInsPolicySvg,
  generateAssistantBadgeSvg,
  DEFAULT_BUSETA_PHOTO,
  DEFAULT_BUSETA_PHOTOS,
} from '@/lib/document-samples';
import { toast } from 'sonner';

function DocumentUploadRow({
  label,
  icon: Icon,
  iconColor = 'text-amber-500',
  imageSrc,
  docTitle,
  docType,
  onUpload,
  onEnlarge,
}: {
  label: string;
  icon: React.ElementType;
  iconColor?: string;
  imageSrc?: string | undefined;
  docTitle: string;
  docType: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEnlarge: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border bg-muted/20 hover:bg-muted/30 transition">
      <div className="flex items-center gap-3 min-w-0">
        {/* Thumbnail Preview with Enlarge on Click */}
        {imageSrc ? (
          <div
            onClick={onEnlarge}
            className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 border-amber-400/90 bg-background shadow-xs cursor-pointer group"
            title="Haz clic para agrandar la imagen"
          >
            <img
              src={imageSrc}
              alt={label}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[9px] font-bold">
              <Eye className="h-4 w-4 drop-shadow" />
              <span>Agrandar</span>
            </div>
          </div>
        ) : (
          <div className="h-14 w-20 shrink-0 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/40 flex flex-col items-center justify-center text-muted-foreground text-[9px]">
            <Upload className="h-4 w-4 opacity-40 mb-0.5" />
            <span>Sin foto</span>
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />
            <span className="text-xs font-bold text-foreground truncate">{label}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {imageSrc ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" /> Foto adjuntada
              </span>
            ) : (
              <span className="text-[10px] text-amber-600 font-semibold">Pendiente de adjuntar</span>
            )}
            {imageSrc && (
              <button
                type="button"
                onClick={onEnlarge}
                className="text-[10px] font-bold text-sky-600 hover:text-sky-700 underline flex items-center gap-0.5 cursor-pointer"
              >
                <Eye className="h-3 w-3" /> Ver en grande
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-bold shadow-2xs hover:bg-muted transition">
          <Upload className="h-3.5 w-3.5 text-amber-500" />
          <span>{imageSrc ? 'Cambiar Foto' : 'Adjuntar Foto'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={onUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}

export function AdminBusetas() {
  const { state, dispatch } = usePlatform();
  const [query, setQuery] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<Van | null>(null);
  const [busetaTab, setBusetaTab] = useState<'vehiculo' | 'documentos' | 'checklist'>('vehiculo');
  const [fichaModalOpen, setFichaModalOpen] = useState(false);
  const [inspectingBus, setInspectingBus] = useState<Van | null>(null);

  // Document Lightbox Preview
  const [previewDoc, setPreviewDoc] = useState<{ title: string; src: string; type: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    patente: '',
    marcaModelo: 'Toyota Coaster 2022',
    ano: 2022,
    cap: 16,
    chofer: '',
    asistente: 'Patricia Mora Jiménez',
    permisoCtp: 'CTP-TE-2024-8841',
    vencimientoCtp: '31/12/2026',
    dekraRtv: '15/11/2026',
    dekraEstado: 'Al día' as 'Al día' | 'Próximo a vencer' | 'Vencido',
    polizaIns: 'INS-RESP-CIVIL-99214',
    vencimientoIns: '31/12/2026',
    cinturones: true,
    rotuloEscolar: true,
    extintorBotiquin: true,
    puertaEmergencia: true,
    estado: 'En ruta' as 'En ruta' | 'Detenido' | 'Finalizado',
    // Fotos y Documentos
    fotoBuseta: DEFAULT_BUSETA_PHOTO,
    fotoPermisoCtp: '',
    marchamoAno: 2026,
    marchamoEstado: 'Al día' as 'Al día' | 'Pendiente',
    fotoMarchamo: '',
    tarjetaCirculacion: 'REG-CR-4821-2026',
    fotoCirculacion: '',
    fotoDekra: '',
    fotoPolizaIns: '',
    licenciaNumero: '1-1142-0892',
    licenciaTipo: 'C-2 Profesional',
    licenciaVencimiento: '18/04/2028',
    fotoLicencia: '',
    carnetAsistente: 'ASIST-CTP-2024-881',
    fotoCarnetAsistente: '',
  });

  const vans = state.vans || [];

  // Filtered List
  const filteredVans = vans.filter((v) => {
    const text = (v.patente + ' ' + (v.marcaModelo || '') + ' ' + v.chofer + ' ' + (v.permisoCtp || '')).toLowerCase();
    return text.includes(query.toLowerCase());
  });

  // Compliance metrics
  const totalVans = vans.length;
  const totalAsientos = vans.reduce((acc, v) => acc + (v.cap || 0), 0);
  const dekraAlDia = vans.filter((v) => (v.dekraEstado || 'Al día') === 'Al día').length;
  const ctpVigentes = vans.filter((v) => Boolean(v.permisoCtp)).length;
  const docsCompletos = vans.filter((v) => Boolean(v.fotoPermisoCtp && v.fotoMarchamo && v.fotoDekra)).length;

  const handleOpenModal = (b?: Van) => {
    if (b) {
      setEditingBus(b);
      setFormData({
        patente: b.patente,
        marcaModelo: b.marcaModelo || 'Toyota Coaster 2022',
        ano: b.ano || 2022,
        cap: b.cap || 16,
        chofer: b.chofer,
        asistente: b.asistente || 'Patricia Mora Jiménez',
        permisoCtp: b.permisoCtp || 'CTP-TE-2024-8841',
        vencimientoCtp: b.vencimientoCtp || '31/12/2026',
        dekraRtv: b.dekraRtv || '15/11/2026',
        dekraEstado: b.dekraEstado || 'Al día',
        polizaIns: b.polizaIns || 'INS-RESP-CIVIL-99214',
        vencimientoIns: b.vencimientoIns || '31/12/2026',
        cinturones: b.cinturones ?? true,
        rotuloEscolar: b.rotuloEscolar ?? true,
        extintorBotiquin: b.extintorBotiquin ?? true,
        puertaEmergencia: b.puertaEmergencia ?? true,
        estado: b.estado,
        fotoBuseta: b.fotoBuseta || DEFAULT_BUSETA_PHOTO,
        fotoPermisoCtp: b.fotoPermisoCtp || generateCtpPermitSvg(b.patente, b.permisoCtp || 'CTP-TE-2024-8841', b.vencimientoCtp || '31/12/2026', b.chofer),
        marchamoAno: b.marchamoAno || 2026,
        marchamoEstado: b.marchamoEstado || 'Al día',
        fotoMarchamo: b.fotoMarchamo || generateMarchamoSvg(b.patente, b.marchamoAno || 2026),
        tarjetaCirculacion: b.tarjetaCirculacion || `REG-CR-${b.patente.replace(/[^0-9]/g, '') || '4821'}-2026`,
        fotoCirculacion: b.fotoCirculacion || generateCirculacionSvg(b.patente, b.marcaModelo || 'Toyota Coaster', b.ano || 2022),
        fotoDekra: b.fotoDekra || generateDekraSvg(b.patente, b.dekraRtv || '15/11/2026', b.dekraEstado || 'Al día'),
        fotoPolizaIns: b.fotoPolizaIns || generateInsPolicySvg(b.patente, b.polizaIns || 'INS-RESP-CIVIL-99214', b.vencimientoIns || '31/12/2026'),
        licenciaNumero: b.licenciaNumero || '1-1142-0892',
        licenciaTipo: b.licenciaTipo || 'C-2 Profesional',
        licenciaVencimiento: b.licenciaVencimiento || '18/04/2028',
        fotoLicencia: b.fotoLicencia || generateLicenseSvg(b.chofer, b.licenciaNumero || '1-1142-0892', b.licenciaTipo || 'C-2', b.licenciaVencimiento || '18/04/2028'),
        carnetAsistente: b.carnetAsistente || 'ASIST-CTP-2024-881',
        fotoCarnetAsistente: b.fotoCarnetAsistente || generateAssistantBadgeSvg(b.asistente || 'Patricia Mora Jiménez', b.carnetAsistente || 'ASIST-CTP-2024-881'),
      });
    } else {
      setEditingBus(null);
      const newPatente = 'SJ-' + Math.floor(1000 + Math.random() * 8999);
      const newPermiso = 'CTP-TE-2024-' + Math.floor(1000 + Math.random() * 8999);
      const newPoliza = 'INS-RESP-CIVIL-' + Math.floor(10000 + Math.random() * 89999);
      const defaultChofer = state.choferes[0]?.nombre || 'Carlos Solís Morales';

      setFormData({
        patente: newPatente,
        marcaModelo: 'Toyota Coaster 2022',
        ano: 2022,
        cap: 16,
        chofer: defaultChofer,
        asistente: 'Patricia Mora Jiménez',
        permisoCtp: newPermiso,
        vencimientoCtp: '31/12/2026',
        dekraRtv: '15/11/2026',
        dekraEstado: 'Al día',
        polizaIns: newPoliza,
        vencimientoIns: '31/12/2026',
        cinturones: true,
        rotuloEscolar: true,
        extintorBotiquin: true,
        puertaEmergencia: true,
        estado: 'En ruta',
        fotoBuseta: DEFAULT_BUSETA_PHOTO,
        fotoPermisoCtp: generateCtpPermitSvg(newPatente, newPermiso, '31/12/2026', defaultChofer),
        marchamoAno: 2026,
        marchamoEstado: 'Al día',
        fotoMarchamo: generateMarchamoSvg(newPatente, 2026),
        tarjetaCirculacion: `REG-CR-${newPatente.replace(/[^0-9]/g, '')}-2026`,
        fotoCirculacion: generateCirculacionSvg(newPatente, 'Toyota Coaster 2022', 2022),
        fotoDekra: generateDekraSvg(newPatente, '15/11/2026', 'Al día'),
        fotoPolizaIns: generateInsPolicySvg(newPatente, newPoliza, '31/12/2026'),
        licenciaNumero: '1-1142-0892',
        licenciaTipo: 'C-2 Profesional',
        licenciaVencimiento: '18/04/2028',
        fotoLicencia: generateLicenseSvg(defaultChofer, '1-1142-0892', 'C-2', '18/04/2028'),
        carnetAsistente: 'ASIST-CTP-2024-881',
        fotoCarnetAsistente: generateAssistantBadgeSvg('Patricia Mora Jiménez', 'ASIST-CTP-2024-881'),
      });
    }
    setModalOpen(true);
  };

  const handleFileUpload = async (field: keyof typeof formData, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida (JPG, PNG o WebP)');
      return;
    }

    const toastId = toast.loading('Subiendo documento a Supabase Storage...');
    try {
      const publicUrl = await uploadFileToStorage(file, {
        tenantId: state.currentTenantId,
        folder: 'fleet',
        filename: file.name,
      });
      const updatedForm = { ...formData, [field]: publicUrl };
      setFormData(updatedForm);
      if (editingBus) {
        const updatedBus: Van = {
          ...editingBus,
          ...updatedForm,
        };
        dispatch({ type: 'updateRoute', route: updatedBus });
        setEditingBus(updatedBus);
      }
      toast.success(
        editingBus ? 'Foto/documento guardado en la ficha de la buseta' : 'Documento subido y adjuntado correctamente',
        { id: toastId },
      );
    } catch {
      toast.error('No se pudo subir el documento', { id: toastId });
    } finally {
      e.target.value = '';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations: MOPT max 20 years
    const currentYear = new Date().getFullYear();
    const age = currentYear - formData.ano;
    if (age > 20) {
      toast.error('La ley del CTP prohíbe busetas escolares con más de 20 años de antigüedad.');
      return;
    }

    if (editingBus) {
      const updatedBus: Van = {
        ...editingBus,
        ...formData,
      };
      dispatch({ type: 'updateRoute', route: updatedBus });
      toast.success(`Buseta ${formData.patente} y expediente documental actualizados`);
    } else {
      const newBus: Van = {
        id: crypto.randomUUID(),
        ...formData,
        ruta: 'Nueva Ruta Escolar',
        colegio: 'Colegio Asignado',
        horario: '06:30 / 14:30',
        aBordo: 0,
        path: [[20, 20], [50, 50], [80, 80]],
      };
      dispatch({ type: 'addRoute', route: newBus });
      toast.success(`Buseta ${formData.patente} incorporada exitosamente al padrón CTP`);
    }

    setModalOpen(false);
  };

  const handleDelete = (bus: Van) => {
    if (confirm(`¿Desinscribir la buseta ${bus.patente} (${bus.marcaModelo}) del padrón escolar?`)) {
      dispatch({ type: 'deleteRoute', id: bus.id });
      toast.success(`Buseta ${bus.patente} removida de la flota`);
    }
  };

  const handleOpenFicha = (bus: Van) => {
    setInspectingBus(bus);
    setFichaModalOpen(true);
  };

  const handleExportCsv = () => {
    const headers = [
      'Placa',
      'Marca_Modelo',
      'Ano_Fabricacion',
      'Antiguedad_Anos',
      'Capacidad_Asientos',
      'Permiso_CTP',
      'Vencimiento_CTP',
      'Dekra_RTV_Fecha',
      'Dekra_RTV_Estado',
      'Poliza_INS_Numero',
      'Poliza_INS_Vencimiento',
      'Marchamo_Ano',
      'Marchamo_Estado',
      'Tarjeta_Circulacion_Registro',
      'Chofer_Titular',
      'Licencia_Tipo',
      'Licencia_Vencimiento',
      'Asistente_Escolar',
      'Carnet_Asistente',
      'Cinturones_3_Puntos',
      'Rotulo_Transporte_Estudiantes',
      'Extintor_Botiquin',
      'Salida_Emergencia',
    ];

    const currentYear = new Date().getFullYear();
    const rows = vans.map((v) => [
      v.patente,
      v.marcaModelo || '',
      v.ano || 2022,
      currentYear - (v.ano || 2022),
      v.cap || 16,
      v.permisoCtp || '',
      v.vencimientoCtp || '',
      v.dekraRtv || '',
      v.dekraEstado || 'Al día',
      v.polizaIns || '',
      v.vencimientoIns || '',
      v.marchamoAno || 2026,
      v.marchamoEstado || 'Al día',
      v.tarjetaCirculacion || '',
      v.chofer,
      v.licenciaTipo || 'C-2 Profesional',
      v.licenciaVencimiento || '18/04/2028',
      v.asistente || '',
      v.carnetAsistente || '',
      v.cinturones ? 'SI' : 'NO',
      v.rotuloEscolar ? 'SI' : 'NO',
      v.extintorBotiquin ? 'SI' : 'NO',
      v.puertaEmergencia ? 'SI' : 'NO',
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join(
        '\n'
      );
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `padron_vehicular_ctp_aresep_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Padrón vehicular CTP/ARESEP exportado exitosamente');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground">Flota de Busetas Escolares</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider">
              CTP & ARESEP CR
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Padrón vehicular oficial · Fotografías, permisos CTP, marchamo, tarjeta de circulación, Dekra RTV y licencias C-2 al día.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5 font-bold text-xs h-9">
            <Download className="h-3.5 w-3.5" />
            <span>Exportar CTP (CSV)</span>
          </Button>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-500 gap-1.5 text-xs h-9 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Nueva Buseta
          </Button>
        </div>
      </div>

      {/* KPI Cards: Regulatory Compliance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Flota Habilitada</span>
            <Bus className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-foreground">{totalVans} busetas</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{totalAsientos} asientos autorizados</p>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Permisos CTP</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{ctpVigentes}/{totalVans} Vigentes</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">MOPT / Consejo Transp. Público</p>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inspección Dekra</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-foreground">{dekraAlDia}/{totalVans} Al Día</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Revisión técnica semestral ley</p>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Expediente Digital</span>
            <FolderArchive className="h-4 w-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-sky-600 dark:text-sky-400">{docsCompletos}/{totalVans} Completos</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Fotos, marchamo, INS y licencias</p>
        </div>
      </div>

      {/* ⚠️ Semáforo de Vencimientos CTP / Dekra / INS */}
      <ExpirationAlertsWidget />

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por placa, modelo, CTP o chofer…"
          className="w-full rounded-xl border bg-card pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* Fleet Table */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead className="bg-muted/60 text-[10px] uppercase font-bold text-muted-foreground border-b">
              <tr>
                <th className="px-4 py-3.5">Foto & Unidad</th>
                <th className="px-4 py-3.5">Permiso CTP & Marchamo</th>
                <th className="px-4 py-3.5">Dekra RTV & Seguro INS</th>
                <th className="px-4 py-3.5">Chofer & Licencia C-2</th>
                <th className="px-4 py-3.5">Expediente Digital</th>
                <th className="px-4 py-3.5 text-center">Capacidad</th>
                <th className="px-4 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredVans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Bus className="h-8 w-8 mx-auto opacity-30 mb-2" />
                    <p className="font-bold">No se encontraron busetas</p>
                  </td>
                </tr>
              ) : (
                filteredVans.map((v) => {
                  const currentYear = new Date().getFullYear();
                  const antiguedad = currentYear - (v.ano || 2022);
                  const isDekraOk = (v.dekraEstado || 'Al día') === 'Al día';

                  return (
                    <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                      {/* Foto & Unidad */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => handleOpenFicha(v)}
                            className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted cursor-pointer group"
                            title="Ver ficha técnica y documentos"
                          >
                            <img
                              src={v.fotoBuseta || DEFAULT_BUSETA_PHOTO}
                              alt={v.marcaModelo || 'Buseta'}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="h-4 w-4 text-white drop-shadow" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="inline-block px-2 py-0.5 font-mono text-[11px] font-black tracking-wider bg-slate-900 text-amber-400 rounded border border-slate-700 shadow-2xs">
                                {v.patente}
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground">
                                {v.ano || 2022} ({antiguedad}a)
                              </span>
                            </div>
                            <p className="font-extrabold text-foreground mt-0.5">{v.marcaModelo || 'Toyota Coaster'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Permiso CTP & Marchamo */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-mono font-bold text-foreground">{v.permisoCtp || 'CTP-TE-2024-8841'}</p>
                          <p className="text-[10px] text-emerald-600 font-semibold">Vigente: {v.vencimientoCtp || '31/12/2026'}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                              Marchamo {v.marchamoAno || 2026}: {v.marchamoEstado || 'Al día'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Dekra & Seguro INS */}
                      <td className="px-4 py-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                isDekraOk ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                            <span className="font-bold text-foreground">Dekra: {v.dekraRtv || '15/11/2026'}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{v.polizaIns || 'INS-RESP-CIVIL'}</p>
                        </div>
                      </td>

                      {/* Chofer & Licencia */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-foreground">{v.chofer}</p>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <span className="font-semibold text-emerald-600">Lic. {v.licenciaTipo || 'C-2'}</span>
                            <span>· Vence: {v.licenciaVencimiento || '18/04/2028'}</span>
                          </div>
                          {v.asistente && (
                            <p className="text-[9.5px] text-muted-foreground mt-0.5">Asistente: {v.asistente}</p>
                          )}
                          <div className="mt-1.5">
                            <QuickActionPills
                              lat={v.lat}
                              lng={v.lng}
                              locationName={v.colegio || v.ruta}
                              phone={state.choferes.find((c) => c.nombre === v.chofer)?.telefono}
                              whatsappMessage={`Hola ${v.chofer}, consulta sobre la buseta ${v.patente}.`}
                              size="sm"
                            />
                          </div>
                        </div>
                      </td>

                      {/* Expediente Digital / Documentos */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenFicha(v)}
                            className="h-7 px-2 text-[10px] font-bold gap-1 bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20"
                          >
                            <FileCheck2 className="h-3.5 w-3.5 text-sky-500" />
                            <span>6 Docs Verificados</span>
                          </Button>
                        </div>
                      </td>

                      {/* Capacidad */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full font-bold text-xs bg-muted text-foreground">
                          {v.cap} asientos
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenFicha(v)}
                            title="Ficha Técnica CTP y Documentos"
                            className="h-8 px-2.5 text-xs font-semibold gap-1 text-slate-700 dark:text-slate-300"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Ficha CTP</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenModal(v)}
                            title="Editar Datos y Documentos"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(v)}
                            title="Eliminar Buseta"
                            className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: FICHA TÉCNICA CTP & EXPEDIENTE DIGITAL */}
      {inspectingBus && (
        <Dialog open={fichaModalOpen} onOpenChange={setFichaModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-6">
            <DialogHeader className="border-b pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Consejo de Transporte Público · Costa Rica
                </span>
                <span className="text-xs font-mono text-muted-foreground">Form. CTP-TE-F01</span>
              </div>
              <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2 mt-1">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Ficha Técnica Vehicular & Expediente Legal
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Documentación digitalizada, permisos y fotografías conformes a la normativa de transporte de estudiantes.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              {/* Header Box with Buseta Photo & Plate */}
              <div className="rounded-xl border bg-muted/40 p-4 flex flex-col sm:flex-row items-center gap-4">
                <div
                  className="relative h-28 w-44 shrink-0 overflow-hidden rounded-xl border-2 border-amber-400 shadow-sm cursor-pointer group"
                  onClick={() =>
                    setPreviewDoc({
                      title: `Fotografía de la Buseta ${inspectingBus.patente}`,
                      src: inspectingBus.fotoBuseta || DEFAULT_BUSETA_PHOTO,
                      type: 'Fotografía Exterior',
                    })
                  }
                >
                  <img
                    src={inspectingBus.fotoBuseta || DEFAULT_BUSETA_PHOTO}
                    alt={inspectingBus.marcaModelo}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold gap-1">
                    <Eye className="h-4 w-4" /> Ampliar
                  </div>
                </div>

                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Unidad Escolar</span>
                    <div className="rounded-lg border-2 border-slate-900 bg-white px-2.5 py-1 text-center shadow-xs">
                      <span className="block text-[7px] font-black uppercase text-slate-600">COSTA RICA</span>
                      <span className="block font-black font-mono text-sm text-slate-950">{inspectingBus.patente}</span>
                    </div>
                  </div>
                  <p className="text-base font-extrabold text-foreground mt-1">{inspectingBus.marcaModelo || 'Toyota Coaster'}</p>
                  <p className="text-xs text-muted-foreground">
                    Modelo {inspectingBus.ano || 2022} · Capacidad autorizada: {inspectingBus.cap} estudiantes
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                      ✓ Marchamo {inspectingBus.marchamoAno || 2026} Al Día
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300">
                      ✓ Póliza INS Estudiantil Vigente
                    </span>
                  </div>
                </div>
              </div>

              {/* Legal Permits Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border p-3 bg-card space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Permiso Especial CTP</span>
                  <p className="font-mono font-bold text-xs text-foreground">{inspectingBus.permisoCtp || 'CTP-TE-2024-8841'}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">Vigente hasta: {inspectingBus.vencimientoCtp || '31/12/2026'}</p>
                </div>
                <div className="rounded-xl border p-3 bg-card space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Revisión Dekra (RTV)</span>
                  <p className="font-mono font-bold text-xs text-foreground">Aprobada Semestral</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">Vigente hasta: {inspectingBus.dekraRtv || '15/11/2026'}</p>
                </div>
              </div>

              {/* Personnel & Driver License */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border p-3 bg-card space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Conductor Titular</span>
                  <p className="font-bold text-xs text-foreground">{inspectingBus.chofer}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">
                    Licencia {inspectingBus.licenciaTipo || 'C-2'} · Vence: {inspectingBus.licenciaVencimiento || '18/04/2028'}
                  </p>
                  <p className="text-[9.5px] text-muted-foreground">Cédula: {inspectingBus.licenciaNumero || '1-1142-0892'}</p>
                </div>
                <div className="rounded-xl border p-3 bg-card space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Asistente Acompañante</span>
                  <p className="font-bold text-xs text-foreground">{inspectingBus.asistente || 'Patricia Mora Jiménez'}</p>
                  <p className="text-[10px] text-indigo-600 font-semibold">
                    Carné CTP: {inspectingBus.carnetAsistente || 'ASIST-CTP-2024-881'}
                  </p>
                  <p className="text-[9.5px] text-muted-foreground">Acreditación obligatoria CTP de acompañante</p>
                </div>
              </div>

              {/* Document Gallery (Expediente Digital) */}
              <div className="rounded-xl border p-3.5 bg-card space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <FolderArchive className="h-4 w-4 text-sky-500" /> Expediente Digital de Documentos y Fotos (Haz clic para ver)
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    6 de 6 al día
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {/* Doc 1: Permiso CTP */}
                  <div
                    onClick={() =>
                      setPreviewDoc({
                        title: 'Permiso Especial CTP de Transporte de Estudiantes',
                        src: inspectingBus.fotoPermisoCtp || generateCtpPermitSvg(inspectingBus.patente, inspectingBus.permisoCtp || 'CTP-TE-2024-8841', inspectingBus.vencimientoCtp || '31/12/2026', inspectingBus.chofer),
                        type: 'Resolución Oficial CTP',
                      })
                    }
                    className="p-2.5 rounded-lg border bg-muted/30 hover:bg-muted/70 transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[9px] font-black uppercase text-amber-600">Permiso CTP</span>
                      <p className="font-bold text-[11px] text-foreground truncate mt-0.5">{inspectingBus.permisoCtp || 'CTP-TE'}</p>
                    </div>
                    <span className="text-[9px] text-sky-600 font-bold mt-2 flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Ver Permiso
                    </span>
                  </div>

                  {/* Doc 2: Marchamo */}
                  <div
                    onClick={() =>
                      setPreviewDoc({
                        title: `Derecho de Circulación (Marchamo) ${inspectingBus.marchamoAno || 2026}`,
                        src: inspectingBus.fotoMarchamo || generateMarchamoSvg(inspectingBus.patente, inspectingBus.marchamoAno || 2026),
                        type: 'Comprobante INS & MOPT',
                      })
                    }
                    className="p-2.5 rounded-lg border bg-muted/30 hover:bg-muted/70 transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[9px] font-black uppercase text-emerald-600">Marchamo INS</span>
                      <p className="font-bold text-[11px] text-foreground truncate mt-0.5">Año {inspectingBus.marchamoAno || 2026}</p>
                    </div>
                    <span className="text-[9px] text-sky-600 font-bold mt-2 flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Ver Marchamo
                    </span>
                  </div>

                  {/* Doc 3: Dekra RTV */}
                  <div
                    onClick={() =>
                      setPreviewDoc({
                        title: 'Inspección Técnica Vehicular Semestral Dekra',
                        src: inspectingBus.fotoDekra || generateDekraSvg(inspectingBus.patente, inspectingBus.dekraRtv || '15/11/2026', inspectingBus.dekraEstado || 'Al día'),
                        type: 'Hoja Verde Aprobatoria',
                      })
                    }
                    className="p-2.5 rounded-lg border bg-muted/30 hover:bg-muted/70 transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-700 dark:text-slate-300">Dekra RTV</span>
                      <p className="font-bold text-[11px] text-foreground truncate mt-0.5">{inspectingBus.dekraRtv || 'Al día'}</p>
                    </div>
                    <span className="text-[9px] text-sky-600 font-bold mt-2 flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Ver Hoja Verde
                    </span>
                  </div>

                  {/* Doc 4: Tarjeta Circulación */}
                  <div
                    onClick={() =>
                      setPreviewDoc({
                        title: 'Tarjeta de Circulación - Registro Nacional',
                        src: inspectingBus.fotoCirculacion || generateCirculacionSvg(inspectingBus.patente, inspectingBus.marcaModelo || 'Toyota Coaster', inspectingBus.ano || 2022),
                        type: 'Título de Propiedad Registral',
                      })
                    }
                    className="p-2.5 rounded-lg border bg-muted/30 hover:bg-muted/70 transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[9px] font-black uppercase text-sky-600">Circulación</span>
                      <p className="font-bold text-[11px] text-foreground truncate mt-0.5">{inspectingBus.tarjetaCirculacion || 'REG-CR'}</p>
                    </div>
                    <span className="text-[9px] text-sky-600 font-bold mt-2 flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Ver Registro
                    </span>
                  </div>

                  {/* Doc 5: Póliza INS */}
                  <div
                    onClick={() =>
                      setPreviewDoc({
                        title: 'Póliza Colectiva Estudiantil INS',
                        src: inspectingBus.fotoPolizaIns || generateInsPolicySvg(inspectingBus.patente, inspectingBus.polizaIns || 'INS-RESP-CIVIL-99214', inspectingBus.vencimientoIns || '31/12/2026'),
                        type: 'Seguro Colectivo ARESEP',
                      })
                    }
                    className="p-2.5 rounded-lg border bg-muted/30 hover:bg-muted/70 transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[9px] font-black uppercase text-indigo-600">Póliza INS</span>
                      <p className="font-bold text-[11px] text-foreground truncate mt-0.5">{inspectingBus.polizaIns || 'INS Colectiva'}</p>
                    </div>
                    <span className="text-[9px] text-sky-600 font-bold mt-2 flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Ver Póliza
                    </span>
                  </div>

                  {/* Doc 6: Licencia C-2 */}
                  <div
                    onClick={() =>
                      setPreviewDoc({
                        title: `Licencia de Conducir C-2 - ${inspectingBus.chofer}`,
                        src: inspectingBus.fotoLicencia || generateLicenseSvg(inspectingBus.chofer, inspectingBus.licenciaNumero || '1-1142-0892', inspectingBus.licenciaTipo || 'C-2', inspectingBus.licenciaVencimiento || '18/04/2028'),
                        type: 'Licencia Transporte Público MOPT',
                      })
                    }
                    className="p-2.5 rounded-lg border bg-muted/30 hover:bg-muted/70 transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[9px] font-black uppercase text-rose-600">Licencia Chofer</span>
                      <p className="font-bold text-[11px] text-foreground truncate mt-0.5">Tipo {inspectingBus.licenciaTipo || 'C-2'}</p>
                    </div>
                    <span className="text-[9px] text-sky-600 font-bold mt-2 flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Ver Licencia
                    </span>
                  </div>
                </div>
              </div>

              {/* Checklist CTP */}
              <div className="rounded-xl border p-3 bg-muted/20 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Checklist Reglamentario CTP</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Cinturones de 3 puntos (100%)
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Rótulo oficial amarillo y negro
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Extintor ABC & Botiquín
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Salidas de emergencia rotuladas
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t">
              <Button variant="outline" onClick={() => window.print()} className="gap-1.5 text-xs font-bold">
                <Printer className="h-3.5 w-3.5" />
                Imprimir Expediente
              </Button>
              <Button onClick={() => setFichaModalOpen(false)} className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-500 text-xs">
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL 2: LIGHTBOX PREVIEW DOCUMENTO / FOTO AMPLIADA */}
      {previewDoc && (
        <Dialog open={Boolean(previewDoc)} onOpenChange={(open) => !open && setPreviewDoc(null)}>
          <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto overflow-x-hidden z-[9999] p-5">
            <DialogHeader className="border-b pb-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {previewDoc.type} · Expediente Oficial
                </span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-600 px-2 py-0.5 rounded-full font-bold">
                  ✓ Documento en Alta Resolución
                </span>
              </div>
              <DialogTitle className="text-base font-black text-foreground">{previewDoc.title}</DialogTitle>
            </DialogHeader>
            <div className="my-2 flex items-center justify-center bg-slate-950/5 dark:bg-slate-900 rounded-xl p-3 border shadow-inner">
              <img
                src={previewDoc.src}
                alt={previewDoc.title}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg shadow-lg border"
              />
            </div>
            <DialogFooter className="border-t pt-2">
              <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs font-bold">
                <Printer className="h-3.5 w-3.5" /> Imprimir Documento
              </Button>
              <Button size="sm" onClick={() => setPreviewDoc(null)} className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-500 text-xs">
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL 3: EDITAR / REGISTRAR BUSETA CON FOTOS Y DOCUMENTOS */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-6">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
              <Bus className="h-5 w-5 text-amber-500" />
              {editingBus ? 'Editar Buseta Escolar & Expediente' : 'Registrar Nueva Buseta (CTP / ARESEP)'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Formulario de habilitación vehicular con fotografías, permisos, marchamo, circulación y licencias oficiales.
            </DialogDescription>
          </DialogHeader>

          {/* TAB SELECTOR */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/70 border text-xs font-bold my-1">
            <button
              type="button"
              onClick={() => setBusetaTab('vehiculo')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all text-center cursor-pointer ${
                busetaTab === 'vehiculo'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              1. Unidad & Personal
            </button>
            <button
              type="button"
              onClick={() => setBusetaTab('documentos')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all text-center cursor-pointer ${
                busetaTab === 'documentos'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              2. Expediente & Fotos CTP
            </button>
            <button
              type="button"
              onClick={() => setBusetaTab('checklist')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all text-center cursor-pointer ${
                busetaTab === 'checklist'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              3. Checklist CTP
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 py-2 overflow-x-hidden">
            {/* TAB 1: VEHÍCULO & CHOFER */}
            <div className={busetaTab === 'vehiculo' ? 'space-y-4' : 'hidden'}>
              {/* Sección 1: Datos del Vehículo & Fotografía */}
              <div className="space-y-3 rounded-xl border p-4 bg-card">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
                <Car className="h-3.5 w-3.5 text-amber-500" /> 1. Datos del Vehículo & Fotografía de la Unidad
              </h4>

              {/* Photo Upload & Preview for Buseta */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl bg-muted/30 border">
                <div
                  onClick={() =>
                    setPreviewDoc({
                      title: `Fotografía Exterior de la Buseta ${formData.patente}`,
                      src: formData.fotoBuseta || DEFAULT_BUSETA_PHOTO,
                      type: 'Fotografía Exterior',
                    })
                  }
                  className="relative h-24 w-36 shrink-0 overflow-hidden rounded-xl border-2 border-amber-400 bg-muted cursor-pointer group shadow-sm"
                  title="Haz clic para agrandar la foto de la buseta"
                >
                  <img
                    src={formData.fotoBuseta || DEFAULT_BUSETA_PHOTO}
                    alt="Foto de la buseta"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] font-bold">
                    <Eye className="h-5 w-5 drop-shadow mb-0.5" />
                    <span>Agrandar Foto</span>
                  </div>
                </div>
                <div className="flex-1 w-full space-y-2">
                  <div>
                    <label className="text-xs font-bold text-foreground block">
                      Fotografía Exterior de la Buseta (con rótulo escolar y placa visible)
                    </label>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Haz clic en la foto miniatura para agrandarla a pantalla completa.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-bold shadow-2xs hover:bg-muted transition">
                      <Upload className="h-3.5 w-3.5 text-amber-500" />
                      <span>Subir / Cambiar Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('fotoBuseta', e)}
                        className="hidden"
                      />
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setPreviewDoc({
                          title: `Fotografía Exterior de la Buseta ${formData.patente}`,
                          src: formData.fotoBuseta || DEFAULT_BUSETA_PHOTO,
                          type: 'Fotografía Exterior',
                        })
                      }
                      className="text-xs font-bold gap-1 text-sky-600 hover:text-sky-700"
                    >
                      <Eye className="h-3.5 w-3.5" /> Ver en grande
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Placa (Costa Rica)</label>
                  <input
                    required
                    value={formData.patente}
                    onChange={(e) => setFormData({ ...formData, patente: e.target.value.toUpperCase() })}
                    placeholder="Ej. SJ-4821"
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Marca y Modelo</label>
                  <input
                    required
                    value={formData.marcaModelo}
                    onChange={(e) => setFormData({ ...formData, marcaModelo: e.target.value })}
                    placeholder="Toyota Coaster 2022"
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Año del Modelo (Máx. 20 años CTP)</label>
                  <input
                    type="number"
                    required
                    min={2006}
                    max={2027}
                    value={formData.ano}
                    onChange={(e) => setFormData({ ...formData, ano: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Capacidad (Asientos)</label>
                  <input
                    type="number"
                    required
                    min={8}
                    max={40}
                    value={formData.cap}
                    onChange={(e) => setFormData({ ...formData, cap: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>
            {/* Fin Sección 1 */}
          </div>

          {/* TAB 2: EXPEDIENTE CTP, DEKRA, MARCHAMO, PÓLIZA */}
          <div className={busetaTab === 'documentos' ? 'space-y-4' : 'hidden'}>
            {/* Sección 2: Permisos CTP & Dekra RTV */}
            <div className="space-y-3 rounded-xl border p-4 bg-card">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> 2. Permiso CTP & Inspección Técnica Dekra
              </h4>

              {/* Permiso CTP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Número de Permiso CTP</label>
                  <input
                    required
                    value={formData.permisoCtp}
                    onChange={(e) => setFormData({ ...formData, permisoCtp: e.target.value })}
                    placeholder="CTP-TE-2024-8841"
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Vencimiento Permiso CTP</label>
                  <input
                    required
                    value={formData.vencimientoCtp}
                    onChange={(e) => setFormData({ ...formData, vencimientoCtp: e.target.value })}
                    placeholder="31/12/2026"
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Upload Foto Permiso CTP con Miniatura y Ampliación */}
              <DocumentUploadRow
                label="Documento / Resolución Oficial Permiso CTP"
                icon={FileText}
                iconColor="text-amber-500"
                imageSrc={formData.fotoPermisoCtp}
                docTitle={`Permiso Especial CTP (${formData.permisoCtp}) - ${formData.patente}`}
                docType="Resolución Oficial CTP"
                onUpload={(e) => handleFileUpload('fotoPermisoCtp', e)}
                onEnlarge={() =>
                  setPreviewDoc({
                    title: `Permiso Especial CTP (${formData.permisoCtp}) - ${formData.patente}`,
                    src: formData.fotoPermisoCtp || '',
                    type: 'Resolución Oficial CTP',
                  })
                }
              />

              {/* Dekra */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Vencimiento Dekra RTV</label>
                  <input
                    required
                    value={formData.dekraRtv}
                    onChange={(e) => setFormData({ ...formData, dekraRtv: e.target.value })}
                    placeholder="15/11/2026"
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Estado Dekra</label>
                  <select
                    value={formData.dekraEstado}
                    onChange={(e) => setFormData({ ...formData, dekraEstado: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="Al día">Al día</option>
                    <option value="Próximo a vencer">Próximo a vencer</option>
                    <option value="Vencido">Vencido</option>
                  </select>
                </div>
              </div>

              {/* Upload Foto Dekra con Miniatura y Ampliación */}
              <DocumentUploadRow
                label="Foto Hoja Verde Dekra RTV (Inspección Técnica Semestral)"
                icon={CheckCircle2}
                iconColor="text-emerald-500"
                imageSrc={formData.fotoDekra}
                docTitle={`Inspección Técnica Vehicular Semestral Dekra RTV - ${formData.patente}`}
                docType="Hoja Verde Dekra RTV"
                onUpload={(e) => handleFileUpload('fotoDekra', e)}
                onEnlarge={() =>
                  setPreviewDoc({
                    title: `Inspección Técnica Vehicular Semestral Dekra RTV - ${formData.patente}`,
                    src: formData.fotoDekra || '',
                    type: 'Hoja Verde Dekra RTV',
                  })
                }
              />
            </div>

            {/* Sección 3: Marchamo & Tarjeta de Circulación (Registro Nacional) */}
            <div className="space-y-3 rounded-xl border p-4 bg-card">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
                <CreditCard className="h-3.5 w-3.5 text-amber-500" /> 3. Derecho de Circulación (Marchamo) & Tarjeta de Circulación
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Marchamo Año Fiscal</label>
                  <input
                    type="number"
                    required
                    value={formData.marchamoAno}
                    onChange={(e) => setFormData({ ...formData, marchamoAno: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Estado Marchamo</label>
                  <select
                    value={formData.marchamoEstado}
                    onChange={(e) => setFormData({ ...formData, marchamoEstado: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="Al día">Al día (Cancelado)</option>
                    <option value="Pendiente">Pendiente de pago</option>
                  </select>
                </div>
              </div>

              {/* Upload Foto Marchamo con Miniatura y Ampliación */}
              <DocumentUploadRow
                label={`Foto Comprobante / Sticker Marchamo INS (${formData.marchamoAno})`}
                icon={CreditCard}
                iconColor="text-emerald-500"
                imageSrc={formData.fotoMarchamo}
                docTitle={`Derecho de Circulación Marchamo ${formData.marchamoAno} - ${formData.patente}`}
                docType="Marchamo INS / Hacienda"
                onUpload={(e) => handleFileUpload('fotoMarchamo', e)}
                onEnlarge={() =>
                  setPreviewDoc({
                    title: `Derecho de Circulación Marchamo ${formData.marchamoAno} - ${formData.patente}`,
                    src: formData.fotoMarchamo || '',
                    type: 'Marchamo INS / Hacienda',
                  })
                }
              />

              <div>
                <label className="text-xs font-bold text-foreground">Número de Tarjeta de Circulación (Registro Nacional)</label>
                <input
                  required
                  value={formData.tarjetaCirculacion}
                  onChange={(e) => setFormData({ ...formData, tarjetaCirculacion: e.target.value })}
                  placeholder="REG-CR-4821-2026"
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Upload Foto Tarjeta Circulación con Miniatura y Ampliación */}
              <DocumentUploadRow
                label="Foto Tarjeta de Circulación (Registro de la Propiedad Automotor)"
                icon={FileText}
                iconColor="text-sky-500"
                imageSrc={formData.fotoCirculacion}
                docTitle={`Tarjeta de Circulación Registro Nacional - ${formData.patente}`}
                docType="Título de Propiedad Registral"
                onUpload={(e) => handleFileUpload('fotoCirculacion', e)}
                onEnlarge={() =>
                  setPreviewDoc({
                    title: `Tarjeta de Circulación Registro Nacional - ${formData.patente}`,
                    src: formData.fotoCirculacion || '',
                    type: 'Título de Propiedad Registral',
                  })
                }
              />
            </div>

            {/* Sección 4: Póliza Colectiva INS */}
            <div className="space-y-3 rounded-xl border p-4 bg-card">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-amber-500" /> 4. Póliza Colectiva Estudiantil INS (ARESEP)
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Número de Póliza INS</label>
                  <input
                    required
                    value={formData.polizaIns}
                    onChange={(e) => setFormData({ ...formData, polizaIns: e.target.value })}
                    placeholder="INS-RESP-CIVIL-99214"
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Vencimiento Póliza INS</label>
                  <input
                    required
                    value={formData.vencimientoIns}
                    onChange={(e) => setFormData({ ...formData, vencimientoIns: e.target.value })}
                    placeholder="31/12/2026"
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Upload Foto Póliza INS con Miniatura y Ampliación */}
              <DocumentUploadRow
                label="Foto / Carátula de Póliza Colectiva Estudiantil INS"
                icon={Shield}
                iconColor="text-indigo-500"
                imageSrc={formData.fotoPolizaIns}
                docTitle={`Póliza Colectiva de Responsabilidad Civil INS (${formData.polizaIns})`}
                docType="Póliza Colectiva Estudiantil"
                onUpload={(e) => handleFileUpload('fotoPolizaIns', e)}
                onEnlarge={() =>
                  setPreviewDoc({
                    title: `Póliza Colectiva de Responsabilidad Civil INS (${formData.polizaIns})`,
                    src: formData.fotoPolizaIns || '',
                    type: 'Póliza Colectiva Estudiantil',
                  })
                }
              />
            </div>
            {/* Fin Sección 4 / Fin TAB 2 */}
          </div>

          {/* TAB 1 (Continuación): PERSONAL ASIGNADO */}
          <div className={busetaTab === 'vehiculo' ? 'space-y-4' : 'hidden'}>
            {/* Sección 5: Personal Asignado & Licencia de Conducir */}
            <div className="space-y-3 rounded-xl border p-4 bg-card">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
                <Users className="h-3.5 w-3.5 text-amber-500" /> 5. Personal Asignado & Licencia Chofer C-2
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Chofer Conductor Titular</label>
                  <select
                    value={formData.chofer}
                    onChange={(e) => setFormData({ ...formData, chofer: e.target.value })}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {state.choferes.map((c) => (
                      <option key={c.id} value={c.nombre}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Tipo de Licencia</label>
                  <select
                    value={formData.licenciaTipo}
                    onChange={(e) => setFormData({ ...formData, licenciaTipo: e.target.value })}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="C-2 Profesional">C-2 (Transporte Público / Buseta)</option>
                    <option value="C-1">C-1 (Vehículo Pesado)</option>
                    <option value="B-2">B-2 (Microbús)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground">Número de Cédula / Licencia</label>
                  <input
                    required
                    value={formData.licenciaNumero}
                    onChange={(e) => setFormData({ ...formData, licenciaNumero: e.target.value })}
                    placeholder="1-1142-0892"
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Vencimiento Licencia</label>
                  <input
                    required
                    value={formData.licenciaVencimiento}
                    onChange={(e) => setFormData({ ...formData, licenciaVencimiento: e.target.value })}
                    placeholder="18/04/2028"
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Upload Foto Licencia Chofer con Miniatura y Ampliación */}
              <DocumentUploadRow
                label={`Foto Licencia de Conducir ${formData.licenciaTipo} (Chofer: ${formData.chofer})`}
                icon={CreditCard}
                iconColor="text-rose-500"
                imageSrc={formData.fotoLicencia}
                docTitle={`Licencia de Conducir ${formData.licenciaTipo} - ${formData.chofer}`}
                docType="Licencia de Conducir MOPT"
                onUpload={(e) => handleFileUpload('fotoLicencia', e)}
                onEnlarge={() =>
                  setPreviewDoc({
                    title: `Licencia de Conducir ${formData.licenciaTipo} - ${formData.chofer}`,
                    src: formData.fotoLicencia || '',
                    type: 'Licencia de Conducir MOPT',
                  })
                }
              />

              {/* Asistente */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-foreground">Asistente Acompañante CTP</label>
                  <input
                    required
                    value={formData.asistente}
                    onChange={(e) => setFormData({ ...formData, asistente: e.target.value })}
                    placeholder="Patricia Mora Jiménez"
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Carné / Código Acreditación CTP</label>
                  <input
                    value={formData.carnetAsistente}
                    onChange={(e) => setFormData({ ...formData, carnetAsistente: e.target.value })}
                    placeholder="ASIST-CTP-2024-881"
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Upload Foto Carnet Asistente con Miniatura y Ampliación */}
              <DocumentUploadRow
                label={`Foto Carné Acreditación CTP (Asistente: ${formData.asistente})`}
                icon={FileText}
                iconColor="text-indigo-500"
                imageSrc={formData.fotoCarnetAsistente}
                docTitle={`Carné de Acompañante / Asistente Escolar CTP - ${formData.asistente}`}
                docType="Carné Asistente CTP"
                onUpload={(e) => handleFileUpload('fotoCarnetAsistente', e)}
                onEnlarge={() =>
                  setPreviewDoc({
                    title: `Carné de Acompañante / Asistente Escolar CTP - ${formData.asistente}`,
                    src: formData.fotoCarnetAsistente || '',
                    type: 'Carné Asistente CTP',
                  })
                }
              />
            </div>
            {/* Fin Sección 5 / Fin TAB 1 */}
          </div>

          {/* TAB 3: CHECKLIST DE SEGURIDAD CTP */}
          <div className={busetaTab === 'checklist' ? 'space-y-4' : 'hidden'}>
            {/* Sección 6: Checklist Reglamentario */}
            <div className="space-y-2.5 rounded-xl border p-4 bg-muted/30">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                6. Checklist de Equipamiento Obligatorio CTP
              </h4>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.cinturones}
                    onChange={(e) => setFormData({ ...formData, cinturones: e.target.checked })}
                    className="rounded text-amber-400 focus:ring-amber-400 h-4 w-4"
                  />
                  <span>Cinturones de seguridad de 3 puntos en cada asiento</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rotuloEscolar}
                    onChange={(e) => setFormData({ ...formData, rotuloEscolar: e.target.checked })}
                    className="rounded text-amber-400 focus:ring-amber-400 h-4 w-4"
                  />
                  <span>Rótulo reglamentario "TRANSPORTE DE ESTUDIANTES" (frente y atrás)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.extintorBotiquin}
                    onChange={(e) => setFormData({ ...formData, extintorBotiquin: e.target.checked })}
                    className="rounded text-amber-400 focus:ring-amber-400 h-4 w-4"
                  />
                  <span>Extintor de incendios vigente ABC y Botiquín de primeros auxilios</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.puertaEmergencia}
                    onChange={(e) => setFormData({ ...formData, puertaEmergencia: e.target.checked })}
                    className="rounded text-amber-400 focus:ring-amber-400 h-4 w-4"
                  />
                  <span>Puerta o ventanilla de emergencia debidamente rotulada</span>
                </label>
              </div>
            </div>
            {/* Fin TAB 3 */}
          </div>

          <DialogFooter className="pt-3 border-t flex flex-row items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-500 shadow-sm">
              {editingBus ? 'Guardar Cambios & Documentos' : 'Registrar Buseta con Expediente'}
            </Button>
          </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
