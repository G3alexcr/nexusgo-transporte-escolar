import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Bus, ShieldCheck, Monitor, Smartphone, Building2, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pointOnPath, type Van } from "@/lib/data";
import { ThemeToggle } from "./theme-toggle";
import { UserUtilityBar } from "./user-profile-menu";
import { usePlatform } from "./platform-provider";
import { useAuth } from "./auth-provider";

export function Logo({ light = false }: { light?: boolean }) {
  const { pathname } = useLocation();
  const homeTarget = pathname.startsWith("/apoderado")
    ? "/apoderado"
    : pathname.startsWith("/chofer")
    ? "/chofer"
    : pathname.startsWith("/admin")
    ? "/admin/dashboard"
    : "/";

  return (
    <Link
      to={homeTarget}
      className={`flex shrink-0 items-center gap-2 ${light ? "text-primary-foreground" : "text-primary"}`}
      aria-label="Nexus Go Inicio"
    >
      <img
        src="/logo-nexus-go-icon.jpg"
        alt="Nexus Go"
        className="h-8 w-8 shrink-0 rounded-lg bg-white object-cover shadow-sm"
      />
      <div className="leading-tight">
        <span className="block whitespace-nowrap font-display text-base font-extrabold italic tracking-tight">
          Nexus <span className="text-gold">Go</span>
        </span>
        <span className="hidden sm:block whitespace-nowrap text-[9px] font-bold uppercase tracking-widest opacity-70">
          Transporte Escolar
        </span>
      </div>
    </Link>
  );
}

export function RoleSwitcher() {
  const { pathname } = useLocation();
  const roles = [
    { to: "/admin/dashboard", label: "Admin Flota", short: "Admin", icon: Monitor, match: "/admin" },
    { to: "/chofer", label: "App Chofer", short: "Chofer", icon: Smartphone, match: "/chofer" },
    { to: "/apoderado", label: "App Familia", short: "Familia", icon: Smartphone, match: "/apoderado" },
  ] as const;
  return (
    <div className="inline-flex items-center gap-0.5 rounded-xl bg-white/10 p-0.5 sm:p-1 text-xs">
      {roles.map((r) => {
        const active = pathname.startsWith(r.match);
        return (
          <Link
            key={r.to}
            to={r.to}
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 sm:px-3 font-bold transition-all ${
              active
                ? "bg-amber-400 text-slate-950 shadow-xs"
                : "text-white/75 hover:text-white hover:bg-white/10"
            }`}
          >
            <r.icon className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">{r.label}</span>
            <span className="sm:hidden text-[11px]">{r.short}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function TopBar() {
  const { state } = usePlatform();
  const { profile } = useAuth();
  const { pathname } = useLocation();

  const isParent = pathname.startsWith("/apoderado");
  const isDriver = pathname.startsWith("/chofer");
  const isAdmin = pathname.startsWith("/admin");
  const isSuperAdminRoute = pathname.startsWith("/superadmin");
  const isLanding = pathname === "/";

  // Active user name resolution
  const activeStudent = state.alumnos.find((a) => a.id === state.selectedAlumnoId) || state.alumnos[0];
  const activeParentName = activeStudent?.apoderado || state.parentProfile?.nombre || "Carla Pérez";

  const activeDriver = state.choferes.find((c) => c.id === state.selectedDriverId) || state.choferes[0];
  const driverName = activeDriver?.nombre || "Carlos Solís";

  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-2 px-3 sm:px-6">
        <Logo light />

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          {/* 1. PARENT / APODERADO VIEW - Strict role separation: NO role switcher */}
          {isParent && (
            <>
              <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-extrabold text-amber-300 whitespace-nowrap">Portal Familia</span>
                <span className="text-white/40">|</span>
                <span className="font-medium text-white/90 whitespace-nowrap">
                  {activeParentName.split(" ")[0]} ({activeStudent?.nombre.split(" ")[0]})
                </span>
              </div>
              <UserUtilityBar darkBar />
            </>
          )}

          {/* 2. DRIVER / CHOFER VIEW - Strict role separation: NO role switcher */}
          {isDriver && (
            <>
              <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-extrabold text-amber-300 whitespace-nowrap">Consola Chofer</span>
                <span className="text-white/40">|</span>
                <span className="font-medium text-white/90 whitespace-nowrap">
                  {driverName.split(" ")[0]} ({activeDriver?.buseta})
                </span>
              </div>
              <UserUtilityBar darkBar />
            </>
          )}

          {/* 3. ADMIN VIEW - Strict role separation: only real superadmin sees Centro Mando */}
          {(isAdmin || isSuperAdminRoute) && (
            <>
              <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-extrabold text-amber-300 whitespace-nowrap">Admin Flota</span>
                <span className="text-white/40">|</span>
                <span className="font-medium text-white/90 whitespace-nowrap">
                  {state.company}
                </span>
              </div>
              {profile?.role === "superadmin" && (
                <Link
                  to="/superadmin"
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-400/20 border border-amber-400/40 px-2 sm:px-2.5 py-1.5 text-xs font-extrabold text-amber-300 hover:text-white whitespace-nowrap"
                >
                  <Building2 className="h-3.5 w-3.5 text-amber-400" />
                  <span className="hidden md:inline">Centro Mando</span>
                  <span className="md:hidden">Mando</span>
                </Link>
              )}
              <UserUtilityBar darkBar />
            </>
          )}

          {/* 4. PUBLIC / FALLBACK - Theme toggle only, no role switcher */}
          {isLanding && <ThemeToggle />}
        </div>
      </div>
    </header>
  );
}

export function PrivacyNote({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-start gap-2 ${compact ? "text-[11px]" : "text-sm"} text-muted-foreground`}>
      <ShieldCheck className={`${compact ? "h-4 w-4" : "h-5 w-5"} shrink-0 text-success`} />
      <p>Conforme a la normativa de protección de datos y privacidad de menores, la ubicación de las busetas solo se comparte en vivo mientras el viaje está en curso y <b>NO</b> se almacena historial de geolocalización.</p>
    </div>
  );
}

export function useTicker(speed = 0.004, running = true) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setT((v) => (v + speed) % 1), 80);
    return () => clearInterval(id);
  }, [speed, running]);
  return t;
}

