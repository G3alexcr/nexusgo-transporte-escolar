import { useState } from 'react';
import type { Van } from '@/lib/data';
import { usePlatform } from '@/components/linkbus/platform-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  CheckCircle2,
  Eye,
  FolderArchive,
  Phone,
  MessageCircle,
  FileText,
  BadgeCheck,
  Calendar,
  X,
  ExternalLink,
  ClipboardCheck,
  Printer,
  Users,
} from 'lucide-react';
import { ManifiestoPasajerosModal } from './manifiesto-pasajeros-modal';
import {
  DEFAULT_BUSETA_PHOTOS,
  generateCtpPermitSvg,
  generateMarchamoSvg,
  generateDekraSvg,
  generateLicenseSvg,
  generateCirculacionSvg,
  generateInsPolicySvg,
  generateAssistantBadgeSvg,
  generatePreOpCertificateSvg,
} from '@/lib/document-samples';

interface BusetaFichaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  van: Van | null;
  mode?: 'admin' | 'parent';
}

export function BusetaFichaModal({ open, onOpenChange, van, mode = 'parent' }: BusetaFichaModalProps) {
  const { state } = usePlatform();
  const [previewDoc, setPreviewDoc] = useState<{ title: string; src: string; type: string } | null>(null);
  const [manifiestoOpen, setManifiestoOpen] = useState(false);

  if (!van) return null;

  const inspection = state.inspections[van.patente];

  const defaultBusetaPhoto = DEFAULT_BUSETA_PHOTOS[0] || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80';
  const busPhoto = van.fotoBuseta || defaultBusetaPhoto;

  const ctpPermitSrc = van.fotoPermisoCtp || generateCtpPermitSvg(van.patente, van.permisoCtp || 'CTP-TE-2024-8841', van.vencimientoCtp || '31/12/2026', van.chofer);
  const marchamoSrc = van.fotoMarchamo || generateMarchamoSvg(van.patente, van.marchamoAno || 2026);
  const dekraSrc = van.fotoDekra || generateDekraSvg(van.patente, van.dekraRtv || '15/11/2026', van.dekraEstado || 'Al día');
  const circulacionSrc = van.fotoCirculacion || generateCirculacionSvg(van.patente, van.marcaModelo || 'Toyota Coaster', van.ano || 2022);
  const polizaInsSrc = van.fotoPolizaIns || generateInsPolicySvg(van.patente, van.polizaIns || 'INS-RESP-CIVIL-99214', van.vencimientoIns || '31/12/2026');
  const licenciaSrc = van.fotoLicencia || generateLicenseSvg(van.chofer, van.licenciaNumero || '1-1142-0892', van.licenciaTipo || 'C-2', van.licenciaVencimiento || '18/04/2028');
  const carnetAsistenteSrc = van.fotoCarnetAsistente || generateAssistantBadgeSvg(van.asistente || 'Patricia Mora Jiménez', van.carnetAsistente || 'ASIST-CTP-2024-881');
  const preOpCertificateSrc = generatePreOpCertificateSvg(
    inspection?.folioDigital || 'CTP-PREOP-2026-99412',
    van.patente,
    van.chofer,
    inspection?.fechaHora || 'Hoy, 06:15 AM',
    inspection?.kilometraje || 142850,
    van.colegio
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[94vw] max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 rounded-2xl z-[100]">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                Consejo de Transporte Público (CTP)
              </span>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
                Expediente Oficial
              </span>
            </div>
            <DialogTitle className="text-base sm:text-lg font-black text-foreground flex items-center gap-2 mt-1">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
              <span>{mode === 'parent' ? 'Expediente de Seguridad del Conductor y Buseta' : 'Ficha Técnica Vehicular & Expediente Legal'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {mode === 'parent'
                ? 'Acreditación oficial, inspección técnica Dekra RTV, póliza colectiva INS y licencia del conductor asignado a tu hijo.'
                : 'Documentación digitalizada, permisos y fotografías conformes a la normativa de transporte de estudiantes.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            {/* Header Box with Buseta Photo & Plate */}
            <div className="rounded-xl border bg-muted/40 p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-3.5">
              <div
                className="relative h-40 sm:h-28 w-full sm:w-44 shrink-0 overflow-hidden rounded-xl border-2 border-amber-400 shadow-sm cursor-pointer group bg-slate-900"
                onClick={() =>
                  setPreviewDoc({
                    title: `Fotografía Exterior de la Buseta ${van.patente}`,
                    src: busPhoto,
                    type: 'Fotografía Exterior de la Unidad',
                  })
                }
              >
                <img
                  src={busPhoto}
                  alt={van.marcaModelo || 'Buseta Escolar'}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold gap-1">
                  <Eye className="h-4 w-4" /> Ampliar Fotografía
                </div>
              </div>

              <div className="flex-1 w-full text-center sm:text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Unidad Oficial Asignada</span>
                  <div className="rounded-lg border-2 border-slate-900 bg-white px-2 py-0.5 text-center shadow-xs">
                    <span className="block text-[6.5px] font-black uppercase text-slate-600">COSTA RICA</span>
                    <span className="block font-black font-mono text-xs text-slate-950">{van.patente}</span>
                  </div>
                </div>
                <p className="text-base font-extrabold text-foreground mt-0.5">{van.marcaModelo || 'Toyota Coaster'}</p>
                <p className="text-xs text-muted-foreground">
                  Modelo {van.ano || 2022} · Capacidad autorizada: {van.cap} estudiantes
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2 justify-center sm:justify-start">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    ✓ Marchamo {van.marchamoAno || 2026} Al Día
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300">
                    ✓ Póliza Colectiva INS
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300">
                    ✓ Permiso CTP Vigente
                  </span>
                </div>
              </div>
            </div>

            {/* Legal Permits Grid (1 col on mobile, 2 col on sm) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="rounded-xl border p-3 bg-card space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3 text-amber-500" /> Permiso Especial CTP
                </span>
                <p className="font-mono font-bold text-xs text-foreground">{van.permisoCtp || 'CTP-TE-2024-8841'}</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Vigente hasta: {van.vencimientoCtp || '31/12/2026'}</p>
              </div>
              <div className="rounded-xl border p-3 bg-card space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Inspección Dekra (RTV Semestral)
                </span>
                <p className="font-mono font-bold text-xs text-foreground">Aprobada · Hoja Verde Oficial</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Vigente hasta: {van.dekraRtv || '15/11/2026'}</p>
              </div>
            </div>

            {/* Personnel & Driver License (1 col on mobile, 2 col on sm) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="rounded-xl border p-3 bg-card space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Chofer Conductor Titular</span>
                <p className="font-bold text-xs text-foreground">{van.chofer}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Licencia {van.licenciaTipo || 'C-2 Profesional'} · Vence: {van.licenciaVencimiento || '18/04/2028'}
                </p>
                <p className="text-[9.5px] text-muted-foreground font-mono">Cédula: {van.licenciaNumero || '1-1142-0892'}</p>
              </div>
              <div className="rounded-xl border p-3 bg-card space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Asistente Acompañante CTP</span>
                <p className="font-bold text-xs text-foreground">{van.asistente || 'Patricia Mora Jiménez'}</p>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold font-mono">
                  Carné CTP: {van.carnetAsistente || 'ASIST-CTP-2024-881'}
                </p>
                <p className="text-[9.5px] text-muted-foreground">Acompañante obligatoria acreditada CTP</p>
              </div>
            </div>

            {/* Pre-Op Daily CTP Inspection Certificate Card */}
            <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black text-slate-900 dark:text-emerald-100">
                      Inspección Pre-Operativa Matutina CTP
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      ✓ {inspection ? '6/6 Conforme' : 'Conforme CTP'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Certificado digital diario (Decreto N° 35249-MOPT) · Folio: <b className="font-mono text-foreground">{inspection?.folioDigital || 'CTP-PREOP-2026-99412'}</b>
                  </p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                    Registrado {inspection?.fechaHora || 'Hoy, 06:15 AM'} · Odómetro: {inspection?.kilometraje ? `${inspection.kilometraje.toLocaleString('es-CR')} km` : '142,850 km'}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setPreviewDoc({
                    title: `Certificado Pre-Operativo Matutino CTP - ${van.patente}`,
                    src: preOpCertificateSrc,
                    type: 'Constancia Oficial CTP Decreto N° 35249-MOPT',
                  })
                }
                className="gap-1.5 font-bold text-xs rounded-xl border-emerald-400 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 cursor-pointer shrink-0 shadow-xs"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Ver Constancia Firmada</span>
              </Button>
            </div>

            {/* Document Gallery (Expediente Digital) */}
            <div className="rounded-xl border p-3 sm:p-3.5 bg-card space-y-2.5">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <FolderArchive className="h-4 w-4 text-sky-500 shrink-0" />
                  <span>Documentos Adjuntos (Toca para ver)</span>
                </h4>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                  7 de 7 al día
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {/* Doc 1: Permiso CTP */}
                <div
                  onClick={() =>
                    setPreviewDoc({
                      title: 'Permiso Especial CTP de Transporte de Estudiantes',
                      src: ctpPermitSrc,
                      type: 'Resolución Oficial CTP',
                    })
                  }
                  className="p-2 rounded-lg border bg-muted/30 hover:bg-muted/70 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div className="h-16 w-full rounded overflow-hidden border border-border/60 mb-1.5 bg-white">
                    <img src={ctpPermitSrc} alt="Permiso CTP" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-amber-600">Permiso CTP</span>
                    <p className="font-bold text-[10px] text-foreground truncate">{van.permisoCtp || 'CTP-TE-2024'}</p>
                  </div>
                  <span className="text-[9px] text-sky-600 font-bold mt-1 flex items-center gap-1">
                    <Eye className="h-3 w-3" /> Ver Permiso
                  </span>
                </div>

                {/* Doc 2: Licencia C-2 del Chofer */}
                <div
                  onClick={() =>
                    setPreviewDoc({
                      title: `Licencia de Conducir C-2 - ${van.chofer}`,
                      src: licenciaSrc,
                      type: 'Licencia Transporte Público MOPT / COSEVI',
                    })
                  }
                  className="p-2 rounded-lg border bg-muted/30 hover:bg-muted/70 transition cursor-pointer flex flex-col justify-between group ring-1 ring-amber-400/40"
                >
                  <div className="h-16 w-full rounded overflow-hidden border border-border/60 mb-1.5 bg-white">
                    <img src={licenciaSrc} alt="Licencia Chofer" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-rose-600">Licencia Chofer</span>
                    <p className="font-bold text-[10px] text-foreground truncate">{van.licenciaTipo || 'C-2 Profesional'}</p>
                  </div>
                  <span className="text-[9px] text-sky-600 font-bold mt-1 flex items-center gap-1">
                    <Eye className="h-3 w-3" /> Ver Licencia
                  </span>
                </div>

                {/* Doc 3: Dekra RTV */}
                <div
                  onClick={() =>
                    setPreviewDoc({
                      title: 'Inspección Técnica Vehicular Semestral Dekra',
                      src: dekraSrc,
                      type: 'Hoja Verde Aprobatoria Dekra',
                    })
                  }
                  className="p-2 rounded-lg border bg-muted/30 hover:bg-muted/70 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div className="h-16 w-full rounded overflow-hidden border border-border/60 mb-1.5 bg-white">
                    <img src={dekraSrc} alt="Dekra RTV" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-700 dark:text-slate-300">Dekra RTV</span>
                    <p className="font-bold text-[10px] text-foreground truncate">{van.dekraRtv || '15/11/2026'}</p>
                  </div>
                  <span className="text-[9px] text-sky-600 font-bold mt-1 flex items-center gap-1">
                    <Eye className="h-3 w-3" /> Ver Hoja Verde
                  </span>
                </div>

                {/* Doc 4: Póliza Colectiva INS */}
                <div
                  onClick={() =>
                    setPreviewDoc({
                      title: 'Póliza Colectiva Estudiantil INS (Seguro de Accidentes y Responsabilidad Civil)',
                      src: polizaInsSrc,
                      type: 'Seguro Colectivo ARESEP',
                    })
                  }
                  className="p-2 rounded-lg border bg-muted/30 hover:bg-muted/70 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div className="h-16 w-full rounded overflow-hidden border border-border/60 mb-1.5 bg-white">
                    <img src={polizaInsSrc} alt="Póliza INS" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-indigo-600">Póliza INS</span>
                    <p className="font-bold text-[10px] text-foreground truncate">{van.polizaIns || 'INS Colectiva'}</p>
                  </div>
                  <span className="text-[9px] text-sky-600 font-bold mt-1 flex items-center gap-1">
                    <Eye className="h-3 w-3" /> Ver Póliza
                  </span>
                </div>

                {/* Doc 5: Marchamo */}
                <div
                  onClick={() =>
                    setPreviewDoc({
                      title: `Derecho de Circulación (Marchamo) ${van.marchamoAno || 2026}`,
                      src: marchamoSrc,
                      type: 'Comprobante INS & MOPT',
                    })
                  }
                  className="p-2 rounded-lg border bg-muted/30 hover:bg-muted/70 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div className="h-16 w-full rounded overflow-hidden border border-border/60 mb-1.5 bg-white">
                    <img src={marchamoSrc} alt="Marchamo" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-emerald-600">Marchamo INS</span>
                    <p className="font-bold text-[10px] text-foreground truncate">Año {van.marchamoAno || 2026}</p>
                  </div>
                  <span className="text-[9px] text-sky-600 font-bold mt-1 flex items-center gap-1">
                    <Eye className="h-3 w-3" /> Ver Marchamo
                  </span>
                </div>

                {/* Doc 6: Carné Asistente CTP */}
                <div
                  onClick={() =>
                    setPreviewDoc({
                      title: `Acreditación CTP Asistente de Transporte - ${van.asistente || 'Patricia Mora'}`,
                      src: carnetAsistenteSrc,
                      type: 'Acreditación Oficial CTP',
                    })
                  }
                  className="p-2 rounded-lg border bg-muted/30 hover:bg-muted/70 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div className="h-16 w-full rounded overflow-hidden border border-border/60 mb-1.5 bg-white">
                    <img src={carnetAsistenteSrc} alt="Carné Asistente" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-purple-600">Asistente CTP</span>
                    <p className="font-bold text-[10px] text-foreground truncate">{van.carnetAsistente || 'ASIST-CTP'}</p>
                  </div>
                  <span className="text-[9px] text-sky-600 font-bold mt-1 flex items-center gap-1">
                    <Eye className="h-3 w-3" /> Ver Carné
                  </span>
                </div>

                {/* Doc 7: Constancia Pre-Operativa CTP */}
                <div
                  onClick={() =>
                    setPreviewDoc({
                      title: `Certificado Pre-Operativo Matutino CTP - ${van.patente}`,
                      src: preOpCertificateSrc,
                      type: 'Constancia Diaria CTP (Decreto N° 35249-MOPT)',
                    })
                  }
                  className="p-2 rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-400/60 hover:bg-emerald-100/60 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div className="h-16 w-full rounded overflow-hidden border border-emerald-300/60 mb-1.5 bg-white">
                    <img src={preOpCertificateSrc} alt="Constancia Pre-Op" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-emerald-700 dark:text-emerald-300">Pre-Op CTP</span>
                    <p className="font-bold text-[10px] text-foreground truncate">{inspection?.folioDigital || 'CTP-PREOP'}</p>
                  </div>
                  <span className="text-[9px] text-emerald-700 dark:text-emerald-300 font-bold mt-1 flex items-center gap-1">
                    <Eye className="h-3 w-3" /> Ver Constancia
                  </span>
                </div>

                {/* Doc 8: Manifiesto / Lista Oficial de Pasajeros CTP */}
                <div
                  onClick={() => setManifiestoOpen(true)}
                  className="p-2 rounded-lg border bg-amber-50/60 dark:bg-amber-950/20 border-amber-400/70 hover:bg-amber-100/60 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div className="h-16 w-full rounded overflow-hidden border border-amber-300/60 mb-1.5 bg-white flex flex-col items-center justify-center p-1 text-center">
                    <Users className="h-6 w-6 text-amber-600 mb-0.5" />
                    <span className="text-[8px] font-bold text-slate-700 leading-tight">Lista CTP Alumnos</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-amber-800 dark:text-amber-300">Manifiesto CTP</span>
                    <p className="font-bold text-[10px] text-foreground truncate">Retenes Tránsito</p>
                  </div>
                  <span className="text-[9px] text-amber-700 dark:text-amber-300 font-bold mt-1 flex items-center gap-1">
                    <Printer className="h-3 w-3" /> Ver / Imprimir
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist CTP (1 col on mobile, 2 col on sm) */}
            <div className="rounded-xl border p-3 bg-muted/20 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Checklist de Equipamiento Obligatorio CTP</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Cinturones de 3 puntos (100% asientos)
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Rótulo oficial "TRANSPORTE DE ESTUDIANTES"
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Extintor de incendios vigente ABC & Botiquín
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Puerta / ventanilla de emergencia rotulada
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-3 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 text-center sm:text-left">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              Verificado oficialmente por la administración de Nexus Go CR
            </span>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManifiestoOpen(true)}
                className="w-full sm:w-auto text-xs font-bold border-amber-500/50 hover:bg-amber-500/10 text-amber-900 dark:text-amber-200"
              >
                <Printer className="h-3.5 w-3.5 mr-1.5 text-amber-600 dark:text-amber-400" />
                Manifiesto CTP
              </Button>
              <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto bg-amber-400 font-bold text-slate-950 hover:bg-amber-500 text-xs">
                Cerrar Expediente
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Manifiesto Pasajeros CTP */}
      <ManifiestoPasajerosModal
        open={manifiestoOpen}
        onOpenChange={setManifiestoOpen}
        van={van}
      />

      {/* Lightbox Preview Modal */}
      {previewDoc && (
        <Dialog open={Boolean(previewDoc)} onOpenChange={(val) => !val && setPreviewDoc(null)}>
          <DialogContent className="w-[94vw] max-w-3xl max-h-[92vh] overflow-y-auto overflow-x-hidden z-[9999] p-3.5 sm:p-5 rounded-2xl">
            <DialogHeader className="border-b pb-2">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 truncate">
                  {previewDoc.type}
                </span>
                <span className="text-xs font-mono text-muted-foreground shrink-0">{van.patente} · CR</span>
              </div>
              <DialogTitle className="text-sm sm:text-base font-bold text-foreground mt-1 leading-snug">{previewDoc.title}</DialogTitle>
            </DialogHeader>

            <div className="py-2.5 flex flex-col items-center justify-center bg-slate-950/5 dark:bg-slate-900/50 rounded-xl p-2 border">
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

            <DialogFooter className="border-t pt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = previewDoc.src;
                  link.download = `${previewDoc.title.replace(/\s+/g, '_')}.png`;
                  link.click();
                }}
                className="w-full sm:w-auto text-xs"
              >
                Descargar Documento
              </Button>
              <Button
                size="sm"
                onClick={() => setPreviewDoc(null)}
                className="w-full sm:w-auto bg-amber-400 text-slate-950 font-bold hover:bg-amber-500 text-xs"
              >
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
