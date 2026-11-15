import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, RefreshCw, Search, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useAuth, type UserRole } from "./auth-provider";
import { usePlatform } from "./platform-provider";
import { Badge } from "./shared";
import { createEphemeralSupabaseClient, getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

type AssignableBaseRole = "admin" | "chofer" | "asistente" | "apoderado";
type RoleSelectValue = AssignableBaseRole | "custom";

type TenantUserRow = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  custom_role?: string | null;
  tenant_id: string | null;
  chofer_id: string | null;
  alumno_id: string | null;
  created_at?: string;
};

const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: "SuperAdmin",
  admin: "Administrador",
  chofer: "Chofer",
  asistente: "Asistente de Chofer",
  apoderado: "Apoderado / Familia",
};

const ROLE_TONES: Record<UserRole, "ok" | "warn" | "info" | "bad"> = {
  superadmin: "warn",
  admin: "info",
  chofer: "ok",
  asistente: "ok",
  apoderado: "info",
};

export function AdminUsuarios() {
  const { state } = usePlatform();
  const { profile } = useAuth();
  const activeTenantId = state.isSuperAdmin
    ? state.currentTenantId
    : (profile?.tenantId ?? state.currentTenantId);

  const [users, setUsers] = useState<TenantUserRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<TenantUserRow | null>(null);
  const [deletingUser, setDeletingUser] = useState<TenantUserRow | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Create form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newRoleSelect, setNewRoleSelect] = useState<RoleSelectValue>("chofer");
  const [newBaseRole, setNewBaseRole] = useState<AssignableBaseRole>("asistente");
  const [newCustomRole, setNewCustomRole] = useState("");
  const [newChoferId, setNewChoferId] = useState("");
  const [newAlumnoId, setNewAlumnoId] = useState("");

  // Edit form state
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRoleSelect, setEditRoleSelect] = useState<RoleSelectValue>("apoderado");
  const [editBaseRole, setEditBaseRole] = useState<AssignableBaseRole>("asistente");
  const [editCustomRole, setEditCustomRole] = useState("");
  const [editChoferId, setEditChoferId] = useState("");
  const [editAlumnoId, setEditAlumnoId] = useState("");

  // Custom roles already used in this tenant for quick reuse
  const existingCustomRoles = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.custom_role?.trim()) set.add(u.custom_role.trim());
    });
    return Array.from(set);
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const roleText = (u.custom_role || ROLE_LABELS[u.role] || u.role).toLowerCase();
      return (
        (u.full_name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        roleText.includes(q)
      );
    });
  }, [users, query]);

  const fetchUsers = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseClient();
    if (!supabase || !activeTenantId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, email, full_name, role, custom_role, tenant_id, chofer_id, alumno_id, created_at")
        .eq("tenant_id", activeTenantId)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("No se pudieron cargar los usuarios", { description: error.message });
        return;
      }
      setUsers((data ?? []) as TenantUserRow[]);
    } finally {
      setLoading(false);
    }
  }, [activeTenantId]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || password.length < 6) {
      toast.error("Completa nombre, correo y una contraseña de al menos 6 caracteres.");
      return;
    }

    const isCustom = newRoleSelect === "custom";
    if (isCustom && !newCustomRole.trim()) {
      toast.error("Escribe el nombre del rol personalizado.");
      return;
    }

    if (!isSupabaseConfigured()) {
      toast.error("Supabase no está configurado en este entorno.");
      return;
    }

    const ephemeral = createEphemeralSupabaseClient();
    if (!ephemeral) return;

    const resolvedRole: AssignableBaseRole = isCustom ? newBaseRole : newRoleSelect;
    const resolvedCustomRole = isCustom ? newCustomRole.trim() : null;

    setSubmitting(true);
    try {
      const { data, error } = await ephemeral.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: resolvedRole,
            custom_role: resolvedCustomRole,
            tenant_id: activeTenantId,
            chofer_id: (resolvedRole === "chofer" || resolvedRole === "asistente") && newChoferId ? newChoferId : null,
            alumno_id: resolvedRole === "apoderado" && newAlumnoId ? newAlumnoId : null,
          },
        },
      });

      if (error) {
        toast.error("No se pudo registrar el usuario", { description: error.message });
        return;
      }

      if (data.user) {
        toast.success("Usuario registrado correctamente", {
          description: `${fullName.trim()} (${resolvedCustomRole || ROLE_LABELS[resolvedRole]})`,
        });
        setCreateOpen(false);
        setFullName("");
        setEmail("");
        setPassword("");
        setNewRoleSelect("chofer");
        setNewBaseRole("asistente");
        setNewCustomRole("");
        setNewChoferId("");
        setNewAlumnoId("");
        await fetchUsers();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (u: TenantUserRow) => {
    setEditingUser(u);
    setEditFullName(u.full_name || "");
    setEditEmail(u.email || "");
    setEditPassword("");
    const base: AssignableBaseRole = u.role === "superadmin" ? "admin" : u.role;
    if (u.custom_role?.trim()) {
      setEditRoleSelect("custom");
      setEditBaseRole(base);
      setEditCustomRole(u.custom_role.trim());
    } else {
      setEditRoleSelect(base);
      setEditBaseRole(base);
      setEditCustomRole("");
    }
    setEditChoferId(u.chofer_id ?? "");
    setEditAlumnoId(u.alumno_id ?? "");
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editFullName.trim()) {
      toast.error("El nombre completo no puede estar vacío.");
      return;
    }

    const normalizedEditEmail = editEmail.trim().toLowerCase();
    if (!normalizedEditEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEditEmail)) {
      toast.error("Ingresa un correo electrónico válido.");
      return;
    }

    if (editPassword && editPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const isCustom = editRoleSelect === "custom";
    if (isCustom && !editCustomRole.trim()) {
      toast.error("Escribe el nombre del rol personalizado.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    const resolvedRole: AssignableBaseRole = isCustom ? editBaseRole : editRoleSelect;
    const resolvedCustomRole = isCustom ? editCustomRole.trim() : null;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          full_name: editFullName.trim(),
          role: resolvedRole,
          custom_role: resolvedCustomRole,
          chofer_id: (resolvedRole === "chofer" || resolvedRole === "asistente") && editChoferId ? editChoferId : null,
          alumno_id: resolvedRole === "apoderado" && editAlumnoId ? editAlumnoId : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingUser.id);

      if (error) {
        toast.error("No se pudo actualizar el usuario", { description: error.message });
        return;
      }

      if (normalizedEditEmail !== (editingUser.email || "").trim().toLowerCase()) {
        const { error: emailError } = await supabase.rpc("admin_update_user_email", {
          target_user_id: editingUser.id,
          new_email: normalizedEditEmail,
        });
        if (emailError) {
          toast.error("Perfil actualizado, pero falló el cambio de correo", {
            description: emailError.message,
          });
          return;
        }
      }

      if (editPassword) {
        const { error: passError } = await supabase.rpc("admin_set_user_password", {
          target_user_id: editingUser.id,
          new_password: editPassword,
        });
        if (passError) {
          toast.error("Perfil actualizado, pero falló el cambio de contraseña", {
            description: passError.message,
          });
          return;
        }
      }

      toast.success("Usuario actualizado", {
        description: editPassword
          ? `${editFullName.trim()} (${resolvedCustomRole || ROLE_LABELS[resolvedRole]}) · Contraseña actualizada.`
          : `${editFullName.trim()} (${resolvedCustomRole || ROLE_LABELS[resolvedRole]}).`,
      });
      setEditingUser(null);
      setEditPassword("");
      await fetchUsers();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.rpc("admin_delete_user", {
        target_user_id: deletingUser.id,
      });

      if (error) {
        toast.error("No se pudo eliminar el usuario", { description: error.message });
        return;
      }

      toast.success("Usuario eliminado", {
        description: `${deletingUser.full_name || deletingUser.email} fue dado de baja.`,
      });
      setDeletingUser(null);
      await fetchUsers();
    } finally {
      setSubmitting(false);
    }
  };

  const resolvedNewRoleForLink: AssignableBaseRole = newRoleSelect === "custom" ? newBaseRole : newRoleSelect;
  const resolvedEditRoleForLink: AssignableBaseRole = editRoleSelect === "custom" ? editBaseRole : editRoleSelect;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            NEXUS GO / ADMINISTRACIÓN
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight">Usuarios y Roles</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las cuentas de acceso y permisos para {state.company}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => void fetchUsers()}
            disabled={loading}
            className="gap-1.5 text-xs font-bold cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="bg-amber-400 text-slate-950 hover:bg-amber-500 font-bold text-xs gap-1.5 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Registrar Usuario
          </Button>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-amber-400/40 bg-amber-50/60 dark:bg-amber-950/20 p-3.5 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          Cada cuenta registrada queda aislada a tu empresa (<b>{state.company}</b>). Puedes asignar roles estándar
          (<b>Chofer</b>, <b>Asistente de Chofer</b>, <b>Apoderado</b>, <b>Administrador</b>) o crear{" "}
          <b>roles personalizados</b> según la estructura de tu operación.
        </p>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-extrabold">Cuentas del Transportista ({filteredUsers.length})</h3>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, correo o rol..."
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {loading
              ? "Cargando usuarios..."
              : query.trim()
              ? "No se encontraron usuarios con esa búsqueda."
              : "No hay usuarios listados todavía para este transportista."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-bold">Nombre</th>
                  <th className="px-4 py-3 font-bold">Correo</th>
                  <th className="px-4 py-3 font-bold">Rol</th>
                  <th className="px-4 py-3 font-bold">Vínculo Operativo</th>
                  <th className="px-4 py-3 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((u) => {
                  const choferMatch = state.choferes.find((c) => c.id === u.chofer_id);
                  const alumnoMatch = state.alumnos.find((a) => a.id === u.alumno_id);
                  const isOwnAccount = profile?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-bold text-foreground">
                        {u.full_name || "Sin nombre"}
                      </td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-0.5">
                          <Badge tone={ROLE_TONES[u.role] ?? "info"}>
                            {u.custom_role?.trim() || ROLE_LABELS[u.role] || u.role}
                          </Badge>
                          {u.custom_role?.trim() && (
                            <span className="text-[10px] text-muted-foreground">
                              Acceso base: {ROLE_LABELS[u.role] ?? u.role}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {(u.role === "chofer" || u.role === "asistente") && choferMatch
                          ? `Unidad: ${choferMatch.nombre} (${choferMatch.buseta})`
                          : u.role === "apoderado" && alumnoMatch
                          ? `Alumno: ${alumnoMatch.nombre}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.role !== "superadmin" && (
                          <div className="inline-flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(u)}
                              className="h-7 px-2.5 text-[11px] font-bold gap-1 cursor-pointer"
                              title="Editar usuario"
                            >
                              <Pencil className="h-3 w-3" />
                              Editar
                            </Button>
                            {!isOwnAccount && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeletingUser(u)}
                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                                title="Eliminar usuario"
                                aria-label={`Eliminar ${u.full_name || u.email}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-base font-extrabold">Registrar Usuario</DialogTitle>
          <DialogDescription className="text-xs">
            Crea una cuenta nueva asociada a {state.company} sin cerrar tu sesión actual.
          </DialogDescription>
          <form onSubmit={handleCreateUser} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold">Nombre completo</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Carlos Solís"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold">Correo electrónico</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@empresa.cr"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold">Contraseña temporal (mín. 6 caracteres)</Label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                minLength={6}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold">Rol asignado</Label>
              <select
                value={newRoleSelect}
                onChange={(e) => setNewRoleSelect(e.target.value as RoleSelectValue)}
                className="w-full rounded-md border bg-background px-3 py-2 text-xs font-semibold"
              >
                <option value="chofer">Chofer (App ruta & GPS)</option>
                <option value="asistente">Asistente de Chofer (Abordaje & lista)</option>
                <option value="apoderado">Apoderado / Familia</option>
                <option value="admin">Administrador de Flota</option>
                <option value="custom">+ Crear / asignar rol personalizado...</option>
              </select>
            </div>

            {newRoleSelect === "custom" && (
              <div className="rounded-xl border border-amber-400/40 bg-amber-50/50 dark:bg-amber-950/20 p-3 space-y-2.5">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Nombre del rol personalizado</Label>
                  <Input
                    value={newCustomRole}
                    onChange={(e) => setNewCustomRole(e.target.value)}
                    placeholder="Ej: Coordinador de Ruta, Auxiliar, Contabilidad..."
                    list="custom-roles-list"
                    required
                  />
                  {existingCustomRoles.length > 0 && (
                    <datalist id="custom-roles-list">
                      {existingCustomRoles.map((r) => (
                        <option key={r} value={r} />
                      ))}
                    </datalist>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Nivel de acceso en la plataforma</Label>
                  <select
                    value={newBaseRole}
                    onChange={(e) => setNewBaseRole(e.target.value as AssignableBaseRole)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-xs font-semibold"
                  >
                    <option value="asistente">Asistente / Operativo en ruta</option>
                    <option value="chofer">Chofer (Ruta & GPS)</option>
                    <option value="admin">Administración (/admin)</option>
                    <option value="apoderado">Familia (/apoderado)</option>
                  </select>
                </div>
              </div>
            )}

            {(resolvedNewRoleForLink === "chofer" || resolvedNewRoleForLink === "asistente") && (
              <div className="space-y-1">
                <Label className="text-xs font-bold">Vincular a Chofer / Buseta (opcional)</Label>
                <select
                  value={newChoferId}
                  onChange={(e) => setNewChoferId(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-xs"
                >
                  <option value="">— Sin vincular —</option>
                  {state.choferes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.buseta})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {resolvedNewRoleForLink === "apoderado" && (
              <div className="space-y-1">
                <Label className="text-xs font-bold">Vincular a Alumno (opcional)</Label>
                <select
                  value={newAlumnoId}
                  onChange={(e) => setNewAlumnoId(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-xs"
                >
                  <option value="">— Sin vincular —</option>
                  {state.alumnos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} ({a.colegio})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-amber-400 text-slate-950 hover:bg-amber-500 font-bold cursor-pointer"
              >
                {submitting ? "Registrando..." : "Crear Cuenta"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={Boolean(editingUser)} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-base font-extrabold">Editar Usuario</DialogTitle>
          <DialogDescription className="text-xs font-mono">
            {editingUser?.email}
          </DialogDescription>
          <form onSubmit={handleSaveRole} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold">Correo electrónico (acceso)</Label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="usuario@nexusgo.cr"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold">Nombre completo</Label>
              <Input
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                placeholder="Nombre completo"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold">Nueva contraseña (opcional, mín. 6 caracteres)</Label>
              <PasswordInput
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Dejar vacío para mantener la actual"
                minLength={6}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold">Rol</Label>
              <select
                value={editRoleSelect}
                onChange={(e) => setEditRoleSelect(e.target.value as RoleSelectValue)}
                className="w-full rounded-md border bg-background px-3 py-2 text-xs font-semibold"
              >
                <option value="chofer">Chofer</option>
                <option value="asistente">Asistente de Chofer</option>
                <option value="apoderado">Apoderado / Familia</option>
                <option value="admin">Administrador de Flota</option>
                <option value="custom">+ Rol personalizado...</option>
              </select>
            </div>

            {editRoleSelect === "custom" && (
              <div className="rounded-xl border border-amber-400/40 bg-amber-50/50 dark:bg-amber-950/20 p-3 space-y-2.5">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Nombre del rol personalizado</Label>
                  <Input
                    value={editCustomRole}
                    onChange={(e) => setEditCustomRole(e.target.value)}
                    placeholder="Ej: Coordinador de Ruta, Auxiliar..."
                    list="custom-roles-list"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Nivel de acceso en la plataforma</Label>
                  <select
                    value={editBaseRole}
                    onChange={(e) => setEditBaseRole(e.target.value as AssignableBaseRole)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-xs font-semibold"
                  >
                    <option value="asistente">Asistente / Operativo en ruta</option>
                    <option value="chofer">Chofer (Ruta & GPS)</option>
                    <option value="admin">Administración (/admin)</option>
                    <option value="apoderado">Familia (/apoderado)</option>
                  </select>
                </div>
              </div>
            )}

            {(resolvedEditRoleForLink === "chofer" || resolvedEditRoleForLink === "asistente") && (
              <div className="space-y-1">
                <Label className="text-xs font-bold">Chofer / Buseta vinculada</Label>
                <select
                  value={editChoferId}
                  onChange={(e) => setEditChoferId(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-xs"
                >
                  <option value="">— Sin vincular —</option>
                  {state.choferes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.buseta})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {resolvedEditRoleForLink === "apoderado" && (
              <div className="space-y-1">
                <Label className="text-xs font-bold">Alumno vinculado</Label>
                <select
                  value={editAlumnoId}
                  onChange={(e) => setEditAlumnoId(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-xs"
                >
                  <option value="">— Sin vincular —</option>
                  {state.alumnos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} ({a.colegio})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingUser(null)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-amber-400 text-slate-950 hover:bg-amber-500 font-bold cursor-pointer"
              >
                {submitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Modal */}
      <Dialog open={Boolean(deletingUser)} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogTitle className="text-base font-extrabold">Eliminar Usuario</DialogTitle>
          <DialogDescription className="text-xs">
            ¿Estás seguro de que deseas eliminar la cuenta de{" "}
            <b>{deletingUser?.full_name || deletingUser?.email}</b>? Esta acción revocará su acceso de inmediato.
          </DialogDescription>
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setDeletingUser(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={submitting}
              onClick={() => void handleDeleteUser()}
              className="font-bold cursor-pointer"
            >
              {submitting ? "Eliminando..." : "Eliminar Cuenta"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
