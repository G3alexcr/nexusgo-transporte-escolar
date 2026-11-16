import { useRef } from 'react';
import { Printer, FileText, Download, CheckCircle2, ShieldCheck, Bus, School, Calendar, UserCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { usePlatform } from './platform-provider';
import type { Van, Alumno } from '@/lib/data';
import { clp } from '@/lib/data';

export function ExecutiveReportModal({
  open,
  onOpenChange,
  van,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  van?: Van | undefined;
}) {
  const { state } = usePlatform();
  const currentVan = van || state.vans[0];
  const students = state.alumnos || [];

  const total = students.length;
  const aBordo = students.filter((a) => state.attendance[a.id]?.status === 'A bordo').length;
  const entregados = students.filter((a) => state.attendance[a.id]?.status === 'Entregado').length;
  const ausentes = students.filter((a) => state.attendance[a.id]?.status === 'Ausente').length;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('es-CR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="max-w-3xl p-0 overflow-hidden rounded-2xl border shadow-2xl bg-white text-slate-900 max-h-[90vh] flex flex-col">
        {/* Modal Controls Bar (Hidden in Print) */}
        <div className="print:hidden bg-slate-950 text-white p-3.5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-400 text-slate-950 font-bold">
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-xs font-extrabold text-white">Acta Oficial de Operación y Asistencia</h3>
              <p className="text-[10px] text-amber-300">Documento administrativo listo para impresión o PDF</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="h-7 px-3 bg-amber-400 text-slate-950 font-bold hover:bg-amber-500 text-xs rounded-lg shadow-sm"
            >
              <Printer className="h-3.5 w-3.5 mr-1" />
              Imprimir / PDF
            </Button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white text-slate-900 print:p-0 print:m-0">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-400 text-slate-950 font-black text-sm">
                    LB
                  </span>
                  <h1 className="text-xl font-black tracking-tight text-slate-950">NEXUS GO COSTA RICA</h1>
                </div>
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mt-1">
                  Sistema de Gestión y Seguridad de Transporte Escolar
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-[10px] font-mono font-bold text-slate-800 border">
                  ACTA #{new Date().getFullYear()}-CR{currentVan?.patente || '01'}
                </span>
                <p className="text-[10px] text-slate-500 mt-1 capitalize">{todayStr}</p>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase">Unidad / Placa</span>
                <p className="font-extrabold text-slate-900 mt-0.5">{currentVan?.patente} (16 Pasajeros)</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase">Conductor Asignado</span>
                <p className="font-extrabold text-slate-900 mt-0.5">{currentVan?.chofer}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase">Colegio Destino</span>
                <p className="font-extrabold text-slate-900 mt-0.5">Lincoln School (Escazú)</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase">Horario de Operación</span>
                <p className="font-extrabold text-slate-900 mt-0.5">06:30 AM — 08:00 AM</p>
              </div>
            </div>
          </div>

          {/* Executive KPI Summary */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Estudiantes</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{total}</p>
            </div>
            <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900">
              <p className="text-[10px] font-bold uppercase text-emerald-700">Entregados</p>
              <p className="text-xl font-black mt-0.5">{entregados}</p>
            </div>
            <div className="p-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-900">
              <p className="text-[10px] font-bold uppercase text-blue-700">A Bordo</p>
              <p className="text-xl font-black mt-0.5">{aBordo}</p>
            </div>
            <div className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-900">
              <p className="text-[10px] font-bold uppercase text-rose-700">Inasistencias</p>
              <p className="text-xl font-black mt-0.5">{ausentes}</p>
            </div>
          </div>

          {/* Detailed Attendance Table */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
              Bitácora Detallada de Pasajeros y Check-in QR
            </h3>
            <div className="overflow-x-auto border border-slate-300 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-[10px] uppercase font-bold text-slate-700">
                    <th className="p-2">Estudiante</th>
                    <th className="p-2">Grado</th>
                    <th className="p-2">Punto de Parada</th>
                    <th className="p-2 text-center">Subida</th>
                    <th className="p-2 text-center">Bajada</th>
                    <th className="p-2">Encargado / Contacto</th>
                    <th className="p-2 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students.map((a) => {
                    const att = state.attendance[a.id];
                    const status = att?.status || 'Pendiente';
                    return (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-900 truncate max-w-[140px]">{a.nombre}</td>
                        <td className="p-2 text-slate-600">{a.curso}</td>
                        <td className="p-2 text-slate-600 truncate max-w-[140px]">{a.direccion}</td>
                        <td className="p-2 text-center font-mono font-bold text-slate-800">{att?.subida || '—'}</td>
                        <td className="p-2 text-center font-mono font-bold text-slate-800">{att?.bajada || '—'}</td>
                        <td className="p-2 text-slate-600 text-[11px] truncate max-w-[130px]">
                          {a.apoderado} ({a.telefonoApoderado || '8841-9230'})
                        </td>
                        <td className="p-2 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              status === 'Entregado'
                                ? 'bg-emerald-100 text-emerald-800'
                                : status === 'A bordo'
                                ? 'bg-blue-100 text-blue-800'
                                : status === 'Ausente'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="h-14 border-b border-dashed border-slate-400 mx-auto max-w-[200px]" />
              <p className="mt-2 font-bold text-slate-900">{currentVan?.chofer}</p>
              <p className="text-[10px] text-slate-500">Firma del Conductor Responsable</p>
            </div>
            <div>
              <div className="h-14 border-b border-dashed border-slate-400 mx-auto max-w-[200px]" />
              <p className="mt-2 font-bold text-slate-900">Dirección de Transporte Escolar</p>
              <p className="text-[10px] text-slate-500">Sello y Firma de Administración</p>
            </div>
          </div>

          {/* Legal Footer */}
          <p className="text-[9px] text-slate-500 text-center leading-tight">
            Documento generado automáticamente por Nexus Go Costa Rica. Conforme al reglamento de transporte de estudiantes del CTP y la Ley de Protección de la Persona frente al Tratamiento de sus Datos Personales (Ley N° 8968).
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
