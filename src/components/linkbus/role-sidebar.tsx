import type { ComponentType } from "react";
import { Bus, ChevronRight, Menu, X } from "lucide-react";
import { InstallAppButton } from "./install-app-button";

export interface RoleSidebarItem {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  count?: number;
}

export function MobileMenuButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-xs hover:bg-muted transition-colors cursor-pointer ${className}`}
      aria-label="Abrir menú"
      title="Abrir menú"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

export function RoleSidebar({
  company,
  logoUrl,
  roleLabel,
  sectionTitle,
  items,
  activeKey,
  onSelect,
  userName,
  userSubtitle,
  mobileOpen = false,
  onMobileClose,
}: {
  company: string;
  logoUrl?: string;
  roleLabel: string;
  sectionTitle: string;
  items: readonly RoleSidebarItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  userName: string;
  userSubtitle: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const renderContent = (afterSelect?: () => void) => (
    <>
      {/* Carrier Logo & Identity */}
      <div className="flex flex-col items-center gap-2.5 border-b border-white/10 pb-4 text-center">
        {logoUrl ? (
          <div className="w-full overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-sm">
            <img src={logoUrl} alt={company} className="block h-auto w-full" />
          </div>
        ) : (
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-400 text-slate-950 shadow-sm">
            <Bus className="h-7 w-7" />
          </span>
        )}
        <div className="min-w-0 w-full">
          <p className="break-words text-sm font-extrabold uppercase tracking-tight leading-snug text-white" title={company}>
            {company}
          </p>
          <span className="mt-1 inline-block rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Section Navigation */}
      <p className="mb-2 mt-5 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {sectionTitle}
      </p>
      <nav className="flex-1 space-y-1 overflow-y-auto pr-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeKey === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onSelect(item.key);
                afterSelect?.();
              }}
              className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                active
                  ? "bg-amber-400 text-slate-950 shadow-sm font-extrabold"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-slate-950" : "text-slate-400"}`} />
                <span className="truncate">{item.label}</span>
              </span>
              {typeof item.count === "number" && item.count > 0 ? (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-black shrink-0 ${
                    active ? "bg-slate-950 text-amber-300" : "bg-amber-400 text-slate-950"
                  }`}
                >
                  {item.count}
                </span>
              ) : (
                active && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-950" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Install App CTA + User Info */}
      <div className="mt-auto space-y-3 border-t border-white/10 pt-3">
        <InstallAppButton />
        <div className="px-1">
          <p className="truncate text-xs font-bold text-white">{userName}</p>
          <p className="truncate text-[11px] text-slate-400">{userSubtitle}</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="sticky top-[56px] hidden h-[calc(100vh-56px)] w-64 shrink-0 flex-col border-r border-white/10 bg-slate-950 px-4 py-5 text-white lg:flex">
        {renderContent()}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px]" onClick={onMobileClose} />
          <aside className="relative z-10 flex h-full w-72 max-w-[82vw] flex-col border-r border-white/10 bg-slate-950 px-4 py-5 text-white shadow-2xl">
            <button
              type="button"
              onClick={onMobileClose}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
              aria-label="Cerrar menú"
            >
              <X className="h-4 w-4" />
            </button>
            {renderContent(onMobileClose)}
          </aside>
        </div>
      )}
    </>
  );
}
