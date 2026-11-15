import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { PasswordInput } from '@/components/ui/password-input';
import {
  Building2,
  Users,
  Bus,
  CreditCard,
  Plus,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Download,
  Filter,
  Trash2,
  Edit,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
  X,
  MessageCircle,
  Menu,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  RefreshCw,
  LayoutGrid,
  List,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePlatform } from './platform-provider';
import { useAuth } from './auth-provider';
import { UserUtilityBar } from './user-profile-menu';
import type { Tenant, TenantPlan, TenantStatus, Van } from '@/lib/data';
import { crc } from '@/lib/data';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';

const PRICING_FORMULA_STORAGE_KEY = 'linkbus_pricing_formula_v1';
const TENANT_VIEW_MODE_STORAGE_KEY = 'linkbus_superadmin_view_mode_v1';

function loadTenantViewMode(): 'list' | 'grid' {
  if (typeof window === 'undefined') return 'list';
  return window.localStorage.getItem(TENANT_VIEW_MODE_STORAGE_KEY) === 'grid' ? 'grid' : 'list';
}

interface PricingFormula {
  basePrice: number;
  stepDiscount: number;
  floorPrice: number;
}

const DEFAULT_PRICING_FORMULA: PricingFormula = {
  basePrice: 15000,
  stepDiscount: 500,
  floorPrice: 10500,
};

const PLAN_LABELS: Record<TenantPlan, { title: string }> = {
  'Básico (1-3 busetas)': { title: 'Independiente' },
  'Profesional (4-10 busetas)': { title: 'Empresa' },
  'Flota Enterprise (+10 busetas)': { title: 'Flota' },
};

function loadPricingFormula(): PricingFormula {
  if (typeof window === 'undefined') return DEFAULT_PRICING_FORMULA;
  try {
    const raw = window.localStorage.getItem(PRICING_FORMULA_STORAGE_KEY);
    if (!raw) return DEFAULT_PRICING_FORMULA;
    const parsed = JSON.parse(raw) as Partial<PricingFormula>;
    return {
      basePrice: Number(parsed.basePrice) >= 0 ? Number(parsed.basePrice) : DEFAULT_PRICING_FORMULA.basePrice,
      stepDiscount: Number(parsed.stepDiscount) >= 0 ? Number(parsed.stepDiscount) : DEFAULT_PRICING_FORMULA.stepDiscount,
      floorPrice: Number(parsed.floorPrice) >= 0 ? Number(parsed.floorPrice) : DEFAULT_PRICING_FORMULA.floorPrice,
    };
  } catch {
    return DEFAULT_PRICING_FORMULA;
  }
}

function calcUnitPriceForVans(vanCount: number, formula: PricingFormula): number {
  if (vanCount <= 0) return 0;
  return Math.max(formula.floorPrice, formula.basePrice - (vanCount - 1) * formula.stepDiscount);
}

function calcMonthlyFeeForVans(vanCount: number, formula: PricingFormula): number {
  if (vanCount <= 0) return 0;
  return vanCount * calcUnitPriceForVans(vanCount, formula);
}

function suggestPlanByVans(vanCount: number): TenantPlan {
  if (vanCount > 5) return 'Flota Enterprise (+10 busetas)';
  if (vanCount >= 2) return 'Profesional (4-10 busetas)';
  return 'Básico (1-3 busetas)';
}

