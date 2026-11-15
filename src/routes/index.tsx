import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { getDefaultPortalForRole, useAuth } from "@/components/linkbus/auth-provider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexus Go — Plataforma de Transporte Escolar" },
      { name: "description", content: "Acceso a la plataforma operativa de transporte escolar Nexus Go Costa Rica." },
    ],
  }),
  component: AppEntry,
});

function AppEntry() {
  const { session, profile, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (session && profile) {
      void navigate({ to: getDefaultPortalForRole(profile.role), replace: true });
    } else {
      void navigate({ to: "/login", search: { tab: "login", redirect: "" }, replace: true });
    }
  }, [isLoading, session, profile, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-950 text-white px-4">
      <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      <p className="text-sm font-semibold text-slate-300">Cargando plataforma...</p>
    </div>
  );
}
