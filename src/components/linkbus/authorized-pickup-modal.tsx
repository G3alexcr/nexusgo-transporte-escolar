import { useState } from 'react';
import { UserCheck, Plus, Trash2, Phone, ShieldCheck, UserPlus, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { usePlatform } from './platform-provider';
import type { AuthorizedPerson } from '@/lib/platform-state';
import { toast } from 'sonner';

interface AuthorizedPickupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alumnoId?: string | undefined;
  isDriverView?: boolean | undefined;
}

export function AuthorizedPickupModal({
  open,
  onOpenChange,
  alumnoId = 'a1',
  isDriverView = false,
}: AuthorizedPickupModalProps) {
  const { state, dispatch } = usePlatform();
  const student = state.alumnos.find((a) => a.id === alumnoId) || state.alumnos[0];
  const list = state.authorizedPersons.filter((p) => p.alumnoId === student?.id || p.alumnoId === 'a1');

  const [showAddForm, setShowAddForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [parentesco, setParentesco] = useState('Abuela Materna');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !cedula.trim()) {
      toast.error('Por favor ingresa nombre y cédula de la persona');
      return;
    }

    const newPerson: AuthorizedPerson = {
      id: crypto.randomUUID(),
      alumnoId: student?.id || '',
      nombre: nombre.trim(),
      parentesco,
      cedula: cedula.trim(),
      telefono: telefono.trim() || '8888-0000',
      estado: 'Autorizado',
    };

    dispatch({ type: 'addAuthorizedPerson', person: newPerson });
    toast.success(`¡${nombre} ha sido autorizada para retirar a ${student?.nombre}!`, {
      description: 'Queda registrada en el sistema de seguridad y visible para el chofer.',
    });

    // Reset Form
    setNombre('');
    setCedula('');
    setTelefono('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Deseas revocar la autorización de retiro a ${name}?`)) {
      dispatch({ type: 'deleteAuthorizedPerson', id });
      toast.info(`Autorización revocada para ${name}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1.5rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-extrabold text-foreground">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400 text-slate-950 shrink-0">
              <UserCheck className="h-4 w-4" />
            </span>
            <span>Personas Autorizadas para Retirar</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            Adultos verificados con documento de identidad para recibir a{' '}
            <strong className="text-foreground font-bold">{student?.nombre}</strong> en la parada de la buseta.
          </DialogDescription>
        </DialogHeader>

        {isDriverView && (
          <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-900 dark:text-amber-200">
            <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-tight">
              <strong>Verificación de Chofer CTP:</strong> Compruebe que la cédula del adulto en la parada coincida con esta lista antes de marcar la entrega del menor.
            </p>
          </div>
        )}

        {/* List of Authorized Persons */}
        <div className="space-y-2.5 py-1">
          {list.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground border rounded-xl bg-muted/20">
              No hay personas autorizadas adicionales registradas.
            </div>
          ) : (
            list.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-xl border bg-card/60 shadow-xs hover:border-amber-400/40 transition-all"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-extrabold text-foreground truncate">{p.nombre}</p>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
                      Autorizado
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {p.parentesco} · <span className="font-mono text-slate-700 dark:text-slate-300">Cédula: {p.cedula}</span>
                  </p>
                  {p.telefono && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Phone className="h-2.5 w-2.5 text-amber-500" />
                      <a href={`tel:+506${p.telefono.replace(/\D/g, '')}`} className="hover:underline font-mono">
                        +506 {p.telefono}
                      </a>
                    </p>
                  )}
                </div>

                {!isDriverView && p.parentesco !== 'Madre (Titular)' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(p.id, p.nombre)}
                    className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 shrink-0"
                    title="Revocar autorización"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add New Person Section */}
        {!isDriverView && (
          <div className="pt-2">
            {!showAddForm ? (
              <Button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="w-full bg-amber-400 text-slate-950 font-bold hover:bg-amber-500 text-xs h-10 shadow-sm"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Registrar Nueva Persona Autorizada
              </Button>
            ) : (
              <form onSubmit={handleAdd} className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <UserPlus className="h-3.5 w-3.5 text-amber-500" /> Nueva Autorización de Retiro
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold">Nombre Completo del Adulto</Label>
                  <Input
                    placeholder="Ej. Carmen Monge Vargas"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="h-8 text-xs bg-background"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold">Parentesco / Vínculo</Label>
                    <select
                      value={parentesco}
                      onChange={(e) => setParentesco(e.target.value)}
                      className="w-full h-8 rounded-md border bg-background px-2 text-xs"
                    >
                      <option value="Padre">Padre</option>
                      <option value="Madre">Madre</option>
                      <option value="Abuela Materna">Abuela Materna</option>
                      <option value="Abuelo Materno">Abuelo Materno</option>
                      <option value="Abuela Paterna">Abuela Paterna</option>
                      <option value="Abuelo Paterno">Abuelo Paterno</option>
                      <option value="Tía">Tía</option>
                      <option value="Tío">Tío</option>
                      <option value="Hermano Mayor (+18)">Hermano Mayor (+18)</option>
                      <option value="Niñera / Cuidador">Niñera / Cuidador</option>
                      <option value="Tutor Legal">Tutor Legal</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold">Cédula (CR / DIMEX)</Label>
                    <Input
                      placeholder="1-0412-0544"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      required
                      className="h-8 text-xs font-mono bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold">Teléfono Celular / WhatsApp</Label>
                  <Input
                    placeholder="8390-1122"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="h-8 text-xs font-mono bg-background"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 text-xs h-8"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="flex-1 bg-amber-400 text-slate-950 hover:bg-amber-500 font-bold text-xs h-8"
                  >
                    Guardar y Autorizar
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