export function SuperAdminDashboard() {
  const { state, dispatch } = usePlatform();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<'resumen' | 'tarifas' | 'cumplimiento'>('resumen');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Empresa de Transporte' | 'Chofer Independiente' | 'En prueba'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [pricingFormula, setPricingFormula] = useState<PricingFormula>(() => loadPricingFormula());
  const [showPricingPanel, setShowPricingPanel] = useState(true);
  const [editingFeeTenantId, setEditingFeeTenantId] = useState<string | null>(null);
  const [feeDraft, setFeeDraft] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => loadTenantViewMode());
  const [draggedTenantId, setDraggedTenantId] = useState<string | null>(null);
  const [dragOverTenantId, setDragOverTenantId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Tenant, 'id' | 'slug' | 'fechaRegistro'>>({
    nombre: '',
    tipo: 'Empresa de Transporte',
    cedulaJuridica: '',
    contactoTitular: '',
    telefono: '',
    email: '',
    provincia: 'San José',
    canton: 'Escazú',
    permisoCtp: '',
    plan: 'Básico (1-3 busetas)',
    montoMensualSaaS: pricingFormula.basePrice,
    estado: 'En prueba',
    busetasActivas: 1,
    estudiantesTotales: 12,
  });

  const tenants = state.tenants || [];
  const [vansByTenant, setVansByTenant] = useState<Record<string, number>>({});
  const [alumnosByTenant, setAlumnosByTenant] = useState<Record<string, number>>({});
  const [contractsByTenant, setContractsByTenant] = useState<Record<string, { total: number; signed: number }>>({});
  const [realTotalVans, setRealTotalVans] = useState<number>(0);
  const [realTotalAlumnos, setRealTotalAlumnos] = useState<number>(0);
  const [ctpCompliancePct, setCtpCompliancePct] = useState<string>('0.0%');
  const [ctpSummary, setCtpSummary] = useState({ ok: 0, warning: 0, expired: 0 });
  const [contractSummary, setContractSummary] = useState({ total: 0, signed: 0 });
  const [refreshingMetrics, setRefreshingMetrics] = useState(false);

  const fetchLiveMetrics = useCallback(async (showToast = false) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    setRefreshingMetrics(true);
    try {
      const [vansRes, alumnosRes, contractsRes] = await Promise.all([
        supabase.from('vans').select('id, tenant_id, data'),
        supabase.from('alumnos').select('id, tenant_id'),
        supabase.from('contracts').select('id, tenant_id, signed'),
      ]);

      const vMap: Record<string, number> = {};
      let okCtp = 0;
      let warningCtp = 0;
      let expiredCtp = 0;
      const vansRows = vansRes.data ?? [];
      for (const row of vansRows) {
        const tid = row.tenant_id as string;
        vMap[tid] = (vMap[tid] ?? 0) + 1;
        const vData = row.data as Van | undefined;
        if (!vData?.dekraEstado || vData.dekraEstado === 'Al día') {
          okCtp += 1;
        } else if (vData.dekraEstado === 'Próximo a vencer') {
          warningCtp += 1;
        } else {
          expiredCtp += 1;
        }
      }

      const aMap: Record<string, number> = {};
      const alumnosRows = alumnosRes.data ?? [];
      for (const row of alumnosRows) {
        const tid = row.tenant_id as string;
        aMap[tid] = (aMap[tid] ?? 0) + 1;
      }

      const cMap: Record<string, { total: number; signed: number }> = {};
      const contractRows = contractsRes.data ?? [];
      let totalContracts = 0;
      let signedContracts = 0;
      for (const row of contractRows) {
        const tid = row.tenant_id as string;
        const entry = cMap[tid] ?? { total: 0, signed: 0 };
        entry.total += 1;
        totalContracts += 1;
        if (row.signed === true) {
          entry.signed += 1;
          signedContracts += 1;
        }
        cMap[tid] = entry;
      }

      setVansByTenant(vMap);
      setAlumnosByTenant(aMap);
      setContractsByTenant(cMap);
      setRealTotalVans(vansRows.length);
      setRealTotalAlumnos(alumnosRows.length);
      setCtpSummary({ ok: okCtp, warning: warningCtp, expired: expiredCtp });
      setContractSummary({ total: totalContracts, signed: signedContracts });

      if (totalContracts > 0) {
        setCtpCompliancePct(`${((signedContracts / totalContracts) * 100).toFixed(1)}%`);
      } else if (vansRows.length > 0) {
        setCtpCompliancePct(`${((okCtp / vansRows.length) * 100).toFixed(1)}%`);
      } else {
        setCtpCompliancePct('0.0%');
      }

      if (showToast) {
        toast.success('Métricas actualizadas desde Supabase');
      }
    } finally {
      setRefreshingMetrics(false);
    }
  }, []);

  useEffect(() => {
    void fetchLiveMetrics();
  }, [fetchLiveMetrics, tenants.length, activeSection]);

  useEffect(() => {
    const onFocus = () => {
      void fetchLiveMetrics();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchLiveMetrics]);

  // Global KPIs en vivo desde Supabase (prioriza el valor editado en el transportista; fallback al conteo de tablas vans/alumnos)
  const getLiveVansCount = (t: Tenant) =>
    t.busetasActivas > 0 ? t.busetasActivas : (vansByTenant[t.id] ?? 0);
  const getLiveAlumnosCount = (t: Tenant) =>
    t.estudiantesTotales > 0 ? t.estudiantesTotales : (alumnosByTenant[t.id] ?? 0);
  const getLiveMonthlyFee = (t: Tenant) => calcMonthlyFeeForVans(getLiveVansCount(t), pricingFormula);

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.estado === 'Activo').length;
  const totalBusetas = tenants.length > 0 ? tenants.reduce((acc, t) => acc + getLiveVansCount(t), 0) : realTotalVans;
  const totalEstudiantes = tenants.length > 0 ? tenants.reduce((acc, t) => acc + getLiveAlumnosCount(t), 0) : realTotalAlumnos;
  const totalMrr = tenants
    .filter((t) => t.estado === 'Activo')
    .reduce((acc, t) => acc + getLiveMonthlyFee(t), 0);

  // Ordered & Filtered List (from DB sortOrder)
  const orderedTenants = [...tenants].sort(
    (a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER),
  );

  const filteredTenants = orderedTenants.filter((t) => {
    const matchQuery =
      t.nombre.toLowerCase().includes(query.toLowerCase()) ||
      t.contactoTitular.toLowerCase().includes(query.toLowerCase()) ||
      t.cedulaJuridica.includes(query) ||
      t.provincia.toLowerCase().includes(query.toLowerCase()) ||
      t.canton.toLowerCase().includes(query.toLowerCase()) ||
      t.permisoCtp.toLowerCase().includes(query.toLowerCase());

    if (!matchQuery) return false;

    if (filterType === 'Empresa de Transporte') return t.tipo === 'Empresa de Transporte';
    if (filterType === 'Chofer Independiente') return t.tipo === 'Chofer Independiente';
    if (filterType === 'En prueba') return t.estado === 'En prueba';
    return true;
  });

  const handleOpenModal = (tenant?: Tenant) => {
    if (tenant) {
      const realVans = getLiveVansCount(tenant);
      const realAlumnos = getLiveAlumnosCount(tenant);
      setEditingTenant(tenant);
      setFormData({
        nombre: tenant.nombre,
        tipo: tenant.tipo,
        cedulaJuridica: tenant.cedulaJuridica,
        contactoTitular: tenant.contactoTitular,
        telefono: tenant.telefono,
        email: tenant.email,
        provincia: tenant.provincia,
        canton: tenant.canton,
        permisoCtp: tenant.permisoCtp,
        plan: suggestPlanByVans(realVans),
        montoMensualSaaS: calcMonthlyFeeForVans(realVans, pricingFormula),
        estado: tenant.estado,
        busetasActivas: realVans,
        estudiantesTotales: realAlumnos,
      });
    } else {
      setEditingTenant(null);
      setFormData({
        nombre: '',
        tipo: 'Empresa de Transporte',
        cedulaJuridica: '3-101-' + Math.floor(100000 + Math.random() * 900000),
        contactoTitular: '',
        telefono: '8' + Math.floor(100 + Math.random() * 899) + '-' + Math.floor(1000 + Math.random() * 9000),
        email: '',
        provincia: 'San José',
        canton: 'Escazú',
        permisoCtp: 'CTP-TE-2026-' + Math.floor(1000 + Math.random() * 9000),
        plan: 'Básico (1-3 busetas)',
        montoMensualSaaS: pricingFormula.basePrice,
        estado: 'En prueba',
        busetasActivas: 1,
        estudiantesTotales: 12,
      });
    }
    setModalOpen(true);
  };

  const handleUpdatePricingFormula = (patch: Partial<PricingFormula>) => {
    const next: PricingFormula = {
      basePrice: Math.max(0, Math.round(patch.basePrice ?? pricingFormula.basePrice)),
      stepDiscount: Math.max(0, Math.round(patch.stepDiscount ?? pricingFormula.stepDiscount)),
      floorPrice: Math.max(0, Math.round(patch.floorPrice ?? pricingFormula.floorPrice)),
    };
    setPricingFormula(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PRICING_FORMULA_STORAGE_KEY, JSON.stringify(next));
    }
  };

  const handleApplyPricingToAll = () => {
    let updatedCount = 0;
    for (const t of tenants) {
      const realVans = getLiveVansCount(t);
      const suggestedPlan = suggestPlanByVans(realVans);
      const targetFee = calcMonthlyFeeForVans(realVans, pricingFormula);
      if (t.plan !== suggestedPlan || t.montoMensualSaaS !== targetFee || t.busetasActivas !== realVans) {
        dispatch({
          type: 'updateTenant',
          tenant: {
            ...t,
            plan: suggestedPlan,
            busetasActivas: realVans,
            montoMensualSaaS: targetFee,
          },
        });
        updatedCount += 1;
      }
    }
    toast.success(
      updatedCount > 0
        ? `Tarifa progresiva aplicada a ${updatedCount} transportista(s)`
        : 'Todos los transportistas ya están al día con la tabla de precios',
    );
  };

  const handleSaveInlineFee = (tenant: Tenant) => {
    const parsed = Math.max(0, Math.round(Number(feeDraft) || 0));
    dispatch({
      type: 'updateTenant',
      tenant: { ...tenant, montoMensualSaaS: parsed },
    });
    setEditingFeeTenantId(null);
    toast.success(`Tarifa mensual de "${tenant.nombre}" actualizada a ${crc(parsed)}/mes`);
  };

  const handleQuickStatusChange = (tenant: Tenant, nextStatus: TenantStatus) => {
    dispatch({
      type: 'updateTenant',
      tenant: { ...tenant, estado: nextStatus },
    });
    toast.success(`Estado de "${tenant.nombre}" cambiado a ${nextStatus}`);
  };

  const handleChangeViewMode = (mode: 'list' | 'grid') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TENANT_VIEW_MODE_STORAGE_KEY, mode);
    }
  };

  const persistTenantOrder = (nextOrder: string[]) => {
    nextOrder.forEach((id, index) => {
      const tenant = tenants.find((t) => t.id === id);
      if (tenant && tenant.sortOrder !== index) {
        dispatch({ type: 'updateTenant', tenant: { ...tenant, sortOrder: index } });
      }
    });
  };

  const moveTenantStep = (tenantId: string, direction: -1 | 1) => {
    const visibleIndex = filteredTenants.findIndex((t) => t.id === tenantId);
    const targetVisibleIndex = visibleIndex + direction;
    if (visibleIndex < 0 || targetVisibleIndex < 0 || targetVisibleIndex >= filteredTenants.length) return;
    const neighbor = filteredTenants[targetVisibleIndex];
    if (!neighbor) return;
    const allIds = orderedTenants.map((t) => t.id);
    const idxA = allIds.indexOf(tenantId);
    const idxB = allIds.indexOf(neighbor.id);
    if (idxA < 0 || idxB < 0) return;
    const idA = allIds[idxA];
    const idB = allIds[idxB];
    if (!idA || !idB) return;
    allIds[idxA] = idB;
    allIds[idxB] = idA;
    persistTenantOrder(allIds);
  };

  const moveTenantToTarget = (sourceId: string, targetId: string) => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    const allIds = orderedTenants.map((t) => t.id);
    const sourceIdx = allIds.indexOf(sourceId);
    const targetIdx = allIds.indexOf(targetId);
    if (sourceIdx < 0 || targetIdx < 0) return;
    const [moved] = allIds.splice(sourceIdx, 1);
    if (!moved) return;
    allIds.splice(targetIdx, 0, moved);
    persistTenantOrder(allIds);
  };

  const handleSaveTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.contactoTitular.trim()) {
      toast.error('Completa los campos obligatorios');
      return;
    }

    if (editingTenant) {
      const updated: Tenant = {
        ...editingTenant,
        ...formData,
      };
      dispatch({ type: 'updateTenant', tenant: updated });
      toast.success(`Transportista "${updated.nombre}" actualizado con éxito`);
    } else {
      const slug = formData.nombre
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');
      const newTenant: Tenant = {
        id: crypto.randomUUID(),
        slug,
        ...formData,
        fechaRegistro: new Date().toLocaleDateString('es-CR'),
      };
      dispatch({ type: 'addTenant', tenant: newTenant });
      toast.success(`¡Nuevo transportista "${newTenant.nombre}" afiliado a Nexus Go!`, {
        description: `Plan: ${newTenant.plan} · Tenant ID: ${newTenant.slug}`,
      });
    }
    setModalOpen(false);
  };

  const handleDeleteTenant = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de dar de baja al transportista "${name}" de la plataforma?`)) {
      dispatch({ type: 'deleteTenant', id });
      toast.success(`Transportista "${name}" dado de baja`);
    }
  };

  const handleSwitchToTenant = (tenant: Tenant) => {
    dispatch({ type: 'switchTenant', id: tenant.id });
    toast.success(`Abriendo panel de "${tenant.nombre}" en nueva pestaña...`);
    window.open(`/admin/dashboard?tenant=${tenant.id}`, '_blank');
  };

  const handleExportCsv = () => {
    const headers = [
      'Empresa / Transportista',
      'Tipo',
      'Cédula Jurídica',
      'Titular',
      'Teléfono',
      'Correo',
      'Provincia',
      'Cantón',
      'Permiso CTP',
      'Plan SaaS',
      'Canon Mensual',
      'Busetas',
      'Alumnos',
      'Estado',
    ];
    const rows = tenants.map((t) => [
      t.nombre,
      t.tipo,
      t.cedulaJuridica,
      t.contactoTitular,
      t.telefono,
      t.email,
      t.provincia,
      t.canton,
      t.permisoCtp,
      t.plan,
      t.montoMensualSaaS,
      t.busetasActivas,
      t.estudiantesTotales,
      t.estado,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join(
        '\n'
      );
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `directorio_transportistas_cr_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Directorio nacional de transportistas exportado');
  };

  if (!state.isSuperAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-navy p-6 sm:p-8 text-white shadow-2xl text-center space-y-6">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-400 text-slate-950 shadow-lg">
            <ShieldCheck className="h-8 w-8" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-bold text-amber-300 border border-amber-400/30">
              NexusEduCR Master Access
            </span>
            <h2 className="mt-3 text-2xl font-black text-white">Acceso Restringido</h2>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              El Centro de Mando es confidencial y de acceso exclusivo para el <strong>SuperAdmin de NexusEduCR</strong>. Los transportistas, choferes y familias solo tienen acceso a su respectiva empresa.
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/60 border border-white/10 p-4 text-left space-y-2">
            <Label className="text-xs font-bold text-slate-200">Autenticación Maestra</Label>
            <PasswordInput
              defaultValue="••••••••••••"
              readOnly
              className="h-10 text-xs bg-slate-900 border-white/10 text-slate-400 font-mono tracking-widest cursor-not-allowed"
            />
            <p className="text-[10px] text-amber-300/80">
              * Identidad de plataforma: NexusEduCR Master Hub
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            <Button
              className="w-full h-11 bg-amber-400 text-slate-950 hover:bg-amber-500 font-extrabold text-xs shadow-md rounded-xl"
              onClick={() => {
                dispatch({ type: 'setSuperAdmin', enabled: true });
                toast.success('Sesión iniciada como SuperAdmin NexusEduCR', {
                  description: 'Centro de Mando desbloqueado.',
                });
              }}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Ingresar como SuperAdmin NexusEduCR
            </Button>

            <Button
              variant="ghost"
              className="w-full text-xs text-slate-400 hover:text-white"
              onClick={() => navigate({ to: '/admin/dashboard' })}
            >
              Volver al panel de flota
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSuperAdminSignOut = async () => {
    await signOut();
    dispatch({ type: 'setSuperAdmin', enabled: false });
    toast.info('Sesión cerrada');
    void navigate({ to: '/login', search: { tab: 'login', redirect: '' } });
  };

  const navItems: {
    id: 'resumen' | 'tarifas' | 'cumplimiento';
    label: string;
    icon: typeof LayoutDashboard;
    badge?: string;
  }[] = [
    { id: 'resumen', label: 'Resumen & KPIs', icon: LayoutDashboard, badge: String(totalTenants) },
    { id: 'tarifas', label: 'Tarifas & Facturación', icon: CreditCard, badge: crc(totalMrr) },
    { id: 'cumplimiento', label: 'Cumplimiento CTP', icon: ShieldCheck, badge: ctpCompliancePct },
  ];

  const renderSidebarContent = (onSelect?: () => void) => (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 border-b border-white/10 px-2 pb-4 pt-1 text-center">
          <div className="rounded-xl bg-white p-2 shadow-md">
            <img
              src="/logo-nexus-go.jpg"
              alt="Nexus Go CR"
              className="h-24 w-auto object-contain"
            />
          </div>
          <p className="text-sm font-black uppercase tracking-wide text-white">
            Nexus Go CR
          </p>
          <span className="rounded-full border border-amber-400/35 bg-amber-400/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-300">
            SuperAdmin Hub
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Centro de Mando
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveSection(item.id);
                  onSelect?.();
                }}
                className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md shrink-0 ${
                      isActive ? 'bg-slate-950/15 text-slate-950' : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="space-y-2 border-t border-white/10 pt-4">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Acciones Rápidas
          </p>
          <Button
            type="button"
            onClick={() => {
              handleOpenModal();
              onSelect?.();
            }}
            className="w-full justify-start bg-amber-400/15 text-amber-300 hover:bg-amber-400 hover:text-slate-950 border border-amber-400/30 font-bold text-xs h-9 rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Afiliar Transportista
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              handleExportCsv();
              onSelect?.();
            }}
            className="w-full justify-start text-slate-300 hover:bg-white/10 hover:text-white font-semibold text-xs h-9 rounded-xl"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-2 border-t border-white/10 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate({ to: '/admin/dashboard' })}
          className="w-full justify-between text-slate-300 hover:bg-white/10 hover:text-white text-xs h-9 rounded-xl"
        >
          <span className="flex items-center gap-2">
            <Bus className="h-4 w-4" />
            Ir al Panel de Flota
          </span>
          <ChevronRight className="h-3.5 w-3.5 opacity-60" />
        </Button>
        <Button
          type="button"
          onClick={handleSuperAdminSignOut}
          variant="outline"
          className="w-full justify-start border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500 hover:text-white font-bold text-xs h-9 rounded-xl"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-muted/20">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-slate-950 text-white border-r border-white/10 sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative z-10 w-64 max-w-[80vw] bg-slate-950 text-white h-full shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Cerrar menú"
            >
              <X className="h-4 w-4" />
            </button>
            {renderSidebarContent(() => setMobileMenuOpen(false))}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 border-b bg-slate-950 px-4 py-3 text-white">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-1.5 hover:bg-white/10"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-black">Nexus Go · SuperAdmin</span>
          </div>
          <div className="flex items-center gap-2">
            <UserUtilityBar darkBar />
          </div>
        </header>

        {/* Desktop Top Utility Bar */}
        <header className="hidden lg:flex sticky top-0 z-20 items-center justify-between border-b bg-card/85 backdrop-blur-md px-8 py-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <span className="text-foreground font-extrabold">NexusEduCR Master Hub</span>
            <span>/</span>
            <span className="capitalize">
              {navItems.find((n) => n.id === activeSection)?.label || 'Resumen'}
            </span>
          </div>
          <UserUtilityBar />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
      {/* NexusEduCR Master Header (Resumen) */}
      {activeSection === 'resumen' && (
      <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-navy to-slate-950 p-6 sm:p-8 text-white shadow-xl border border-white/10">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-bold text-amber-300 border border-amber-400/30">
                <Sparkles className="h-3 w-3" /> NexusEduCR Master Hub · Costa Rica
              </span>
              <span className="text-xs font-mono text-slate-400">v2026.4 Multi-Tenant</span>
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-white">
              Centro de Mando de Transportistas
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl leading-relaxed">
              Plataforma maestra de administración SaaS: afilia, monitorea y administra todas las empresas de busetas y choferes independientes de Costa Rica que contratan Nexus Go.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              onClick={() => void fetchLiveMetrics(true)}
              variant="outline"
              size="sm"
              disabled={refreshingMetrics}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold text-xs h-10 px-3.5 shadow-sm rounded-xl"
              title="Recargar conteos reales desde Supabase"
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshingMetrics ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button
              onClick={handleExportCsv}
              variant="outline"
              size="sm"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold text-xs h-10 px-3.5 shadow-sm rounded-xl"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Exportar
            </Button>
            <Button
              onClick={() => handleOpenModal()}
              className="bg-amber-400 text-slate-950 hover:bg-amber-500 font-extrabold text-xs h-10 px-4 shadow-md rounded-xl transition-all active:scale-95"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Afiliar Nuevo Transportista
            </Button>
          </div>
        </div>

        {/* Master SaaS KPIs */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Empresas & Choferes</p>
            <p className="mt-1 text-2xl font-black text-white">{totalTenants}</p>
            <p className="text-[10px] text-emerald-400 font-medium mt-0.5">● {activeTenants} Activos</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Flota Nacional</p>
            <p className="mt-1 text-2xl font-black text-white">{totalBusetas}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Busetas registradas</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Alumnos Conectados</p>
            <p className="mt-1 text-2xl font-black text-white">{totalEstudiantes}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Matrícula escolar total</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Facturación SaaS (MRR)</p>
            <p className="mt-1 text-2xl font-black text-amber-400">{crc(totalMrr)}</p>
            <p className="text-[10px] text-amber-300/80 font-medium mt-0.5">Solo cuentas Activas</p>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Cumplimiento CTP</p>
            <p className="mt-1 text-2xl font-black text-emerald-400">{ctpCompliancePct}</p>
            <p className="text-[10px] text-slate-300 font-medium mt-0.5">
              {contractSummary.total > 0
                ? `${contractSummary.signed}/${contractSummary.total} contratos firmados`
                : 'Permisos e INS al día'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards in Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setActiveSection('tarifas')}
          className="text-left rounded-2xl border bg-card p-5 shadow-xs hover:border-amber-400/60 transition-all group"
        >
          <div className="flex items-center justify-between">
            <CreditCard className="h-5 w-5 text-amber-500" />
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="mt-3 text-sm font-extrabold text-foreground">Tarifas & Facturación SaaS</p>
          <p className="mt-1 text-xs text-muted-foreground">
            MRR actual: <strong className="text-foreground">{crc(totalMrr)}</strong>. Ajusta precios por plan y busetas activas.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('cumplimiento')}
          className="text-left rounded-2xl border bg-card p-5 shadow-xs hover:border-amber-400/60 transition-all group"
        >
          <div className="flex items-center justify-between">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="mt-3 text-sm font-extrabold text-foreground">Cumplimiento CTP & Dekra</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {ctpCompliancePct} al día ({ctpSummary.ok} de {totalBusetas} busetas verificadas).
          </p>
        </button>
      </div>
      </>
      )}

      {/* Configurable SaaS Pricing & Billing Cycle */}
      {activeSection === 'tarifas' && (
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Tarifas & Facturación SaaS</h1>
          <p className="text-xs text-muted-foreground">
            Configura el costo mensual por plan y revisa el aporte al MRR ({crc(totalMrr)}/mes).
          </p>
        </div>
      </div>
      <div className="rounded-2xl border bg-card p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-extrabold text-foreground">
                Tarifas SaaS por Buseta Activa / Mes (Editable)
              </h2>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Ciclo sugerido: 15–30 días de prueba gratis al registrarse; cobro mensual adelantado del día 1 al 5 al pasar a <strong>Activo</strong>.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleApplyPricingToAll}
              className="h-8 text-xs font-bold"
            >
              Aplicar según busetas reales
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPricingPanel((prev) => !prev)}
              className="h-8 text-xs text-muted-foreground"
            >
              {showPricingPanel ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
        </div>

        {showPricingPanel && (
          <div className="space-y-4 pt-1">
            {/* Editable Formula Parameters + Quick Presets */}
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-extrabold text-foreground">
                    Descuento lineal progresivo por buseta adicional
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Ajusta la tarifa base, el descuento por unidad adicional o aplica un preset para Privado / Público.
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleUpdatePricingFormula({ basePrice: 15000, stepDiscount: 500, floorPrice: 10500 })
                    }
                    className="h-7 text-[11px] font-bold"
                  >
                    Privado (₡15k → ₡10.5k)
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleUpdatePricingFormula({ basePrice: 10000, stepDiscount: 500, floorPrice: 7000 })
                    }
                    className="h-7 text-[11px] font-bold"
                  >
                    Público (₡10k → ₡7k)
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold">Tarifa base (1 buseta)</Label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-muted-foreground">₡</span>
                    <Input
                      type="number"
                      min={0}
                      step={500}
                      value={pricingFormula.basePrice}
                      onChange={(e) => handleUpdatePricingFormula({ basePrice: Number(e.target.value) })}
                      className="h-8 text-xs font-mono font-bold bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold">Descuento por buseta extra</Label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-muted-foreground">-₡</span>
                    <Input
                      type="number"
                      min={0}
                      step={100}
                      value={pricingFormula.stepDiscount}
                      onChange={(e) => handleUpdatePricingFormula({ stepDiscount: Number(e.target.value) })}
                      className="h-8 text-xs font-mono font-bold bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold">Piso mínimo (10+ busetas)</Label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-muted-foreground">₡</span>
                    <Input
                      type="number"
                      min={0}
                      step={500}
                      value={pricingFormula.floorPrice}
                      onChange={(e) => handleUpdatePricingFormula({ floorPrice: Number(e.target.value) })}
                      className="h-8 text-xs font-mono font-bold bg-background"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Complete 1-10+ Progressive Table */}
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-[10px] uppercase font-bold text-muted-foreground border-b">
                  <tr>
                    <th className="px-3.5 py-2.5">Cantidad de busetas</th>
                    <th className="px-3.5 py-2.5">Precio mensual / buseta</th>
                    <th className="px-3.5 py-2.5">Total mensual a pagar</th>
                    <th className="px-3.5 py-2.5">Ingreso por +1 buseta</th>
                    <th className="px-3.5 py-2.5">Ahorro total vs tarifa base</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => {
                    const unit = calcUnitPriceForVans(count, pricingFormula);
                    const total = calcMonthlyFeeForVans(count, pricingFormula);
                    const prevTotal = count > 1 ? calcMonthlyFeeForVans(count - 1, pricingFormula) : 0;
                    const diff = count > 1 ? total - prevTotal : 0;
                    const savings = count * pricingFormula.basePrice - total;
                    return (
                      <tr key={count} className="hover:bg-muted/20">
                        <td className="px-3.5 py-2 font-bold text-foreground">
                          {count === 10 ? '10 o más busetas' : `${count} ${count === 1 ? 'buseta' : 'busetas'}`}
                        </td>
                        <td className="px-3.5 py-2 font-mono font-semibold">{crc(unit)}</td>
                        <td className="px-3.5 py-2 font-mono font-extrabold text-amber-600 dark:text-amber-400">
                          {crc(total)}
                          {count === 10 ? ' (por 10)' : ''}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          {count === 1 ? '—' : `+${crc(diff)}`}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-muted-foreground">
                          {savings > 0 ? `${crc(savings)}${count === 10 ? '+ al mes' : ' al mes'}` : '₡0'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      </div>
      )}

      {/* Filter and Search Bar + Tenants Table (visible directly in Resumen below KPIs) */}
      {activeSection === 'resumen' && (
      <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-foreground">Directorio de Transportistas</h2>
          <p className="text-xs text-muted-foreground">
            {totalTenants} empresas y choferes registrados · {activeTenants} activos.
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-amber-400 text-slate-950 hover:bg-amber-500 font-extrabold text-xs h-9 px-4 rounded-xl self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Afiliar Transportista
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, titular, cédula, cantón o permiso CTP..."
            className="pl-10 h-10 text-xs bg-card"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 py-1">
          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            {[
              { id: 'all', label: `Todos (${tenants.length})` },
              { id: 'Empresa de Transporte', label: 'Empresas Flota' },
              { id: 'Chofer Independiente', label: 'Independientes' },
              { id: 'En prueba', label: 'En Prueba' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs shrink-0 ${
                  filterType === tab.id
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-muted hover:text-foreground text-muted-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center rounded-xl border bg-muted/60 p-0.5 text-xs shrink-0">
            <button
              type="button"
              onClick={() => handleChangeViewMode('list')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Ver en formato lista"
            >
              <List className="h-3.5 w-3.5" />
              <span>Lista</span>
            </button>
            <button
              type="button"
              onClick={() => handleChangeViewMode('grid')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Ver en formato cuadro"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cuadro</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tenants List or Grid */}
      {viewMode === 'list' ? (
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="bg-muted/60 text-[10px] uppercase font-bold text-muted-foreground border-b">
              <tr>
                <th className="px-4 py-3.5">Empresa / Transportista</th>
                <th className="px-4 py-3.5">Ubicación (CR)</th>
                <th className="px-4 py-3.5">Permiso CTP</th>
                <th className="px-4 py-3.5">Plan SaaS</th>
                <th className="px-4 py-3.5 text-center">Busetas / Alumnos</th>
                <th className="px-4 py-3.5">Estado</th>
                <th className="px-4 py-3.5 text-right">Acción Maestro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Building2 className="h-8 w-8 mx-auto opacity-30 mb-2" />
                    <p className="font-bold">No se encontraron transportistas</p>
                    <p className="text-[11px] mt-0.5">Prueba con otro término de búsqueda o afilia uno nuevo.</p>
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t, index) => {
                  const isCurrent = state.currentTenantId === t.id;
                  const isDragOver = dragOverTenantId === t.id && draggedTenantId !== t.id;
                  return (
                    <tr
                      key={t.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggedTenantId(t.id);
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', t.id);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (dragOverTenantId !== t.id) setDragOverTenantId(t.id);
                      }}
                      onDragLeave={() => {
                        if (dragOverTenantId === t.id) setDragOverTenantId(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const sourceId = draggedTenantId || e.dataTransfer.getData('text/plain');
                        moveTenantToTarget(sourceId, t.id);
                        setDraggedTenantId(null);
                        setDragOverTenantId(null);
                      }}
                      onDragEnd={() => {
                        setDraggedTenantId(null);
                        setDragOverTenantId(null);
                      }}
                      className={`hover:bg-muted/30 transition-colors ${
                        draggedTenantId === t.id ? 'opacity-50' : ''
                      } ${isDragOver ? 'bg-amber-50/60 dark:bg-amber-950/30 ring-2 ring-inset ring-amber-400' : ''}`}
                    >
                      {/* Name & Contact */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex flex-col items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveTenantStep(t.id, -1)}
                              disabled={index === 0}
                              className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-25 disabled:pointer-events-none"
                              title="Subir ubicación"
                              aria-label={`Subir a ${t.nombre}`}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/60 cursor-grab active:cursor-grabbing" />
                            <button
                              type="button"
                              onClick={() => moveTenantStep(t.id, 1)}
                              disabled={index === filteredTenants.length - 1}
                              className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-25 disabled:pointer-events-none"
                              title="Bajar ubicación"
                              aria-label={`Bajar a ${t.nombre}`}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-slate-900 to-navy text-amber-400 flex items-center justify-center font-black text-xs shadow-xs border border-white/10">
                            {t.nombre.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-foreground text-sm leading-snug break-words">{t.nombre}</span>
                              {isCurrent && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-bold shrink-0">
                                  En vista
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">
                              Titular: {t.contactoTitular} · {t.telefono}
                            </p>
                            <p className="text-[10px] font-mono text-slate-500">Céd: {t.cedulaJuridica}</p>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 text-foreground font-semibold">
                          <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                          <span>{t.canton}, {t.provincia}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground capitalize">{t.tipo}</span>
                      </td>

                      {/* CTP Permit */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-muted px-2 py-0.5 rounded-md border">
                          <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                          {t.permisoCtp}
                        </span>
                      </td>

                      {/* SaaS Plan & Fee */}
                      <td className="px-4 py-3.5">
                        <p className="font-extrabold text-foreground truncate">
                          {PLAN_LABELS[suggestPlanByVans(getLiveVansCount(t))]?.title ?? t.plan.split('(')[0]}
                        </p>
                        {editingFeeTenantId === t.id ? (
                          <div className="mt-1 flex items-center gap-1">
                            <Input
                              type="number"
                              min={0}
                              step={1000}
                              value={feeDraft}
                              onChange={(e) => setFeeDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveInlineFee(t);
                                }
                                if (e.key === 'Escape') {
                                  setEditingFeeTenantId(null);
                                }
                              }}
                              className="h-7 w-24 text-[11px] font-mono px-2"
                              autoFocus
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleSaveInlineFee(t)}
                              className="h-7 px-2 text-[10px] font-bold bg-amber-400 text-slate-950 hover:bg-amber-500"
                            >
                              OK
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingFeeTenantId(t.id);
                              setFeeDraft(String(getLiveMonthlyFee(t)));
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 hover:underline"
                            title="Calculado en vivo (busetas × tarifa unitaria). Clic para ajustar."
                          >
                            <span>{crc(getLiveMonthlyFee(t))}/mes</span>
                            <Edit className="h-2.5 w-2.5 opacity-70" />
                          </button>
                        )}
                      </td>

                      {/* Fleet & Students */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-black text-sm text-foreground">{getLiveVansCount(t)}</span>
                        <span className="text-[10px] text-muted-foreground"> busetas · </span>
                        <span className="font-bold text-foreground">{getLiveAlumnosCount(t)}</span>
                        <span className="text-[10px] text-muted-foreground"> alumnos</span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <select
                          value={t.estado}
                          onChange={(e) => handleQuickStatusChange(t, e.target.value as TenantStatus)}
                          aria-label={`Estado de ${t.nombre}`}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold border-0 cursor-pointer focus:outline-none ${
                            t.estado === 'Activo'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                              : t.estado === 'En prueba'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          <option value="Activo">● Activo</option>
                          <option value="En prueba">● En prueba</option>
                          <option value="Suspendido">● Suspendido</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => handleSwitchToTenant(t)}
                            className="h-8 px-2.5 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded-lg shadow-xs"
                            title="Abrir consola de flota de este transportista en nueva pestaña"
                          >
                            <span>Entrar</span>
                            <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenModal(t)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Editar datos del transportista"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTenant(t.id, t.nombre)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            title="Dar de baja de la plataforma"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTenants.length === 0 ? (
            <div className="col-span-full rounded-2xl border bg-card py-12 text-center text-muted-foreground shadow-sm">
              <Building2 className="h-8 w-8 mx-auto opacity-30 mb-2" />
              <p className="font-bold text-sm">No se encontraron transportistas</p>
              <p className="text-xs mt-0.5">Prueba con otro término de búsqueda o afilia uno nuevo.</p>
            </div>
          ) : (
            filteredTenants.map((t, index) => {
              const isCurrent = state.currentTenantId === t.id;
              const isDragOver = dragOverTenantId === t.id && draggedTenantId !== t.id;
              return (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedTenantId(t.id);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', t.id);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverTenantId !== t.id) setDragOverTenantId(t.id);
                  }}
                  onDragLeave={() => {
                    if (dragOverTenantId === t.id) setDragOverTenantId(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const sourceId = draggedTenantId || e.dataTransfer.getData('text/plain');
                    moveTenantToTarget(sourceId, t.id);
                    setDraggedTenantId(null);
                    setDragOverTenantId(null);
                  }}
                  onDragEnd={() => {
                    setDraggedTenantId(null);
                    setDragOverTenantId(null);
                  }}
                  className={`rounded-2xl border bg-card p-4 shadow-sm transition-all flex flex-col justify-between gap-3.5 ${
                    draggedTenantId === t.id ? 'opacity-50' : ''
                  } ${isDragOver ? 'ring-2 ring-amber-400 bg-amber-50/40 dark:bg-amber-950/20' : 'hover:shadow-md'}`}
                >
                  <div className="space-y-3">
                    {/* Card top bar: reorder + status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <GripVertical className="h-4 w-4 cursor-grab active:cursor-grabbing opacity-60" />
                        <button
                          type="button"
                          onClick={() => moveTenantStep(t.id, -1)}
                          disabled={index === 0}
                          className="p-1 rounded-md hover:bg-muted hover:text-foreground disabled:opacity-25 disabled:pointer-events-none"
                          title="Mover antes"
                          aria-label={`Subir a ${t.nombre}`}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveTenantStep(t.id, 1)}
                          disabled={index === filteredTenants.length - 1}
                          className="p-1 rounded-md hover:bg-muted hover:text-foreground disabled:opacity-25 disabled:pointer-events-none"
                          title="Mover después"
                          aria-label={`Bajar a ${t.nombre}`}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold">
                            En vista
                          </span>
                        )}
                        <select
                          value={t.estado}
                          onChange={(e) => handleQuickStatusChange(t, e.target.value as TenantStatus)}
                          aria-label={`Estado de ${t.nombre}`}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold border-0 cursor-pointer focus:outline-none ${
                            t.estado === 'Activo'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                              : t.estado === 'En prueba'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          <option value="Activo">● Activo</option>
                          <option value="En prueba">● En prueba</option>
                          <option value="Suspendido">● Suspendido</option>
                        </select>
                      </div>
                    </div>

                    {/* Identity */}
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-slate-900 to-navy text-amber-400 flex items-center justify-center font-black text-xs shadow-xs border border-white/10">
                        {t.nombre.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-foreground text-sm leading-snug break-words">{t.nombre}</h3>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          Titular: {t.contactoTitular} · {t.telefono}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500">Céd: {t.cedulaJuridica}</p>
                      </div>
                    </div>

                    {/* Location & CTP */}
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2 text-xs">
                      <div className="flex items-center gap-1 text-foreground font-semibold min-w-0">
                        <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{t.canton}, {t.provincia}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-background px-2 py-0.5 rounded-md border">
                        <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                        {t.permisoCtp}
                      </span>
                    </div>

                    {/* Plan, Fee & Fleet */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl border bg-background/60 px-3 py-2">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Plan SaaS</p>
                        <p className="font-extrabold text-foreground truncate">
                          {PLAN_LABELS[suggestPlanByVans(getLiveVansCount(t))]?.title ?? t.plan.split('(')[0]}
                        </p>
                        {editingFeeTenantId === t.id ? (
                          <div className="mt-1 flex items-center gap-1">
                            <Input
                              type="number"
                              min={0}
                              step={1000}
                              value={feeDraft}
                              onChange={(e) => setFeeDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveInlineFee(t);
                                }
                                if (e.key === 'Escape') {
                                  setEditingFeeTenantId(null);
                                }
                              }}
                              className="h-7 w-20 text-[11px] font-mono px-1.5"
                              autoFocus
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleSaveInlineFee(t)}
                              className="h-7 px-2 text-[10px] font-bold bg-amber-400 text-slate-950 hover:bg-amber-500"
                            >
                              OK
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingFeeTenantId(t.id);
                              setFeeDraft(String(getLiveMonthlyFee(t)));
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 hover:underline mt-0.5"
                            title="Clic para ajustar tarifa mensual"
                          >
                            <span>{crc(getLiveMonthlyFee(t))}/mes</span>
                            <Edit className="h-2.5 w-2.5 opacity-70" />
                          </button>
                        )}
                      </div>

                      <div className="rounded-xl border bg-background/60 px-3 py-2 flex flex-col justify-center">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Flota / Alumnos</p>
                        <p className="mt-0.5">
                          <span className="font-black text-sm text-foreground">{getLiveVansCount(t)}</span>
                          <span className="text-[11px] text-muted-foreground"> busetas</span>
                        </p>
                        <p>
                          <span className="font-bold text-xs text-foreground">{getLiveAlumnosCount(t)}</span>
                          <span className="text-[11px] text-muted-foreground"> alumnos</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      onClick={() => handleSwitchToTenant(t)}
                      className="h-8 flex-1 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded-lg shadow-xs"
                    >
                      <span>Entrar</span>
                      <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenModal(t)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title="Editar datos del transportista"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteTenant(t.id, t.nombre)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      title="Dar de baja de la plataforma"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
      </div>
      )}

      {/* Cumplimiento CTP / Dekra */}
      {activeSection === 'cumplimiento' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-black text-foreground">Cumplimiento CTP & Dekra</h1>
            <p className="text-xs text-muted-foreground">
              Monitoreo consolidado de permisos estudiantiles, Dekra e INS sobre {totalBusetas} busetas registradas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border bg-card p-5">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Al día</p>
              <p className="mt-1 text-3xl font-black text-foreground">{ctpSummary.ok}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Busetas habilitadas sin alertas</p>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Próximo a vencer</p>
              <p className="mt-1 text-3xl font-black text-foreground">{ctpSummary.warning}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Renovación preventiva requerida</p>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">Vencido</p>
              <p className="mt-1 text-3xl font-black text-foreground">{ctpSummary.expired}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Atención inmediata requerida</p>
            </div>
          </div>

          <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-[10px] uppercase font-bold text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3">Transportista</th>
                  <th className="px-4 py-3">Permiso CTP</th>
                  <th className="px-4 py-3 text-center">Busetas</th>
                  <th className="px-4 py-3 text-center">Contratos Firmados</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {tenants.map((t) => {
                  const cStats = contractsByTenant[t.id] ?? { total: 0, signed: 0 };
                  return (
                    <tr key={t.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-bold text-foreground">{t.nombre}</td>
                      <td className="px-4 py-3 font-mono text-[11px]">{t.permisoCtp}</td>
                      <td className="px-4 py-3 text-center font-bold">{vansByTenant[t.id] ?? 0}</td>
                      <td className="px-4 py-3 text-center font-bold">
                        {cStats.total > 0 ? `${cStats.signed}/${cStats.total}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {t.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </main>
      </div>

      {/* Onboarding / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-extrabold">
              <Building2 className="h-5 w-5 text-amber-500" />
              {editingTenant ? 'Editar Empresa / Transportista' : 'Afiliar Nuevo Transportista a Nexus Go'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveTenant} className="space-y-4 py-2 text-xs">
            {/* General Info */}
            <div className="space-y-1">
              <Label className="text-xs font-bold">Razón Social o Nombre Comercial</Label>
              <Input
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej. Busetas del Valle Central S.A."
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Tipo de Transportista</Label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                  className="w-full h-9 rounded-lg border bg-background px-3 text-xs font-semibold focus:outline-none"
                >
                  <option value="Empresa de Transporte">Empresa de Transporte</option>
                  <option value="Chofer Independiente">Chofer Independiente</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Cédula Física / Jurídica (Costa Rica)</Label>
                <Input
                  required
                  value={formData.cedulaJuridica}
                  onChange={(e) => setFormData({ ...formData, cedulaJuridica: e.target.value })}
                  placeholder="3-101-789234"
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Representative & Contacts */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Administrador Titular</Label>
                <Input
                  required
                  value={formData.contactoTitular}
                  onChange={(e) => setFormData({ ...formData, contactoTitular: e.target.value })}
                  placeholder="Nombre y Apellidos"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Teléfono WhatsApp</Label>
                <Input
                  required
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="8841-9230"
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Correo Electrónico</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@empresa.cr"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Permiso de Transporte Estudiantil CTP</Label>
                <Input
                  required
                  value={formData.permisoCtp}
                  onChange={(e) => setFormData({ ...formData, permisoCtp: e.target.value })}
                  placeholder="CTP-TE-2024-8841"
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Provincia</Label>
                <select
                  value={formData.provincia}
                  onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                  className="w-full h-9 rounded-lg border bg-background px-3 text-xs font-semibold focus:outline-none"
                >
                  {['San José', 'Alajuela', 'Heredia', 'Cartago', 'Puntarenas', 'Guanacaste', 'Limón'].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Cantón de Operación</Label>
                <Input
                  value={formData.canton}
                  onChange={(e) => setFormData({ ...formData, canton: e.target.value })}
                  placeholder="Ej. Escazú, Belén, Desamparados"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Plan SaaS & Capacity */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Plan SaaS Contratado</Label>
                <select
                  value={formData.plan}
                  onChange={(e) => {
                    const plan = e.target.value as TenantPlan;
                    setFormData({
                      ...formData,
                      plan,
                      montoMensualSaaS: calcMonthlyFeeForVans(formData.busetasActivas || 1, pricingFormula),
                    });
                  }}
                  className="w-full h-9 rounded-lg border bg-background px-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="Básico (1-3 busetas)">Independiente (1 buseta)</option>
                  <option value="Profesional (4-10 busetas)">Empresa (2–5 busetas)</option>
                  <option value="Flota Enterprise (+10 busetas)">Flota (+5 busetas)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Tarifa Mensual (₡)</Label>
                <Input
                  type="number"
                  value={formData.montoMensualSaaS}
                  onChange={(e) => setFormData({ ...formData, montoMensualSaaS: Number(e.target.value) })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Estado</Label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as TenantStatus })}
                  className="w-full h-9 rounded-lg border bg-background px-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="Activo">Activo</option>
                  <option value="En prueba">En prueba</option>
                  <option value="Suspendido">Suspendido</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Busetas en Operación</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.busetasActivas}
                  onChange={(e) => {
                    const vansCount = Math.max(1, Number(e.target.value) || 1);
                    setFormData({
                      ...formData,
                      busetasActivas: vansCount,
                      plan: suggestPlanByVans(vansCount),
                      montoMensualSaaS: calcMonthlyFeeForVans(vansCount, pricingFormula),
                    });
                  }}
                  className="h-9 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold">Estudiantes Matriculados</Label>
                <Input
                  type="number"
                  value={formData.estudiantesTotales}
                  onChange={(e) => setFormData({ ...formData, estudiantesTotales: Number(e.target.value) })}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-500">
                {editingTenant ? 'Actualizar Transportista' : 'Completar Afiliación'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