export function MapSim({ vans, t, selected, onSelect, school = true, className = "" }: { vans: Van[]; t: number; selected?: string; onSelect?: (id: string) => void; school?: boolean; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-map ${className}`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <rect x="20" y="30" width="15" height="18" rx="2" className="fill-map-park" />
        <rect x="64" y="62" width="20" height="10" rx="2" className="fill-map-park" />
        {[10, 25, 40, 60, 75, 90].map((v) => (
          <g key={v}>
            <line x1={v} y1="0" x2={v} y2="100" className="stroke-map-road" strokeWidth="2.2" />
            <line x1="0" y1={v} x2="100" y2={v} className="stroke-map-road" strokeWidth="2.2" />
          </g>
        ))}
        {vans.map((v) => (
          <polyline key={v.id} points={v.path.map((p) => p.join(",")).join(" ")} fill="none" className={selected === v.id ? "stroke-gold" : "stroke-navy/30"} strokeWidth={selected === v.id ? 1.4 : 0.8} strokeDasharray="2 1.5" />
        ))}
      </svg>
      {school && vans.map((v) => {
        const end = v.path[v.path.length - 1];
        if (!end) return null;
        return <div key={v.id + "s"} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md bg-card px-1.5 py-0.5 text-[10px] font-bold shadow-card" style={{ left: `${end[0]}%`, top: `${end[1]}%` }}>🏫</div>;
      })}
      {vans.map((v, i) => {
        const [x, y] = pointOnPath(v.path, (t + i * 0.27) % 1);
        return (
          <Button variant="ghost" size="icon" aria-label={`Buseta ${v.patente}`} key={v.id} onClick={() => onSelect?.(v.id)} className="absolute -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-100 ease-linear" style={{ left: `${x}%`, top: `${y}%` }}>
            <span className="absolute inset-0 rounded-full bg-gold pulse-ring" />
            <span className={`relative grid h-8 w-8 place-items-center rounded-full border-2 border-card ${selected === v.id ? "bg-gold text-navy" : "bg-navy text-gold"} shadow-card`}><Bus className="h-4 w-4" /></span>
            <span className="absolute left-1/2 top-9 -translate-x-1/2 whitespace-nowrap rounded bg-navy px-1.5 text-[10px] font-bold text-primary-foreground">{v.patente}</span>
          </Button>
        );
      })}
    </div>
  );
}

export function PhoneFrame({ children, nav }: { children: ReactNode; nav: ReactNode }) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Viewport mode toggle on desktop */}
      <div className="mb-3 hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
        <span>Modo de visualización:</span>
        <button
          type="button"
          onClick={() => setFullscreen(false)}
          className={`px-2.5 py-1 rounded-md font-bold transition-all ${
            !fullscreen ? 'bg-amber-400 text-slate-950 shadow-sm' : 'bg-muted hover:text-foreground'
          }`}
        >
          📱 Simulador Móvil
        </button>
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className={`px-2.5 py-1 rounded-md font-bold transition-all ${
            fullscreen ? 'bg-amber-400 text-slate-950 shadow-sm' : 'bg-muted hover:text-foreground'
          }`}
        >
          💻 Pantalla Completa
        </button>
      </div>

      <div
        className={`w-full transition-all duration-300 ${
          fullscreen
            ? 'max-w-2xl rounded-3xl bg-background border shadow-xl p-2'
            : 'max-w-[400px] rounded-none sm:rounded-[2.75rem] bg-navy sm:p-3 shadow-phone'
        }`}
      >
        <div
          className={`relative flex flex-col overflow-hidden bg-background ${
            fullscreen
              ? 'min-h-[680px] rounded-2xl'
              : 'min-h-[720px] max-sm:h-auto sm:h-[760px] rounded-none sm:rounded-[2.2rem]'
          }`}
        >
          {/* Status bar (only in phone frame mode) */}
          {!fullscreen && (
            <div className="hidden sm:flex items-center justify-between px-6 pt-3 text-[11px] font-bold text-foreground">
              <span>9:41</span>
              <span className="h-5 w-24 rounded-full bg-navy" />
              <span>5G ▮▮▮</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto pb-4">{children}</div>
          <nav className="sticky bottom-0 z-20 flex items-center justify-around border-t bg-card/95 backdrop-blur-md px-1 pb-3 pt-1.5 shadow-lg">
            {nav}
          </nav>
        </div>
      </div>
    </div>
  );
}

export function NavBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Button variant="ghost" onClick={onClick} className={`flex h-auto flex-1 flex-col items-center gap-0.5 px-0 py-1 text-[10px] sm:text-[11px] font-semibold transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
      <span className={`grid h-7 w-10 place-items-center rounded-full transition-all ${active ? "bg-gold text-slate-950 font-bold" : ""}`}><Icon className="h-4 w-4" /></span>
      {label}
    </Button>
  );
}

export function Badge({ tone, children }: { tone: "ok" | "warn" | "bad" | "info"; children: ReactNode }) {
  const m = { ok: "bg-success/15 text-success", warn: "bg-gold/30 text-navy", bad: "bg-destructive/15 text-destructive", info: "bg-navy/10 text-navy" };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${m[tone]}`}>{children}</span>;
}

export function Occupancy({ n, cap }: { n: number; cap: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">Ocupación</span><b>{n}/{cap} a bordo</b></div>
      <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-gold transition-all duration-500" style={{ width: `${(n / cap) * 100}%` }} /></div>
    </div>
  );
}
