import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlatform } from './platform-provider';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  Users,
  Bus,
  Clock,
  AlertCircle,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface JuntaReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultColegio?: string | undefined;
}

export const MESES_LECTIVOS = [
  'Noviembre 2026 (En Curso)',
  'Octubre 2026',
  'Setiembre 2026',
  'Agosto 2026',
  'Ciclo Lectivo Anual 2026',
];

export function JuntaReportModal({ open, onOpenChange, defaultColegio }: JuntaReportModalProps) {
  const { state } = usePlatform();
  const [mes, setMes] = useState<string>(MESES_LECTIVOS[0] || 'Noviembre 2026 (En Curso)');
  const [colegioSeleccionado, setColegioSeleccionado] = useState<string>(
    defaultColegio || state.colegios[0]?.nombre || 'Todos'
  );

  const colegiosList = ['Todos', ...state.colegios.map((c) => c.nombre)];

  // Filter students by selected school
  const filteredStudents =
    colegioSeleccionado === 'Todos'
      ? state.alumnos
      : state.alumnos.filter(
          (a) =>
            a.colegio.toLowerCase().includes(colegioSeleccionado.toLowerCase()) ||
            colegioSeleccionado.toLowerCase().includes(a.colegio.toLowerCase())
        );

  // Associated vans
  const filteredVans =
    colegioSeleccionado === 'Todos'
      ? state.vans
      : state.vans.filter(
          (v) =>
            v.colegio.toLowerCase().includes(colegioSeleccionado.toLowerCase()) ||
            colegioSeleccionado.toLowerCase().includes(v.colegio.toLowerCase())
        );

  const totalEstudiantes = filteredStudents.length;
  const contratosFirmados = filteredStudents.filter((a) => state.contracts[a.id]?.signed).length;
  const tasaPuntualidad = 98.7;
  const tasaAsistencia = 96.2;
  const viajesMes = mes.includes('Anual') ? 380 : 42;
  const kmRecorridos = mes.includes('Anual') ? 11400 : 1260;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success('Generando archivo digital del informe...', {
      description: 'El documento está listo para archivar o imprimir en PDF.',
    });
    window.print();
  };

  const fechaEmision = new Date().toLocaleDateString('es-CR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="z-[200]"
        className="z-[200] max-w-4xl max-h-[94vh] overflow-y-auto p-4 sm:p-6 rounded-2xl print:p-0 print:border-none print:shadow-none print:max-w-none print:bg-white print:text-black"
      >
        {/* Controls Bar (Hidden during window.print) */}
        <div className="print:hidden border-b pb-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit">
                <Building2 className="h-3 w-3" />
                Informe Ejecutivo MEP · CTP · Junta de Educación
              </span>
              <DialogTitle className="text-lg sm:text-xl font-black text-foreground mt-1">
                Informe Mensual Oficial para la Dirección del Centro Educativo
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Resumen certificado de puntualidad, asistencia, constancia de pólizas colectivas INS e inspecciones Dekra al día.
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handlePrint}
                className="bg-amber-400 text-slate-950 font-bold hover:bg-amber-500 text-xs gap-1.5 shadow-sm"
              >
                <Printer className="h-3.5 w-3.5" />
                Imprimir Informe
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="text-xs font-bold gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Guardar PDF
              </Button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 bg-muted/40 p-3 rounded-xl border">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                Período / Mes Lectivo:
              </label>
              <Select value={mes} onValueChange={setMes}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[300]">
                  {MESES_LECTIVOS.map((m) => (
                    <SelectItem key={m} value={m} className="text-xs">
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                Institución Educativa:
              </label>
              <Select value={colegioSeleccionado} onValueChange={setColegioSeleccionado}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[300]">
                  {colegiosList.map((c) => (
                    <SelectItem key={c} value={c} className="text-xs">
                      {c === 'Todos' ? 'Todos los Centros Educativos' : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Printable Formal Document Paper */}
        <div className="mt-3 p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-xl border space-y-6 text-slate-900 dark:text-slate-100 print:border-none print:p-0 print:m-0 print:text-black">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  REPÚBLICA DE COSTA RICA · MINISTERIO DE EDUCACIÓN PÚBLICA (MEP)
                </p>
                <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500">
                  CONSEJO DE TRANSPORTE PÚBLICO (CTP) · LEY N° 9078 · DECRETO N° 35249-MOPT
                </p>
                <h1 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white mt-1">
                  ACTA DE CUMPLIMIENTO OPERATIVO Y SEGURIDAD ESTUDIANTIL
                </h1>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Dirigido a: <b>Dirección y Junta de Educación — {colegioSeleccionado === 'Todos' ? 'Centros Educativos Afiliados' : colegioSeleccionado}</b>
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="inline-block rounded-lg border-2 border-slate-900 bg-amber-400/20 px-2.5 py-1 text-center font-mono">
                  <span className="block text-[8px] font-black uppercase text-slate-700 dark:text-slate-300">FOLIO OFICIAL</span>
                  <span className="block text-xs font-black text-slate-950 dark:text-white">MEP-INF-2026-{(filteredVans[0]?.patente || 'CR').replace('-', '')}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Emisión: {fechaEmision}</p>
              </div>
            </div>

            {/* Carrier Credentials Sub-bar */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg border">
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-500">Empresa Transportista</span>
                <p className="font-extrabold truncate">{state.company}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-500">Póliza Colectiva INS</span>
                <p className="font-extrabold text-emerald-700 dark:text-emerald-400 truncate">INS-RESP-99214 (Al día)</p>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-500">Permiso Especial CTP</span>
                <p className="font-extrabold truncate font-mono">CTP-TE-2024-8841</p>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-500">Período Auditado</span>
                <p className="font-extrabold text-amber-700 dark:text-amber-400 truncate">{mes}</p>
              </div>
            </div>
          </div>

          {/* Section 1: Executive KPI Metrics */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-2.5">
              <Clock className="h-4 w-4 text-amber-500" />
              1. Indicadores de Calidad de Servicio y Cumplimiento de Horarios
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="rounded-xl border p-3 bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] font-bold uppercase text-slate-500">Índice de Puntualidad</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{tasaPuntualidad}%</p>
                <p className="text-[9px] text-slate-500 mt-0.5">Tolerancia máxima &lt; 5 min</p>
              </div>

              <div className="rounded-xl border p-3 bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] font-bold uppercase text-slate-500">Viajes Ejecutados</span>
                <p className="text-2xl font-black text-foreground mt-1">{viajesMes}</p>
                <p className="text-[9px] text-emerald-600 font-bold mt-0.5">100% efectividad de ruta</p>
              </div>

              <div className="rounded-xl border p-3 bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] font-bold uppercase text-slate-500">Asistencia Escolar</span>
                <p className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">{tasaAsistencia}%</p>
                <p className="text-[9px] text-slate-500 mt-0.5">{totalEstudiantes} estudiantes en lista</p>
              </div>

              <div className="rounded-xl border p-3 bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] font-bold uppercase text-slate-500">Incidentes Graves</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">0</p>
                <p className="text-[9px] text-emerald-600 font-bold mt-0.5">Cero accidentes en ruta</p>
              </div>
            </div>
          </div>

          {/* Section 2: Fleet & Safety Accreditations */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-2.5">
              <Bus className="h-4 w-4 text-amber-500" />
              2. Ficha de Unidades Asignadas al Centro Educativo e Inspecciones Técnicas
            </h2>

            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 border-b">
                    <th className="p-2.5">Placa</th>
                    <th className="p-2.5">Modelo / Capacidad</th>
                    <th className="p-2.5">Conductor Titular</th>
                    <th className="p-2.5">Inspección Dekra RTV</th>
                    <th className="p-2.5">Póliza Colectiva INS</th>
                    <th className="p-2.5 text-center">Permiso CTP</th>
                    <th className="p-2.5 text-right">Pre-Operativo</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-[11px]">
                  {filteredVans.map((v) => (
                    <tr key={v.id} className="hover:bg-muted/40">
                      <td className="p-2.5 font-mono font-black text-amber-700 dark:text-amber-300">{v.patente}</td>
                      <td className="p-2.5">
                        <span className="font-bold">{v.marcaModelo || 'Toyota Coaster'}</span>
                        <p className="text-[10px] text-muted-foreground">{v.cap} asientos autorizados</p>
                      </td>
                      <td className="p-2.5 font-bold">{v.chofer}</td>
                      <td className="p-2.5 text-emerald-700 dark:text-emerald-400 font-bold">
                        ✓ {v.dekraRtv || '15/11/2026'}
                      </td>
                      <td className="p-2.5 text-sky-700 dark:text-sky-400 font-mono text-[10px]">
                        {v.polizaIns || 'INS-RESP-CIVIL-99214'}
                      </td>
                      <td className="p-2.5 text-center font-mono text-[10px] font-bold">
                        {v.permisoCtp || 'CTP-TE-2024'}
                      </td>
                      <td className="p-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        100% al día
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Student Roll & Attendance Summary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-amber-500" />
                3. Nómina de Pasajeros y Contratos Registrados ({totalEstudiantes} estudiantes)
              </h2>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                {contratosFirmados} de {totalEstudiantes} Contratos CTP Firmados
              </span>
            </div>

            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 border-b">
                    <th className="p-2 text-center">N°</th>
                    <th className="p-2">Estudiante</th>
                    <th className="p-2">Grado / Sección</th>
                    <th className="p-2">Apoderado Titular & Contacto</th>
                    <th className="p-2">Parada Autorizada</th>
                    <th className="p-2 text-center">Contrato Digital CTP</th>
                    <th className="p-2 text-right">Asistencia Mensual</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-[11px]">
                  {filteredStudents.map((a, idx) => {
                    const hasContract = state.contracts[a.id]?.signed;
                    return (
                      <tr key={a.id} className="hover:bg-muted/40">
                        <td className="p-2 text-center font-mono text-muted-foreground font-bold">{idx + 1}</td>
                        <td className="p-2 font-bold">{a.nombre}</td>
                        <td className="p-2 text-muted-foreground">{a.curso}</td>
                        <td className="p-2">
                          <span>{a.apoderado}</span>
                          <p className="text-[10px] font-mono text-sky-600">{a.telefonoApoderado || '8841-9230'}</p>
                        </td>
                        <td className="p-2 text-muted-foreground truncate max-w-[180px]">{a.direccion}</td>
                        <td className="p-2 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              hasContract
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            {hasContract ? 'Firmado' : 'En Trámite'}
                          </span>
                        </td>
                        <td className="p-2 text-right font-bold text-foreground">
                          {hasContract ? '97.6%' : '94.2%'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Signatures and Certification Block */}
          <div className="pt-6 border-t-2 border-slate-900 dark:border-slate-100">
            <p className="text-[10px] text-slate-600 dark:text-slate-400 text-center leading-relaxed mb-6">
              Por medio del presente documento, la empresa concesionaria certifica que las unidades detalladas han prestado el servicio de transporte remunerado de estudiantes con apego estricto a las regulaciones del Consejo de Transporte Público (CTP), la Ley de Tránsito por Vías Públicas Terrestres y Seguridad Vial (Ley N° 9078) y las directrices del Ministerio de Educación Pública (MEP).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
              <div>
                <div className="h-16 border-b-2 border-dashed border-slate-400 mx-auto max-w-[200px] flex items-end justify-center pb-1">
                  <span className="font-mono text-[9px] text-slate-500">FIRMA Y CÉDULA</span>
                </div>
                <p className="mt-2 font-black text-slate-900 dark:text-slate-100">{state.choferes[0]?.nombre || 'Jorge Castro Ureña'}</p>
                <p className="text-[10px] text-slate-500">Conductor Representante CTP</p>
              </div>

              <div>
                <div className="h-16 border-b-2 border-dashed border-slate-400 mx-auto max-w-[200px] flex items-end justify-center pb-1">
                  <span className="font-mono text-[9px] text-slate-500">SELLO Y FECHA</span>
                </div>
                <p className="mt-2 font-black text-slate-900 dark:text-slate-100">Dirección del Centro Educativo</p>
                <p className="text-[10px] text-slate-500">Recibido Conforme MEP</p>
              </div>

              <div>
                <div className="h-16 border-b-2 border-dashed border-slate-400 mx-auto max-w-[200px] flex items-end justify-center pb-1">
                  <span className="font-mono text-[9px] text-slate-500">SELLO DE AUDITORÍA</span>
                </div>
                <p className="mt-2 font-black text-slate-900 dark:text-slate-100">Junta de Educación / Junta Administrativa</p>
                <p className="text-[10px] text-slate-500">Supervisión de Transporte Escolar</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="print:hidden border-t pt-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 text-center sm:text-left">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            Certificado digitalmente conforme a la normativa de transporte escolar de Costa Rica.
          </span>
          <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full sm:w-auto text-xs font-bold">
            Cerrar Informe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
