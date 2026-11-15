import { useState } from 'react';
import {
  Printer,
  Download,
  Share2,
  Bus,
  ShieldCheck,
  CheckCircle2,
  Users,
  Phone,
  MapPin,
  ExternalLink,
  MessageCircle,
  Eye,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/linkbus/shared';
import { toast } from 'sonner';
import { usePlatform } from './platform-provider';
import { generatePassengerManifestSvg } from '@/lib/document-samples';
import type { Van, Alumno } from '@/lib/data';

export interface ManifiestoPasajerosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  van?: Van | undefined;
  customAlumnos?: Alumno[] | undefined;
}

export function ManifiestoPasajerosModal({
  open,
  onOpenChange,
  van: propVan,
  customAlumnos,
}: ManifiestoPasajerosModalProps) {
  const { state } = usePlatform();
  const [docPreviewOpen, setDocPreviewOpen] = useState(false);

  const van = propVan || state.vans[0];
  if (!van) return null;

  // Filter students belonging to this van / school
  const students =
    customAlumnos ||
    state.alumnos.filter(
      (a) =>
        a.colegio.toLowerCase().includes(van.colegio.toLowerCase()) ||
        van.colegio.toLowerCase().includes(a.colegio.toLowerCase())
    );

  const displayStudents = students.length > 0 ? students : state.alumnos;

  const now = new Date();
  const fechaHora = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${now.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}`;
  const folio = `CTP-MAN-2026-${van.patente.replace(/\D/g, '') || '4821'}`;

  const manifestSvgSrc = generatePassengerManifestSvg(
    folio,
    van,
    displayStudents.map((a, i) => ({
      id: a.id,
      nombre: a.nombre,
      curso: a.curso,
      colegio: a.colegio,
      apoderado: a.apoderado,
      telefonoApoderado: a.telefonoApoderado || '8841-9230',
      direccion: a.direccion,
      cedulaMenor: `1-2${String(340 + i).padStart(3, '0')}-${String(100 + i).padStart(4, '0')}`,
    })),
    fechaHora
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSvg = () => {
    const a = document.createElement('a');
    a.href = manifestSvgSrc;
    a.download = `Manifiesto_CTP_${van.patente}_${fechaHora.replace(/[\s\:\/]/g, '_')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Manifiesto oficial CTP descargado exitosamente');
  };

  const handleShareWhatsApp = () => {
    let text = `*MANIFIESTO OFICIAL DE ESTUDIANTES CTP*\n`;
    text += `*Unidad:* ${van.patente} (${van.marcaModelo || 'Toyota Coaster'})\n`;
    text += `*Chofer:* ${van.chofer} (Lic. C-2: ${van.licenciaNumero || '1-1142-0892'})\n`;
    text += `*Acompañante CTP:* ${van.asistente || 'Patricia Mora Jiménez'} (${van.carnetAsistente || 'ASIST-CTP'})\n`;
    text += `*Póliza INS:* ${van.polizaIns || 'INS-RESP-CIVIL-99214'} (Al día)\n`;
    text += `*Dekra RTV:* ${van.dekraRtv || 'Al día'}\n`;
    text += `*Colegio:* ${van.colegio}\n`;
    text += `*Estudiantes en Ruta:* ${displayStudents.length}\n\n`;
    text += `*LISTA DE PASAJEROS:*\n`;
    displayStudents.forEach((a, i) => {
      text += `${i + 1}. ${a.nombre} (${a.curso}) - Parada: ${a.direccion} - Encargado: ${a.apoderado} (${a.telefonoApoderado || '8841-9230'})\n`;
    });
    text += `\n*Folio CTP:* ${folio}\n`;
    text += `*Fecha/Hora:* ${fechaHora}`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="z-[200] max-w-4xl max-h-[94vh] overflow-y-auto p-4 sm:p-6 rounded-2xl print:p-0 print:border-none print:shadow-none print:max-w-none">
          {/* Header */}
          <DialogHeader className="border-b pb-3 print:border-b-2 print:border-slate-900">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full print:border print:border-slate-900">
                  Consejo de Transporte Público (CTP) · Costa Rica
                </span>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {folio}
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                Emitido: <b>{fechaHora}</b>
              </span>
            </div>

            <DialogTitle className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2 mt-1">
              <Bus className="h-5 w-5 text-amber-500 shrink-0" />
              <span>Manifiesto Oficial de Pasajeros · Control en Carretera</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Documento reglamentario de presentación obligatoria ante retenes de la Policía de Tránsito e inspectores del CTP (Decreto Ejecutivo N° 35249-MOPT).
            </DialogDescription>
          </DialogHeader>

          {/* Unit & Legal Badges Row */}
          <div className="rounded-xl border bg-muted/40 p-3 sm:p-4 space-y-3 print:bg-white print:border-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {/* Unit Info */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Buseta Escolar
                </span>
                <div className="flex items-center gap-2">
                  <div className="rounded-md border-2 border-slate-900 bg-white px-2 py-0.5 text-center shadow-2xs">
                    <span className="block text-[6px] font-black uppercase text-slate-600 leading-none">
                      COSTA RICA
                    </span>
                    <span className="block font-black font-mono text-xs text-slate-950 leading-tight">
                      {van.patente}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-foreground truncate">{van.marcaModelo || 'Toyota Coaster'}</p>
                    <p className="text-[10px] text-muted-foreground">Capacidad: {van.cap || 16} asientos</p>
                  </div>
                </div>
              </div>

              {/* Driver Credentials */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Conductor Titular
                </span>
                <p className="font-extrabold text-foreground">{van.chofer}</p>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                  Lic. {van.licenciaTipo || 'C-2 Profesional'} · Céd: {van.licenciaNumero || '1-1142-0892'}
                </p>
                <p className="text-[9.5px] text-muted-foreground">Vence: {van.licenciaVencimiento || '18/04/2028'}</p>
              </div>

              {/* Assistant Credentials */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Acompañante Acreditada CTP
                </span>
                <p className="font-extrabold text-foreground">{van.asistente || 'Patricia Mora Jiménez'}</p>
                <p className="text-[10px] font-mono text-indigo-700 dark:text-indigo-400 font-semibold">
                  Carnet CTP: {van.carnetAsistente || 'ASIST-CTP-2024-881'}
                </p>
                <p className="text-[9.5px] text-muted-foreground">Acompañante a bordo obligatoria</p>
              </div>

              {/* Insurance & CTP */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Permiso & Seguro INS
                </span>
                <p className="text-[11px] font-mono font-bold text-foreground truncate">
                  CTP: {van.permisoCtp || 'CTP-TE-2024-8841'}
                </p>
                <p className="text-[10px] font-mono text-sky-700 dark:text-sky-400 font-semibold truncate">
                  Póliza INS: {van.polizaIns || 'INS-RESP-CIVIL-99214'}
                </p>
                <p className="text-[9.5px] text-emerald-700 dark:text-emerald-400 font-semibold">
                  ✓ Dekra RTV Semestral Al Día
                </p>
              </div>
            </div>

            {/* Destination & Route line */}
            <div className="border-t pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <p className="text-muted-foreground">
                Colegio Destino: <b className="text-foreground">{van.colegio}</b> · Trayecto: {van.ruta}
              </p>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                  ✓ {displayStudents.length} Estudiantes Autorizados
                </span>
              </div>
            </div>
          </div>

          {/* Table of Students */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Users className="h-4 w-4 text-amber-500" />
                <span>Nómina de Estudiantes Transportados ({displayStudents.length})</span>
              </h4>
              <span className="text-[10px] text-muted-foreground font-mono">
                Orden oficial de parada
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border bg-card shadow-xs print:border-none print:shadow-none">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="bg-muted/70 text-[10px] font-black uppercase text-muted-foreground border-b print:bg-slate-100">
                  <tr>
                    <th className="px-3 py-2.5 w-10 text-center">N°</th>
                    <th className="px-3 py-2.5">Estudiante & Grado</th>
                    <th className="px-3 py-2.5">Cédula Menor / TIM</th>
                    <th className="px-3 py-2.5">Apoderado Titular & Teléfono</th>
                    <th className="px-3 py-2.5">Parada Autorizada</th>
                    <th className="px-3 py-2.5 text-center">Estado CTP</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-[11px]">
                  {displayStudents.map((alumno, idx) => {
                    const rowAttendance = state.attendance[alumno.id];
                    const isABordo = rowAttendance?.status === 'A bordo' || rowAttendance?.status === 'Entregado';
                    const cedulaMenor = `1-2${String(340 + idx).padStart(3, '0')}-${String(100 + idx).padStart(4, '0')}`;
                    const tel = alumno.telefonoApoderado || '8841-9230';

                    return (
                      <tr key={alumno.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2 text-center font-mono font-bold text-muted-foreground">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 font-bold text-foreground">
                          <div>
                            <span className="text-xs">{alumno.nombre}</span>
                            <span className="ml-1.5 text-[10px] font-semibold text-muted-foreground">
                              ({alumno.curso})
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 font-mono text-[10.5px] text-muted-foreground">
                          {cedulaMenor}
                        </td>
                        <td className="px-3 py-2 font-medium">
                          <div>
                            <span className="text-foreground">{alumno.apoderado}</span>
                            <p className="text-[10px] text-sky-600 font-mono font-bold">{tel}</p>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          <p className="truncate max-w-[200px]" title={alumno.direccion}>
                            {alumno.direccion}
                          </p>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isABordo
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{rowAttendance?.status || 'A Bordo'}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legal Certification and Signatures Block */}
          <div className="rounded-xl border bg-muted/20 p-3.5 space-y-2 text-xs print:bg-white print:border-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
              <div>
                <span className="text-[9.5px] font-bold text-muted-foreground uppercase">Firma del Conductor:</span>
                <div className="h-10 border-b border-slate-400 flex items-end justify-center sm:justify-start pb-0.5">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                    {van.chofer}
                  </span>
                </div>
                <p className="text-[9px] text-muted-foreground font-mono mt-0.5">Lic. C-2 N° {van.licenciaNumero || '1-1142-0892'}</p>
              </div>

              <div>
                <span className="text-[9.5px] font-bold text-muted-foreground uppercase">Firma Acompañante CTP:</span>
                <div className="h-10 border-b border-slate-400 flex items-end justify-center sm:justify-start pb-0.5">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                    {van.asistente || 'Patricia Mora Jiménez'}
                  </span>
                </div>
                <p className="text-[9px] text-muted-foreground font-mono mt-0.5">Carnet: {van.carnetAsistente || 'ASIST-CTP-2024-881'}</p>
              </div>

              <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-blue-400/40 bg-blue-50/50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300">
                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-0.5" />
                <span className="font-black text-[10px] uppercase">Sello Digital CTP</span>
                <span className="text-[8.5px] font-mono font-bold">CONTROL VIAL REGLAMENTARIO</span>
              </div>
            </div>

            <p className="text-[9px] text-muted-foreground text-center sm:text-left pt-1 border-t">
              Documento digital generado conforme al Decreto Ejecutivo N° 35249-MOPT. Válido para fiscalización en retenes de la Policía de Tránsito.
            </p>
          </div>

          {/* Action Footer */}
          <DialogFooter className="border-t pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 print:hidden">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                onClick={handlePrint}
                className="gap-1.5 font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded-xl cursor-pointer shadow-xs"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Imprimir Manifiesto</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadSvg}
                className="gap-1.5 font-bold text-xs border-amber-400 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Descargar SVG / PDF</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleShareWhatsApp}
                className="gap-1.5 font-bold text-xs border-emerald-400 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl cursor-pointer"
              >
                <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                <span>Enviar por WhatsApp</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDocPreviewOpen(true)}
                className="gap-1 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Ver Documento</span>
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs font-bold rounded-xl"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* High-Res SVG Viewer Modal */}
      {docPreviewOpen && (
        <Dialog open={docPreviewOpen} onOpenChange={setDocPreviewOpen}>
          <DialogContent className="z-[300] max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
            <DialogHeader className="border-b pb-2">
              <DialogTitle className="text-base font-black">
                Vista de Impresión · Manifiesto CTP {van.patente}
              </DialogTitle>
            </DialogHeader>

            <div className="my-2 rounded-xl overflow-hidden border bg-slate-100 dark:bg-slate-900 p-2 sm:p-4 flex items-center justify-center">
              <img src={manifestSvgSrc} alt="Manifiesto CTP" className="max-h-[650px] w-auto shadow-md rounded" />
            </div>

            <DialogFooter className="border-t pt-2 flex items-center justify-between">
              <Button size="sm" onClick={handleDownloadSvg} className="gap-1.5 text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-500">
                <Download className="h-3.5 w-3.5" /> Descargar Archivo Oficial
              </Button>
              <Button size="sm" variant="outline" onClick={() => setDocPreviewOpen(false)} className="text-xs font-bold">
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
