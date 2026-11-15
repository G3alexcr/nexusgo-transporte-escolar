import { Link, useLocation } from "@tanstack/react-router";
import { ArrowLeftRight, Bus, ChevronRight, CreditCard, History, Map, Route, School, Settings, Users, UserCog, Building2, GraduationCap } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { TopBar } from "./shared";
import { usePlatform } from "./platform-provider";

export const adminNavigation = [
  { to: "/admin/dashboard", label: "Mapa en vivo", icon: Map },
  { to: "/admin/alumnos", label: "Alumnos / Contratos", icon: GraduationCap },
  { to: "/admin/busetas", label: "Busetas / Flota", icon: Bus },
  { to: "/admin/choferes", label: "Choferes", icon: Users },
  { to: "/admin/rutas", label: "Rutas", icon: Route },
  { to: "/admin/viajes", label: "Viajes / Historial", icon: History },
  { to: "/admin/colegios", label: "Colegios", icon: School },
  { to: "/admin/pagos", label: "Pagos", icon: CreditCard },
  { to: "/admin/usuarios", label: "Usuarios y Roles", icon: UserCog },
  { to: "/admin/ajustes", label: "Ajustes", icon: Settings },
] as const;
export function AdminShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { state } = usePlatform();
  const activeTenant = state.tenants.find((t) => t.id === state.currentTenantId);
  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-[56px] hidden h-[calc(100vh-56px)] w-60 shrink-0 flex-col border-r bg-card px-4 py-5 md:flex">
          <div className="flex flex-col items-center gap-2 border-b pb-4 text-center">
            {activeTenant?.logoUrl ? (
              <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm">
                <img
                  src={activeTenant.logoUrl}
                  alt={state.company}
                  className="block h-auto w-full"
                />
              </div>
            ) : (
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold text-slate-950 shadow-sm">
                <Bus className="h-7 w-7" />
              </span>
            )}
            <div className="min-w-0 w-full">
              <p className="break-words text-sm font-extrabold uppercase tracking-tight leading-snug" title={state.company}>
                {state.company}
              </p>
              <span className="mt-1 inline-block rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                Flota afiliada
              </span>
            </div>
          </div>
          {state.isSuperAdmin && (
            <Link
              to="/superadmin"
              className="mt-2.5 flex items-center justify-between rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              <span className="flex items-center gap-1.5"><Building2 className="h-3 w-3" /> Centro de Mando</span>
              <span>&rarr;</span>
            </Link>
          )}
          <p className="mb-2 mt-6 px-3 text-[10px] font-bold tracking-widest text-muted-foreground">OPERACIONES</p>
          <nav className="flex flex-col gap-1">
            {adminNavigation.map((n) => (
              <Button
                asChild
                variant="ghost"
                key={n.to}
                className={`h-10 justify-start px-3 text-xs ${pathname === n.to ? "bg-gold/25 font-bold text-primary" : "text-muted-foreground"}`}
              >
                <Link to={n.to}>
                  <n.icon className="h-4 w-4 mr-2" />
                  {n.label}
                  {pathname === n.to && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
                </Link>
              </Button>
            ))}
          </nav>
          <div className="mt-auto border-t px-2 pt-4">
            <p className="text-xs font-bold">Carolina Morales</p>
            <p className="text-[11px] text-muted-foreground">Administradora · Tenant Activo</p>
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {/* Active Tenant Context Banner (Only for SuperAdmin) */}
          {state.isSuperAdmin && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                <Building2 className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  Modo SuperAdmin: Inspeccionando <strong className="font-bold">{state.company}</strong>
                </span>
              </div>
              <Link
                to="/superadmin"
                className="font-bold text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100 underline flex items-center gap-1 text-[11px]"
              >
                Volver al Centro de Mando &rarr;
              </Link>
            </div>
          )}
          <div className="mb-3 flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-xs md:hidden">
            {activeTenant?.logoUrl ? (
              <div className="w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200/80 shadow-xs">
                <img
                  src={activeTenant.logoUrl}
                  alt={state.company}
                  className="block h-auto w-full"
                />
              </div>
            ) : (
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold text-slate-950 shadow-xs">
                <Bus className="h-5 w-5" />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold uppercase tracking-tight">{state.company}</p>
              <span className="mt-0.5 inline-block rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                Flota afiliada
              </span>
            </div>
          </div>
          <nav className="mb-5 flex gap-2 overflow-x-auto pb-2 md:hidden">
            {adminNavigation.map((n) => (
              <Button asChild key={n.to} variant={pathname === n.to ? "default" : "outline"} size="sm" className="text-xs whitespace-nowrap">
                <Link to={n.to}>{n.label}</Link>
              </Button>
            ))}
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}
export function TransferButton() {
  const { state, dispatch } = usePlatform();
  const [open, setOpen] = useState(false);
  const [vanId, setVanId] = useState("v1");
  const [driverId, setDriverId] = useState("c4");
  const van = state.vans.find(v => v.id === vanId);
  const driver = state.choferes.find(c => c.id === driverId);
  return <><Button variant="outline" onClick={() => setOpen(true)}><ArrowLeftRight />Traspasar ruta</Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md"><DialogTitle>Traspasar ruta</DialogTitle><DialogDescription>Reasignación del viaje activo a otro chofer.</DialogDescription>
      <label className="text-sm font-bold" htmlFor="transfer-trip">Viaje activo</label><select id="transfer-trip" className="w-full rounded-md border bg-card p-3 text-sm" value={vanId} onChange={e => setVanId(e.target.value)}>{state.vans.filter(v => v.estado === "En ruta").map(v => <option key={v.id} value={v.id}>{v.patente} · {v.ruta}</option>)}</select>
      <p className="text-xs text-muted-foreground">Chofer actual: {van?.chofer}</p>
      <label className="text-sm font-bold" htmlFor="transfer-driver">Nuevo chofer</label><select id="transfer-driver" className="w-full rounded-md border bg-card p-3 text-sm" value={driverId} onChange={e => setDriverId(e.target.value)}>{state.choferes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
      <Button disabled={!driver || !van || van.chofer === driver.nombre} onClick={() => { if (!driver || !van) return; dispatch({ type: "transfer", vanId, driver: driver.nombre }); toast.success(`Ruta traspasada a ${driver.nombre}`); setOpen(false); }}>Confirmar traspaso</Button>
    </DialogContent></Dialog></>;
}
export function PageTitle({ title, subtitle, children }: { title: string; subtitle: string; children?: ReactNode }) {
  return <div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Nexus Go / Administración</p><h1 className="text-3xl font-extrabold">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{subtitle}</p></div>{children}</div>;
}