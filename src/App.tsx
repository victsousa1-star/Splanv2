/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  LayoutDashboard,
  HardHat,
  ClipboardList,
  DollarSign,
  LayoutGrid,
  Settings2,
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  User,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Check,
  X,
  FileText,
  Eye,
  Users,
  Upload,
  Wallet,
  Calendar,
  Folder,
  Share2,
  Download,
  Share,
  Search,
  Info,
  Presentation,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  GripVertical,
  List,
  Type,
  Image as ImageIcon,
  Move,
  Briefcase,
  Building2,
  TrendingUp,
  Sun,
  Moon,
  Camera,
  CloudRain,
  Cloud,
  ThermometerSun,
  Settings,
  Minus,
  Receipt,
  Send,
  Copy,
  Menu,
  ShieldCheck,
  Store,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Toaster, toast } from "sonner";
import { 
  auth, 
  adminAuth, 
  db, 
  storage,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  collection,
  query,
  where,
  or,
  onSnapshot,
  addDoc,
  updateDoc,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  onSupabaseStatusChange
} from "./firebase-compat";
import { supabase } from "./supabase";
import { handleFirestoreError, OperationType } from "./firestoreError";
import { PasswordResetScreen } from "./components/PasswordResetScreen";
import { LoginScreen } from "./components/LoginScreen";
import { UserManagement } from "./components/UserManagement";
import { analyzeProjectInsights } from "./services/geminiService";
import {
  CHECKLIST_TEMPLATES,
  type ChecklistTemplateId,
  type ChecklistTemplateRow,
} from "./checklistModels";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface UserProfile {
  uid: string;
  email: string | null;
  role: "admin" | "user";
  needsPasswordReset: boolean;
  name?: string;
  accessProfile?: AccessProfileId;
}

type AppModuleId =
  | "home"
  | "shopping"
  | "lojas"
  | "obras"
  | "checklists"
  | "relatorios"
  | "admin";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


import {
  Status,
  Service,
  MeasurementPeriod,
  Provider,
  Measurement,
  Invoice,
  OCStatus,
  OC,
  DisbursementType,
  DisbursementCategoryConfig,
  DisbursementConfig,
  Disbursement,
  RDOPhoto,
  RDOLabor,
  RDOEquipment,
  ReportConfig,
  RDO,
  Location,
  SlideElement,
  CustomSlide,
  Project,
  Role,
  AccountabilityEntry,
  EnvioMacro,
  AppConfig,
  Allowance,
} from "./types";
import { AllowanceView } from "./components/AllowanceView";
import { AllowanceDashboard } from "./components/AllowanceDashboard";

const TAB_PERMISSIONS: Record<string, Role[]> = {
  financeiro: ["owner", "editor"],
  notas: ["owner", "editor"],
  desembolso: ["owner", "editor"],
  rdo: ["owner", "editor"],
  compartilhar: ["owner"],
};

const SUPABASE_SETUP_SQL = `create table if not exists public.splan_data (
    id text primary key,
    doc_id text not null,
    collection text not null,
    owner_id text,
    shared_emails text[] not null default '{}',
    data jsonb not null default '{}'::jsonb,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists splan_data_collection_idx on public.splan_data (collection);
create index if not exists splan_data_owner_idx on public.splan_data (owner_id);
create index if not exists splan_data_shared_emails_idx on public.splan_data using gin (shared_emails);

alter table public.splan_data enable row level security;

create or replace function public.is_splan_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.splan_data
    where collection = 'users'
      and doc_id = auth.uid()::text
      and data->>'role' = 'admin'
  );
$$;

drop policy if exists "Acesso público total" on public.splan_data;
drop policy if exists "Acesso público total" on public.splan_data;
drop policy if exists "Acesso publico total" on public.splan_data;
drop policy if exists "splan_select_own_shared_admin" on public.splan_data;
drop policy if exists "splan_insert_own_or_admin" on public.splan_data;
drop policy if exists "splan_update_own_shared_admin" on public.splan_data;
drop policy if exists "splan_delete_own_or_admin" on public.splan_data;

create policy "splan_select_own_shared_admin"
on public.splan_data
for select
using (
  collection = 'appConfig'
  or owner_id = auth.uid()::text
  or auth.email() = any(shared_emails)
  or public.is_splan_admin()
);

create policy "splan_insert_own_or_admin"
on public.splan_data
for insert
with check (
  public.is_splan_admin()
  or (collection = 'users' and doc_id = auth.uid()::text and coalesce(data->>'role', 'user') = 'user')
  or (collection not in ('appConfig', 'admins', 'users') and owner_id = auth.uid()::text)
);

create policy "splan_update_own_shared_admin"
on public.splan_data
for update
using (
  owner_id = auth.uid()::text
  or auth.email() = any(shared_emails)
  or public.is_splan_admin()
)
with check (
  owner_id = auth.uid()::text
  or auth.email() = any(shared_emails)
  or public.is_splan_admin()
);

create policy "splan_delete_own_or_admin"
on public.splan_data
for delete
using (
  owner_id = auth.uid()::text
  or public.is_splan_admin()
);`;

function hasTabAccess(
  tabId: string,
  role: Role,
  allowedTabs: string[],
): boolean {
  if (role === "owner") return true;
  return allowedTabs.includes(tabId);
}

const AVAILABLE_TABS = [
  {
    id: "resumo",
    label: "Resumo",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    id: "servicos",
    label: "Serviços",
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    id: "medicoes",
    label: "Medições",
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  {
    id: "financeiro",
    label: "Financeiro",
    icon: <DollarSign className="w-5 h-5" />,
  },
  {
    id: "notas",
    label: "Notas Fiscais",
    icon: <FileText className="w-5 h-5" />,
  },
  { id: "ocs", label: "OCs", icon: <Briefcase className="w-5 h-5" /> },
  {
    id: "cronograma",
    label: "Cronograma",
    icon: <Calendar className="w-5 h-5" />,
  },
  { id: "rdo", label: "RDO", icon: <Camera className="w-5 h-5" /> },
];

const APP_MODULES: Array<{
  id: AppModuleId;
  label: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  available?: boolean;
}> = [
  {
    id: "shopping",
    label: "Shopping",
    description: "Cadastro e selecao do shopping ativo",
    icon: <Building2 className="w-5 h-5" />,
    accent: "from-cyan-600 to-blue-600",
    available: true,
  },
  {
    id: "lojas",
    label: "Lojas",
    description: "Cadastro e historico das lojas do shopping",
    icon: <Store className="w-5 h-5" />,
    accent: "from-emerald-700 to-teal-700",
    available: true,
  },
  {
    id: "obras",
    label: "Obras",
    description: "Gestao de obras, medicoes, RDOs e cronogramas",
    icon: <Building2 className="w-5 h-5" />,
    accent: "from-blue-600 to-indigo-600",
    available: true,
  },
  {
    id: "checklists",
    label: "Checklists",
    description: "Listas de verificacao por obra e rotina",
    icon: <ClipboardList className="w-5 h-5" />,
    accent: "from-emerald-600 to-teal-600",
    available: true,
  },
  {
    id: "relatorios",
    label: "Relatorios",
    description: "Historico de vistorias e PDFs por loja",
    icon: <FileText className="w-5 h-5" />,
    accent: "from-slate-700 to-emerald-800",
    available: true,
  },
  {
    id: "admin",
    label: "Admin",
    description: "Usuarios, permissoes e branding",
    icon: <Settings2 className="w-5 h-5" />,
    accent: "from-slate-600 to-zinc-700",
    available: true,
  },
];

const MODULE_FEATURES: Record<AppModuleId, string[]> = {
  home: ["Hub de modulos", "Resumo geral", "Acessos rapidos"],
  shopping: ["Cadastro de shoppings", "Contexto do sistema", "Permissoes por unidade"],
  lojas: ["Cadastro de lojas", "Dados operacionais", "Base para checklists"],
  obras: ["Locais e obras", "Medicoes e RDO", "Cronograma e apresentacao"],
  checklists: ["Cadastro de lojas", "Modelos de vistoria", "Pendencias por loja"],
  relatorios: ["Historico por loja", "Filtros e consulta", "Base para PDFs"],
  admin: ["Usuarios", "Permissoes", "Identidade visual"],
};

type PermissionModuleId = Exclude<AppModuleId, "home">;
type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "export_pdf"
  | "manage_users";
type AccessScopeType = "global" | "shopping" | "obra" | "loja";
type AccessProfileId =
  | "admin"
  | "gestor_shopping"
  | "fiscal"
  | "leitura";

type ModulePermissionSet = Partial<Record<PermissionModuleId, PermissionAction[]>>;

const ACCESS_PROFILE_LABELS: Record<AccessProfileId, string> = {
  admin: "Administrador",
  gestor_shopping: "Gerentes",
  fiscal: "Operações",
  leitura: "Somente leitura",
};

const ACCESS_SCOPE_LABELS: Record<AccessScopeType, string> = {
  global: "Todos os módulos",
  shopping: "Shopping/local",
  obra: "Obra específica",
  loja: "Loja específica",
};

const ACCESS_PROFILE_PERMISSIONS: Record<AccessProfileId, ModulePermissionSet> = {
  admin: {
    shopping: ["view", "create", "edit", "delete"],
    lojas: ["view", "create", "edit", "delete"],
    obras: ["view", "create", "edit", "delete", "export_pdf"],
    checklists: ["view", "create", "edit", "delete", "export_pdf"],
    relatorios: ["view", "export_pdf", "delete"],
    admin: ["view", "manage_users", "edit"],
  },
  gestor_shopping: {
    shopping: ["view", "create", "edit"],
    lojas: ["view", "create", "edit", "delete"],
    obras: ["view", "create", "edit", "export_pdf"],
    checklists: ["view", "create", "edit", "export_pdf"],
    relatorios: ["view", "export_pdf"],
  },
  fiscal: {
    shopping: ["view"],
    lojas: ["view"],
    checklists: ["view", "create", "edit", "export_pdf"],
    relatorios: ["view", "export_pdf"],
  },
  leitura: {
    shopping: ["view"],
    lojas: ["view"],
    relatorios: ["view"],
  },
};

function getAccessProfile(user: UserProfile | null): AccessProfileId {
  if (!user) return "leitura";
  if (user.role === "admin" || user.email === "vict.sousa1@gmail.com") return "admin";
  return user.accessProfile || "gestor_shopping";
}

function getAccessScope(user: UserProfile | null): AccessScopeType {
  const profile = getAccessProfile(user);
  if (profile === "admin") return "global";
  return "shopping";
}

function canUseModule(
  user: UserProfile | null,
  moduleId: PermissionModuleId,
  action: PermissionAction = "view",
  profileOverride?: AccessProfileId | null,
) {
  const profile = profileOverride || getAccessProfile(user);
  return ACCESS_PROFILE_PERMISSIONS[profile][moduleId]?.includes(action) ?? false;
}

function getVisibleAppModules(
  user: UserProfile | null,
  profileOverride?: AccessProfileId | null,
  hasSelectedShopping = true,
) {
  const isActualAdmin = user?.role === "admin" || user?.email === "vict.sousa1@gmail.com";
  return APP_MODULES.filter((module) => {
    if (module.id === "home") return false;
    if (module.id === "admin" && isActualAdmin) return true;
    if (module.id !== "shopping" && !hasSelectedShopping) return false;
    return canUseModule(user, module.id, "view", profileOverride);
  });
}

type ChecklistItemStatus = "na" | "ok" | "nok";

interface ChecklistStore {
  id: string;
  shoppingId?: string;
  code: string;
  name: string;
  company: string;
  templateId: ChecklistTemplateId;
  openingDate: string;
  createdAt: number;
}

interface ChecklistReport {
  id: string;
  shoppingId: string;
  storeId: string;
  title: string;
  date: string;
  templateId?: ChecklistTemplateId;
  statuses?: Record<string, ChecklistItemStatus>;
  notes?: Record<string, string>;
  ownerId?: string;
  sharedWith?: Record<string, any>;
  sharedEmails?: string[];
  createdAt: number;
  updatedAt?: number;
}

interface NavigationSnapshot {
  activeModule: AppModuleId;
  homeView: "shoppings" | "modules";
  selectedShoppingId: string | null;
  selectedLocationId: string | null;
  selectedProjectId: string | null;
  isUserManagementView: boolean;
  isAllowanceView: boolean;
  selectedAllowance: Allowance | null;
  focusedStoreId: string | null;
  focusedReportMode: "checklists" | "reports" | null;
}

type StoreStatus = "planejada" | "em_obra" | "vistoria" | "entregue" | "pausada";

interface RetailStore {
  id: string;
  shoppingId: string;
  name: string;
  code: string;
  segment: string;
  responsibleName: string;
  contractorName: string;
  status: StoreStatus;
  notes: string;
  ownerId: string;
  sharedWith?: Record<string, any>;
  sharedEmails?: string[];
  createdAt: number;
  updatedAt?: number;
}

const STORE_STATUS_LABELS: Record<StoreStatus, string> = {
  planejada: "Planejada",
  em_obra: "Em obra",
  vistoria: "Em vistoria",
  entregue: "Entregue",
  pausada: "Pausada",
};

function usePermissions(
  location: Location | undefined,
  project: Project | undefined,
  user: any,
): { role: Role; allowedTabs: string[] } {
  return useMemo(() => {
    if (!user || !user.email) return { role: "none", allowedTabs: [] };

    if (user.role === "admin" || user.email === "vict.sousa1@gmail.com") {
      return { role: "owner", allowedTabs: AVAILABLE_TABS.map((t) => t.id) };
    }

    if (
      (location && location.ownerId === user.uid) ||
      (project && project.ownerId === user.uid)
    ) {
      return { role: "owner", allowedTabs: AVAILABLE_TABS.map((t) => t.id) };
    }

    const defaultWorkTabs = [
      "resumo",
      "servicos",
      "medicoes",
      "financeiro",
      "notas",
      "ocs",
      "cronograma",
      "rdo",
    ];

    if (location && location.sharedWith && location.sharedWith[user.email]) {
      const shared = location.sharedWith[user.email];
      const allowed = Array.from(
        new Set([...defaultWorkTabs, ...(shared.allowedTabs || [])]),
      );
      return { role: shared.role, allowedTabs: allowed };
    }

    if (project && project.sharedWith && project.sharedWith[user.email]) {
      const shared = project.sharedWith[user.email] as any;
      // Handle both old format (string) and new format (object)
      if (typeof shared === "string") {
        return {
          role: shared as Role,
          allowedTabs: AVAILABLE_TABS.map((t) => t.id),
        };
      } else {
        const allowed = Array.from(
          new Set([...defaultWorkTabs, ...(shared.allowedTabs || [])]),
        );
        return { role: shared.role, allowedTabs: allowed };
      }
    }

    return { role: "none", allowedTabs: [] };
  }, [location, project, user]);
}

// --- Mock Data ---

const INITIAL_LOCATIONS: Location[] = [
  { id: "loc1", name: "SRP", ownerId: "admin" },
  { id: "loc2", name: "SDI", ownerId: "admin" },
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Residencial Bella Vista",
    locationId: "loc1",
    startDate: "2024-01-15",
    status: "Em Execução",
    services: [
      {
        id: "s1",
        name: "Alvenaria de Vedação",
        unit: "m²",
        quantity: 500,
        unitPrice: 45.0,
      },
      {
        id: "s2",
        name: "Reboco Interno",
        unit: "m²",
        quantity: 1200,
        unitPrice: 25.5,
      },
      {
        id: "s3",
        name: "Pintura Látex",
        unit: "m²",
        quantity: 1200,
        unitPrice: 18.0,
      },
    ],
    measurements: [
      {
        id: "m1",
        serviceId: "s1",
        periodId: "p1",
        date: "2024-02-10",
        quantity: 200,
      },
      {
        id: "m2",
        serviceId: "s2",
        periodId: "p1",
        date: "2024-02-15",
        quantity: 100,
      },
    ],
    measurementPeriods: [{ id: "p1", number: 1, date: "2024-02-15" }],
    invoices: [],
    ownerId: "admin",
  },
];

// --- Helpers ---

const calculateProjectStats = (project: Project) => {
  const nonMacroServices = project.services.filter((s) => !s.isMacro);
  const totalValue = nonMacroServices.reduce(
    (sum, s) => sum + (s.quantity || 0) * (s.unitPrice || 0),
    0,
  );
  const totalMeasured = project.measurements.reduce((sum, m) => {
    const service = project.services.find((s) => s.id === m.serviceId);
    return sum + (m.quantity || 0) * (service?.unitPrice || 0);
  }, 0);
  const totalScheduledProgressValue = nonMacroServices.reduce((sum, s) => {
    return sum + ((s.progress || 0) / 100) * (s.quantity * s.unitPrice);
  }, 0);
  const totalInvoices = (project.invoices || []).reduce(
    (sum, inv) => sum + inv.value,
    0,
  );
  const totalDisbursements = (project.disbursements || []).reduce(
    (sum, d) => sum + d.value,
    0,
  );
  const percent =
    totalValue > 0 ? (totalScheduledProgressValue / totalValue) * 100 : 0;
  const percentInvoiced =
    totalValue > 0 ? (totalInvoices / totalValue) * 100 : 0;
  const percentDisbursed =
    totalValue > 0 ? (totalDisbursements / totalValue) * 100 : 0;
  return {
    totalValue,
    totalMeasured,
    totalScheduledProgressValue,
    totalInvoices,
    totalDisbursements,
    percent,
    percentInvoiced,
    percentDisbursed,
  };
};

// --- Components ---

function removeUndefined(obj: any): any {
  if (obj === undefined) return undefined;
  if (obj === null || typeof obj !== "object") return obj;

  // Preserve Date and other non-plain objects
  if (obj.constructor !== Object && !Array.isArray(obj)) return obj;

  if (Array.isArray(obj)) {
    return obj.map(removeUndefined).filter((v) => v !== undefined);
  }

  const newObj: any = {};
  Object.keys(obj).forEach((key) => {
    const val = removeUndefined(obj[key]);
    if (val !== undefined) {
      newObj[key] = val;
    }
  });
  return newObj;
}

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isAppMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;
    setIsStandalone(isAppMode);

    if (isAppMode) return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      const hasSeenPrompt = localStorage.getItem("hasSeenInstallPrompt");
      if (!hasSeenPrompt) {
        setTimeout(() => setShow(true), 3000);
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const hasSeenPrompt = localStorage.getItem("hasSeenInstallPrompt");
      if (!hasSeenPrompt) {
        setShow(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShow(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem("hasSeenInstallPrompt", "true");
  };

  if (!show || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-5 z-[100] flex flex-col gap-4 card-shadow">
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-400 p-1 hover:bg-slate-800 rounded-full transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-4">
        <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-sm">
          <Download className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-white font-display">
            Instalar Aplicativo
          </h4>
          <p className="text-sm text-slate-500 font-medium">
            Acesso rápido e offline!
          </p>
        </div>
      </div>

      {isIOS ? (
        <div className="bg-slate-950 p-4 rounded-xl text-sm text-slate-400 flex flex-col gap-3 border border-slate-800">
          <p className="font-semibold">Para instalar no iOS:</p>
          <ol className="list-decimal list-inside space-y-2 ml-1 font-medium">
            <li>
              Toque no ícone de Compartilhar{" "}
              <Share className="w-4 h-4 inline mx-1 text-blue-600" />
            </li>
            <li>
              Toque em <strong>"Adicionar à Tela de Início"</strong>
            </li>
          </ol>
        </div>
      ) : (
        <button
          onClick={handleInstall}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          Instalar Agora
        </button>
      )}
    </div>
  );
}

export default function App() {
  const [appConfig, setAppConfig] = useState<AppConfig>({
    name: "SPlan",
    logoUrl: null,
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "appConfig", "branding"),
      (snap) => {
        if (snap.exists()) {
          setAppConfig(snap.data() as AppConfig);
        }
      },
      (error) => {
        // Silently ignore if not found initially, but report permission issues
        if (error.code !== "permission-denied") {
          console.error("Error fetching app branding:", error);
        } else {
          handleFirestoreError(error, OperationType.GET, "appConfig/branding");
        }
      },
    );
    return () => unsubscribe();
  }, []);

  const handleUpdateAppConfig = async (newConfig: AppConfig) => {
    try {
      await setDoc(doc(db, "appConfig", "branding"), removeUndefined(newConfig));
      toast.success("Branding do aplicativo atualizado!");
    } catch (error) {
      console.error("Error updating branding:", error);
      toast.error("Erro ao atualizar branding.");
    }
  };
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stores, setStores] = useState<RetailStore[]>([]);
  const [checklistReports, setChecklistReports] = useState<ChecklistReport[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [selectedShoppingId, setSelectedShoppingId] = useState<string | null>(() => {
    try {
      return localStorage.getItem("splan.selectedShoppingId");
    } catch {
      return null;
    }
  });
  const [isUserManagementView, setIsUserManagementView] = useState(false);
  const [activeModule, setActiveModule] = useState<AppModuleId>("home");
  const [focusedStoreId, setFocusedStoreId] = useState<string | null>(null);
  const [focusedReportMode, setFocusedReportMode] = useState<"checklists" | "reports" | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<NavigationSnapshot[]>([]);
  const [homeView, setHomeView] = useState<"shoppings" | "modules">("shoppings");
  const [dismissedSupabaseWarning, setDismissedSupabaseWarning] = useState(false);
  const [subStatus, setSubStatus] = useState<{ connected: boolean; error: string | null; tableMissing: boolean }>({
    connected: false,
    error: null,
    tableMissing: false,
  });

  useEffect(() => {
    return onSupabaseStatusChange((status) => {
      setSubStatus(status);
    });
  }, []);
  const [isAllowanceView, setIsAllowanceView] = useState(false);
  const [selectedAllowance, setSelectedAllowance] = useState<Allowance | null>(null);
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "dark";
  });
  const [permissionTestProfile, setPermissionTestProfile] =
    useState<AccessProfileId | null>(() => {
      const saved = localStorage.getItem("splan.permissionTestProfile");
      return saved &&
        [
          "admin",
          "gestor_shopping",
          "fiscal",
          "leitura",
        ].includes(saved)
        ? (saved as AccessProfileId)
        : null;
    });

  useEffect(() => {
    if (permissionTestProfile) {
      localStorage.setItem("splan.permissionTestProfile", permissionTestProfile);
    } else {
      localStorage.removeItem("splan.permissionTestProfile");
    }
  }, [permissionTestProfile]);

  useEffect(() => {
    if (selectedShoppingId) {
      localStorage.setItem("splan.selectedShoppingId", selectedShoppingId);
    } else {
      localStorage.removeItem("splan.selectedShoppingId");
    }
  }, [selectedShoppingId]);

  useEffect(() => {
    if (
      selectedShoppingId &&
      locations.length > 0 &&
      !locations.some((location) => location.id === selectedShoppingId)
    ) {
      setSelectedShoppingId(null);
    }
  }, [locations, selectedShoppingId]);

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        try {
          let userSnap = await getDoc(userRef);
          const isInitialAdmin = currentUser.email === "vict.sousa1@gmail.com";

          if (!userSnap.exists()) {
            const initialProfile = {
              email: currentUser.email,
              role: isInitialAdmin ? "admin" : "user",
              needsPasswordReset: false,
              name: currentUser.displayName || "",
            };
            await setDoc(userRef, initialProfile);

            if (isInitialAdmin) {
              await setDoc(doc(db, "admins", currentUser.uid), {
                email: currentUser.email,
              });
            }

            setUser({ uid: currentUser.uid, ...initialProfile } as UserProfile);
          } else {
            let data = userSnap.data();

            if (isInitialAdmin && data.role !== "admin") {
              await updateDoc(userRef, { role: "admin" });
              await setDoc(doc(db, "admins", currentUser.uid), {
                email: currentUser.email,
              });
              data.role = "admin";
            }

            setUser({ uid: currentUser.uid, ...data, email: currentUser.email } as UserProfile);
          }

          // Move the listener outside so we can clean it up
          if (unsubscribeProfile) unsubscribeProfile();
          unsubscribeProfile = onSnapshot(
            userRef,
            (snap) => {
              if (snap.exists() && currentUser) {
                setUser({
                  uid: currentUser.uid,
                  ...snap.data(),
                  email: currentUser.email
                } as UserProfile);
              }
            },
            (error) => {
              if (error.message.includes("Quota limit exceeded"))
                setQuotaExceeded(true);
              handleFirestoreError(
                error,
                OperationType.GET,
                "users/" + currentUser.uid,
              );
            },
          );
        } catch (error: any) {
          console.error("Error checking/creating user document:", error);
          if (error.message?.includes("Quota limit exceeded"))
            setQuotaExceeded(true);
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            role: "user",
            needsPasswordReset: false,
          });
        }
      } else {
        setUser(null);
        if (unsubscribeProfile) unsubscribeProfile();
        unsubscribeProfile = null;
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  useEffect(() => {
    if (!user || !user.uid || !user.email) return;

    // Use or() query to combine both owner and shared access into a single listener
    const projectsQuery = query(
      collection(db, "projects"),
      or(
        where("ownerId", "==", user.uid),
        where("sharedEmails", "array-contains", user.email),
      ),
    );

    const unsubscribeProjects = onSnapshot(
      projectsQuery,
      (snapshot) => {
        const projectsData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Project,
        );
        const uniqueProjects = projectsData.filter(
          (project, index, self) =>
            self.findIndex((p) => p.id === project.id) === index
        );
        setProjects(uniqueProjects);
      },
      (error) => {
        if (error.message.includes("Quota limit exceeded"))
          setQuotaExceeded(true);
        handleFirestoreError(error, OperationType.LIST, "projects");
      },
    );

    const locationsQuery = query(
      collection(db, "locations"),
      or(
        where("ownerId", "==", user.uid),
        where("sharedEmails", "array-contains", user.email),
      ),
    );

    const unsubscribeLocations = onSnapshot(
      locationsQuery,
      (snapshot) => {
        const locationsData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Location,
        );
        const uniqueLocations = locationsData.filter(
          (location, index, self) =>
            self.findIndex((l) => l.id === location.id) === index
        );
        setLocations(uniqueLocations);
      },
      (error) => {
        if (error.message.includes("Quota limit exceeded"))
          setQuotaExceeded(true);
        handleFirestoreError(error, OperationType.LIST, "locations");
      },
    );

    const storesQuery = query(
      collection(db, "stores"),
      or(
        where("ownerId", "==", user.uid),
        where("sharedEmails", "array-contains", user.email),
      ),
    );

    const unsubscribeStores = onSnapshot(
      storesQuery,
      (snapshot) => {
        const storesData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as RetailStore,
        );
        const uniqueStores = storesData.filter(
          (store, index, self) =>
            self.findIndex((item) => item.id === store.id) === index,
        );
        setStores(uniqueStores);
      },
      (error) => {
        if (error.message.includes("Quota limit exceeded"))
          setQuotaExceeded(true);
        handleFirestoreError(error, OperationType.LIST, "stores");
      },
    );

    const checklistReportsQuery = query(
      collection(db, "checklistReports"),
      or(
        where("ownerId", "==", user.uid),
        where("sharedEmails", "array-contains", user.email),
      ),
    );

    const unsubscribeChecklistReports = onSnapshot(
      checklistReportsQuery,
      (snapshot) => {
        const reportsData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as ChecklistReport,
        );
        const uniqueReports = reportsData.filter(
          (report, index, self) =>
            self.findIndex((item) => item.id === report.id) === index,
        );
        setChecklistReports(uniqueReports);
      },
      (error) => {
        if (error.message.includes("Quota limit exceeded"))
          setQuotaExceeded(true);
        handleFirestoreError(error, OperationType.LIST, "checklistReports");
      },
    );

    return () => {
      unsubscribeProjects();
      unsubscribeLocations();
      unsubscribeStores();
      unsubscribeChecklistReports();
    };
  }, [user?.uid, user?.email]);

  useEffect(() => {
    if (!user || !user.uid) return;

    const q = query(
      collection(db, "allowances"),
      where("ownerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Allowance));
      setAllowances(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "allowances");
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleUpdateLocation = async (updated: Location) => {
    const { id, ...locationData } = updated;
    const oldLocation = locations.find((l) => l.id === id);

    const dataToSave = {
      ...locationData,
      sharedWith: locationData.sharedWith || {},
      sharedEmails: Object.keys(locationData.sharedWith || {}),
    };

    // Deep comparison of location data to avoid redundant writes
    const hasLocationChanged =
      JSON.stringify(oldLocation) !== JSON.stringify(updated);

    if (hasLocationChanged) {
      try {
        await updateDoc(
          doc(db, "locations", id),
          removeUndefined(dataToSave) as any,
        );
      } catch (error: any) {
        if (error.message.includes("Quota limit exceeded"))
          setQuotaExceeded(true);
        handleFirestoreError(error, OperationType.UPDATE, "locations/" + id);
      }
    }

    // Only update projects if sharing settings changed AND we have the old state to compare
    if (oldLocation) {
      const sharingChanged =
        JSON.stringify(oldLocation.sharedWith) !==
        JSON.stringify(updated.sharedWith);

      if (sharingChanged) {
        try {
          const q = query(
            collection(db, "projects"),
            where("locationId", "==", id),
          );
          const querySnapshot = await getDocs(q);
          for (const docSnap of querySnapshot.docs) {
            try {
              const projectData = docSnap.data();
              // Only update if project sharing is actually different
              const projectSharingChanged =
                JSON.stringify(projectData.sharedWith) !==
                JSON.stringify(updated.sharedWith);
              if (projectSharingChanged) {
                await updateDoc(
                  doc(db, "projects", docSnap.id),
                  removeUndefined({
                    sharedWith: updated.sharedWith || {},
                    sharedEmails: Object.keys(updated.sharedWith || {}),
                  }) as any,
                );
              }
            } catch (error: any) {
              if (error.message.includes("Quota limit exceeded"))
                setQuotaExceeded(true);
              handleFirestoreError(
                error,
                OperationType.UPDATE,
                "projects/" + docSnap.id,
              );
            }
          }

          const storesQuery = query(
            collection(db, "stores"),
            where("shoppingId", "==", id),
          );
          const storesSnapshot = await getDocs(storesQuery);
          for (const docSnap of storesSnapshot.docs) {
            try {
              const storeData = docSnap.data();
              const storeSharingChanged =
                JSON.stringify(storeData.sharedWith) !==
                JSON.stringify(updated.sharedWith);
              if (storeSharingChanged) {
                await updateDoc(
                  doc(db, "stores", docSnap.id),
                  removeUndefined({
                    sharedWith: updated.sharedWith || {},
                    sharedEmails: Object.keys(updated.sharedWith || {}),
                  }) as any,
                );
              }
            } catch (error: any) {
              if (error.message.includes("Quota limit exceeded"))
                setQuotaExceeded(true);
              handleFirestoreError(
                error,
                OperationType.UPDATE,
                "stores/" + docSnap.id,
              );
            }
          }

          const checklistReportsQuery = query(
            collection(db, "checklistReports"),
            where("shoppingId", "==", id),
          );
          const checklistReportsSnapshot = await getDocs(checklistReportsQuery);
          for (const docSnap of checklistReportsSnapshot.docs) {
            try {
              const reportData = docSnap.data();
              const reportSharingChanged =
                JSON.stringify(reportData.sharedWith) !==
                JSON.stringify(updated.sharedWith);
              if (reportSharingChanged) {
                await updateDoc(
                  doc(db, "checklistReports", docSnap.id),
                  removeUndefined({
                    sharedWith: updated.sharedWith || {},
                    sharedEmails: Object.keys(updated.sharedWith || {}),
                  }) as any,
                );
              }
            } catch (error: any) {
              if (error.message.includes("Quota limit exceeded"))
                setQuotaExceeded(true);
              handleFirestoreError(
                error,
                OperationType.UPDATE,
                "checklistReports/" + docSnap.id,
              );
            }
          }
        } catch (error: any) {
          if (error.message.includes("Quota limit exceeded"))
            setQuotaExceeded(true);
          handleFirestoreError(error, OperationType.LIST, "projects");
        }
      }
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const selectedLocation = locations.find((l) => l.id === selectedLocationId);

  useEffect(() => {
    if (!selectedAllowance) return;
    if (selectedLocation?.type === 'allowance' && selectedLocation.id === selectedAllowance.id) {
      const locStoreName = selectedLocation.allowanceFields?.storeName || selectedLocation.name;
      const locValue = selectedLocation.allowanceFields?.value || 0;
      if (locValue !== selectedAllowance.value || locStoreName !== selectedAllowance.storeName) {
        setSelectedAllowance(prev => prev ? ({
          ...prev,
          storeName: locStoreName,
          value: locValue
        }) : null);
      }
    } else {
      const updatedAllowance = allowances.find(a => a.id === selectedAllowance.id);
      if (updatedAllowance && (updatedAllowance.value !== selectedAllowance.value || updatedAllowance.storeName !== selectedAllowance.storeName)) {
        setSelectedAllowance(updatedAllowance);
      }
    }
  }, [selectedLocation, allowances, selectedAllowance]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  if (quotaExceeded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6">
          <div className="bg-red-500/10 p-4 rounded-full">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white font-display">
              Limite de Quota Atingido
            </h2>
            <p className="text-slate-400 font-medium">
              Este aplicativo atingiu o limite diário de leitura do banco de
              dados (plano gratuito). A quota será resetada amanhã às 00:00 UTC.
            </p>
          </div>
          <a
            href="https://console.firebase.google.com/project/gen-lang-client-0227360694/firestore/databases/ai-studio-91f5e9e0-f18c-427e-a3bf-ff42c7ba8f56/data?openUpgradeDialog=true"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-600/20"
          >
            Fazer Upgrade no Console
          </a>
          <button
            onClick={() => window.location.reload()}
            className="text-slate-400 hover:text-white text-sm font-semibold transition-colors"
          >
            Tentar Recarregar
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen appConfig={appConfig} />;
  }

  if (user.needsPasswordReset) {
    return (
      <PasswordResetScreen
        user={user}
        appConfig={appConfig}
        onPasswordChanged={() => {
          // Profile will be updated by the onSnapshot listener already running in App
        }}
      />
    );
  }

  const resetWorkContext = () => {
    setSelectedLocationId(null);
    setSelectedProjectId(null);
    setIsAllowanceView(false);
    setSelectedAllowance(null);
  };

  const getNavigationSnapshot = (): NavigationSnapshot => ({
    activeModule,
    homeView,
    selectedShoppingId,
    selectedLocationId,
    selectedProjectId,
    isUserManagementView,
    isAllowanceView,
    selectedAllowance,
    focusedStoreId,
    focusedReportMode,
  });

  const restoreNavigationSnapshot = (snapshot: NavigationSnapshot) => {
    setActiveModule(snapshot.activeModule);
    setHomeView(snapshot.homeView);
    setSelectedShoppingId(snapshot.selectedShoppingId);
    setSelectedLocationId(snapshot.selectedLocationId);
    setSelectedProjectId(snapshot.selectedProjectId);
    setIsUserManagementView(snapshot.isUserManagementView);
    setIsAllowanceView(snapshot.isAllowanceView);
    setSelectedAllowance(snapshot.selectedAllowance);
    setFocusedStoreId(snapshot.focusedStoreId);
    setFocusedReportMode(snapshot.focusedReportMode);
  };

  const pushNavigationSnapshot = () => {
    const snapshot = getNavigationSnapshot();
    setNavigationHistory((current) => {
      const last = current[current.length - 1];
      if (last && JSON.stringify(last) === JSON.stringify(snapshot)) return current;
      return [...current.slice(-9), snapshot];
    });
  };

  const handleGoBack = () => {
    const previous = navigationHistory[navigationHistory.length - 1];
    if (!previous) return;
    setNavigationHistory((current) => current.slice(0, -1));
    restoreNavigationSnapshot(previous);
  };

  const handleSelectModule = (moduleId: AppModuleId) => {
    const isActualAdmin =
      user?.role === "admin" || user?.email === "vict.sousa1@gmail.com";
    if (
      moduleId !== "home" &&
      moduleId !== "shopping" &&
      moduleId !== "admin" &&
      !selectedShoppingId
    ) {
      setActiveModule("home");
      setHomeView("shoppings");
      setIsUserManagementView(false);
      toast.info("Selecione ou cadastre um shopping antes de acessar os módulos.");
      return;
    }
    if (
      moduleId !== "home" &&
      !(moduleId === "admin" && isActualAdmin) &&
      !canUseModule(user, moduleId, "view", permissionTestProfile)
    ) {
      toast.error("Seu perfil nao possui acesso a este modulo.");
      return;
    }
    if (moduleId !== activeModule) {
      pushNavigationSnapshot();
    }
    setActiveModule(moduleId);
    setIsUserManagementView(moduleId === "admin");
    resetWorkContext();
  };

  const handleGoHome = () => {
    if (activeModule !== "home" || homeView !== "shoppings") {
      pushNavigationSnapshot();
    }
    setActiveModule("home");
    setHomeView("shoppings");
    setIsUserManagementView(false);
    resetWorkContext();
  };

  const handleSelectLocation = (id: string) => {
    pushNavigationSnapshot();
    setActiveModule("obras");
    setSelectedLocationId(id);
    const loc = locations.find(l => l.id === id);
    if (loc?.allowanceFields) {
      setSelectedAllowance({
        id: loc.id,
        storeName: loc.allowanceFields.storeName || loc.name,
        value: loc.allowanceFields.value || 0,
        ownerId: loc.ownerId,
        createdAt: Date.now()
      });
      setIsAllowanceView(true);
    } else {
      setIsAllowanceView(false);
      setSelectedAllowance(null);
    }
  };

  const handleBackToLocations = () => {
    pushNavigationSnapshot();
    setActiveModule("obras");
    setSelectedLocationId(null);
    setSelectedProjectId(null);
    setIsUserManagementView(false);
    setIsAllowanceView(false);
    setSelectedAllowance(null);
  };

  const handleBackToProjects = () => {
    pushNavigationSnapshot();
    setActiveModule("obras");
    setSelectedProjectId(null);
  };

  const shoppingLocations = locations.filter((location) => location.type !== "allowance");
  const selectedShopping = shoppingLocations.find(
    (location) => location.id === selectedShoppingId,
  );
  const activeShoppingId = selectedShopping?.id || null;
  const canDeleteShopping = canUseModule(user, "shopping", "delete", permissionTestProfile);
  const handleDeleteShopping = async (shoppingId: string) => {
    if (!canDeleteShopping) {
      toast.error("Voce nao tem permissao para apagar shoppings.");
      return;
    }

    const shopping = shoppingLocations.find((item) => item.id === shoppingId);
    const linkedProjects = projects.filter((project) => project.locationId === shoppingId);
    const linkedStores = stores.filter((store) => store.shoppingId === shoppingId);
    const linkedReports = checklistReports.filter((report) => report.shoppingId === shoppingId);
    const confirmed = window.confirm(
      `Apagar o shopping "${shopping?.name || "selecionado"}"?` +
        (linkedProjects.length > 0
          ? `\n\nTambem serao apagadas ${linkedProjects.length} obra(s) vinculada(s).`
          : "") +
        (linkedStores.length > 0
          ? `\nTambem serao apagadas ${linkedStores.length} loja(s) vinculada(s).`
          : "") +
        (linkedReports.length > 0
          ? `\nTambem serao apagados ${linkedReports.length} relatorio(s) vinculados.`
          : ""),
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "locations", shoppingId));
      for (const project of linkedProjects) {
        await deleteDoc(doc(db, "projects", project.id));
      }
      for (const store of linkedStores) {
        await deleteDoc(doc(db, "stores", store.id));
      }
      for (const report of linkedReports) {
        await deleteDoc(doc(db, "checklistReports", report.id));
      }

      if (selectedShoppingId === shoppingId) {
        setSelectedShoppingId(null);
        setSelectedLocationId(null);
        setSelectedProjectId(null);
        setHomeView("shoppings");
        setActiveModule("home");
      }

      toast.success("Shopping apagado.");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "locations/" + shoppingId);
    }
  };
  const accessProfile = permissionTestProfile || getAccessProfile(user);
  const accessScope = permissionTestProfile
    ? permissionTestProfile === "admin"
      ? "global"
      : "shopping"
    : getAccessScope(user);
  const canManageUsers = canUseModule(user, "admin", "manage_users", permissionTestProfile);
  const reportsForSelectedShopping = selectedShopping
    ? checklistReports.filter((report) => report.shoppingId === selectedShopping.id)
    : [];
  const canInstallApp = Boolean(deferredPrompt);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans app-shell">
      <Toaster
        position="top-right"
        theme={theme === "dark" ? "dark" : "light"}
      />
      {/* Navbar */}
      <nav className="bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 text-white px-3 md:px-6 py-3 md:py-4 flex justify-between items-center border-b border-slate-800/60">
          <div 
            className="flex items-center gap-2 md:gap-3 cursor-pointer group min-w-0"
            onClick={handleGoHome}
          >
            {appConfig.logoUrl ? (
              <span className="splan-logo-frame">
                <img src={appConfig.logoUrl} alt="Logo" className="splan-brand-logo" />
              </span>
            ) : (
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 md:p-2 rounded-xl shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105 flex-shrink-0">
                <HardHat className="w-5 h-5 md:w-8 md:h-8 text-white" />
              </div>
            )}
            <h1 className="text-xl md:text-2xl font-bold tracking-tight font-display bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent truncate">
              {appConfig.name}
            </h1>
          </div>
        <div className="hidden md:flex items-center gap-1 bg-slate-900/40 border border-slate-800/70 rounded-2xl p-1.5">
          {navigationHistory.length > 0 && (
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all text-slate-400 hover:text-white hover:bg-slate-800/70"
              title="Voltar para a pagina anterior"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
          )}
          <button
            onClick={handleGoHome}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all",
              activeModule === "home"
                ? "bg-slate-800 text-white shadow-lg shadow-black/10"
                : "text-slate-400 hover:text-white hover:bg-slate-800/70",
            )}
            title="Visao geral da plataforma"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Geral</span>
          </button>
        </div>
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {canManageUsers && (
            <button
              onClick={() => {
                handleSelectModule("admin");
              }}
              className={cn(
                "flex items-center gap-2 px-3 md:px-4 py-2 rounded-full font-bold text-xs md:text-sm transition-all",
                activeModule === "admin"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800",
              )}
            >
              <Users className="w-4 h-4" />
              <span className="hidden lg:inline">Usuários</span>
            </button>
          )}
          <div className="hidden xl:flex items-center gap-2 text-xs bg-slate-900/50 px-3 py-2 rounded-full border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="font-bold text-slate-300">{ACCESS_PROFILE_LABELS[accessProfile]}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-500">{ACCESS_SCOPE_LABELS[accessScope]}</span>
          </div>
          {deferredPrompt && (
            <button
              onClick={() => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult: any) => {
                  if (choiceResult.outcome === "accepted") {
                    setDeferredPrompt(null);
                  }
                });
              }}
              className="text-xs md:text-sm bg-blue-600 text-white px-3 md:px-4 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-sm hidden sm:block"
            >
              Instalar App
            </button>
          )}
          <div className="flex items-center gap-2 text-xs md:text-sm bg-slate-900/50 px-2 md:px-4 py-2 rounded-full border border-slate-800 max-w-[120px] md:max-w-none">
            <User className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span className="font-medium text-slate-300 truncate hidden xs:inline">{user.email}</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-1.5 md:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            title={
              theme === "dark"
                ? "Mudar para modo claro"
                : "Mudar para modo escuro"
            }
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <Moon className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </button>
          <button
            onClick={handleLogout}
            className="p-1.5 md:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </nav>

      <main className="flex-1 p-4 lg:p-6 max-w-full mx-auto w-full">
        {permissionTestProfile && (
          <div className="mb-5 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-slate-200 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-black text-white text-sm">
                  Modo teste de permissões ativo: {ACCESS_PROFILE_LABELS[permissionTestProfile]}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  A navegação e os botões estão simulando este perfil apenas neste navegador.
                </p>
              </div>
            </div>
            <button
              onClick={() => setPermissionTestProfile(null)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition-colors"
            >
              Sair do modo teste
            </button>
          </div>
        )}
        {subStatus.tableMissing && !dismissedSupabaseWarning && (
          <div className="mb-6 p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-slate-200 card-shadow flex flex-col md:flex-row gap-5 items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 text-amber-500 font-bold mb-2">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <h3 className="text-lg font-display">SPlan integrado ao Supabase com sucesso! 🚀</h3>
              </div>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                A transição do Firebase para o Supabase está pronta. O aplicativo está utilizando armazenamento local offline, mas para sincronizar os dados em nuvem automaticamente, execute o script SQL abaixo no <strong>SQL Editor</strong> do painel do seu Supabase:
              </p>
              <div className="relative bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto max-w-full mb-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
                    toast.success("Script SQL copiado com sucesso!");
                  }}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                  title="Copiar script SQL"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <pre className="pr-12">{SUPABASE_SETUP_SQL}</pre>
              </div>
              <p className="text-xs text-slate-500">
                💡 <strong>Dica adicional:</strong> Para habilitar fotos nos relatórios, crie também um bucket público chamado <code>rdo-fotos</code> na seção de Storage do seu painel Supabase.
              </p>
            </div>
            <button
              onClick={() => setDismissedSupabaseWarning(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-colors flex-shrink-0"
            >
              Continuar Offline
            </button>
          </div>
        )}
        <AnimatePresence mode="wait">
          {activeModule === "home" ? (
            <ModuleHome
              key="home-hub"
              locations={locations}
              projects={projects}
              stores={stores}
              allowances={allowances}
              user={user}
              onSelectModule={handleSelectModule}
              onSelectShopping={(shoppingId) => {
                pushNavigationSnapshot();
                setSelectedShoppingId(shoppingId);
                setSelectedLocationId(null);
                setSelectedProjectId(null);
                setHomeView("modules");
              }}
              onBackToShoppings={() => {
                pushNavigationSnapshot();
                setHomeView("shoppings");
              }}
              permissionTestProfile={permissionTestProfile}
              selectedShopping={selectedShopping}
              shoppings={shoppingLocations}
              homeView={homeView}
              canDeleteShopping={canDeleteShopping}
              onDeleteShopping={handleDeleteShopping}
            />
          ) : activeModule === "shopping" ? (
            <ShoppingModule
              key="shopping"
              shoppings={shoppingLocations}
              selectedShoppingId={selectedShoppingId}
              projects={projects}
              onSelectShopping={(shoppingId) => {
                pushNavigationSnapshot();
                setSelectedShoppingId(shoppingId);
                setSelectedLocationId(null);
                setSelectedProjectId(null);
                setHomeView("modules");
                setActiveModule("home");
                toast.success("Shopping selecionado. Módulos liberados.");
              }}
              onClearShopping={() => {
                setSelectedShoppingId(null);
                setSelectedLocationId(null);
                setSelectedProjectId(null);
              }}
              onAddShopping={async (name) => {
                try {
                  await addDoc(
                    collection(db, "locations"),
                    removeUndefined({
                      name,
                      type: "shopping",
                      ownerId: user.uid,
                      sharedWith: {},
                      sharedEmails: [],
                    }),
                  );
                  toast.success("Shopping cadastrado.");
                } catch (error) {
                  handleFirestoreError(error, OperationType.CREATE, "locations");
                }
              }}
              canDeleteShopping={canDeleteShopping}
              onDeleteShopping={handleDeleteShopping}
            />
          ) : (activeModule === "admin" || isUserManagementView) && canManageUsers ? (
            <UserManagement 
              key="user-mgt" 
              appConfig={appConfig}
              onUpdateAppConfig={handleUpdateAppConfig}
              permissionTestProfile={permissionTestProfile}
              onChangePermissionTestProfile={setPermissionTestProfile}
              canManagePermissions={canManageUsers}
            />
          ) : activeModule === "lojas" ? (
            <StoresModule
              key="stores"
              selectedShopping={selectedShopping}
              stores={stores}
              reports={reportsForSelectedShopping}
              projects={projects}
              permissions={{
                canCreate: canUseModule(user, "lojas", "create", permissionTestProfile),
                canEdit: canUseModule(user, "lojas", "edit", permissionTestProfile),
                canDelete: canUseModule(user, "lojas", "delete", permissionTestProfile),
                canOpenChecklists: canUseModule(user, "checklists", "view", permissionTestProfile),
                canCreateChecklists: canUseModule(user, "checklists", "create", permissionTestProfile),
                canOpenReports: canUseModule(user, "relatorios", "view", permissionTestProfile),
              }}
              onOpenStoreChecklists={(storeId) => {
                setFocusedStoreId(storeId);
                setFocusedReportMode("checklists");
                handleSelectModule("checklists");
              }}
              onOpenStoreReports={(storeId) => {
                setFocusedStoreId(storeId);
                setFocusedReportMode("reports");
                handleSelectModule("relatorios");
              }}
              onCreateStore={async (storeData) => {
                if (!selectedShopping || !user) return;
                try {
                  await addDoc(
                    collection(db, "stores"),
                    removeUndefined({
                      ...storeData,
                      shoppingId: selectedShopping.id,
                      ownerId: user.uid,
                      sharedWith: selectedShopping.sharedWith || {},
                      sharedEmails: selectedShopping.sharedEmails || [],
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    }),
                  );
                  toast.success("Loja cadastrada.");
                } catch (error) {
                  handleFirestoreError(error, OperationType.CREATE, "stores");
                }
              }}
              onUpdateStore={async (store) => {
                const { id, ...storeData } = store;
                try {
                  await updateDoc(
                    doc(db, "stores", id),
                    removeUndefined({
                      ...storeData,
                      updatedAt: Date.now(),
                    }) as any,
                  );
                  toast.success("Loja atualizada.");
                } catch (error) {
                  handleFirestoreError(error, OperationType.UPDATE, "stores/" + id);
                }
              }}
              onDeleteStore={async (storeId) => {
                try {
                  const linkedReports = checklistReports.filter(
                    (report) => report.storeId === storeId,
                  );
                  await deleteDoc(doc(db, "stores", storeId));
                  for (const report of linkedReports) {
                    await deleteDoc(doc(db, "checklistReports", report.id));
                  }
                  toast.success("Loja apagada.");
                } catch (error) {
                  handleFirestoreError(error, OperationType.DELETE, "stores/" + storeId);
                }
              }}
            />
          ) : activeModule === "checklists" ? (
            <ChecklistModule
              key="checklists"
              selectedShopping={selectedShopping}
              stores={stores}
              reports={reportsForSelectedShopping}
              initialStoreId={focusedReportMode === "checklists" ? focusedStoreId : null}
              permissions={{
                canCreate: canUseModule(user, "checklists", "create", permissionTestProfile),
                canEdit: canUseModule(user, "checklists", "edit", permissionTestProfile),
                canDelete: canUseModule(user, "checklists", "delete", permissionTestProfile),
                canExportPdf: canUseModule(user, "checklists", "export_pdf", permissionTestProfile),
              }}
              onCreateReport={async (reportData) => {
                if (!selectedShopping || !user) return null;
                try {
                  const created = await addDoc(
                    collection(db, "checklistReports"),
                    removeUndefined({
                      ...reportData,
                      shoppingId: selectedShopping.id,
                      ownerId: user.uid,
                      sharedWith: selectedShopping.sharedWith || {},
                      sharedEmails: selectedShopping.sharedEmails || [],
                      statuses: {},
                      notes: {},
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    }),
                  );
                  toast.success("Relatorio criado para a loja.");
                  return created.id;
                } catch (error) {
                  handleFirestoreError(error, OperationType.CREATE, "checklistReports");
                  return null;
                }
              }}
              onUpdateReport={async (reportId, updates) => {
                try {
                  await updateDoc(
                    doc(db, "checklistReports", reportId),
                    removeUndefined({
                      ...updates,
                      updatedAt: Date.now(),
                    }) as any,
                  );
                } catch (error) {
                  handleFirestoreError(
                    error,
                    OperationType.UPDATE,
                    "checklistReports/" + reportId,
                  );
                }
              }}
              onDeleteReport={async (reportId) => {
                try {
                  await deleteDoc(doc(db, "checklistReports", reportId));
                  toast.success("Relatorio apagado.");
                } catch (error) {
                  handleFirestoreError(
                    error,
                    OperationType.DELETE,
                    "checklistReports/" + reportId,
                  );
                }
              }}
            />
          ) : activeModule === "relatorios" ? (
            <ReportsModule
              key="relatorios"
              selectedShopping={selectedShopping}
              stores={stores}
              reports={reportsForSelectedShopping}
              initialStoreId={focusedReportMode === "reports" ? focusedStoreId : null}
              permissions={{
                canExportPdf: canUseModule(user, "relatorios", "export_pdf", permissionTestProfile),
              }}
              onOpenChecklists={(storeId) => {
                if (storeId) {
                  setFocusedStoreId(storeId);
                  setFocusedReportMode("checklists");
                }
                handleSelectModule("checklists");
              }}
              onOpenStores={() => handleSelectModule("lojas")}
            />
          ) : isAllowanceView ? (
            selectedAllowance ? (
              <AllowanceDashboard
                key={`allowance-db-${selectedAllowance.id}`}
                allowance={selectedAllowance}
                user={user}
                onBack={() => {
                  if (selectedLocation?.type !== 'allowance') {
                    setIsAllowanceView(false);
                  } else {
                    handleBackToLocations();
                  }
                }}
                onUpdateAllowanceValue={async (newValue: number) => {
                  if (selectedLocation?.type === 'allowance') {
                    await updateDoc(doc(db, "locations", selectedLocation.id), {
                      "allowanceFields.value": newValue
                    });
                  } else {
                    await updateDoc(doc(db, "allowances", selectedAllowance.id), {
                      value: newValue
                    });
                  }
                }}
              />
            ) : (
              <AllowanceView
                key="allowance"
                allowances={allowances}
                user={user}
                onBack={() => {
                  if (selectedLocation?.type !== 'allowance') {
                    setIsAllowanceView(false);
                  } else {
                    handleBackToLocations();
                  }
                }}
                onSelectAllowance={setSelectedAllowance}
              />
            )
          ) : !selectedLocationId ? (
            <LocationList
              key="location-list"
              locations={locations}
              projects={projects}
              onSelectLocation={handleSelectLocation}
              onAddLocation={async (l) => {
                try {
                  const { id, ...locationData } = l;
                  const dataToSave = {
                    ...locationData,
                    sharedWith: locationData.sharedWith || {},
                    sharedEmails: Object.keys(locationData.sharedWith || {}),
                  };
                  try {
                    await addDoc(
                      collection(db, "locations"),
                      removeUndefined(dataToSave),
                    );
                  } catch (error) {
                    handleFirestoreError(
                      error,
                      OperationType.CREATE,
                      "locations",
                    );
                  }
                } catch (error) {
                  console.error("Error adding location:", error);
                  toast.error(
                    "Erro ao adicionar local: " + (error as Error).message,
                  );
                }
              }}
              onDeleteLocation={async (id) => {
                await deleteDoc(doc(db, "locations", id));
                // Delete associated projects
                const projectsToDelete = projects.filter(
                  (p) => p.locationId === id,
                );
                for (const p of projectsToDelete) {
                  await deleteDoc(doc(db, "projects", p.id));
                }
              }}
              onUpdateLocation={handleUpdateLocation}
              user={user}
            />
          ) : selectedLocationId && selectedLocation ? (
            !selectedProjectId ? (
              <ProjectList
                location={selectedLocation}
                projects={projects.filter(
                  (p) => p.locationId === selectedLocationId,
                )}
                onSelectProject={setSelectedProjectId}
                onAddProject={async (p) => {
                  try {
                    const { id, ...projectData } = p;
                    // Fetch location to get sharedEmails
                    const locationDoc = await getDoc(
                      doc(db, "locations", projectData.locationId),
                    );
                    const locationData = locationDoc.data();

                    const dataToSave = {
                      ...projectData,
                      sharedWith: locationData?.sharedWith || {},
                      sharedEmails: locationData?.sharedEmails || [],
                    };
                    try {
                      await addDoc(collection(db, "projects"), dataToSave);
                    } catch (error) {
                      handleFirestoreError(
                        error,
                        OperationType.CREATE,
                        "projects",
                      );
                    }
                  } catch (error) {
                    console.error("Error adding project:", error);
                    toast.error(
                      "Erro ao adicionar obra: " + (error as Error).message,
                    );
                  }
                }}
                onDeleteProject={async (id) => {
                  await deleteDoc(doc(db, "projects", id));
                }}
                onBack={handleBackToLocations}
                onUpdateLocation={handleUpdateLocation}
                user={user}
                onUpdateProject={async (updated) => {
                  const { id, ...projectData } = updated;
                  const oldProject = projects.find((p) => p.id === id);
                  if (JSON.stringify(oldProject) !== JSON.stringify(updated)) {
                    try {
                      await updateDoc(
                        doc(db, "projects", id),
                        removeUndefined(projectData) as any,
                      );
                    } catch (error) {
                      handleFirestoreError(
                        error,
                        OperationType.UPDATE,
                        "projects/" + id,
                      );
                    }
                  }
                }}
              />
            ) : selectedProject ? (
              <ProjectDashboard
                key={selectedProject.id}
                project={selectedProject}
                location={selectedLocation}
                user={user}
                onBack={handleBackToProjects}
                onUpdateProject={async (updated) => {
                  const { id, ...projectData } = updated;
                  const oldProject = projects.find((p) => p.id === id);

                  // Deep comparison to avoid redundant writes
                  const hasChanged =
                    JSON.stringify(oldProject) !== JSON.stringify(updated);

                  if (hasChanged) {
                    try {
                      await updateDoc(
                        doc(db, "projects", id),
                        removeUndefined(projectData) as any,
                      );
                    } catch (error) {
                      handleFirestoreError(
                        error,
                        OperationType.UPDATE,
                        "projects/" + id,
                      );
                    }
                  }
                }}
                onUpdateLocation={handleUpdateLocation}
                onDeleteProject={async () => {
                  if (selectedProject) {
                    await deleteDoc(doc(db, "projects", selectedProject.id));
                    handleBackToProjects();
                  }
                }}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 font-medium">
                Obra não encontrada ou carregando...
              </div>
            )
          ) : selectedLocationId ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 font-medium">
              Local de obra não encontrado ou carregando...
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 font-medium">
              Selecione um local de obra para começar.
            </div>
          )}
        </AnimatePresence>
        <InstallPrompt />
      </main>
    </div>
  );
}

function ShoppingModule({
  shoppings,
  selectedShoppingId,
  projects,
  onSelectShopping,
  onClearShopping,
  onAddShopping,
  canDeleteShopping,
  onDeleteShopping,
}: {
  shoppings: Location[];
  selectedShoppingId: string | null;
  projects: Project[];
  onSelectShopping: (shoppingId: string) => void;
  onClearShopping: () => void;
  onAddShopping: (name: string) => void;
  canDeleteShopping: boolean;
  onDeleteShopping: (shoppingId: string) => void;
}) {
  const [shoppingName, setShoppingName] = useState("");
  const selectedShopping = shoppings.find((item) => item.id === selectedShoppingId);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const name = shoppingName.trim();
    if (!name) {
      toast.error("Informe o nome do shopping.");
      return;
    }
    onAddShopping(name);
    setShoppingName("");
  };

  return (
    <motion.div
      key="shopping"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      <div className="airo-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-600 to-blue-600" />
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-lg mb-5">
              <Building2 className="w-7 h-7" />
            </div>
            <p className="text-xs font-black text-cyan-400 uppercase tracking-[0.22em] mb-3">
              SÁ CAVALCANTE
            </p>
            <h2 className="text-3xl md:text-5xl font-black text-white font-display tracking-tight">
              Shopping
            </h2>
            <p className="text-slate-400 mt-3 text-base md:text-lg leading-relaxed">
              Cadastre ou selecione um shopping para liberar Obras, Checklists e
              permissões dentro daquele contexto.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full xl:w-[520px]">
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Shoppings
              </p>
              <p className="text-2xl font-black text-white mt-1">
                {shoppings.length}
              </p>
            </div>
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Obras
              </p>
              <p className="text-2xl font-black text-white mt-1">
                {selectedShopping
                  ? projects.filter((project) => project.locationId === selectedShopping.id).length
                  : "-"}
              </p>
            </div>
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Status
              </p>
              <p className="text-sm font-black text-white mt-2">
                {selectedShopping ? "Ativo" : "Selecione"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <form onSubmit={handleSubmit} className="airo-card p-5 space-y-4">
          <div>
            <h3 className="text-lg font-black text-white font-display">
              Cadastrar shopping
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Depois de criado, ele vira o contexto para Obras e Checklists.
            </p>
          </div>
          <input
            value={shoppingName}
            onChange={(event) => setShoppingName(event.target.value)}
            className="premium-input"
            placeholder="Nome do shopping"
          />
          <button type="submit" className="btn-primary w-full">
            <Plus className="w-5 h-5" />
            Criar shopping
          </button>
          {selectedShopping && (
            <button
              type="button"
              onClick={onClearShopping}
              className="btn-secondary w-full"
            >
              Limpar seleção
            </button>
          )}
        </form>

        <div className="airo-card p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-black text-white font-display">
              Shoppings cadastrados
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {shoppings.length}
            </span>
          </div>
          {shoppings.length === 0 ? (
            <div className="splan-empty-state min-h-[320px]">
              <div className="splan-empty-icon">
                <Building2 className="w-7 h-7" />
              </div>
              <h4>Nenhum shopping cadastrado</h4>
              <p>Cadastre o primeiro shopping para liberar os módulos do app.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shoppings.map((shopping) => {
                const active = selectedShoppingId === shopping.id;
                const projectCount = projects.filter(
                  (project) => project.locationId === shopping.id,
                ).length;
                return (
                  <div
                    key={shopping.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectShopping(shopping.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectShopping(shopping.id);
                      }
                    }}
                    className={cn(
                      "text-left p-5 rounded-2xl border transition-all min-h-[150px] cursor-pointer",
                      active
                        ? "bg-cyan-500/10 border-cyan-500/40"
                        : "bg-slate-950/30 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-white text-lg">
                          {shopping.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {projectCount} obra(s) vinculada(s)
                        </p>
                      </div>
                      {active && (
                        <span className="px-2 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-black uppercase tracking-widest">
                          ativo
                        </span>
                      )}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-bold text-slate-300">
                        Obras
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-bold text-slate-300">
                        Checklists
                      </span>
                    </div>
                    <div className="mt-5 flex items-center justify-end gap-2">
                      {canDeleteShopping && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeleteShopping(shopping.id);
                          }}
                          className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors"
                          title="Apagar shopping"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function StoresModule({
  selectedShopping,
  stores,
  reports,
  permissions,
  onOpenStoreChecklists,
  onOpenStoreReports,
  onCreateStore,
  onUpdateStore,
  onDeleteStore,
}: {
  selectedShopping?: Location;
  stores: RetailStore[];
  reports: ChecklistReport[];
  projects: Project[];
  permissions: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canOpenChecklists: boolean;
    canCreateChecklists: boolean;
    canOpenReports: boolean;
  };
  onOpenStoreChecklists: (storeId: string) => void;
  onOpenStoreReports: (storeId: string) => void;
  onCreateStore: (
    storeData: Omit<
      RetailStore,
      "id" | "shoppingId" | "ownerId" | "createdAt" | "updatedAt" | "sharedWith" | "sharedEmails"
    >,
  ) => void;
  onUpdateStore: (store: RetailStore) => void;
  onDeleteStore: (storeId: string) => void;
}) {
  const emptyForm = {
    name: "",
    code: "",
    segment: "",
    responsibleName: "",
    contractorName: "",
    status: "planejada" as StoreStatus,
    notes: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);

  const shoppingStores = useMemo(
    () =>
      selectedShopping
        ? stores
            .filter((store) => store.shoppingId === selectedShopping.id)
            .sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [selectedShopping, stores],
  );

  const selectedStore =
    shoppingStores.find((store) => store.id === selectedStoreId) ||
    shoppingStores[0] ||
    null;

  useEffect(() => {
    if (!selectedStore) {
      setSelectedStoreId(null);
      return;
    }
    if (!selectedStoreId || !shoppingStores.some((store) => store.id === selectedStoreId)) {
      setSelectedStoreId(selectedStore.id);
    }
  }, [selectedStore, selectedStoreId, shoppingStores]);

  const statusCounters = useMemo(() => {
    return shoppingStores.reduce(
      (acc, store) => {
        acc[store.status] = (acc[store.status] || 0) + 1;
        return acc;
      },
      {} as Record<StoreStatus, number>,
    );
  }, [shoppingStores]);

  const selectedStoreReports = useMemo(() => {
    if (!selectedStore) return [];
    return reports
      .filter((report) => report.storeId === selectedStore.id)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  }, [reports, selectedStore]);

  const selectedStoreReportStats = useMemo(() => {
    return selectedStoreReports.reduce(
      (acc, report) => {
        const template =
          CHECKLIST_TEMPLATES.find((item) => item.id === report.templateId) ||
          CHECKLIST_TEMPLATES[0];
        template.rows.forEach((row) => {
          if (row.kind !== "item") return;
          const status = report.statuses?.[row.id];
          if (status === "ok") acc.ok += 1;
          if (status === "nok") acc.nok += 1;
          if (status === "na") acc.na += 1;
        });
        return acc;
      },
      { ok: 0, nok: 0, na: 0 },
    );
  }, [selectedStoreReports]);

  const latestStoreReport = selectedStoreReports[0];

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!permissions.canCreate) {
      toast.error("Seu perfil nao permite cadastrar lojas.");
      return;
    }
    const name = form.name.trim();
    if (!selectedShopping) {
      toast.error("Selecione um shopping antes de cadastrar lojas.");
      return;
    }
    if (!name) {
      toast.error("Informe o nome da loja.");
      return;
    }

    onCreateStore({
      name,
      code: form.code.trim(),
      segment: form.segment.trim(),
      responsibleName: form.responsibleName.trim(),
      contractorName: form.contractorName.trim(),
      status: form.status,
      notes: form.notes.trim(),
    });
    setForm(emptyForm);
  };

  const handleStartEdit = (store: RetailStore) => {
    setEditingStoreId(store.id);
    setForm({
      name: store.name || "",
      code: store.code || "",
      segment: store.segment || "",
      responsibleName: store.responsibleName || "",
      contractorName: store.contractorName || "",
      status: store.status || "planejada",
      notes: store.notes || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingStoreId(null);
    setForm(emptyForm);
  };

  const handleSaveEdit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!permissions.canEdit) {
      toast.error("Seu perfil nao permite editar lojas.");
      return;
    }
    const currentStore = shoppingStores.find((store) => store.id === editingStoreId);
    if (!currentStore) return;
    const name = form.name.trim();
    if (!name) {
      toast.error("Informe o nome da loja.");
      return;
    }

    onUpdateStore({
      ...currentStore,
      name,
      code: form.code.trim(),
      segment: form.segment.trim(),
      responsibleName: form.responsibleName.trim(),
      contractorName: form.contractorName.trim(),
      status: form.status,
      notes: form.notes.trim(),
    });
    handleCancelEdit();
  };

  const handleDelete = (store: RetailStore) => {
    if (!permissions.canDelete) {
      toast.error("Seu perfil nao permite apagar lojas.");
      return;
    }
    const confirmed = window.confirm(`Apagar a loja "${store.name}"?`);
    if (!confirmed) return;
    onDeleteStore(store.id);
    if (selectedStoreId === store.id) {
      setSelectedStoreId(null);
    }
    if (editingStoreId === store.id) {
      handleCancelEdit();
    }
  };

  const isEditing = Boolean(editingStoreId);

  return (
    <motion.div
      key="lojas"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      <div className="airo-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-emerald-700" />
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-lg mb-5">
              <Store className="w-7 h-7" />
            </div>
            <p className="text-xs font-black text-cyan-400 uppercase tracking-[0.22em] mb-3">
              {selectedShopping ? selectedShopping.name : "Shopping"}
            </p>
            <h2 className="text-3xl md:text-5xl font-black text-white font-display tracking-tight">
              Lojas
            </h2>
            <p className="text-slate-400 mt-3 text-base md:text-lg leading-relaxed">
              Cadastre as lojas do shopping para futuramente centralizar obras,
              checklists, relatorios e pendencias por loja.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full xl:w-[620px]">
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Lojas
              </p>
              <p className="text-2xl font-black text-white mt-1">
                {shoppingStores.length}
              </p>
            </div>
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Em obra
              </p>
              <p className="text-2xl font-black text-white mt-1">
                {statusCounters.em_obra || 0}
              </p>
            </div>
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Vistoria
              </p>
              <p className="text-2xl font-black text-white mt-1">
                {statusCounters.vistoria || 0}
              </p>
            </div>
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Entregues
              </p>
              <p className="text-2xl font-black text-white mt-1">
                {statusCounters.entregue || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {!selectedShopping ? (
        <div className="splan-empty-state min-h-[420px]">
          <div className="splan-empty-icon">
            <Building2 className="w-7 h-7" />
          </div>
          <h4>Nenhum shopping selecionado</h4>
          <p>Volte para Shoppings e selecione um shopping para gerenciar lojas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
          <div className="space-y-5">
            <form
              onSubmit={isEditing ? handleSaveEdit : handleCreate}
              className="airo-card p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-white font-display">
                    {isEditing ? "Editar loja" : "Cadastrar loja"}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Dados principais para organizar a operacao por loja.
                  </p>
                </div>
                {isEditing && (
                  <button type="button" onClick={handleCancelEdit} className="btn-secondary py-2">
                    Cancelar
                  </button>
                )}
              </div>
              <input
                value={form.name}
                disabled={isEditing ? !permissions.canEdit : !permissions.canCreate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className="premium-input"
                placeholder="Nome da loja"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.code}
                  disabled={isEditing ? !permissions.canEdit : !permissions.canCreate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, code: event.target.value }))
                  }
                  className="premium-input"
                  placeholder="Numero / SUC"
                />
                <input
                  value={form.segment}
                  disabled={isEditing ? !permissions.canEdit : !permissions.canCreate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, segment: event.target.value }))
                  }
                  className="premium-input"
                  placeholder="Segmento"
                />
              </div>
              <input
                value={form.responsibleName}
                disabled={isEditing ? !permissions.canEdit : !permissions.canCreate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    responsibleName: event.target.value,
                  }))
                }
                className="premium-input"
                placeholder="Responsavel da loja"
              />
              <input
                value={form.contractorName}
                disabled={isEditing ? !permissions.canEdit : !permissions.canCreate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    contractorName: event.target.value,
                  }))
                }
                className="premium-input"
                placeholder="Responsavel da obra / contratada"
              />
              <select
                value={form.status}
                disabled={isEditing ? !permissions.canEdit : !permissions.canCreate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as StoreStatus,
                  }))
                }
                className="premium-input"
              >
                {Object.entries(STORE_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <textarea
                value={form.notes}
                disabled={isEditing ? !permissions.canEdit : !permissions.canCreate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
                className="premium-input min-h-[96px] resize-y"
                placeholder="Observacoes"
              />
              <button
                type="submit"
                disabled={isEditing ? !permissions.canEdit : !permissions.canCreate}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEditing ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {isEditing ? "Salvar loja" : "Adicionar loja"}
              </button>
            </form>

            <div className="airo-card p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-black text-white font-display">
                  Lojas cadastradas
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  {shoppingStores.length}
                </span>
              </div>
              {shoppingStores.length === 0 ? (
                <div className="splan-empty-state py-8">
                  <div className="splan-empty-icon">
                    <Store className="w-6 h-6" />
                  </div>
                  <h4>Nenhuma loja cadastrada</h4>
                  <p>Cadastre a primeira loja deste shopping.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[560px] overflow-y-auto custom-scrollbar pr-1">
                  {shoppingStores.map((store) => {
                    const active = selectedStore?.id === store.id;
                    return (
                      <button
                        key={store.id}
                        type="button"
                        onClick={() => setSelectedStoreId(store.id)}
                        className={cn(
                          "w-full text-left p-4 rounded-2xl border transition-all",
                          active
                            ? "bg-emerald-500/10 border-emerald-500/40"
                            : "bg-slate-950/30 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-black text-white truncate">
                              {store.name}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {store.code || "Sem numero"} | {store.segment || "Sem segmento"}
                            </p>
                          </div>
                          <span className="px-2 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            {STORE_STATUS_LABELS[store.status]}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="airo-card p-5 md:p-6 min-h-[540px]">
            {selectedStore ? (
              <div className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      Loja selecionada
                    </p>
                    <h3 className="text-3xl font-black text-white font-display">
                      {selectedStore.name}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2">
                      {selectedStore.code || "Sem numero"} | {selectedStore.segment || "Sem segmento"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {permissions.canEdit && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(selectedStore)}
                        className="btn-secondary"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </button>
                    )}
                    {permissions.canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(selectedStore)}
                        className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-black"
                      >
                        <Trash2 className="w-4 h-4" />
                        Apagar
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Status
                    </p>
                    <p className="text-base font-black text-white mt-1">
                      {STORE_STATUS_LABELS[selectedStore.status]}
                    </p>
                  </div>
                  <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Shopping
                    </p>
                    <p className="text-base font-black text-white mt-1">
                      {selectedShopping.name}
                    </p>
                  </div>
                  <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Responsavel da loja
                    </p>
                    <p className="text-base font-black text-white mt-1">
                      {selectedStore.responsibleName || "-"}
                    </p>
                  </div>
                  <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Responsavel da obra
                    </p>
                    <p className="text-base font-black text-white mt-1">
                      {selectedStore.contractorName || "-"}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    Observacoes
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedStore.notes || "Nenhuma observacao cadastrada."}
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-5">
                  <p className="text-xs font-black text-cyan-400 uppercase tracking-[0.2em] mb-3">
                    Operacao da loja
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      type="button"
                      disabled={!permissions.canCreateChecklists}
                      onClick={() => onOpenStoreChecklists(selectedStore.id)}
                      className="bg-slate-950/30 border border-slate-800 rounded-2xl p-4 text-left hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-white">Criar checklist</p>
                        <ClipboardList className="w-5 h-5 text-emerald-400" />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Abre esta loja no modulo Checklists para iniciar uma vistoria.
                      </p>
                    </button>
                    <button
                      type="button"
                      disabled={!permissions.canOpenChecklists}
                      onClick={() => onOpenStoreChecklists(selectedStore.id)}
                      className="bg-slate-950/30 border border-slate-800 rounded-2xl p-4 text-left hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-white">Checklists</p>
                        <span className="text-lg font-black text-cyan-300">
                          {selectedStoreReports.length}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Vistorias criadas para esta loja.
                      </p>
                    </button>
                    <button
                      type="button"
                      disabled={!permissions.canOpenReports}
                      onClick={() => onOpenStoreReports(selectedStore.id)}
                      className="bg-slate-950/30 border border-slate-800 rounded-2xl p-4 text-left hover:border-blue-500/50 hover:bg-blue-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-white">Relatorios</p>
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Historico por data e status desta loja.
                      </p>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                    <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Ultimo relatorio
                      </p>
                      <p className="text-sm font-black text-white mt-2">
                        {latestStoreReport
                          ? new Date(`${latestStoreReport.date}T00:00:00`).toLocaleDateString("pt-BR")
                          : "-"}
                      </p>
                    </div>
                    <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        OK
                      </p>
                      <p className="text-lg font-black text-emerald-300 mt-1">
                        {selectedStoreReportStats.ok}
                      </p>
                    </div>
                    <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Nao OK
                      </p>
                      <p className="text-lg font-black text-red-300 mt-1">
                        {selectedStoreReportStats.nok}
                      </p>
                    </div>
                    <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        NA
                      </p>
                      <p className="text-lg font-black text-slate-300 mt-1">
                        {selectedStoreReportStats.na}
                      </p>
                    </div>
                  </div>

                  {selectedStoreReports.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-slate-800 overflow-hidden">
                      <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-white">Relatorios recentes</p>
                        <button
                          type="button"
                          onClick={() => onOpenStoreReports(selectedStore.id)}
                          className="text-xs font-black text-cyan-300 hover:text-white transition-colors"
                        >
                          Ver todos
                        </button>
                      </div>
                      <div className="divide-y divide-slate-800/80">
                        {selectedStoreReports.slice(0, 3).map((report) => (
                          <button
                            key={report.id}
                            type="button"
                            onClick={() => onOpenStoreChecklists(selectedStore.id)}
                            className="w-full px-4 py-3 text-left hover:bg-slate-900/60 transition-colors flex items-center justify-between gap-3"
                          >
                            <div>
                              <p className="text-sm font-black text-white">
                                {report.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {new Date(`${report.date}T00:00:00`).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="splan-empty-state h-full min-h-[500px]">
                <div className="splan-empty-icon">
                  <Store className="w-7 h-7" />
                </div>
                <h4>Selecione ou cadastre uma loja</h4>
                <p>As lojas serao a base para checklists, relatorios e pendencias.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ChecklistModule({
  selectedShopping,
  stores,
  reports,
  initialStoreId,
  permissions,
  onCreateReport,
  onUpdateReport,
  onDeleteReport,
}: {
  selectedShopping?: Location;
  stores: RetailStore[];
  reports: ChecklistReport[];
  initialStoreId?: string | null;
  permissions: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExportPdf: boolean;
  };
  onCreateReport: (
    report: Pick<ChecklistReport, "storeId" | "title" | "date" | "templateId">,
  ) => Promise<string | null>;
  onUpdateReport: (
    reportId: string,
    updates: Partial<ChecklistReport>,
  ) => Promise<void>;
  onDeleteReport: (reportId: string) => Promise<void>;
}) {
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(() => {
    try {
      return localStorage.getItem("splan.checklist.selectedStore");
    } catch {
      return null;
    }
  });
  const [selectedReportId, setSelectedReportId] = useState<string | null>(() => {
    try {
      return localStorage.getItem("splan.checklist.selectedReport");
    } catch {
      return null;
    }
  });
  const [reportForm, setReportForm] = useState({
    title: "Vistoria Final",
    date: new Date().toISOString().slice(0, 10),
    templateId: "loja" as ChecklistTemplateId,
  });

  const visibleStores = useMemo(
    () =>
      selectedShopping
        ? stores
            .filter((store) => store.shoppingId === selectedShopping.id)
            .sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [selectedShopping, stores],
  );
  const selectedStore = visibleStores.find((store) => store.id === selectedStoreId);
  const reportsForSelectedStore = selectedStore
    ? reports
        .filter((report) => report.storeId === selectedStore.id)
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    : [];
  const selectedReport =
    reportsForSelectedStore.find((report) => report.id === selectedReportId) ||
    reportsForSelectedStore[0];
  const selectedTemplate =
    CHECKLIST_TEMPLATES.find(
      (template) => template.id === selectedReport?.templateId,
    ) || CHECKLIST_TEMPLATES[0];

  const selectedStoreStats = selectedStore && selectedReport
    ? selectedTemplate.rows.reduce(
        (stats, row) => {
          if (row.kind !== "item") return stats;
          const status = selectedReport.statuses?.[row.id];
          if (status) {
            stats.completed += 1;
          }
          if (status === "ok") {
            stats.ok += 1;
          }
          if (status === "nok") {
            stats.pending += 1;
          }
          if (status === "na") {
            stats.na += 1;
          }
          return stats;
        },
        { completed: 0, ok: 0, pending: 0, na: 0 },
      )
    : { completed: 0, ok: 0, pending: 0, na: 0 };
  const selectedProgress = selectedTemplate.totalItems
    ? Math.round((selectedStoreStats.completed / selectedTemplate.totalItems) * 100)
    : 0;

  useEffect(() => {
    if (
      initialStoreId &&
      initialStoreId !== selectedStoreId &&
      visibleStores.some((store) => store.id === initialStoreId)
    ) {
      setSelectedStoreId(initialStoreId);
      setSelectedReportId(null);
    }
  }, [initialStoreId, selectedStoreId, visibleStores]);

  useEffect(() => {
    if (selectedStoreId) {
      localStorage.setItem("splan.checklist.selectedStore", selectedStoreId);
    } else {
      localStorage.removeItem("splan.checklist.selectedStore");
    }
  }, [selectedStoreId]);

  useEffect(() => {
    if (selectedReportId) {
      localStorage.setItem("splan.checklist.selectedReport", selectedReportId);
    } else {
      localStorage.removeItem("splan.checklist.selectedReport");
    }
  }, [selectedReportId]);

  useEffect(() => {
    if (!selectedStoreId && visibleStores[0]) {
      setSelectedStoreId(visibleStores[0].id);
      return;
    }
    if (
      selectedStoreId &&
      !visibleStores.some((store) => store.id === selectedStoreId)
    ) {
      setSelectedStoreId(visibleStores[0]?.id || null);
    }
  }, [selectedStoreId, visibleStores]);

  useEffect(() => {
    if (!selectedStore) {
      setSelectedReportId(null);
      return;
    }
    if (
      !selectedReportId ||
      !reportsForSelectedStore.some((report) => report.id === selectedReportId)
    ) {
      setSelectedReportId(reportsForSelectedStore[0]?.id || null);
    }
  }, [selectedReportId, selectedStore, reportsForSelectedStore]);

  const handleCreateReport = async () => {
    if (!permissions.canCreate) {
      toast.error("Seu perfil nao permite criar relatorios.");
      return;
    }
    if (!selectedStore) return;
    if (!reportForm.date) {
      toast.error("Informe a data do relatorio.");
      return;
    }
    const reportId = await onCreateReport({
      storeId: selectedStore.id,
      title: reportForm.title.trim() || "Vistoria",
      date: reportForm.date,
      templateId: reportForm.templateId,
    });
    if (!reportId) return;
    setSelectedReportId(reportId);
    setReportForm({
      title: "Vistoria Final",
      date: new Date().toISOString().slice(0, 10),
      templateId: "loja",
    });
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!permissions.canDelete) {
      toast.error("Seu perfil nao permite excluir relatorios.");
      return;
    }
    await onDeleteReport(reportId);
    if (selectedReportId === reportId) {
      setSelectedReportId(null);
    }
  };

  const setRowStatus = async (
    report: ChecklistReport,
    rowId: string,
    status: ChecklistItemStatus,
  ) => {
    if (!permissions.canEdit) {
      toast.error("Seu perfil nao permite editar checklists.");
      return;
    }
    const statuses = { ...(report.statuses || {}) };
    if (statuses[rowId] === status) {
      delete statuses[rowId];
    } else {
      statuses[rowId] = status;
    }
    await onUpdateReport(report.id, { statuses });
  };

  const setRowNote = (
    report: ChecklistReport,
    rowId: string,
    note: string,
  ) => {
    if (!permissions.canEdit) {
      toast.error("Seu perfil nao permite editar checklists.");
      return;
    }
    void onUpdateReport(report.id, {
      notes: {
        ...(report.notes || {}),
        [rowId]: note,
      },
    });
  };

  const getChecklistHeaderValue = (label: string) => {
    if (!selectedStore) return "";
    const normalized = label.toLowerCase();
    if (normalized.startsWith("suc") || normalized === "q:") {
      return selectedStore.code;
    }
    if (normalized.includes("nome fantasia")) {
      return selectedStore.name;
    }
    if (normalized.includes("vistoria")) {
      return selectedReport?.title || "";
    }
    if (normalized.includes("empresas")) {
      return selectedStore.contractorName || selectedStore.responsibleName || "";
    }
    if (normalized === "data:") {
      return selectedReport?.date
        ? new Date(`${selectedReport.date}T00:00:00`).toLocaleDateString("pt-BR")
        : "";
    }
    if (
      normalized.includes("data de início") ||
      normalized.includes("data de inicio")
    ) {
      return selectedStore.createdAt
        ? new Date(selectedStore.createdAt).toLocaleDateString("pt-BR")
        : "";
    }
    return "";
  };

  const handleGenerateReportPdf = () => {
    if (!permissions.canExportPdf) {
      toast.error("Seu perfil nao permite exportar PDF.");
      return;
    }
    if (!selectedStore || !selectedReport) return;

    const pdf = new jsPDF({ orientation: "landscape" });
    const reportDate = selectedReport.date
      ? new Date(`${selectedReport.date}T00:00:00`).toLocaleDateString("pt-BR")
      : "-";

    const brandGreen: [number, number, number] = [18, 63, 53];
    const brandGreenSoft: [number, number, number] = [231, 240, 237];
    const tableStripe: [number, number, number] = [246, 249, 248];
    const subsectionFill: [number, number, number] = [222, 232, 228];

    pdf.setTextColor(...brandGreen);
    pdf.setFontSize(18);
    pdf.text(selectedTemplate.label, 14, 16);
    pdf.setFontSize(11);
    pdf.text(selectedStore.name, 14, 24);
    pdf.setTextColor(70, 82, 78);
    pdf.setFontSize(9);
    pdf.text(`Relatorio: ${selectedReport.title}`, 14, 32);
    pdf.text(`Data: ${reportDate}`, 14, 38);
    pdf.text(`${selectedTemplate.codeLabel}: ${selectedStore.code || "-"}`, 14, 44);
    pdf.text(`Empresa: ${selectedStore.contractorName || selectedStore.responsibleName || "-"}`, 100, 44);
    pdf.text(
      `OK: ${selectedStoreStats.ok} | NAO OK: ${selectedStoreStats.pending} | NA: ${selectedStoreStats.na} | Progresso: ${selectedProgress}%`,
      14,
      50,
    );

    const body: any[] = selectedTemplate.rows.map((row) => {
      const status = selectedReport.statuses?.[row.id];
      const note = selectedReport.notes?.[row.id] || "";

      if (row.kind === "item") {
        return [
          row.label,
          status === "na" ? "X" : "",
          status === "ok" ? "X" : "",
          status === "nok" ? "X" : "",
          note,
        ];
      }

      const headerValue = row.kind === "field" ? getChecklistHeaderValue(row.label) : "";
      const content = headerValue ? `${row.label} ${headerValue}` : row.label;
      return [content, "", "", "", note];
    });

    autoTable(pdf, {
      startY: 58,
      head: [["Item", "NA", "OK", "NÃO OK", "OBS"]],
      body,
      theme: "striped",
      styles: {
        fontSize: 7.5,
        cellPadding: 1.9,
        valign: "middle",
        lineColor: [230, 236, 234],
        textColor: [30, 41, 59],
      },
      headStyles: {
        fillColor: brandGreen,
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: { fillColor: tableStripe },
      columnStyles: {
        0: { cellWidth: 150 },
        1: { cellWidth: 15, halign: "center", valign: "middle" },
        2: { cellWidth: 15, halign: "center", valign: "middle" },
        3: { cellWidth: 20, halign: "center", valign: "middle" },
        4: { cellWidth: 70 },
      },
      didParseCell: (data) => {
        if (data.section === "head" && data.column.index === 0) {
          data.cell.styles.halign = "left";
        }
        if (data.section !== "body") return;
        const row = selectedTemplate.rows[data.row.index];
        if (!row) return;
        if (row.kind === "section") {
          data.cell.styles.fillColor = brandGreen;
          data.cell.styles.textColor = 255;
          data.cell.styles.fontStyle = "bold";
        }
        if (row.kind === "subsection") {
          data.cell.styles.fillColor = subsectionFill;
          data.cell.styles.textColor = brandGreen;
          data.cell.styles.fontStyle = "bold";
        }
        if (row.kind === "field" || row.kind === "note") {
          data.cell.styles.fillColor = brandGreenSoft;
          data.cell.styles.textColor = [31, 51, 46];
          data.cell.styles.fontStyle = "bold";
        }
        if (row.kind !== "item" && data.column.index > 0) {
          data.cell.text = [""];
        }
        if (row.kind === "item" && data.column.index >= 1 && data.column.index <= 3) {
          data.cell.styles.halign = "center";
          if (data.cell.raw === "X") {
            data.cell.styles.textColor = [255, 255, 255];
          }
        }
      },
      didDrawCell: (data) => {
        if (data.section !== "body") return;
        const row = selectedTemplate.rows[data.row.index];
        if (!row) return;
        const shouldDrawStatusBox =
          row.kind === "item" &&
          data.column.index >= 1 &&
          data.column.index <= 3 &&
          data.cell.raw === "X";

        if (!shouldDrawStatusBox) return;

        const boxSize = 4.2;
        const centerX = data.cell.x + data.cell.width / 2;
        const centerY = data.cell.y + data.cell.height / 2;
        const boxX = centerX - boxSize / 2;
        const boxY = centerY - boxSize / 2;

        pdf.setDrawColor(...brandGreen);
        pdf.setLineWidth(0.35);
        pdf.rect(boxX, boxY, boxSize, boxSize);
        pdf.setTextColor(...brandGreen);
        pdf.setFontSize(7);
        pdf.text("X", centerX, centerY + 1.05, { align: "center" });
      },
    });

    const safeStore = selectedStore.name.replace(/[\\/:*?"<>|]+/g, "-");
    const safeDate = selectedReport.date || new Date().toISOString().slice(0, 10);
    pdf.save(`checklist-${safeStore}-${safeDate}.pdf`);
  };

  return (
    <motion.div
      key="checklists"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      <div className="airo-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-600" />
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg mb-5">
              <ClipboardList className="w-7 h-7" />
            </div>
            <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.22em] mb-3">
              Modulo independente
            </p>
            <h2 className="text-3xl md:text-5xl font-black text-white font-display tracking-tight">
              Checklists de lojas
            </h2>
            <p className="text-slate-400 mt-3 text-base md:text-lg leading-relaxed">
              Cadastre lojas ou quiosques e escolha o modelo de vistoria
              adequado. Esta aba nao depende de Obras e usa a estrutura do
              Anexo V como base.
              {selectedShopping ? ` Shopping atual: ${selectedShopping.name}.` : ""}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full xl:w-[520px]">
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Lojas
              </p>
              <p className="text-2xl font-black text-white mt-1">
                {visibleStores.length}
              </p>
            </div>
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Modelos
              </p>
              <p className="text-2xl font-black text-white mt-1">
                {CHECKLIST_TEMPLATES.length}
              </p>
            </div>
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Progresso
              </p>
              <p className="text-2xl font-black text-white mt-1">
                {selectedStore ? `${selectedProgress}%` : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <div className="space-y-5">
          <div className="airo-card p-5">
            <h3 className="text-lg font-black text-white font-display mb-4">
              Loja do checklist
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              As lojas agora vem do modulo Lojas. Cadastre ou edite lojas por la
              para manter Checklists, Obras e Relatorios usando a mesma base.
            </p>
          </div>

          <div className="airo-card p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-black text-white font-display">
                Lojas cadastradas
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {visibleStores.length}
              </span>
            </div>
            {visibleStores.length === 0 ? (
              <div className="splan-empty-state py-8">
                <div className="splan-empty-icon">
                  <Building2 className="w-6 h-6" />
                </div>
                <h4>Nenhuma loja cadastrada</h4>
                <p>Cadastre a primeira loja no modulo Lojas para iniciar uma vistoria.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[560px] overflow-y-auto custom-scrollbar pr-1">
                {visibleStores.map((store) => {
                  const isActive = selectedStoreId === store.id;

                  return (
                    <button
                      key={store.id}
                      onClick={() => setSelectedStoreId(store.id)}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border transition-all",
                        isActive
                          ? "bg-blue-600/10 border-blue-500/40"
                          : "bg-slate-950/30 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-white">{store.name}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {store.code || "Sem numero"} | {store.segment || STORE_STATUS_LABELS[store.status]}
                          </p>
                        </div>
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                          {STORE_STATUS_LABELS[store.status]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedStore && (
            <div className="airo-card p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-black text-white font-display">
                  Relatorios
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  {reportsForSelectedStore.length}
                </span>
              </div>
              <div className="space-y-3 mb-4">
                <input
                  value={reportForm.title}
                  disabled={!permissions.canCreate}
                  onChange={(event) =>
                    setReportForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="premium-input"
                  placeholder="Nome do relatorio"
                />
                <input
                  value={reportForm.date}
                  disabled={!permissions.canCreate}
                  onChange={(event) =>
                    setReportForm((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                  onInput={(event) =>
                    setReportForm((current) => ({
                      ...current,
                      date: (event.target as HTMLInputElement).value,
                    }))
                  }
                  className="premium-input"
                  type="date"
                />
                <select
                  value={reportForm.templateId}
                  disabled={!permissions.canCreate}
                  onChange={(event) =>
                    setReportForm((current) => ({
                      ...current,
                      templateId: event.target.value as ChecklistTemplateId,
                    }))
                  }
                  className="premium-input"
                >
                  {CHECKLIST_TEMPLATES.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleCreateReport}
                  disabled={!permissions.canCreate}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                  Novo relatorio
                </button>
              </div>
              {reportsForSelectedStore.length === 0 ? (
                <div className="splan-empty-state py-8">
                  <div className="splan-empty-icon">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4>Nenhum relatorio</h4>
                  <p>Crie um relatorio para preencher o checklist.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                  {reportsForSelectedStore.map((report) => {
                    const isActive = selectedReport?.id === report.id;
                    const formattedDate = report.date
                      ? new Date(`${report.date}T00:00:00`).toLocaleDateString(
                          "pt-BR",
                        )
                      : "Sem data";

                    return (
                      <button
                        key={report.id}
                        onClick={() => setSelectedReportId(report.id)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border transition-all",
                          isActive
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : "bg-slate-950/30 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-black text-white">{report.title}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {formattedDate}
                            </p>
                          </div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            PDF
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-5">
          {selectedStore && selectedReport ? (
            <>
              <div className="airo-card p-5 md:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      Relatorio selecionado
                    </p>
                    <h3 className="text-2xl font-black text-white font-display">
                      {selectedReport.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2">
                      {selectedStore.name} |{" "}
                      {new Date(`${selectedReport.date}T00:00:00`).toLocaleDateString(
                        "pt-BR",
                      )}{" "}
                      | {selectedTemplate.label} - {selectedTemplate.totalItems} itens.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-2 rounded-xl bg-slate-950/50 border border-slate-800 text-xs font-bold text-slate-300">
                      OK: {selectedStoreStats.ok}
                    </span>
                    <span className="px-3 py-2 rounded-xl bg-slate-950/50 border border-slate-800 text-xs font-bold text-slate-300">
                      NÃO OK: {selectedStoreStats.pending}
                    </span>
                    <span className="px-3 py-2 rounded-xl bg-slate-950/50 border border-slate-800 text-xs font-bold text-slate-300">
                      NA: {selectedStoreStats.na}
                    </span>
                    {permissions.canExportPdf && (
                      <button
                        onClick={handleGenerateReportPdf}
                        className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors flex items-center gap-2 text-xs font-black"
                        title="Gerar PDF"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </button>
                    )}
                    {permissions.canDelete && (
                      <button
                        onClick={() => handleDeleteReport(selectedReport.id)}
                        className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-white transition-colors"
                        title="Excluir relatorio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-5 h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all"
                    style={{ width: `${selectedProgress}%` }}
                  />
                </div>
              </div>

              <div className="airo-card overflow-hidden">
                <div className="bg-slate-950/70 border-b border-slate-800 p-4 md:p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Modelo real do Excel
                      </p>
                      <h4 className="text-xl font-black text-white font-display mt-1">
                        {selectedTemplate.label}
                      </h4>
                    </div>
                    <span className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black">
                      {selectedTemplate.totalItems} itens
                    </span>
                  </div>
                </div>

                <div className="p-4 md:p-5 border-b border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {selectedTemplate.header.map((headerRow) => (
                    <React.Fragment key={headerRow.rowNumber}>
                      <div className="bg-slate-950/30 border border-slate-800 rounded-xl p-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {headerRow.left}
                        </p>
                        <p className="text-sm font-bold text-white mt-1 min-h-[20px]">
                          {getChecklistHeaderValue(headerRow.left) || "-"}
                        </p>
                      </div>
                      {headerRow.right && (
                        <div className="bg-slate-950/30 border border-slate-800 rounded-xl p-3">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {headerRow.right}
                          </p>
                          <p className="text-sm font-bold text-white mt-1 min-h-[20px]">
                            {getChecklistHeaderValue(headerRow.right) || "-"}
                          </p>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full min-w-[980px] text-sm">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                        <th className="text-left px-4 py-3 font-black uppercase text-[11px] tracking-widest">
                          Item
                        </th>
                        <th className="w-16 text-center px-2 py-3 font-black uppercase text-[11px] tracking-widest">
                          NA
                        </th>
                        <th className="w-16 text-center px-2 py-3 font-black uppercase text-[11px] tracking-widest">
                          OK
                        </th>
                        <th className="w-20 text-center px-2 py-3 font-black uppercase text-[11px] tracking-widest">
                          NÃO OK
                        </th>
                        <th className="w-[260px] text-left px-4 py-3 font-black uppercase text-[11px] tracking-widest">
                          OBS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTemplate.rows.map((row) => {
                        const status = selectedReport.statuses?.[row.id];

                        if (row.kind === "section") {
                          return (
                            <tr key={row.id}>
                              <td
                                colSpan={5}
                                className="px-4 py-3 bg-blue-600/20 border-y border-blue-500/30 text-white font-black uppercase tracking-wide"
                              >
                                {row.label}
                              </td>
                            </tr>
                          );
                        }

                        if (row.kind === "subsection") {
                          return (
                            <tr key={row.id}>
                              <td
                                colSpan={5}
                                className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-slate-200 font-black"
                              >
                                {row.label}
                              </td>
                            </tr>
                          );
                        }

                        if (row.kind === "note" || row.kind === "field") {
                          return (
                            <tr key={row.id} className="border-b border-slate-800/70">
                              <td className="px-4 py-3 font-bold text-slate-300">
                                {row.label}
                              </td>
                              <td colSpan={4} className="px-4 py-2">
                                <input
                                  value={selectedReport.notes?.[row.id] || ""}
                                  disabled={!permissions.canEdit}
                                  onChange={(event) =>
                                    setRowNote(selectedReport, row.id, event.target.value)
                                  }
                                  className="premium-input py-2.5 text-sm"
                                  placeholder="Preencher conforme vistoria"
                                />
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr
                            key={row.id}
                            className="border-b border-slate-800/70 hover:bg-slate-900/50 transition-colors"
                          >
                            <td className="px-4 py-3 text-slate-200 leading-relaxed">
                              {row.label}
                            </td>
                            {(["na", "ok", "nok"] as ChecklistItemStatus[]).map(
                              (option) => (
                                <td key={option} className="px-2 py-2 text-center">
                                  <button
                                    disabled={!permissions.canEdit}
                                    onClick={() =>
                                      setRowStatus(selectedReport, row.id, option)
                                    }
                                    className={cn(
                                      "w-9 h-9 rounded-lg border inline-flex items-center justify-center transition-all",
                                      status === option
                                        ? option === "ok"
                                          ? "bg-emerald-500 border-emerald-400 text-white"
                                          : option === "nok"
                                            ? "bg-red-500 border-red-400 text-white"
                                            : "bg-slate-600 border-slate-500 text-white"
                                        : "bg-slate-950/40 border-slate-700 text-transparent hover:text-slate-400",
                                    )}
                                    title={`${row.label} - ${
                                      option === "na"
                                        ? "NA"
                                        : option === "ok"
                                          ? "OK"
                                          : "NÃO OK"
                                    }`}
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                </td>
                              ),
                            )}
                            <td className="px-4 py-2">
                              <input
                                value={selectedReport.notes?.[row.id] || ""}
                                disabled={!permissions.canEdit}
                                onChange={(event) =>
                                  setRowNote(selectedReport, row.id, event.target.value)
                                }
                                className="premium-input py-2.5 text-sm"
                                placeholder="Observacao"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="splan-empty-state min-h-[520px]">
              <div className="splan-empty-icon">
                <ClipboardList className="w-7 h-7" />
              </div>
              <h4>
                {selectedStore
                  ? "Crie um relatorio para iniciar"
                  : "Cadastre uma loja para iniciar"}
              </h4>
              <p>
                {selectedStore
                  ? "Cada relatorio fica organizado por data e pode ser exportado em PDF."
                  : "O checklist agora funciona por cadastro de loja, independente do modulo Obras."}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ReportsModule({
  selectedShopping,
  stores,
  reports,
  initialStoreId,
  permissions,
  onOpenChecklists,
  onOpenStores,
}: {
  selectedShopping?: Location;
  stores: RetailStore[];
  reports: ChecklistReport[];
  initialStoreId?: string | null;
  permissions: {
    canExportPdf: boolean;
  };
  onOpenChecklists: (storeId?: string) => void;
  onOpenStores: () => void;
}) {
  const [search, setSearch] = useState("");
  const [storeFilterId, setStoreFilterId] = useState<string | null>(initialStoreId || null);

  const shoppingStores = useMemo(
    () =>
      selectedShopping
        ? stores.filter((store) => store.shoppingId === selectedShopping.id)
        : [],
    [selectedShopping, stores],
  );

  const storeById = useMemo(() => {
    return new Map(shoppingStores.map((store) => [store.id, store]));
  }, [shoppingStores]);

  useEffect(() => {
    if (initialStoreId && shoppingStores.some((store) => store.id === initialStoreId)) {
      setStoreFilterId(initialStoreId);
    }
  }, [initialStoreId, shoppingStores]);

  const reportRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return reports
      .map((report) => {
        const store = storeById.get(report.storeId);
        if (!store) return null;
        if (storeFilterId && store.id !== storeFilterId) return null;
        const template =
          CHECKLIST_TEMPLATES.find((item) => item.id === report.templateId) ||
          CHECKLIST_TEMPLATES[0];
        const stats = template.rows.reduce(
          (acc, row) => {
            if (row.kind !== "item") return acc;
            const status = report.statuses?.[row.id];
            if (status) acc.completed += 1;
            if (status === "ok") acc.ok += 1;
            if (status === "nok") acc.nok += 1;
            if (status === "na") acc.na += 1;
            return acc;
          },
          { completed: 0, ok: 0, nok: 0, na: 0 },
        );
        const progress = template.totalItems
          ? Math.round((stats.completed / template.totalItems) * 100)
          : 0;
        return { report, store, template, stats, progress };
      })
      .filter(Boolean)
      .filter((row) => {
        if (!row || !normalizedSearch) return true;
        return [
          row.report.title,
          row.report.date,
          row.store.name,
          row.store.code,
          row.store.segment,
          row.template.label,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      })
      .sort((a, b) => {
        if (!a || !b) return 0;
        return (
          b.report.date.localeCompare(a.report.date) ||
          b.report.createdAt - a.report.createdAt
        );
      }) as Array<{
        report: ChecklistReport;
        store: RetailStore;
        template: (typeof CHECKLIST_TEMPLATES)[number];
        stats: { completed: number; ok: number; nok: number; na: number };
        progress: number;
      }>;
  }, [reports, search, storeById, storeFilterId]);

  const reportsWithPending = reportRows.filter((row) => row.stats.nok > 0).length;
  const avgProgress = reportRows.length
    ? Math.round(reportRows.reduce((sum, row) => sum + row.progress, 0) / reportRows.length)
    : 0;

  return (
    <motion.div
      key="relatorios"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      <div className="airo-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-emerald-700" />
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-lg mb-5">
              <FileText className="w-7 h-7" />
            </div>
            <p className="text-xs font-black text-cyan-400 uppercase tracking-[0.22em] mb-3">
              {selectedShopping ? selectedShopping.name : "Shopping"}
            </p>
            <h2 className="text-3xl md:text-5xl font-black text-white font-display tracking-tight">
              Relatorios
            </h2>
            <p className="text-slate-400 mt-3 text-base md:text-lg leading-relaxed">
              Consulte os relatorios de checklist por loja, data, modelo e progresso.
              Esta central prepara a proxima etapa de armazenamento de PDFs.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full xl:w-[620px]">
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Relatorios
              </p>
              <p className="text-2xl font-black text-white mt-1">{reportRows.length}</p>
            </div>
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Lojas
              </p>
              <p className="text-2xl font-black text-white mt-1">{shoppingStores.length}</p>
            </div>
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Com Nao OK
              </p>
              <p className="text-2xl font-black text-white mt-1">{reportsWithPending}</p>
            </div>
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Progresso
              </p>
              <p className="text-2xl font-black text-white mt-1">{avgProgress}%</p>
            </div>
          </div>
        </div>
      </div>

      {!selectedShopping ? (
        <div className="splan-empty-state min-h-[420px]">
          <div className="splan-empty-icon">
            <Building2 className="w-7 h-7" />
          </div>
          <h4>Nenhum shopping selecionado</h4>
          <p>Selecione um shopping para consultar relatorios.</p>
        </div>
      ) : (
        <div className="airo-card overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-white font-display">
                Historico de relatorios
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Relatorios criados no modulo Checklists para lojas deste shopping.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <select
                value={storeFilterId || ""}
                onChange={(event) => setStoreFilterId(event.target.value || null)}
                className="premium-input w-full sm:w-64"
              >
                <option value="">Todas as lojas</option>
                {shoppingStores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="premium-input pl-10"
                  placeholder="Buscar loja, data ou modelo"
                />
              </div>
              <button
                onClick={() => onOpenChecklists(storeFilterId || undefined)}
                className="btn-primary whitespace-nowrap"
              >
                <ClipboardList className="w-5 h-5" />
                Abrir Checklists
              </button>
            </div>
          </div>

          {shoppingStores.length === 0 ? (
            <div className="splan-empty-state min-h-[360px]">
              <div className="splan-empty-icon">
                <Store className="w-7 h-7" />
              </div>
              <h4>Nenhuma loja cadastrada</h4>
              <p>Cadastre lojas antes de criar relatorios de checklist.</p>
              <button onClick={onOpenStores} className="btn-primary mt-4">
                <Store className="w-5 h-5" />
                Abrir Lojas
              </button>
            </div>
          ) : reportRows.length === 0 ? (
            <div className="splan-empty-state min-h-[360px]">
              <div className="splan-empty-icon">
                <FileText className="w-7 h-7" />
              </div>
              <h4>Nenhum relatorio encontrado</h4>
              <p>Crie um relatorio dentro de Checklists para ele aparecer aqui.</p>
              <button
                onClick={() => onOpenChecklists(storeFilterId || undefined)}
                className="btn-primary mt-4"
              >
                <ClipboardList className="w-5 h-5" />
                Criar relatorio
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[980px] text-sm">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                    <th className="text-left px-5 py-4 font-black uppercase text-[11px] tracking-widest">
                      Relatorio
                    </th>
                    <th className="text-left px-5 py-4 font-black uppercase text-[11px] tracking-widest">
                      Loja
                    </th>
                    <th className="text-left px-5 py-4 font-black uppercase text-[11px] tracking-widest">
                      Modelo
                    </th>
                    <th className="text-center px-5 py-4 font-black uppercase text-[11px] tracking-widest">
                      Status
                    </th>
                    <th className="text-center px-5 py-4 font-black uppercase text-[11px] tracking-widest">
                      Progresso
                    </th>
                    <th className="text-right px-5 py-4 font-black uppercase text-[11px] tracking-widest">
                      Acoes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportRows.map(({ report, store, template, stats, progress }) => {
                    const formattedDate = report.date
                      ? new Date(`${report.date}T00:00:00`).toLocaleDateString("pt-BR")
                      : "-";
                    return (
                      <tr
                        key={report.id}
                        className="border-b border-slate-800/70 hover:bg-slate-900/50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <p className="font-black text-white">{report.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{formattedDate}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-200">{store.name}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {store.code || "Sem numero"} | {store.segment || STORE_STATUS_LABELS[store.status]}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-slate-300">{template.label}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-black">
                              OK {stats.ok}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-black">
                              Nao OK {stats.nok}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-slate-700/30 border border-slate-700 text-slate-300 text-xs font-black">
                              NA {stats.na}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-28 h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-black text-slate-300 w-10">
                              {progress}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onOpenChecklists(store.id)}
                              className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors text-xs font-black flex items-center gap-2"
                              title="Abrir em Checklists"
                            >
                              <Eye className="w-4 h-4" />
                              Abrir
                            </button>
                            {permissions.canExportPdf && (
                              <button
                                onClick={() => onOpenChecklists(store.id)}
                                className="px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors text-xs font-black flex items-center gap-2"
                                title="Gerar PDF no checklist"
                              >
                                <Download className="w-4 h-4" />
                                PDF
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function ModuleHome({
  projects,
  stores,
  user,
  onSelectModule,
  onSelectShopping,
  onBackToShoppings,
  permissionTestProfile,
  selectedShopping,
  shoppings,
  homeView,
  canDeleteShopping,
  onDeleteShopping,
}: {
  locations: Location[];
  projects: Project[];
  stores: RetailStore[];
  allowances: Allowance[];
  user: UserProfile;
  onSelectModule: (moduleId: AppModuleId) => void;
  onSelectShopping: (shoppingId: string) => void;
  onBackToShoppings: () => void;
  permissionTestProfile?: AccessProfileId | null;
  selectedShopping?: Location;
  shoppings: Location[];
  homeView: "shoppings" | "modules";
  canDeleteShopping: boolean;
  onDeleteShopping: (shoppingId: string) => void;
}) {
  const visibleModules = getVisibleAppModules(
    user,
    permissionTestProfile,
    homeView === "modules" && Boolean(selectedShopping),
  ).filter(
    (module) =>
      module.id !== "shopping" &&
      module.id !== "admin" &&
      module.id !== "checklists" &&
      module.id !== "relatorios",
  );
  const accessProfile = permissionTestProfile || getAccessProfile(user);
  const accessScope = permissionTestProfile
    ? permissionTestProfile === "admin"
      ? "global"
      : "shopping"
    : getAccessScope(user);

  const showShoppingList = homeView === "shoppings" || !selectedShopping;

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      {showShoppingList ? (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black text-cyan-400 uppercase tracking-[0.22em] mb-3">
                SÁ CAVALCANTE
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-white font-display tracking-tight">
                Shoppings
              </h2>
            </div>
            <button
              onClick={() => onSelectModule("shopping")}
              className="btn-secondary w-full md:w-auto"
            >
              <Plus className="w-5 h-5" />
              Criar shopping
            </button>
          </div>

          {shoppings.length === 0 ? (
            <div className="splan-empty-state min-h-[420px]">
              <div className="splan-empty-icon">
                <Building2 className="w-7 h-7" />
              </div>
              <h4>Nenhum shopping cadastrado</h4>
              <p>Cadastre um shopping para liberar os modulos do app.</p>
              <button onClick={() => onSelectModule("shopping")} className="btn-primary mt-4">
                <Plus className="w-5 h-5" />
                Criar shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {shoppings.map((shopping) => {
                const projectCount = projects.filter(
                  (project) => project.locationId === shopping.id,
                ).length;
                const storeCount = stores.filter(
                  (store) => store.shoppingId === shopping.id,
                ).length;
                return (
                  <div
                    key={shopping.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectShopping(shopping.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectShopping(shopping.id);
                      }
                    }}
                    className="airo-card text-left p-5 min-h-[128px] flex flex-col justify-between cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-lg font-black text-white font-display truncate">
                          {shopping.name}
                        </p>
                        <p className="text-sm font-semibold text-slate-400 mt-2">
                          {projectCount} obra{projectCount === 1 ? "" : "s"}
                        </p>
                        <p className="text-sm font-semibold text-slate-500 mt-1">
                          {storeCount} loja{storeCount === 1 ? "" : "s"}
                        </p>
                      </div>
                      <Building2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    </div>
                    <div className="mt-5 flex items-center justify-end gap-2">
                      {canDeleteShopping && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeleteShopping(shopping.id);
                          }}
                          className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors"
                          title="Apagar shopping"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button
                onClick={onBackToShoppings}
                className="text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2 mb-3"
              >
                <ArrowLeft className="w-4 h-4" />
                Shoppings
              </button>
              <h2 className="text-3xl md:text-4xl font-black text-white font-display tracking-tight">
                {selectedShopping.name}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {visibleModules.map((module) => (
              <button
                key={module.id}
                onClick={() => onSelectModule(module.id)}
                className="airo-card text-left p-5 min-h-[140px] flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-xl font-black text-white font-display">
                      {module.label}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-slate-950/60 border border-slate-800 text-cyan-400 flex items-center justify-center flex-shrink-0">
                    {module.icon}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
function ModulePlaceholder({
  module,
  locations,
  projects,
  onBackHome,
  onOpenObras,
}: {
  module: (typeof APP_MODULES)[number];
  locations: Location[];
  projects: Project[];
  onBackHome: () => void;
  onOpenObras: () => void;
}) {
  return (
    <motion.div
      key={module.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      <div className="airo-card p-8 md:p-10 relative overflow-hidden">
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
            module.accent,
          )}
        />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-3xl">
            <div
              className={cn(
                "w-14 h-14 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shadow-lg mb-5",
                module.accent,
              )}
            >
              {module.icon}
            </div>
            <p className="text-xs font-black text-blue-400 uppercase tracking-[0.22em] mb-3">
              Novo modulo
            </p>
            <h2 className="text-3xl md:text-5xl font-black text-white font-display tracking-tight">
              {module.label}
            </h2>
            <p className="text-slate-400 mt-3 text-base md:text-lg leading-relaxed">
              {module.description}. Esta area ja esta separada para crescer sem
              misturar responsabilidades com o modulo Obras.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full lg:w-[360px]">
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Base atual
              </p>
              <p className="text-2xl font-black text-white mt-1">
                {locations.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">locais</p>
            </div>
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Obras
              </p>
              <p className="text-2xl font-black text-white mt-1">
                {projects.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">registros</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {MODULE_FEATURES[module.id].map((feature, index) => (
          <div key={feature} className="airo-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-black">
                {index + 1}
              </div>
              <h3 className="font-black text-white font-display">
                {feature}
              </h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Estrutura reservada para implementar essa funcionalidade como
              parte independente da plataforma.
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={onBackHome} className="btn-secondary">
          <LayoutGrid className="w-5 h-5" />
          Voltar ao Inicio
        </button>
        <button onClick={onOpenObras} className="btn-primary">
          <Building2 className="w-5 h-5" />
          Abrir Obras
        </button>
      </div>
    </motion.div>
  );
}

function ShareProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");

  const handleShare = async () => {
    if (!email) return;
    const cleanEmail = email.trim().toLowerCase();
    const sharedWith = project.sharedWith || {};
    sharedWith[cleanEmail] = role;
    const sharedEmails = Object.keys(sharedWith);
    try {
      await updateDoc(
        doc(db, "projects", project.id),
        removeUndefined({ sharedWith, sharedEmails }) as any,
      );
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        "projects/" + project.id,
      );
    }
    setEmail("");
  };

  const handleRemove = async (emailToRemove: string) => {
    const sharedWith = { ...(project.sharedWith || {}) };
    delete sharedWith[emailToRemove];
    const sharedEmails = Object.keys(sharedWith);
    try {
      await updateDoc(
        doc(db, "projects", project.id),
        removeUndefined({ sharedWith, sharedEmails }) as any,
      );
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        "projects/" + project.id,
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-800"
      >
        <h3 className="text-2xl font-bold mb-6 text-white font-display">
          Compartilhar Obra
        </h3>

        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-1.5">
              E-mail do usuário
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="exemplo@email.com"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "viewer" | "editor")}
              className="flex-1 px-4 py-2.5 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-900"
            >
              <option value="viewer">Visualizador</option>
              <option value="editor">Editor</option>
            </select>
            <button
              onClick={handleShare}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Adicionar
            </button>
          </div>
        </div>

        {project.sharedWith && Object.keys(project.sharedWith).length > 0 && (
          <div className="mb-8">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              Pessoas com acesso
            </h4>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {Object.entries(project.sharedWith).map(
                ([sharedEmail, sharedRole]) => (
                  <div
                    key={sharedEmail}
                    className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-800"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">
                        {sharedEmail}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        {sharedRole === "editor" ? "Editor" : "Visualizador"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(sharedEmail)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-500/10 rounded-full transition-colors"
                      title="Remover acesso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-800 text-slate-400 rounded-xl font-bold hover:bg-slate-700 transition-colors"
          >
            Concluir
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Location List ---

function LocationList({
  locations,
  projects,
  onSelectLocation,
  onAddLocation,
  onDeleteLocation,
  onUpdateLocation,
  user,
}: {
  locations: Location[];
  projects: Project[];
  onSelectLocation: (id: string) => void;
  onAddLocation: (l: Location) => void;
  onDeleteLocation: (id: string) => void;
  onUpdateLocation: (l: Location) => void;
  user: any;
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(
    null,
  );
  const [locationToShare, setLocationToShare] = useState<Location | null>(null);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<'obra' | 'allowance'>('obra');
  const [newIconUrl, setNewIconUrl] = useState<string | null>(null);
  const [newAllowanceStoreName, setNewAllowanceStoreName] = useState("");
  const [newAllowanceValue, setNewAllowanceValue] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalIconUrl = newIconUrl;

    if (newIconUrl && newIconUrl.startsWith("data:image")) {
      try {
        const compressedBlob = await new Promise<Blob>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;
            const maxWidth = 400; // Icons don't need much resolution
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Erro ao criar Blob"));
            }, "image/webp", 0.8);
          };
          img.onerror = () => reject(new Error("Erro ao carregar imagem"));
          img.src = newIconUrl;
        });

        const fileName = `icons/${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;

        if (supabase) {
          const { error: uploadError } = await supabase.storage
            .from("rdo-fotos")
            .upload(fileName, compressedBlob, { contentType: "image/webp" });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from("rdo-fotos")
            .getPublicUrl(fileName);

          finalIconUrl = publicUrlData.publicUrl;
        }
      } catch (err) {
        console.error("Erro ao carregar e comprimir ícone para o Supabase", err);
        // Fallback to null or keep original if it wasn't base64 (already handled by the guard)
        finalIconUrl = null;
      }
    }

    if (editingLocation) {
      onUpdateLocation({
        ...editingLocation,
        name: newName,
        type: newType,
        iconUrl: finalIconUrl || undefined,
      });
    } else {
      const newLocation: Location = {
        id: Math.random().toString(36).substr(2, 9),
        name: newType === 'allowance' ? newAllowanceStoreName : newName,
        type: newType,
        ownerId: user.uid,
        iconUrl: finalIconUrl || undefined,
        allowanceFields: newType === 'allowance' ? {
           storeName: newAllowanceStoreName,
           value: parseFloat(newAllowanceValue.replace(",", ".")) || 0
        } : undefined
      };
      onAddLocation(newLocation);
      if (newType === 'allowance') {
        onSelectLocation(newLocation.id);
      }
    }
    setShowModal(false);
    setEditingLocation(null);
    setNewName("");
    setNewType('obra');
    setNewIconUrl(null);
    setNewAllowanceStoreName("");
    setNewAllowanceValue("");
  };

  const handleDelete = () => {
    if (locationToDelete) {
      onDeleteLocation(locationToDelete.id);
      setLocationToDelete(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-10 py-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
        <div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white font-display tracking-tight">
            Locais de Obra
          </h2>
          <p className="text-sm md:text-base text-slate-400 mt-0.5 font-medium">
            Selecione ou crie um novo local de gestão
          </p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => {
            setEditingLocation(null);
            setNewName("");
            setNewIconUrl(null);
            setShowModal(true);
          }}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-2xl flex items-center justify-center gap-3 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-xl shadow-blue-600/20 font-bold text-sm md:text-base"
        >
          <Plus className="w-5 h-5" />
          Novo Local
        </button>
      </div>
    </div>

      {locations.length === 0 && (
        <div className="splan-empty-state">
          <div className="splan-empty-icon">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-bold font-display text-lg">
              Nenhum local cadastrado
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Crie seu primeiro local para organizar obras, desembolsos e envios.
            </p>
          </div>
        </div>
      )}

      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6", locations.length === 0 && "hidden")}>
        {locations.map((location) => {
          const locationProjects = projects.filter(
            (p) => p.locationId === location.id,
          );
          let locTotalValue = 0;
          let locTotalMeasured = 0;
          let locTotalScheduledProgressValue = 0;
          let locTotalInvoices = 0;
          let locTotalDisbursements = 0;

          locationProjects.forEach((p) => {
            const stats = calculateProjectStats(p);
            locTotalValue += stats.totalValue;
            locTotalMeasured += stats.totalMeasured;
            locTotalScheduledProgressValue += stats.totalScheduledProgressValue;
            locTotalInvoices += stats.totalInvoices;
          });

          locTotalDisbursements = (location.disbursements || []).reduce(
            (sum, d) => sum + d.value,
            0,
          );

          const locPhysicalPercent =
            locTotalValue > 0
              ? (locTotalScheduledProgressValue / locTotalValue) * 100
              : 0;
          const locFinancialPercent =
            locTotalValue > 0 ? (locTotalInvoices / locTotalValue) * 100 : 0;
          const locDisbursementPercent =
            locTotalValue > 0
              ? (locTotalDisbursements / locTotalValue) * 100
              : 0;

          return (
            <motion.div
              key={location.id}
              whileHover={{ y: -4, scale: 1.005 }}
              onClick={() => onSelectLocation(location.id)}
              className="airo-card p-5 md:p-6 min-h-[168px] transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors" />

              <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="flex gap-3">
                  <div className="bg-slate-800/70 p-3 rounded-xl group-hover:bg-blue-600 transition-all duration-300">
                    {location.iconUrl ? (
                      <img
                        src={location.iconUrl}
                        className="w-5 h-5 object-contain"
                        alt="Icon"
                      />
                    ) : (
                      <LayoutDashboard className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  {location.ownerId === user.uid && (

                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingLocation(location);
                          setNewName(location.name);
                          setNewIconUrl(location.iconUrl || null);
                          setShowModal(true);
                        }}
                        className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                        title="Editar Local"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocationToShare(location);
                        }}
                        className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                        title="Compartilhar Local"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocationToDelete(location);
                    }}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all"
                    title="Excluir Local"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              <div className="flex flex-col mb-2">
                <h3 className="text-xl font-black text-white font-display leading-tight">
                  {location.name}
                </h3>
                <div className="flex items-center mt-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      location.type === "allowance"
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    }`}
                  >
                    {location.type === "allowance" ? "Allowance" : "Capex"}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-800/60 pt-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Obras
                    </p>
                    <p className="text-sm font-bold text-white mt-1">
                      {locationProjects.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Patrimônio
                    </p>
                    <p className="text-sm font-bold text-white mt-1">
                      {locTotalValue.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {locationToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[90]">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-3xl"
          >
            <div className="flex items-center gap-4 text-red-500 mb-6">
              <div className="bg-red-500/100/10 p-3 rounded-2xl">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black font-display text-white">
                Atenção!
              </h3>
            </div>
            <p className="text-slate-400 leading-relaxed mb-8">
              Você está prestes a excluir o local{" "}
              <span className="font-black text-white italic">
                "{locationToDelete.name}"
              </span>
              . Esta operação é irreversível e removerá{" "}
              <span className="text-red-400 font-bold underline">
                todas as obras vinculadas
              </span>
              .
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setLocationToDelete(null)}
                className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-2xl hover:bg-slate-700 transition-all font-bold"
              >
                Voltar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all font-black shadow-lg shadow-red-600/20"
              >
                Sim, Excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {locationToShare && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[90]">
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 p-8 rounded-[2.5rem] w-full max-w-2xl shadow-3xl border border-slate-800 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <TabCompartilhar
              location={locationToShare}
              onUpdateLocation={(l) => {
                onUpdateLocation(l);
                setLocationToShare(null);
              }}
            />
            <button
              onClick={() => setLocationToShare(null)}
              className="mt-8 w-full py-4 bg-slate-800 text-slate-300 rounded-2xl font-bold hover:bg-slate-700 transition-all active:scale-[0.98]"
            >
              Fechar Painel de Compartilhamento
            </button>
          </motion.div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[90]">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-[2.5rem] p-10 w-full max-w-md shadow-3xl border border-slate-800 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500" />

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="bg-emerald-500/10 p-3 rounded-2xl">
                {editingLocation ? (
                  <Edit2 className="w-6 h-6 text-emerald-500" />
                ) : (
                  <Plus className="w-6 h-6 text-emerald-500" />
                )}
              </div>
              <h3 className="text-2xl font-black font-display text-white">
                {editingLocation ? "Editar Local" : "Novo Local"}
              </h3>
            </div>

            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-300 ml-1">
                  Identificação do Local
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white placeholder:text-slate-400"
                  placeholder="Ex: SRP, SDI, Obra Central..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-300 ml-1">
                  Tipo de Local
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setNewType('obra')}
                    className={cn(
                      "px-4 py-3 rounded-2xl border font-bold transition-all",
                      newType === 'obra' 
                        ? "bg-blue-600 border-blue-600 text-white" 
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                    )}
                  >
                    Obra
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('allowance')}
                    className={cn(
                      "px-4 py-3 rounded-2xl border font-bold transition-all",
                      newType === 'allowance'
                        ? "bg-emerald-600 border-emerald-600 text-white" 
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                    )}
                  >
                    Allowance
                  </button>
                </div>
              </div>

              {newType === 'allowance' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-300 ml-1">Nome da Loja</label>
                    <input
                      type="text"
                      required
                      value={newAllowanceStoreName}
                      onChange={(e) => setNewAllowanceStoreName(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white placeholder:text-slate-400"
                      placeholder="Ex: Farm, Vivara..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-300 ml-1">Valor do Allowance (R$)</label>
                    <input
                      type="text"
                      required
                      value={newAllowanceValue}
                      onChange={(e) => setNewAllowanceValue(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white placeholder:text-slate-400 font-mono"
                      placeholder="0,00"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-300 ml-1">
                   Ícone / Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                    {newIconUrl ? (
                      <img
                        src={newIconUrl}
                        className="w-full h-full object-contain p-2"
                        alt="Preview"
                      />
                    ) : (
                      <LayoutDashboard className="w-8 h-8 text-slate-700" />
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <label className="inline-block bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl transition-colors cursor-pointer w-full text-center">
                      Carregar Imagem
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            const reader = new FileReader();
                            reader.onloadend = () =>
                              setNewIconUrl(reader.result as string);
                            reader.readAsDataURL(f);
                          }
                        }}
                      />
                    </label>
                    {newIconUrl && (
                      <button
                        type="button"
                        onClick={() => setNewIconUrl(null)}
                        className="w-full text-[10px] font-black text-rose-500 hover:text-rose-400 transition-colors uppercase tracking-[0.2em] text-center"
                      >
                        Remover Ícone
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingLocation(null);
                    setNewName("");
                    setNewIconUrl(null);
                  }}
                  className="flex-1 px-5 py-4 border border-slate-800 text-slate-400 rounded-2xl hover:bg-slate-950 transition-colors font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-bold shadow-lg shadow-emerald-600/20"
                >
                  {editingLocation ? "Salvar" : "Criar Local"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

// --- Project List ---

// --- Presentation Mode ---

function RDODashboardView({
  project,
  startDate,
  endDate,
  onRangeChange,
}: {
  project: Project;
  startDate: string;
  endDate: string;
  onRangeChange: (start: string, end: string) => void;
}) {
  const [supabasePhotos, setSupabasePhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPhotos() {
      if (!supabase) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("rdo_fotos")
          .select("*")
          .eq("obra_id", project.id)
          .gte("data_registro", startDate)
          .lte("data_registro", endDate);

        if (error) throw error;
        setSupabasePhotos(data || []);
      } catch (err) {
        console.error("Erro ao carregar fotos dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPhotos();
  }, [project.id, startDate, endDate]);

  const filteredRdos = useMemo(() => {
    return (project.rdos || [])
      .filter((r) => r.date >= startDate && r.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [project.rdos, startDate, endDate]);

  const weatherStats = useMemo(() => {
    const stats = { bom: 0, nublado: 0, chuvoso: 0, impraticavel: 0 };
    filteredRdos.forEach((r) => {
      if (r.weatherMorning) stats[r.weatherMorning]++;
      if (r.weatherAfternoon) stats[r.weatherAfternoon]++;
      if (r.weatherNight) stats[r.weatherNight]++;
    });
    return stats;
  }, [filteredRdos]);

  const laborStats = useMemo(() => {
    const roles: Record<string, number> = {};
    filteredRdos.forEach((r) => {
      (r.labor || []).forEach((l) => {
        roles[l.role] = (roles[l.role] || 0) + Number(l.quantity);
      });
    });
    // Average per day
    const days = filteredRdos.length || 1;
    return Object.entries(roles).map(([role, qty]) => ({
      role,
      avg: qty / days,
      total: qty,
    }));
  }, [filteredRdos]);

  const equipmentStats = useMemo(() => {
    const items: Record<string, number> = {};
    filteredRdos.forEach((r) => {
      (r.equipments || []).forEach((eq) => {
        items[eq.name] = (items[eq.name] || 0) + Number(eq.quantity);
      });
    });
    const days = filteredRdos.length || 1;
    return Object.entries(items).map(([name, qty]) => ({
      name,
      avg: qty / days,
      total: qty,
    }));
  }, [filteredRdos]);

  const allPhotos = useMemo(() => {
    const rdoPhotos = filteredRdos.flatMap((r) =>
      (r.photos || []).map((p) => ({ ...p, date: r.date })),
    );
    const sImages = supabasePhotos.map((p) => ({
      id: p.id,
      url: p.url_foto,
      description: p.descricao || "",
      date: p.data_registro?.split(" ")[0],
    }));

    // De-duplicate if needed (though supabase is preferred for new ones)
    const combined = [...rdoPhotos, ...sImages];
    return combined.sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredRdos, supabasePhotos]);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-display mb-2">
            {project.name}
          </h1>
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-500/20 flex items-center gap-2">
              <Camera className="w-3 h-3" />
              Dashboard de Campo (RDO)
            </div>
            <span className="text-slate-400 text-sm">
              Período:{" "}
              {new Date(startDate + "T12:00:00").toLocaleDateString("pt-BR")}{" "}
              até {new Date(endDate + "T12:00:00").toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
              Início
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onRangeChange(e.target.value, endDate)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
              Fim
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onRangeChange(startDate, e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[0px]">
        {/* Lado Esquerdo: Stats */}
        <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          {/* Clima */}
          <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 p-6">
            <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              Clima no Período
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <WeatherMiniStat
                label="Bom"
                count={weatherStats.bom}
                color="text-amber-400"
              />
              <WeatherMiniStat
                label="Nublado"
                count={weatherStats.nublado}
                color="text-slate-400"
              />
              <WeatherMiniStat
                label="Chuva"
                count={weatherStats.chuvoso}
                color="text-blue-400"
              />
              <WeatherMiniStat
                label="Impratic."
                count={weatherStats.impraticavel}
                color="text-red-400"
              />
            </div>
          </div>

          {/* Mão de Obra */}
          <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 p-6 flex-1">
            <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              Mão de Obra (Média)
            </h3>
            <div className="space-y-3">
              {laborStats.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  Nenhum dado registrado
                </p>
              ) : (
                laborStats.slice(0, 8).map((s) => (
                  <div
                    key={s.role}
                    className="flex justify-between items-center group"
                  >
                    <span className="text-sm text-slate-300 font-medium truncate pr-2">
                      {s.role}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Média:</span>
                      <span className="text-sm font-black text-white">
                        {s.avg.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito: Fotos e Atividades */}
        <div className="lg:col-span-3 flex flex-col gap-6 min-h-[0px]">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[0px]">
            {/* Galeria de Fotos */}
            <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 p-6 flex flex-col min-h-[0px]">
              <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2 shrink-0">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                Registros Fotográficos ({allPhotos.length})
              </h3>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {allPhotos.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                    <Camera className="w-12 h-12 opacity-20" />
                    <p className="text-sm font-medium">
                      Nenhuma foto no período
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pb-4">
                    {allPhotos.map((p, idx) => (
                      <div
                        key={p.id || idx}
                        className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer"
                        onClick={() => setSelectedPhotoIndex(idx)}
                      >
                        <img
                          src={p.url}
                          alt={p.description}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-[10px] text-white/90 font-bold truncate">
                            {p.description}
                          </p>
                          <p className="text-[8px] text-white/50">
                            {new Date(p.date + "T12:00:00").toLocaleDateString(
                              "pt-BR",
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedPhotoIndex !== null && (
              <div
                className="fixed inset-0 z-[100] bg-black/98 flex flex-col items-center justify-center p-4 backdrop-blur-xl"
                onClick={() => setSelectedPhotoIndex(null)}
              >
                <button
                  onClick={() => setSelectedPhotoIndex(null)}
                  className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-3 rounded-full"
                >
                  <X size={32} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhotoIndex((prev) =>
                      prev! > 0 ? prev! - 1 : allPhotos.length - 1,
                    );
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/10 p-6 rounded-full text-white transition-all backdrop-blur-md group"
                >
                  <ChevronLeft
                    size={48}
                    className="group-hover:-translate-x-1 transition-transform"
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhotoIndex((prev) =>
                      prev! < allPhotos.length - 1 ? prev! + 1 : 0,
                    );
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/10 p-6 rounded-full text-white transition-all backdrop-blur-md group"
                >
                  <ChevronRight
                    size={48}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>

                <div
                  className="w-full max-w-6xl h-full flex flex-col items-center justify-center gap-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative group w-full flex justify-center">
                    <img
                      src={allPhotos[selectedPhotoIndex].url}
                      alt=""
                      className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl shadow-blue-500/20"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-center space-y-2 max-w-2xl">
                    <p className="text-white text-2xl font-bold font-display tracking-tight leading-tight">
                      {allPhotos[selectedPhotoIndex].description ||
                        "Registro de Campo"}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-px w-8 bg-slate-700" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                        {new Date(
                          allPhotos[selectedPhotoIndex].date + "T12:00:00",
                        ).toLocaleDateString("pt-BR")}
                      </p>
                      <div className="h-px w-8 bg-slate-700" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium mt-4">
                      Imagem {selectedPhotoIndex + 1} de {allPhotos.length}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Atividades e Ocorrências */}
            <div className="flex flex-col gap-6 min-h-[0px]">
              <div className="flex-1 bg-slate-800/40 rounded-3xl border border-slate-700/50 p-6 flex flex-col min-h-[0px]">
                <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2 shrink-0">
                  <ClipboardList className="w-4 h-4 text-emerald-500" />
                  Atividades Principais
                </h3>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-4">
                    {filteredRdos.filter((r) => r.activities).length === 0 ? (
                      <p className="text-sm text-slate-500 italic">
                        Sem atividades registradas no período
                      </p>
                    ) : (
                      filteredRdos
                        .filter((r) => r.activities)
                        .map((r) => (
                          <div
                            key={r.id}
                            className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/30"
                          >
                            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">
                              {new Date(
                                r.date + "T12:00:00",
                              ).toLocaleDateString("pt-BR")}
                            </div>
                            <p className="text-sm text-slate-200 leading-relaxed">
                              {r.activities}
                            </p>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>

              <div className="h-1/3 bg-slate-800/40 rounded-3xl border border-slate-700/50 p-6 flex flex-col min-h-[0px]">
                <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2 shrink-0">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  Ocorrências
                </h3>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-3">
                    {filteredRdos.filter((r) => r.occurrences).length === 0 ? (
                      <p className="text-sm text-slate-500 italic">
                        Nenhuma ocorrência registrada
                      </p>
                    ) : (
                      filteredRdos
                        .filter((r) => r.occurrences)
                        .map((r) => (
                          <div
                            key={r.id}
                            className="flex gap-3 bg-red-500/5 p-3 rounded-xl border border-red-500/10"
                          >
                            <span className="text-[10px] font-bold text-red-400 shrink-0 mt-0.5">
                              {new Date(
                                r.date + "T12:00:00",
                              ).toLocaleDateString("pt-BR")}
                            </span>
                            <p className="text-xs text-slate-300 font-medium">
                              {r.occurrences}
                            </p>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeatherMiniStat({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-700/30 flex flex-col items-center">
      <span className={cn("text-xl font-black", color)}>{count}</span>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}


function LocationPresentation({
  location,
  projects,
  onClose,
  onUpdateLocation,
}: {
  location: Location;
  projects: Project[];
  onClose: () => void;
  onUpdateLocation: (l: Location) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSorter, setShowSorter] = useState(false);
  const [editData, setEditData] = useState<Partial<CustomSlide> | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [rdoDateRanges, setRdoDateRanges] = useState<
    Record<string, { start: string; end: string }>
  >({});

  const slides = useMemo(() => {
    const projectSlides = projects.flatMap((p) => [
      { type: "project" as const, id: p.id, data: p },
      { type: "rdo-dashboard" as const, id: `rdo-${p.id}`, data: p },
    ]);
    const customSlides = (location.customSlides || []).map((s) => ({
      type: "custom" as const,
      id: s.id,
      data: s,
    }));
    const disbursementSlide = {
      type: "disbursement" as const,
      id: `disbursement-${location.id}`,
      data: location,
    };

    const allSlides = [disbursementSlide, ...projectSlides, ...customSlides];

    if (location.slideOrder && location.slideOrder.length > 0) {
      return allSlides.sort((a, b) => {
        const indexA = location.slideOrder!.indexOf(a.id);
        const indexB = location.slideOrder!.indexOf(b.id);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }
    return allSlides;
  }, [projects, location.customSlides, location.slideOrder]);

  const currentSlide = slides[currentIndex];

  const currentRdoRange = useMemo(() => {
    if (currentSlide?.type !== "rdo-dashboard") return { start: "", end: "" };
    const pId = currentSlide.data.id;
    if (rdoDateRanges[pId]) return rdoDateRanges[pId];

    const end = new Date().toISOString().split("T")[0];
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const start = d.toISOString().split("T")[0];
    return { start, end };
  }, [currentSlide, rdoDateRanges]);

  const locDisbursementStats = useMemo(() => {
    if (currentSlide?.type !== "disbursement") return null;
    const loc = currentSlide.data;

    const pCurrency = (val: string) => {
      if (!val) return 0;
      return parseFloat(val.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
    };

    const disbursements = loc.disbursements || [];
    const types = ["Obra Civil", "Instalações", "Equipamento", "Móveis"];
    const totalContract = types.reduce(
      (acc, type) =>
        acc +
        pCurrency(String(loc.disbursementConfig?.[type]?.contractValue || "0")),
      0,
    );
    const totalFinancing = types.reduce(
      (acc, type) =>
        acc +
        pCurrency(
          String(loc.disbursementConfig?.[type]?.financingValue || "0"),
        ),
      0,
    );
    const totalDisbursed = disbursements
      .filter((d) => d.status === "Pago")
      .reduce((acc, d) => acc + d.value, 0);
    const totalPending = disbursements
      .filter((d) => d.status === "Aguardando Pagamento")
      .reduce((acc, d) => acc + d.value, 0);
    const totalBalance = totalFinancing - totalDisbursed;

    return {
      totalContract,
      totalFinancing,
      totalDisbursed,
      totalPending,
      totalBalance,
    };
  }, [currentSlide]);

  const projectStats = useMemo(() => {
    if (currentSlide?.type === "project") {
      return calculateProjectStats(currentSlide.data);
    }
    return null;
  }, [currentSlide]);

  const scheduleStats = useMemo(() => {
    if (currentSlide?.type !== "project") return null;
    const project = currentSlide.data;
    const today = new Date();
    const stats = {
      Adiantada: 0,
      Atrasada: 0,
      "No Prazo": 0,
      "Não Iniciada": 0,
      Finalizada: 0,
    };

    project.services
      .filter((s) => !s.isMacro)
      .forEach((service) => {
        const start = service.startDate ? new Date(service.startDate) : null;
        const end = service.endDate ? new Date(service.endDate) : null;
        const progress = service.progress || 0;

        let expectedProgress = 0;
        let status: keyof typeof stats = "Não Iniciada";

        if (start && end) {
          const totalDuration = end.getTime() - start.getTime();
          const elapsed = today.getTime() - start.getTime();

          if (elapsed < 0) {
            expectedProgress = 0;
          } else if (elapsed > totalDuration) {
            expectedProgress = 100;
          } else {
            expectedProgress = Math.round((elapsed / totalDuration) * 100);
          }

          if (progress >= 100) {
            status = "Finalizada";
          } else if (progress === 0 && elapsed < 0) {
            status = "Não Iniciada";
          } else if (progress > expectedProgress + 5) {
            status = "Adiantada";
          } else if (progress < expectedProgress - 5) {
            status = "Atrasada";
          } else {
            status = "No Prazo";
          }
        }
        stats[status]++;
      });

    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [currentSlide]);

  const scheduleColors: Record<string, string> = {
    Adiantada: "#3B82F6",
    Atrasada: "#EF4444",
    "No Prazo": "#10B981",
    "Não Iniciada": "#9CA3AF",
    Finalizada: "#6366F1",
  };

  const overallSlideSchedule = useMemo(() => {
    if (currentSlide?.type !== "project") return null;
    const project = currentSlide.data;
    const today = new Date();

    // We filter identically to the Cronograma tab (services with dates that are not macros)
    const validServices = project.services.filter(
      (s) => !s.isMacro && s.startDate && s.endDate,
    );
    if (validServices.length === 0) return { real: 0, expected: 0 };

    const totalReal = validServices.reduce(
      (acc, curr) => acc + (curr.progress || 0),
      0,
    );

    // calculate expected
    const totalExpected = validServices.reduce((acc, curr) => {
      const start = new Date(curr.startDate!).getTime();
      const end = new Date(curr.endDate!).getTime();
      const totalDuration = end - start;
      const elapsed = today.getTime() - start;
      if (elapsed < 0) return acc;
      if (elapsed > totalDuration) return acc + 100;
      return acc + Math.round((elapsed / totalDuration) * 100);
    }, 0);

    return {
      real: Math.round(totalReal / validServices.length),
      expected: Math.round(totalExpected / validServices.length),
    };
  }, [currentSlide]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPlaying && !isEditing && !showSorter) {
      timerRef.current = setInterval(nextSlide, 10000); // 10 seconds per slide
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, nextSlide, isEditing, showSorter]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleSaveSlide = () => {
    if (!editData?.title) return;

    const newSlide: CustomSlide = {
      id: editData.id || Math.random().toString(36).substr(2, 9),
      title: editData.title,
      subtitle: editData.subtitle || "",
      content: editData.content || "",
      elements: editData.elements || [],
      type: editData.type || "canvas",
      createdAt: editData.createdAt || new Date().toISOString(),
    };

    const currentCustomSlides = location.customSlides || [];
    let updatedCustomSlides;
    if (editData.id) {
      updatedCustomSlides = currentCustomSlides.map((s) =>
        s.id === editData.id ? newSlide : s,
      );
    } else {
      updatedCustomSlides = [...currentCustomSlides, newSlide];
    }

    onUpdateLocation({
      ...location,
      customSlides: updatedCustomSlides,
      slideOrder: editData.id
        ? location.slideOrder
        : [...(location.slideOrder || []), newSlide.id],
    });
    setIsEditing(false);
    setEditData(null);
  };

  const handleAddElement = (type: "text" | "image") => {
    if (!editData) return;
    const newElement: SlideElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 10,
      y: 10,
      width: type === "text" ? 300 : 200,
      height: type === "text" ? 60 : 200,
      content: type === "text" ? "Novo Texto" : "",
      url: type === "image" ? "https://picsum.photos/seed/slide/400/300" : "",
      fontSize: 24,
      color: "var(--color-slate-800)",
    };
    setEditData((prev) => ({
      ...prev,
      elements: [...(prev?.elements || []), newElement],
    }));
  };

  const checkCollision = (
    id: string,
    x: number,
    y: number,
    w: number,
    h: number,
    elements: SlideElement[],
  ) => {
    if (!canvasRef.current || id.startsWith("bg-")) return false;
    const rect = canvasRef.current.getBoundingClientRect();

    const pxX = (x / 100) * rect.width;
    const pxY = (y / 100) * rect.height;

    return elements.some((el) => {
      if (el.id === id || el.id.startsWith("bg-")) return false;
      const elPxX = (el.x / 100) * rect.width;
      const elPxY = (el.y / 100) * rect.height;

      // Add a small 2px buffer to prevent sticking
      const buffer = 2;
      return (
        pxX < elPxX + el.width - buffer &&
        pxX + w > elPxX + buffer &&
        pxY < elPxY + el.height - buffer &&
        pxY + h > elPxY + buffer
      );
    });
  };

  const handleUpdateElement = (
    id: string,
    updates: Partial<SlideElement>,
    force = false,
  ) => {
    setEditData((prev) => {
      if (!prev?.elements) return prev;

      const currentEl = prev.elements.find((el) => el.id === id);
      if (!currentEl) return prev;

      const updatedEl = { ...currentEl, ...updates };

      if (!force && canvasRef.current) {
        const isColliding = checkCollision(
          id,
          updatedEl.x,
          updatedEl.y,
          updatedEl.width,
          updatedEl.height,
          prev.elements,
        );
        if (isColliding) return prev;
      }

      return {
        ...prev,
        elements: prev.elements.map((el) => (el.id === id ? updatedEl : el)),
      };
    });
  };

  const handleRemoveElement = (id: string) => {
    setEditData((prev) => ({
      ...prev,
      elements: (prev?.elements || [])
        .map((el) => (el.id === id ? { ...el, id: "deleted" } : el))
        .filter((el) => el.id !== "deleted"),
    }));
  };

  const handleImageUpload = async (id: string, file: File) => {
    try {
      if (!storage) {
        throw new Error("Storage service not initialized");
      }
      // Use Firebase Storage for high-resolution images to bypass Firestore 1MB limit
      const storageRef = ref(
        storage,
        `slides/${id}_${Date.now()}_${file.name}`,
      );
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      handleUpdateElement(id, { url }, true);
    } catch (error) {
      console.error(
        "Error uploading image to storage, falling back to DataURL:",
        error,
      );
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        handleUpdateElement(id, { url }, true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteSlide = (id: string) => {
    const updatedCustomSlides = (location.customSlides || []).filter(
      (s) => s.id !== id,
    );
    const updatedOrder = (location.slideOrder || []).filter(
      (sid) => sid !== id,
    );
    onUpdateLocation({
      ...location,
      customSlides: updatedCustomSlides,
      slideOrder: updatedOrder,
    });
    if (currentIndex >= slides.length - 1) {
      setCurrentIndex(Math.max(0, slides.length - 2));
    }
  };

  const moveSlide = (fromIndex: number, toIndex: number) => {
    const newOrder = slides.map((s) => s.id);
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    onUpdateLocation({ ...location, slideOrder: newOrder });
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-[60] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-md p-4 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Presentation className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">
              {location.name}
            </h2>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Apresentação de Resultados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => {
                    setShowSorter(true);
                    setIsPlaying(false);
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                  title="Organizar Slides"
                >
                  <List className="w-5 h-5" />
                </button>
                <div className="h-8 w-px bg-slate-700 mx-2"></div>
                <button
                  onClick={prevSlide}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>
                <button
                  onClick={nextSlide}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData(null);
                  }}
                  className="px-4 py-2 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700 transition-all text-sm font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveSlide}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all text-sm font-bold shadow-lg flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Salvar Alterações
                </button>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-slate-700"></div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full max-w-[1920px] mx-auto overflow-y-auto overflow-x-hidden relative p-4 md:p-8 flex flex-col justify-center min-h-[0px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide?.id || "empty"}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full flex-1 flex flex-col gap-4 sm:gap-6 lg:gap-8 min-h-[0px]"
          >
            {currentSlide?.type === "project" ? (
              <>
                <div className="flex justify-between items-end shrink-0">
                  <div>
                    <h1 className="text-3xl sm:text-5xl lg:text-[3vw] lg:leading-[3.5vw] font-black text-white font-display mb-2">
                      {currentSlide.data.name}
                    </h1>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={currentSlide.data.status} />
                      <span className="text-slate-400 text-sm sm:text-lg">
                        Início:{" "}
                        {new Date(
                          currentSlide.data.startDate,
                        ).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs sm:text-sm mb-1">
                      Slide
                    </p>
                    <p className="text-2xl sm:text-4xl font-black text-blue-500 font-mono">
                      {currentIndex + 1} / {slides.length}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 shrink-0">
                  <PresentationStatCard
                    label="Valor Total"
                    value={projectStats!.totalValue}
                    type="currency"
                    color="blue"
                  />
                  <PresentationStatCard
                    label="Avanço Físico"
                    value={projectStats!.percent}
                    type="percent"
                    color="emerald"
                  />
                  <PresentationStatCard
                    label="Avanço Financeiro"
                    value={projectStats!.percentInvoiced}
                    type="percent"
                    color="amber"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 flex-1 min-h-[400px]">
                  <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 p-6 flex flex-col">
                    <h3 className="text-lg 2xl:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5 2xl:w-6 2xl:h-6 text-blue-500" />
                      Evolução Financeira
                    </h3>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            {
                              name: "Contratado",
                              value: projectStats!.totalValue,
                              fill: "#3B82F6",
                            },
                            {
                              name: "Medido",
                              value: projectStats!.totalMeasured,
                              fill: "#10B981",
                            },
                            {
                              name: "Notas",
                              value: projectStats!.totalInvoices,
                              fill: "#F59E0B",
                            },
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#334155"
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "#94a3b8",
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                            dy={5}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#94a3b8", fontSize: 12 }}
                            tickFormatter={(val) =>
                              `R$ ${(val / 1000).toFixed(0)}k`
                            }
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "var(--color-slate-800)",
                              border: "1px solid #334155",
                              borderRadius: "12px",
                              color: "var(--color-white)",
                            }}
                            formatter={(val: number) =>
                              val.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })
                            }
                          />
                          <Bar
                            dataKey="value"
                            radius={[6, 6, 0, 0]}
                            barSize={50}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 p-6 flex flex-col">
                    <h3 className="text-lg 2xl:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 2xl:w-6 2xl:h-6 text-amber-500" />
                      Status do Cronograma
                    </h3>
                    <div className="flex-1 flex flex-col">
                      <div className="h-1/2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={scheduleStats!.filter((s) => s.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius="60%"
                              outerRadius="90%"
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {scheduleStats!
                                .filter((s) => s.value > 0)
                                .map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={scheduleColors[entry.name]}
                                  />
                                ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "var(--color-slate-800)",
                                border: "1px solid #334155",
                                borderRadius: "12px",
                                color: "var(--color-white)",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-4 2xl:mt-8">
                        {scheduleStats!.map((s) => (
                          <div key={s.name} className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 2xl:w-3 2xl:h-3 rounded-full"
                              style={{
                                backgroundColor: scheduleColors[s.name],
                              }}
                            ></div>
                            <span className="text-xs 2xl:text-sm text-slate-400 font-medium">
                              {s.name}:{" "}
                              <span className="text-white">{s.value}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                      {overallSlideSchedule && (
                        <div className="mt-auto pt-4 border-t border-slate-700/50 flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl">
                          <div className="flex flex-col">
                            <span className="text-[10px] 2xl:text-xs font-bold text-slate-500 uppercase tracking-widest">
                              Avanço
                            </span>
                            <span className="text-sm 2xl:text-xl font-black text-white">
                              {overallSlideSchedule.real}%
                            </span>
                          </div>
                          <div className="h-8 2xl:h-10 w-px bg-slate-700/50" />
                          <div className="flex flex-col text-right">
                            <span className="text-[10px] 2xl:text-xs font-bold text-slate-500 uppercase tracking-widest">
                              Base line
                            </span>
                            <span className="text-sm 2xl:text-xl font-black text-slate-400">
                              {overallSlideSchedule.expected}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 p-6 flex flex-col">
                    <h3 className="text-lg 2xl:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 2xl:w-6 2xl:h-6 text-emerald-500" />
                      Avanço Geral
                    </h3>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-full space-y-6 2xl:space-y-10">
                        <ActivityProgress
                          label="Físico"
                          percent={projectStats!.percent}
                          color="bg-blue-500/100"
                        />
                        <ActivityProgress
                          label="Financeiro"
                          percent={projectStats!.percentInvoiced}
                          color="bg-emerald-500/100"
                        />
                        <ActivityProgress
                          label="Pagamentos"
                          percent={projectStats!.percentDisbursed}
                          color="bg-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : currentSlide?.type === "disbursement" ? (
              <div className="w-full flex-1 flex flex-col gap-4 sm:gap-6 lg:gap-8 min-h-[0px] pb-6">
                <div className="flex justify-between items-end shrink-0">
                  <div>
                    <h1 className="text-3xl sm:text-5xl lg:text-[3vw] lg:leading-[3.5vw] font-black text-white font-display mb-2">
                      Desembolsos{" "}
                      <span className="text-blue-500">Financeiros</span>
                    </h1>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-sm sm:text-lg">
                        {location.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs sm:text-sm mb-1">
                      Slide
                    </p>
                    <p className="text-2xl sm:text-4xl font-black text-blue-500 font-mono">
                      {currentIndex + 1} / {slides.length}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 shrink-0">
                  <PresentationStatCard
                    label="Total do Contrato"
                    value={locDisbursementStats!.totalContract}
                    type="currency"
                    color="blue"
                  />
                  <PresentationStatCard
                    label="Total Financiamento"
                    value={locDisbursementStats!.totalFinancing}
                    type="currency"
                    color="blue"
                  />
                  <PresentationStatCard
                    label="Aguardando Desembolso"
                    value={locDisbursementStats!.totalPending}
                    type="currency"
                    color="amber"
                  />
                  <PresentationStatCard
                    label="Total Desembolsado"
                    value={locDisbursementStats!.totalDisbursed}
                    type="currency"
                    color="emerald"
                  />
                  <PresentationStatCard
                    label="Saldo Financiamento"
                    value={locDisbursementStats!.totalBalance}
                    type="currency"
                    color={
                      locDisbursementStats!.totalBalance >= 0 ? "blue" : "rose"
                    }
                  />
                </div>

                <div className="flex-1 bg-slate-800/40 rounded-3xl border border-slate-700/50 p-6 flex flex-col min-h-[400px]">
                  <h3 className="text-xl 2xl:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <LayoutDashboard className="w-6 h-6 text-emerald-500" />
                    Evolução de Pagamentos
                  </h3>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            name: "Financiamento",
                            value: locDisbursementStats!.totalFinancing,
                            fill: "#3B82F6",
                          },
                          {
                            name: "Desembolsado (Pago)",
                            value: locDisbursementStats!.totalDisbursed,
                            fill: "#10B981",
                          },
                          {
                            name: "Aguardando",
                            value: locDisbursementStats!.totalPending,
                            fill: "#F59E0B",
                          },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#334155"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "#94a3b8",
                            fontSize: 16,
                            fontWeight: 600,
                          }}
                          dy={5}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 13 }}
                          tickFormatter={(val) =>
                            `R$ ${(val / 1000).toFixed(0)}k`
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--color-slate-800)",
                            border: "1px solid #334155",
                            borderRadius: "12px",
                            color: "var(--color-white)",
                          }}
                          formatter={(val: number) =>
                            val.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })
                          }
                        />
                        <Bar
                          dataKey="value"
                          radius={[8, 8, 0, 0]}
                          barSize={80}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : currentSlide?.type === "rdo-dashboard" ? (
              <RDODashboardView
                project={currentSlide.data}
                startDate={currentRdoRange.start}
                endDate={currentRdoRange.end}
                onRangeChange={(start, end) =>
                  setRdoDateRanges((prev) => ({
                    ...prev,
                    [currentSlide.data.id]: { start, end },
                  }))
                }
              />
            ) : currentSlide?.type === "custom" ? (
              <div className="h-full flex flex-col relative">
                <div
                  className={cn(
                    "flex-1 flex items-center justify-center p-0 overflow-hidden",
                  )}
                >
                  <div
                    className={cn(
                      "aspect-video w-full max-h-full rounded-2xl border overflow-hidden relative transition-all shadow-2xl group/canvas",
                      isEditing
                        ? "bg-slate-900 border-blue-500/30 ring-1 ring-blue-500/20"
                        : "bg-slate-900 border-slate-700/50",
                    )}
                    style={{ maxWidth: "calc(100vh * 1.77)" }}
                  >
                    {/* Slide Info & Controls Overlay */}
                    <div className="absolute top-4 right-4 z-30 flex items-center gap-4 opacity-0 group-hover/canvas:opacity-100 transition-opacity">
                      <div className="bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                        <p className="text-xs font-black text-blue-400 font-mono">
                          {currentIndex + 1} / {slides.length}
                        </p>
                      </div>
                      {!isEditing && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditData(currentSlide.data);
                              setIsEditing(true);
                              setIsPlaying(false);
                            }}
                            className="p-2 bg-slate-900/60 backdrop-blur-md text-white hover:bg-blue-600 rounded-full transition-all border border-white/10"
                            title="Editar Slide"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteSlide(currentSlide.data.id)
                            }
                            className="p-2 bg-slate-900/60 backdrop-blur-md text-red-400 hover:bg-red-600 hover:text-white rounded-full transition-all border border-white/10"
                            title="Excluir Slide"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Canvas Toolbar */}
                    {isEditing && (
                      <div className="absolute top-4 left-4 z-10 flex gap-2">
                        <button
                          onClick={() => handleAddElement("text")}
                          className="p-3 bg-slate-800/80 backdrop-blur-md text-white rounded-xl border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-2 shadow-xl"
                        >
                          <Type className="w-4 h-4" />
                          Texto
                        </button>
                        <button
                          onClick={() => handleAddElement("image")}
                          className="p-3 bg-slate-800/80 backdrop-blur-md text-white rounded-xl border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-2 shadow-xl"
                        >
                          <ImageIcon className="w-4 h-4" />
                          Imagem
                        </button>
                        <button
                          onClick={() => {
                            if (!editData) return;
                            const bgElement: SlideElement = {
                              id:
                                "bg-" + Math.random().toString(36).substr(2, 9),
                              type: "image",
                              x: 0,
                              y: 0,
                              width: 3840, // 4K resolution default
                              height: 2160,
                              url: "https://picsum.photos/seed/bg/3840/2160",
                            };
                            setEditData((prev) => ({
                              ...prev,
                              elements: [
                                bgElement,
                                ...(prev?.elements || []).filter(
                                  (el) => !el.id.startsWith("bg-"),
                                ),
                              ],
                            }));
                          }}
                          className="p-3 bg-slate-800/80 backdrop-blur-md text-white rounded-xl border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-2 shadow-xl"
                          title="Adicionar imagem de fundo (PowerPoint)"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Fundo
                        </button>
                        <button
                          onClick={() => {
                            if (!editData) return;
                            setEditData((prev) => ({
                              ...prev,
                              elements: [],
                            }));
                          }}
                          className="p-3 bg-slate-800/80 backdrop-blur-md text-red-400 rounded-xl border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-2 shadow-xl"
                          title="Limpar todos os elementos do slide"
                        >
                          <Trash2 className="w-4 h-4" />
                          Limpar
                        </button>
                      </div>
                    )}

                    {/* Canvas Area */}
                    <div
                      ref={canvasRef}
                      className="w-full h-full relative overflow-hidden"
                    >
                      {(isEditing
                        ? editData?.elements
                        : currentSlide.data.elements
                      )?.map((el) => (
                        <motion.div
                          key={el.id}
                          drag={isEditing && !el.id.startsWith("bg-")}
                          dragMomentum={false}
                          onDragStart={(_, info) => {
                            if (
                              isEditing &&
                              !el.id.startsWith("bg-") &&
                              canvasRef.current
                            ) {
                              const rect =
                                canvasRef.current.getBoundingClientRect();
                              const elPxX = (el.x / 100) * rect.width;
                              const elPxY = (el.y / 100) * rect.height;
                              setDragOffset({
                                x: info.point.x - rect.left - elPxX,
                                y: info.point.y - rect.top - elPxY,
                              });
                            }
                          }}
                          onDragEnd={(_, info) => {
                            if (
                              isEditing &&
                              !el.id.startsWith("bg-") &&
                              canvasRef.current
                            ) {
                              const rect =
                                canvasRef.current.getBoundingClientRect();
                              const mouseX = info.point.x - rect.left;
                              const mouseY = info.point.y - rect.top;

                              const newX =
                                ((mouseX - dragOffset.x) / rect.width) * 100;
                              const newY =
                                ((mouseY - dragOffset.y) / rect.height) * 100;

                              const finalX = Math.max(
                                0,
                                Math.min(
                                  100 - (el.width / rect.width) * 100,
                                  newX,
                                ),
                              );
                              const finalY = Math.max(
                                0,
                                Math.min(
                                  100 - (el.height / rect.height) * 100,
                                  newY,
                                ),
                              );

                              handleUpdateElement(el.id, {
                                x: finalX,
                                y: finalY,
                              });
                            }
                          }}
                          style={{
                            position: "absolute",
                            left: `${el.x}%`,
                            top: `${el.y}%`,
                            width: el.id.startsWith("bg-") ? "100%" : el.width,
                            height: el.id.startsWith("bg-")
                              ? "100%"
                              : el.height,
                            zIndex: el.id.startsWith("bg-")
                              ? 5
                              : isEditing
                                ? 20
                                : 10,
                          }}
                          className={cn(
                            "group transition-shadow",
                            isEditing &&
                              !el.id.startsWith("bg-") &&
                              "cursor-move hover:ring-2 hover:ring-blue-500/50 rounded-lg",
                          )}
                        >
                          {el.type === "text" ? (
                            <div className="w-full h-full relative group/text">
                              {isEditing ? (
                                <>
                                  <textarea
                                    value={el.content}
                                    onChange={(e) =>
                                      handleUpdateElement(el.id, {
                                        content: e.target.value,
                                      })
                                    }
                                    className="w-full h-full bg-transparent text-white outline-none resize-none font-medium leading-relaxed"
                                    style={{
                                      fontSize: el.fontSize,
                                      color: el.color,
                                    }}
                                  />
                                  <div className="absolute -bottom-8 left-0 flex gap-1 opacity-0 group-hover/text:opacity-100 transition-opacity bg-slate-800 rounded-lg p-1 border border-slate-700 shadow-xl">
                                    <button
                                      onClick={() =>
                                        handleUpdateElement(el.id, {
                                          fontSize: (el.fontSize || 24) + 4,
                                        })
                                      }
                                      className="p-1 hover:bg-slate-700 rounded text-xs font-bold text-white"
                                    >
                                      A+
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleUpdateElement(el.id, {
                                          fontSize: Math.max(
                                            12,
                                            (el.fontSize || 24) - 4,
                                          ),
                                        })
                                      }
                                      className="p-1 hover:bg-slate-700 rounded text-xs font-bold text-white"
                                    >
                                      A-
                                    </button>
                                    <input
                                      type="color"
                                      value={
                                        el.color || "var(--color-slate-800)"
                                      }
                                      onChange={(e) =>
                                        handleUpdateElement(el.id, {
                                          color: e.target.value,
                                        })
                                      }
                                      className="w-4 h-4 mt-1 bg-transparent border-none cursor-pointer"
                                    />
                                  </div>
                                  <motion.div
                                    drag
                                    dragMomentum={false}
                                    onDrag={(_, info) => {
                                      handleUpdateElement(el.id, {
                                        width: Math.max(
                                          50,
                                          el.width + info.delta.x,
                                        ),
                                        height: Math.max(
                                          30,
                                          el.height + info.delta.y,
                                        ),
                                      });
                                    }}
                                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500/100 rounded-full cursor-se-resize flex items-center justify-center shadow-lg opacity-0 group-hover/text:opacity-100 transition-opacity z-30"
                                  >
                                    <Move className="w-2 h-2 text-white" />
                                  </motion.div>
                                </>
                              ) : (
                                <p
                                  style={{
                                    fontSize: el.fontSize,
                                    color: el.color,
                                  }}
                                  className="font-medium leading-relaxed"
                                >
                                  {el.content}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="w-full h-full relative group/img">
                              <img
                                src={el.url}
                                alt="Slide element"
                                className={cn(
                                  "w-full h-full rounded-xl shadow-2xl",
                                  el.id.startsWith("bg-")
                                    ? "object-fill"
                                    : "object-cover",
                                )}
                                referrerPolicy="no-referrer"
                                loading={
                                  el.id.startsWith("bg-") ? "eager" : "lazy"
                                }
                              />
                              {isEditing && (
                                <>
                                  <div
                                    className={cn(
                                      "absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center rounded-xl",
                                      el.url.includes("picsum.photos")
                                        ? "opacity-100"
                                        : "opacity-0 group-hover/img:opacity-100",
                                    )}
                                  >
                                    <div className="flex flex-col items-center gap-3">
                                      <label className="cursor-pointer p-4 bg-blue-600 text-white rounded-full hover:bg-blue-500/100 transition-all shadow-xl flex items-center gap-2">
                                        <Upload className="w-6 h-6" />
                                        <span className="font-bold pr-2">
                                          Trocar Imagem
                                        </span>
                                        <input
                                          type="file"
                                          className="hidden"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file)
                                              handleImageUpload(el.id, file);
                                          }}
                                        />
                                      </label>
                                      {el.id.startsWith("bg-") && (
                                        <p className="text-white/70 text-sm font-medium">
                                          Arraste seu slide do PowerPoint aqui
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {!el.id.startsWith("bg-") && (
                                    <motion.div
                                      drag
                                      dragMomentum={false}
                                      onDrag={(_, info) => {
                                        handleUpdateElement(el.id, {
                                          width: Math.max(
                                            50,
                                            el.width + info.delta.x,
                                          ),
                                          height: Math.max(
                                            50,
                                            el.height + info.delta.y,
                                          ),
                                        });
                                      }}
                                      className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500/100 rounded-full cursor-se-resize flex items-center justify-center shadow-lg opacity-0 group-hover/img:opacity-100 transition-opacity z-30"
                                    >
                                      <Move className="w-3 h-3 text-white" />
                                    </motion.div>
                                  )}
                                </>
                              )}
                            </div>
                          )}

                          {isEditing && (
                            <button
                              onClick={() => handleRemoveElement(el.id)}
                              className="absolute -top-3 -right-3 p-1.5 bg-red-500/100 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </motion.div>
                      ))}

                      {/* Fallback for empty slides */}
                      {!(
                        isEditing
                          ? editData?.elements
                          : currentSlide.data.elements
                      )?.length && (
                        <div className="w-full h-full flex flex-col items-center justify-center p-16 bg-slate-950">
                          <div className="text-center space-y-8">
                            <div className="space-y-2">
                              <h2 className="text-3xl font-black text-white font-display">
                                Slide em Branco
                              </h2>
                              <p className="text-slate-500 text-lg">
                                Comece adicionando uma imagem de fundo ou texto.
                              </p>
                            </div>

                            {isEditing && (
                              <div className="flex gap-4 justify-center">
                                <button
                                  onClick={() => {
                                    if (!editData) return;
                                    const bgElement: SlideElement = {
                                      id:
                                        "bg-" +
                                        Math.random().toString(36).substr(2, 9),
                                      type: "image",
                                      x: 0,
                                      y: 0,
                                      width: 3840,
                                      height: 2160,
                                      url: "https://picsum.photos/seed/bg/3840/2160",
                                    };
                                    setEditData((prev) => ({
                                      ...prev,
                                      elements: [bgElement],
                                    }));
                                  }}
                                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl flex items-center gap-3"
                                >
                                  <LayoutDashboard className="w-6 h-6" />
                                  Adicionar Fundo (PowerPoint)
                                </button>
                                <button
                                  onClick={() => handleAddElement("text")}
                                  className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all shadow-xl flex items-center gap-3"
                                >
                                  <Type className="w-6 h-6" />
                                  Adicionar Texto
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 italic">
                Nenhum slide disponível.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Sorter Modal */}
      <AnimatePresence>
        {showSorter && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white font-display flex items-center gap-2">
                  <List className="w-6 h-6 text-blue-500" />
                  Organizar Slides
                </h3>
                <button
                  onClick={() => setShowSorter(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all",
                      currentIndex === index
                        ? "bg-blue-600/20 border-blue-500/50"
                        : "bg-slate-900/50 border-slate-700 hover:border-slate-500",
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <button
                        disabled={index === 0}
                        onClick={() => moveSlide(index, index - 1)}
                        className="p-1 text-slate-500 hover:text-white disabled:opacity-0"
                      >
                        <ChevronRight className="w-4 h-4 -rotate-90" />
                      </button>
                      <button
                        disabled={index === slides.length - 1}
                        onClick={() => moveSlide(index, index + 1)}
                        className="p-1 text-slate-500 hover:text-white disabled:opacity-0"
                      >
                        <ChevronRight className="w-4 h-4 rotate-90" />
                      </button>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 font-mono text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">
                        {slide.type === "project"
                          ? slide.data.name
                          : slide.type === "rdo-dashboard"
                            ? `Status Obra: ${slide.data.name}`
                            : slide.type === "disbursement"
                              ? "Resumo de Desembolsos"
                              : (slide.data as any).title}
                      </p>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                        {slide.type === "project"
                          ? "Financeiro / Cronograma"
                          : slide.type === "rdo-dashboard"
                            ? "Dashboard de Campo (RDO)"
                            : slide.type === "disbursement"
                              ? "Desembolso (Financiamento)"
                              : "Slide Customizado"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentIndex(index);
                        setShowSorter(false);
                      }}
                      className="px-3 py-1.5 bg-slate-700 text-white rounded-lg text-xs font-bold hover:bg-slate-600"
                    >
                      Ir para
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-slate-700 bg-slate-800/50">
                <button
                  onClick={() => setShowSorter(false)}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
                >
                  Concluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Progress Bar at bottom */}
      <div className="h-1.5 bg-slate-800 w-full overflow-hidden">
        <motion.div
          key={`${currentIndex}-${isPlaying}-${isEditing}-${showSorter}`}
          initial={{ width: "0%" }}
          animate={{
            width: isPlaying && !isEditing && !showSorter ? "100%" : "0%",
          }}
          transition={{
            duration: isPlaying && !isEditing && !showSorter ? 10 : 0,
            ease: "linear",
          }}
          className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
        />
      </div>
    </div>
  );
}

function PresentationStatCard({
  label,
  value,
  type,
  color,
}: {
  label: string;
  value: number;
  type: "currency" | "percent";
  color: string;
}) {
  const colors: any = {
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    rose: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  };

  return (
    <div
      className={cn(
        "p-4 sm:p-5 lg:p-6 2xl:p-6 rounded-3xl border backdrop-blur-sm min-w-0 flex flex-col justify-center overflow-hidden",
        colors[color],
      )}
    >
      <p className="text-[10px] sm:text-xs lg:text-sm 2xl:text-sm font-bold uppercase tracking-widest mb-1 sm:mb-2 opacity-80 truncate">
        {label}
      </p>
      <p className="text-xl sm:text-2xl lg:text-2xl 2xl:text-3xl font-black font-display truncate">
        {type === "currency"
          ? value.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          : `${value.toFixed(1)}%`}
      </p>
    </div>
  );
}

function ActivityProgress({
  label,
  percent,
  color,
}: {
  label: string;
  percent: number;
  color: string;
}) {
  return (
    <div className="space-y-3 2xl:space-y-4">
      <div className="flex justify-between items-end">
        <span className="text-slate-300 font-bold text-lg lg:text-xl 2xl:text-2xl">
          {label}
        </span>
        <span className="text-3xl lg:text-4xl 2xl:text-5xl font-black text-white">
          {percent.toFixed(1)}%
        </span>
      </div>
      <div className="h-5 lg:h-6 2xl:h-8 bg-slate-700/50 rounded-full overflow-hidden p-1 border border-slate-600/30">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={cn("h-full rounded-full shadow-lg", color)}
        />
      </div>
    </div>
  );
}

function ProjectList({
  location,
  projects,
  onSelectProject,
  onAddProject,
  onDeleteProject,
  onBack,
  onUpdateLocation,
  user,
  onUpdateProject,
}: {
  location?: Location;
  projects: Project[];
  onSelectProject: (id: string) => void;
  onAddProject: (p: Project) => void;
  onDeleteProject: (id: string) => void;
  onBack: () => void;
  onUpdateLocation: (l: Location) => void;
  user: any;
  onUpdateProject: (p: Project) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);
  const [activeLocationTab, setActiveLocationTab] = useState<'obras'|'desembolso'|'controle_envios'>('obras');
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newStatus, setNewStatus] = useState<Status>("Em Execução");

  const { role: locationRole } = usePermissions(location, undefined, user);

  const locationStats = useMemo(() => {
    let totalValue = 0;
    let totalMeasured = 0;
    let totalScheduledProgressValue = 0;
    let totalInvoices = 0;
    let totalDisbursements = 0;

    projects.forEach((p) => {
      const stats = calculateProjectStats(p);
      totalValue += stats.totalValue;
      totalMeasured += stats.totalMeasured;
      totalScheduledProgressValue += stats.totalScheduledProgressValue;
      totalInvoices += stats.totalInvoices;
    });

    totalDisbursements = (location?.disbursements || []).reduce(
      (sum, d) => sum + d.value,
      0,
    );

    const physicalPercent =
      totalValue > 0 ? (totalScheduledProgressValue / totalValue) * 100 : 0;
    const financialPercent =
      totalValue > 0 ? (totalInvoices / totalValue) * 100 : 0;
    const disbursementPercent =
      totalValue > 0 ? (totalDisbursements / totalValue) * 100 : 0;

    return {
      totalValue,
      totalMeasured,
      totalScheduledProgressValue,
      totalInvoices,
      totalDisbursements,
      physicalPercent,
      financialPercent,
      disbursementPercent,
    };
  }, [projects, location]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      locationId: location.id,
      startDate: newDate,
      status: newStatus,
      services: [],
      measurements: [],
      invoices: [],
      ocs: [],
      enabledTabs: AVAILABLE_TABS.map((t) => t.id),
      ownerId: user.uid,
      sharedWith: location.sharedWith || {},
      sharedEmails: location.sharedEmails || [],
    };
    onAddProject(newProject);
    setShowModal(false);
    setNewName("");
    setNewDate("");
  };

  if (!location) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={onBack}
          className="p-2.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white font-display tracking-tight">
            Obras em {location.name}
          </h2>
          <p className="text-slate-400 font-medium">
            Gestão consolidada de performance
          </p>
        </div>
      </div>

      {/* Dashboard do Local */}
      <div className="grid grid-cols-1 gap-6 px-1">
        <div className="airo-card p-6 border-l-4 border-l-blue-600">
          <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">
            Patrimônio Gerido
          </p>
          <p className="text-2xl font-black text-white">
            {locationStats.totalValue.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between lg:items-center mt-8 px-1 gap-4 lg:gap-0 pb-4 border-b border-slate-800">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
          <button
            onClick={() => setActiveLocationTab('obras')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all shadow-sm flex items-center gap-2",
              activeLocationTab === 'obras'
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700",
            )}
          >
            <Building2 className="w-5 h-5" />
            Lista de Obras
          </button>
          <button
            onClick={() => setActiveLocationTab('desembolso')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all shadow-sm flex items-center gap-2",
              activeLocationTab === 'desembolso'
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                : "bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700",
            )}
          >
            <Wallet className="w-5 h-5" />
            Desembolso Financeiro
          </button>
          <button
            onClick={() => setActiveLocationTab('controle_envios')}
            className={cn(
              "px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all shadow-sm flex items-center gap-2",
              activeLocationTab === 'controle_envios'
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                : "bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700",
            )}
          >
            <Send className="w-5 h-5" />
            Controle de Envios
          </button>
        </div>

        <div className="flex gap-4 shrink-0">
          {projects.length > 0 && (
            <button
              onClick={() => setShowPresentation(true)}
              className="bg-slate-900 border border-slate-800 text-slate-300 px-6 py-3 rounded-2xl flex items-center gap-3 hover:bg-slate-800 hover:text-white transition-all shadow-xl font-bold active:scale-[0.98]"
            >
              <Presentation className="w-5 h-5 text-blue-500" />
              Apresentação
            </button>
          )}
          {activeLocationTab === 'obras' && locationRole !== "viewer" && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-3 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-xl shadow-blue-600/20 font-black active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" />
              Nova Obra
            </button>
          )}
        </div>
      </div>

      {showPresentation && (
        <LocationPresentation
          location={location}
          projects={projects}
          onClose={() => setShowPresentation(false)}
          onUpdateLocation={onUpdateLocation}
        />
      )}

      {activeLocationTab === 'desembolso' ? (
        <div className={cn("mt-8 animate-in fade-in duration-500", locationRole === "viewer" ? "viewer-mode" : "")}>
          <TabDesembolso
            location={location}
            onUpdateLocation={onUpdateLocation}
          />
        </div>
      ) : activeLocationTab === 'controle_envios' ? (
        <div className={cn("mt-8 animate-in fade-in duration-500", locationRole === "viewer" ? "viewer-mode" : "")}>
          <TabControleEnvios
            location={location}
            onUpdateLocation={onUpdateLocation}
          />
        </div>
      ) : (
        <div className="bg-slate-900/40 rounded-[2rem] shadow-2xl border border-slate-800/50 overflow-hidden animate-in fade-in duration-500 mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px] whitespace-nowrap">
              <thead className="bg-slate-950 border-b border-slate-800/80">
                <tr>
                  <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">
                    Nome da Obra
                  </th>
                  <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">
                    Valor Total
                  </th>
                  <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">
                    % Executado
                  </th>
                  <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">
                    Status
                  </th>
                  <th className="px-8 py-5 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-14">
                      <div className="splan-empty-state min-h-[220px]">
                        <div className="splan-empty-icon">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold font-display text-lg">
                            Nenhuma obra cadastrada
                          </h3>
                          <p className="text-sm text-slate-400 mt-1">
                            Use o botão Nova Obra para começar o acompanhamento.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {projects.map((project) => {
                  const { totalValue, percent } = calculateProjectStats(project);
                  return (
                    <tr
                      key={project.id}
                      onClick={() => onSelectProject(project.id)}
                      className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="bg-slate-800 p-2.5 rounded-xl group-hover:bg-blue-600 transition-all">
                            <Building2 className="w-5 h-5 text-blue-500 group-hover:text-white" />
                          </div>
                          <span className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-wide">
                            {project.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-white">
                          {totalValue.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <span>Avanço</span>
                            <span className="text-blue-400">
                              {percent.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              className="bg-blue-600 h-full rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="bg-blue-600/10 text-blue-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2">
                            Acessar <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectToDelete(project.id);
                              setShowConfirmModal(true);
                            }}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all"
                            title="Excluir obra"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-800"
          >
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold font-display">Excluir Obra</h3>
            </div>
            <p className="text-slate-400 mb-6">
              Tem certeza que deseja excluir esta obra? Todos os dados
              associados (serviços, medições, notas, etc.) serão permanentemente
              apagados.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setProjectToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-950 transition-colors font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (projectToDelete) {
                    onDeleteProject(projectToDelete);
                    setShowConfirmModal(false);
                    setProjectToDelete(null);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold shadow-sm"
              >
                Excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-800 relative"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
            <h3 className="text-xl font-bold mb-4 font-display text-white">
              Cadastrar Nova Obra
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-400">
                  Nome da Obra
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-400">
                  Data de Início
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-400">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Status)}
                  className="w-full px-4 py-2 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-900"
                >
                  <option value="Em Execução">Em Execução</option>
                  <option value="Pausada">Pausada</option>
                  <option value="Finalizada">Finalizada</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-950 transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-sm"
                >
                  Salvar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

// --- Project Dashboard ---

function ProjectDashboard({
  project,
  location,
  user,
  onBack,
  onUpdateProject,
  onUpdateLocation,
  onDeleteProject,
}: {
  project: Project;
  location: Location;
  user: any;
  onBack: () => void;
  onUpdateProject: (p: Project) => void;
  onUpdateLocation: (l: Location) => void;
  onDeleteProject: () => void;
}) {
  const { role, allowedTabs } = usePermissions(location, project, user);
  const projectTabs = useMemo(() => {
    const tabs = AVAILABLE_TABS.map((t) => t.id).filter((tabId) =>
      hasTabAccess(tabId, role, allowedTabs),
    );
    // Ensure 'ocs' is included for owners even if not in allowedTabs (for legacy data)
    if (role === "owner" && !tabs.includes("ocs")) {
      tabs.splice(4, 0, "ocs");
    }
    return tabs;
  }, [role, allowedTabs]);
  const [activeTab, setActiveTab] = useState<
    | "resumo"
    | "servicos"
    | "medicoes"
    | "financeiro"
    | "notas"
    | "ocs"
    | "desembolso"
    | "cronograma"
    | "compartilhar"
    | "rdo"
    | "prestadores"
  >("resumo");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [newName, setNewName] = useState(project.name);
  const [pendingTabs, setPendingTabs] = useState<string[]>([]);
  const [pendingName, setPendingName] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Calculations
  const stats = useMemo(() => {
    const nonMacroServices = project.services.filter((s) => !s.isMacro);
    const totalValue = nonMacroServices.reduce(
      (sum, s) => sum + (s.quantity || 0) * (s.unitPrice || 0),
      0,
    );
    const totalMeasured = project.measurements.reduce((sum, m) => {
      const service = project.services.find((s) => s.id === m.serviceId);
      return sum + (m.quantity || 0) * (service?.unitPrice || 0);
    }, 0);
    const totalScheduledProgressValue = nonMacroServices.reduce((sum, s) => {
      return sum + ((s.progress || 0) / 100) * (s.quantity * s.unitPrice);
    }, 0);
    const totalInvoices = (project.invoices || []).reduce(
      (sum, inv) => sum + inv.value,
      0,
    );
    const totalDisbursements = (project.disbursements || []).reduce(
      (sum, d) => sum + d.value,
      0,
    );

    const balance = totalValue - totalMeasured;
    const percent =
      totalValue > 0 ? (totalScheduledProgressValue / totalValue) * 100 : 0;
    const percentInvoiced =
      totalValue > 0 ? (totalInvoices / totalValue) * 100 : 0;
    const percentDisbursed =
      totalValue > 0 ? (totalDisbursements / totalValue) * 100 : 0;

    return {
      totalValue,
      totalMeasured,
      totalScheduledProgressValue,
      balance,
      percent,
      totalInvoices,
      percentInvoiced,
      totalDisbursements,
      percentDisbursed,
    };
  }, [project]);

  const overallSimulation = useMemo(() => {
    const today = new Date();
    const nonMacros = project.services.filter(
      (s) => !s.isMacro && s.startDate && s.endDate,
    );
    if (nonMacros.length === 0)
      return { real: 0, expected: 0, diff: 0, isLate: false };

    const totals = nonMacros.reduce(
      (acc, s) => {
        const start = new Date(s.startDate!).getTime();
        const end = new Date(s.endDate!).getTime();
        const totalDuration = end - start;
        const elapsed = today.getTime() - start;

        let expected = 0;
        if (elapsed < 0) expected = 0;
        else if (elapsed > totalDuration) expected = 100;
        else expected = Math.round((elapsed / totalDuration) * 100);

        return {
          real: acc.real + (s.progress || 0),
          expected: acc.expected + expected,
        };
      },
      { real: 0, expected: 0 },
    );

    const real = Math.round(totals.real / nonMacros.length);
    const expected = Math.round(totals.expected / nonMacros.length);
    const diff = real - expected;

    return {
      real,
      expected,
      diff,
      isLate: real < expected - 5,
    };
  }, [project]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiInsight(null);
    try {
      const insight = await analyzeProjectInsights({
        name: project.name,
        stats,
        overallSimulation,
      });
      setAiInsight(insight || null);
    } catch (error) {
      toast.error("Erro na análise de IA. Tente novamente mais tarde.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const serviceStats = useMemo(() => {
    return project.services.map((s) => {
      if (s.isMacro) {
        const children = project.services.filter(
          (child) => child.parentId === s.id,
        );
        const totalValue = children.reduce(
          (sum, child) => sum + child.quantity * child.unitPrice,
          0,
        );
        const measuredValue = children.reduce((sum, child) => {
          const measuredQty = project.measurements
            .filter((m) => m.serviceId === child.id)
            .reduce((sumM, m) => sumM + m.quantity, 0);
          return sum + measuredQty * child.unitPrice;
        }, 0);

        return {
          ...s,
          measuredQty: 0,
          balance: 0,
          totalValue,
          measuredValue,
        };
      }

      const measuredQty = project.measurements
        .filter((m) => m.serviceId === s.id)
        .reduce((sum, m) => sum + m.quantity, 0);
      return {
        ...s,
        measuredQty,
        balance: s.quantity - measuredQty,
        totalValue: s.quantity * s.unitPrice,
        measuredValue: measuredQty * s.unitPrice,
      };
    });
  }, [project]);

  return (
    <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 items-start relative min-h-[calc(100vh-140px)]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-6 sticky top-[96px] h-[calc(100vh-140px)] justify-between card-shadow overflow-y-auto custom-scrollbar">
        <div className="space-y-6">
          {/* Back button and title */}
          <div className="space-y-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors group px-2 py-1.5 hover:bg-slate-800/40 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Voltar às Obras
            </button>
            <div className="border-b border-slate-800/60 pb-4 px-2">
              <h3 className="text-xl font-bold font-display text-white truncate" title={project.name}>
                {project.name}
              </h3>
              <div className="flex items-center gap-2 mt-1.5">
                <StatusBadge status={project.status} />
              </div>
            </div>
          </div>

          {/* Tab list */}
          <nav className="space-y-1.5">
            {projectTabs.map((tabId) => {
              const tabMeta = AVAILABLE_TABS.find((t) => t.id === tabId);
              const active = activeTab === tabId;
              return (
                <button
                  key={tabId}
                  onClick={() => setActiveTab(tabId as any)}
                  className={cn(
                    "w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all text-left relative overflow-hidden group cursor-pointer",
                    active
                      ? "bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/30 text-blue-400"
                      : "text-slate-400 hover:text-white border border-transparent hover:bg-slate-800/30"
                  )}
                >
                  {/* Subtle active glow light indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r-full" />
                  )}
                  <span className={cn("transition-transform group-hover:scale-105 shrink-0", active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")}>
                    {tabMeta?.icon}
                  </span>
                  <span className="truncate">{tabMeta?.label || tabId}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with progress stats */}
        <div className="border-t border-slate-800/60 pt-4 mt-6 space-y-4">
          <div className="bg-slate-950/40 border border-slate-800/50 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avanço Físico</span>
              <span className="text-sm font-bold text-blue-500">{stats.percent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/60">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                style={{ width: `${stats.percent}%` }}
              />
            </div>
          </div>
          
          <button
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
            className={cn(
              "w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer",
              isAnalyzing
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/15 active:scale-95"
            )}
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Presentation className="w-4 h-4" />
                Insight IA
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            {/* Sidebar Sheet */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-[280px] bg-slate-900 border-r border-slate-800/80 p-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
                  <div className="min-w-0">
                    <h3 className="font-bold font-display text-white text-lg truncate">
                      {project.name}
                    </h3>
                    <div className="mt-1">
                      <StatusBadge status={project.status} />
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                  {projectTabs.map((tabId) => {
                    const tabMeta = AVAILABLE_TABS.find((t) => t.id === tabId);
                    const active = activeTab === tabId;
                    return (
                      <button
                        key={tabId}
                        onClick={() => {
                          setActiveTab(tabId as any);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left relative cursor-pointer",
                          active
                            ? "bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/30 text-blue-400"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/30 border border-transparent"
                        )}
                      >
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r-full" />
                        )}
                        <span className={active ? "text-blue-400" : "text-slate-500"}>
                          {tabMeta?.icon}
                        </span>
                        <span className="truncate">{tabMeta?.label || tabId}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-slate-800/60 pt-4 space-y-4">
                <div className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-3.5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avanço Físico</span>
                    <span className="text-xs font-bold text-blue-500">{stats.percent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800/60">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                      style={{ width: `${stats.percent}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    handleAIAnalysis();
                  }}
                  disabled={isAnalyzing}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer",
                    isAnalyzing
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  )}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Presentation className="w-4 h-4" />
                      Insight IA
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6 lg:space-y-8 py-2 min-w-0 flex-1 w-full"
      >
        {/* Desktop Header (Hidden on Mobile) */}
        <div className="hidden lg:flex items-center justify-between bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 rounded-[2rem] card-shadow">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Projeto Ativo</span>
              <div className="h-1 w-1 bg-slate-700 rounded-full" />
              <p className="text-slate-400 text-xs font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Início: {new Date(project.startDate).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <h2 className="text-3xl font-extrabold text-white font-display tracking-tight mt-1">
              {project.name}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {role !== "viewer" && (
              <div className="flex items-center gap-1.5 bg-slate-950/40 border border-slate-800/60 p-1.5 rounded-2xl">
                <button
                  onClick={() => {
                    setNewName(project.name);
                    setPendingTabs(projectTabs);
                    setShowEditModal(true);
                  }}
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800/60 rounded-xl transition-all"
                  title="Editar obra"
                >
                  <Edit2 className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/60 rounded-xl transition-all"
                  title="Excluir obra"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            )}
            <div className="bg-slate-950/40 border border-slate-800/60 px-4 py-2 rounded-2xl">
              <StatusBadge status={project.status} />
            </div>
          </div>
        </div>

        {/* Mobile Navbar with drawer trigger */}
        <div className="flex lg:hidden items-center justify-between bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-4 rounded-2xl gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="p-2.5 bg-slate-950/40 border border-slate-800/60 hover:bg-slate-800/50 text-slate-400 hover:text-white rounded-xl transition-all"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2.5 bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 text-blue-400 rounded-xl transition-all flex items-center gap-1.5"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider hidden xs:inline">Menu</span>
            </button>
            
            <div className="min-w-0">
              <h3 className="font-extrabold text-white text-base md:text-lg tracking-tight truncate">
                {project.name}
              </h3>
              <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1 truncate mt-0.5">
                <Calendar className="w-3 h-3" />
                Início: {new Date(project.startDate).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {role !== "viewer" && (
              <>
                <button
                  onClick={() => {
                    setNewName(project.name);
                    setPendingTabs(projectTabs);
                    setShowEditModal(true);
                  }}
                  className="p-2 bg-slate-800/30 text-slate-500 hover:text-blue-400 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="p-2 bg-slate-800/30 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

      {/* AI Insight Section */}
      {aiInsight && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="airo-card p-6 bg-blue-600/50 border border-blue-500/20 rounded-[2rem] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Presentation className="w-16 h-16 text-blue-500" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Presentation className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                Análise Estratégica IA
              </h3>
            </div>
            <button
              onClick={() => setAiInsight(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="text-slate-200 text-sm leading-relaxed space-y-4 relative z-10 font-medium">
            {aiInsight
              .split("\n")
              .filter((p) => p.trim())
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
          </div>
        </motion.div>
      )}

      {/* Tab Content */}
      <div className={cn("w-full", role === "viewer" ? "viewer-mode" : "")}>
        {activeTab === "resumo" && (
          <TabResumo
            stats={stats}
            project={project}
            serviceStats={serviceStats}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === "servicos" && (
          <TabServicos
            services={serviceStats}
            onAdd={(s) =>
              onUpdateProject({
                ...project,
                services: [...project.services, s],
              })
            }
            onDelete={(id) => {
              const childrenIds = project.services
                .filter((s) => s.parentId === id)
                .map((s) => s.id);
              const idsToDelete = [id, ...childrenIds];
              onUpdateProject({
                ...project,
                services: project.services.filter(
                  (s) => !idsToDelete.includes(s.id),
                ),
                measurements: project.measurements.filter(
                  (m) => !idsToDelete.includes(m.serviceId),
                ),
              });
            }}
            onUpdate={(id, updates) =>
              onUpdateProject({
                ...project,
                services: project.services.map((s) =>
                  s.id === id ? { ...s, ...updates } : s,
                ),
              })
            }
          />
        )}
        {activeTab === "medicoes" && (
          <TabMedicoes
            project={project}
            serviceStats={serviceStats}
            onAddMeasurement={(m) =>
              onUpdateProject({
                ...project,
                measurements: [...project.measurements, m],
              })
            }
            onAddMeasurements={(ms) =>
              onUpdateProject({
                ...project,
                measurements: [...project.measurements, ...ms],
              })
            }
            onDeleteMeasurement={(id) =>
              onUpdateProject({
                ...project,
                measurements: project.measurements.filter((m) => m.id !== id),
              })
            }
            onUpdateMeasurement={(id, qty) =>
              onUpdateProject({
                ...project,
                measurements: project.measurements.map((m) =>
                  m.id === id ? { ...m, quantity: qty } : m,
                ),
              })
            }
            onAddPeriod={(p) =>
              onUpdateProject({
                ...project,
                measurementPeriods: [...(project.measurementPeriods || []), p],
              })
            }
            onDeletePeriod={(id) =>
              onUpdateProject({
                ...project,
                measurementPeriods: (project.measurementPeriods || []).filter(
                  (p) => p.id !== id,
                ),
                measurements: project.measurements.filter(
                  (m) => m.periodId !== id,
                ),
              })
            }
            onAddProvider={(provider) =>
              onUpdateProject({
                ...project,
                providers: [...(project.providers || []), provider],
              })
            }
            onDeleteProvider={(id) =>
              onUpdateProject({
                ...project,
                providers: (project.providers || []).filter((p) => p.id !== id),
              })
            }
            onUpdateProvider={(id, updates) =>
              onUpdateProject({
                ...project,
                providers: (project.providers || []).map((p) =>
                  p.id === id ? { ...p, ...updates } : p,
                ),
              })
            }
            onUpdateProject={onUpdateProject}
          />
        )}
        {activeTab === "financeiro" && (
          <TabFinanceiro project={project} stats={stats} />
        )}
        {activeTab === "notas" && (
          <TabNotasFiscais
            project={project}
            onAdd={(inv) => {
              onUpdateProject({
                ...project,
                invoices: [...(project.invoices || []), inv],
              });
            }}
            onAddMultiple={(invs) => {
              onUpdateProject({
                ...project,
                invoices: [...(project.invoices || []), ...invs],
              });
            }}
            onDelete={(id) =>
              onUpdateProject({
                ...project,
                invoices: (project.invoices || []).filter(
                  (inv) => inv.id !== id,
                ),
              })
            }
            onUpdate={(id, updates) => {
              onUpdateProject({
                ...project,
                invoices: (project.invoices || []).map((inv) =>
                  inv.id === id ? { ...inv, ...updates } : inv,
                ),
              });
            }}
          />
        )}
        {activeTab === "ocs" && (
          <TabOcs
            project={project}
            onAdd={(oc) =>
              onUpdateProject({ ...project, ocs: [...(project.ocs || []), oc] })
            }
            onDelete={(id) =>
              onUpdateProject({
                ...project,
                ocs: (project.ocs || []).filter((oc) => oc.id !== id),
              })
            }
            onUpdate={(id, updates) =>
              onUpdateProject({
                ...project,
                ocs: (project.ocs || []).map((oc) =>
                  oc.id === id ? { ...oc, ...updates } : oc,
                ),
              })
            }
          />
        )}
        {activeTab === "cronograma" && (
          <TabCronograma
            project={project}
            onUpdateService={(id, updates) =>
              onUpdateProject({
                ...project,
                services: project.services.map((s) =>
                  s.id === id ? { ...s, ...updates } : s,
                ),
              })
            }
          />
        )}
        {activeTab === "rdo" && (
          <RdoTab project={project} onUpdateProject={onUpdateProject} />
        )}
        {activeTab === "compartilhar" && (
          <TabCompartilharProjeto
            project={project}
            onUpdateProject={onUpdateProject}
          />
        )}
      </div>

      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-800"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white font-display">
                  Editar Obra
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newName.trim()) {
                    onUpdateProject({ ...project, name: newName.trim() });
                    setShowEditModal(false);
                  }
                }}
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Nome da Obra
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Nome da obra"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-950 transition-colors font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-sm"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 border border-slate-800"
            >
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold font-display">Excluir Obra</h3>
              </div>
              <p className="text-slate-400 mb-6">
                Tem certeza que deseja excluir a obra{" "}
                <strong className="text-white">"{project.name}"</strong>? Todos
                os dados associados serão permanentemente apagados.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-950 transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onDeleteProject();
                    setShowConfirmModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold shadow-sm"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
}

// --- Sub-Tabs ---

function TabResumo({
  stats,
  project,
  serviceStats,
  onNavigate,
}: {
  stats: any;
  project: Project;
  serviceStats: any[];
  onNavigate: (
    tab:
      | "resumo"
      | "servicos"
      | "medicoes"
      | "financeiro"
      | "notas"
      | "desembolso"
      | "cronograma",
  ) => void;
}) {
  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#6366F1",
    "#EC4899",
    "#8B5CF6",
  ];

  const barData = serviceStats
    .filter((s) => !s.isMacro)
    .map((s) => ({
      name: s.name,
      contratado: s.quantity,
      medido: s.measuredQty,
    }));

  const scheduleStats = useMemo(() => {
    const today = new Date();
    const stats = {
      Adiantada: 0,
      Atrasada: 0,
      "No Prazo": 0,
      "Não Iniciada": 0,
      Finalizada: 0,
    };

    project.services
      .filter((s) => !s.isMacro)
      .forEach((service) => {
        const start = service.startDate ? new Date(service.startDate) : null;
        const end = service.endDate ? new Date(service.endDate) : null;
        const progress = service.progress || 0;

        let expectedProgress = 0;
        let status: keyof typeof stats = "Não Iniciada";

        if (start && end) {
          const totalDuration = end.getTime() - start.getTime();
          const elapsed = today.getTime() - start.getTime();

          if (elapsed < 0) {
            expectedProgress = 0;
          } else if (elapsed > totalDuration) {
            expectedProgress = 100;
          } else {
            expectedProgress = Math.round((elapsed / totalDuration) * 100);
          }

          if (progress >= 100) {
            status = "Finalizada";
          } else if (progress === 0 && elapsed < 0) {
            status = "Não Iniciada";
          } else if (progress > expectedProgress + 5) {
            status = "Adiantada";
          } else if (progress < expectedProgress - 5) {
            status = "Atrasada";
          } else {
            status = "No Prazo";
          }
        }
        stats[status]++;
      });

    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [project.services]);

  const scheduleColors: Record<string, string> = {
    Adiantada: "#3B82F6",
    Atrasada: "#EF4444",
    "No Prazo": "#10B981",
    "Não Iniciada": "#9CA3AF",
    Finalizada: "#6366F1",
  };

  const comparisonData = [
    {
      name: "Total Obra",
      value: stats.totalValue,
      fill: "#3B82F6",
      tab: "servicos",
    },
    {
      name: "Medido",
      value: stats.totalMeasured,
      fill: "#10B981",
      tab: "medicoes",
    },
    { name: "Saldo", value: stats.balance, fill: "#F59E0B", tab: "medicoes" },
    {
      name: "Notas",
      value: stats.totalInvoices,
      fill: "#E11D48",
      tab: "notas",
    },
  ];

  const percentComparisonData = [
    {
      name: "Físico",
      value: stats.percent,
      fill: "#3B82F6",
      tab: "cronograma",
    },
    {
      name: "Financeiro",
      value: stats.percentInvoiced,
      fill: "#10B981",
      tab: "notas",
    },
  ];
  const hasScheduleData = project.services.some((service) => !service.isMacro);

  return (
    <div className="space-y-6">
      {/* Resumo removido por solicitação */}

      {/* Row 3: Service Analysis */}
      <div className="grid grid-cols-1 gap-6">
        {/* Schedule Status Chart */}
        <div
          onClick={() => onNavigate("cronograma")}
          className="airo-card p-8 rounded-[2rem] border border-slate-800/50 cursor-pointer hover:border-blue-500/50 transition-all group"
        >
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
                  Status Temporal
                </h3>
                <p className="text-lg font-bold text-white uppercase tracking-tight">
                  Cronograma por Serviço
                </p>
              </div>
              {scheduleStats.find((s) => s.name === "Atrasada")?.value! > 0 && (
                <div className="flex items-center gap-2 text-red-400 animate-pulse bg-red-500/100/10 border border-red-500/20 px-3 py-1.5 rounded-full backdrop-blur-md">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black tracking-widest uppercase">
                    Atrasos Detectados
                  </span>
                </div>
              )}
            </div>
            <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/10">
              <Calendar className="w-5 h-5 text-blue-500 group-hover:text-white" />
            </div>
          </div>
          {hasScheduleData ? (
            <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={scheduleStats}
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="var(--color-slate-800)"
                  strokeOpacity={0.5}
                />
                <XAxis
                  type="number"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontWeight: 900 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontWeight: 900 }}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: "rgba(30, 41, 59, 0.4)", radius: 8 }}
                  contentStyle={{
                    backgroundColor: "var(--color-slate-900)",
                    borderRadius: "1rem",
                    border: "1px solid #1e293b",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "var(--color-white)",
                  }}
                  itemStyle={{ color: "var(--color-white)" }}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                  {scheduleStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={scheduleColors[entry.name]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          ) : (
            <div className="splan-empty-state mt-4 min-h-[260px]">
              <div className="splan-empty-icon">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold font-display text-lg">
                  Cronograma ainda sem servicos
                </h3>
                <p className="text-sm text-slate-400 mt-1 max-w-md">
                  Cadastre servicos com datas de inicio e fim para visualizar o status temporal da obra.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabServicos({
  services,
  onAdd,
  onDelete,
  onUpdate,
}: {
  services: any[];
  onAdd: (s: Service) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Service>) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    quantity: "",
    unitPrice: "",
  });
  const [isMacroForNew, setIsMacroForNew] = useState(false);
  const [parentIdForNew, setParentIdForNew] = useState<string | null>(null);
  const [expandedMacros, setExpandedMacros] = useState<Record<string, boolean>>(
    {},
  );

  const toggleMacro = (id: string) => {
    setExpandedMacros((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const sortedServices = useMemo(() => {
    const macros = services.filter((s) => s.isMacro);
    const itemsWithoutParent = services.filter(
      (s) => !s.isMacro && !s.parentId,
    );

    let result: any[] = [];
    macros.forEach((macro) => {
      result.push(macro);
      const children = services.filter((s) => s.parentId === macro.id);
      result = [...result, ...children];
    });
    result = [...result, ...itemsWithoutParent];
    return result;
  }, [services]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newService: Service = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      unit: isMacroForNew ? "" : formData.unit,
      quantity: isMacroForNew ? 0 : Number(formData.quantity),
      unitPrice: isMacroForNew ? 0 : Number(formData.unitPrice),
      isMacro: isMacroForNew,
      parentId: parentIdForNew || undefined,
    };
    onAdd(newService);
    setShowModal(false);
    setFormData({ name: "", unit: "", quantity: "", unitPrice: "" });
    setIsMacroForNew(false);
    setParentIdForNew(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight uppercase">
            Planilha de Serviços
          </h3>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
            Gestão de Itens e Orçamento
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setIsMacroForNew(true);
              setParentIdForNew(null);
              setShowModal(true);
            }}
            className="bg-slate-800/50 text-slate-300 px-5 py-2.5 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-800 hover:text-white transition-all font-black uppercase tracking-widest border border-slate-700/50"
          >
            <Folder className="w-4 h-4" /> Item Macro
          </button>
          <button
            onClick={() => {
              setIsMacroForNew(false);
              setParentIdForNew(null);
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 text-xs hover:bg-blue-500/100 transition-all font-black uppercase tracking-widest shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Adicionar Serviço
          </button>
        </div>
      </div>

      <div className="bg-slate-900/40 rounded-[2rem] border border-slate-800/50 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-[11px] min-w-[900px] whitespace-nowrap">
            <thead className="bg-slate-950 border-b border-slate-800/80">
              <tr>
                <th className="px-5 py-4 font-black text-slate-500 uppercase tracking-[0.2em] w-[35%]">
                  Nome do Serviço
                </th>
                <th className="px-3 py-4 font-black text-slate-500 uppercase tracking-[0.2em]">
                  Unid.
                </th>
                <th className="px-3 py-4 font-black text-slate-500 uppercase tracking-[0.2em] text-right">
                  Qtd Contratada
                </th>
                <th className="px-3 py-4 font-black text-slate-500 uppercase tracking-[0.2em] text-right">
                  Valor Unit.
                </th>
                <th className="px-3 py-4 font-black text-slate-500 uppercase tracking-[0.2em] text-right">
                  Total
                </th>
                <th className="px-3 py-4 font-black text-slate-500 uppercase tracking-[0.2em] text-right">
                  Saldo
                </th>
                <th className="px-5 py-4 font-black text-slate-500 uppercase tracking-[0.2em] text-center">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {sortedServices.map((s) => {
                if (s.parentId && expandedMacros[s.parentId] === false)
                  return null;

                return (
                  <tr
                    key={s.id}
                    className={cn(
                      "transition-colors",
                      s.isMacro ? "bg-slate-800/20" : "hover:bg-slate-800/30",
                      s.parentId ? "bg-slate-900/20" : "",
                    )}
                  >
                    <td className="px-5 py-4">
                      <div
                        className={cn(
                          "flex items-center gap-3",
                          s.parentId ? "ml-8" : "",
                        )}
                      >
                        {s.isMacro && (
                          <button
                            onClick={() => toggleMacro(s.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all text-slate-400"
                          >
                            {expandedMacros[s.id] === false ? (
                              <ChevronRight className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        {s.isMacro && (
                          <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                        <div
                          className={cn(
                            "font-bold truncate",
                            s.isMacro
                              ? "text-white uppercase tracking-wider"
                              : "text-slate-200",
                          )}
                        >
                          <EditableName
                            value={s.name}
                            onSave={(name) => onUpdate(s.id, { name })}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 font-mono text-slate-500">
                      {!s.isMacro && s.unit}
                    </td>
                    <td className="px-3 py-4 text-right">
                      {!s.isMacro && (
                        <div className="font-mono text-slate-300">
                          <EditableQuantity
                            value={s.quantity}
                            onSave={(qty) => onUpdate(s.id, { quantity: qty })}
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-4 text-right font-mono text-slate-500">
                      {!s.isMacro && (
                        <EditableUnitPrice
                          value={s.unitPrice}
                          onSave={(val) => onUpdate(s.id, { unitPrice: val })}
                        />
                      )}
                    </td>
                    <td className="px-3 py-4 text-right font-black text-white font-mono">
                      {s.totalValue.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-4 text-right font-black font-mono",
                        (s.isMacro
                          ? s.totalValue - s.measuredValue
                          : s.balance) < 0
                          ? "text-red-400"
                          : "text-emerald-400",
                      )}
                    >
                      {s.isMacro
                        ? (s.totalValue - s.measuredValue).toLocaleString(
                            "pt-BR",
                            { style: "currency", currency: "BRL" },
                          )
                        : s.balance.toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {s.isMacro && (
                          <button
                            onClick={() => {
                              setParentIdForNew(s.id);
                              setIsMacroForNew(false);
                              setShowModal(true);
                            }}
                            className="p-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                            title="Adicionar Subitem"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmDeleteId(s.id)}
                          className="p-2 bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white rounded-xl transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-md relative text-white border border-slate-800 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-extrabold mb-1 font-display tracking-tight uppercase">
              {isMacroForNew
                ? "Novo Item Macro"
                : parentIdForNew
                  ? "Novo Subitem"
                  : "Novo Serviço"}
            </h3>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8">
              Preencha os dados abaixo
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Nome
                </label>
                <input
                  placeholder="Ex: Alvenaria de Vedação"
                  required
                  className="w-full bg-slate-950 px-5 py-4 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white font-bold"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              {!isMacroForNew && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Unidade
                      </label>
                      <input
                        placeholder="Ex: m²"
                        required
                        className="w-full bg-slate-950 px-5 py-4 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white font-mono"
                        value={formData.unit}
                        onChange={(e) =>
                          setFormData({ ...formData, unit: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Quantidade
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        required
                        className="w-full bg-slate-950 px-5 py-4 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white font-mono"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Valor Unitário
                    </label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">
                        R$
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        required
                        className="w-full bg-slate-950 pl-12 pr-5 py-4 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white font-mono"
                        value={formData.unitPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            unitPrice: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setIsMacroForNew(false);
                    setParentIdForNew(null);
                  }}
                  className="flex-1 py-4 border border-slate-800 text-slate-400 rounded-2xl hover:bg-slate-800 hover:text-white transition-all font-black uppercase tracking-widest text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-500/100 transition-all shadow-lg shadow-blue-600/20"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="airo-card p-10 rounded-[2.5rem] w-full max-w-sm text-center text-white border border-slate-800 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-600 to-red-600" />

            <div className="w-20 h-20 bg-red-500/100/10 border border-red-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-500/10">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>

            <h3 className="text-2xl font-extrabold mb-2 font-display tracking-tight uppercase">
              Cuidado!
            </h3>
            <p className="text-slate-400 mb-8 text-sm leading-relaxed">
              Deseja realmente excluir este serviço? <br />
              <span className="text-red-400 font-bold">
                Todas as medições vinculadas serão removidas permanentemente.
              </span>
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  onDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-500/100 transition-all shadow-lg shadow-red-600/20"
              >
                Sim, excluir
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="w-full py-4 border border-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 hover:text-white transition-all"
              >
                Não, manter
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function TabPrestadores({
  project,
  onAdd,
  onDelete,
  onUpdate,
}: {
  project: Project;
  onAdd: (p: Provider) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Provider>) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    email: "",
    phone: "",
  });

  const providers = project.providers || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProvider) {
      onUpdate(editingProvider.id, formData);
    } else {
      onAdd({
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
      });
    }
    setShowModal(false);
    setEditingProvider(null);
    setFormData({ name: "", cnpj: "", email: "", phone: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white font-display">
          Prestadores de Serviço
        </h3>
        <button
          onClick={() => {
            setEditingProvider(null);
            setFormData({ name: "", cnpj: "", email: "", phone: "" });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Novo Prestador
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {providers.map((provider) => (
            <motion.div
              key={provider.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="airo-card p-6 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-blue-500/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-600/10 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingProvider(provider);
                      setFormData({
                        name: provider.name,
                        cnpj: provider.cnpj || "",
                        email: provider.email || "",
                        phone: provider.phone || "",
                      });
                      setShowModal(true);
                    }}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(provider.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h4 className="text-lg font-bold text-white mb-4 line-clamp-1">
                {provider.name}
              </h4>
              <div className="space-y-3">
                {provider.cnpj && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>CNPJ: {provider.cnpj}</span>
                  </div>
                )}
                {provider.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="line-clamp-1">{provider.email}</span>
                  </div>
                )}
                {provider.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>{provider.phone}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {providers.length === 0 && (
        <div className="text-center py-20 bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800/50">
          <div className="bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-slate-700" />
          </div>
          <h3 className="text-xl font-bold text-slate-400">
            Nenhum prestador cadastrado
          </h3>
          <p className="text-slate-500 mt-2">
            Cadastre os prestadores para facilitar a gestão das medições.
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-black text-white font-display">
                {editingProvider ? "Editar Prestador" : "Novo Prestador"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Razão Social / Nome
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 text-white px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  placeholder="Nome da empresa ou profissional"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                    CNPJ / CPF
                  </label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) =>
                      setFormData({ ...formData, cnpj: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-white px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-white px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 text-white px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  placeholder="contato@empresa.com"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-5 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                  {editingProvider ? "Salvar" : "Cadastrar"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}


function TabMedicoes({
  project,
  serviceStats,
  onAddMeasurement,
  onAddMeasurements,
  onDeleteMeasurement,
  onUpdateMeasurement,
  onAddPeriod,
  onDeletePeriod,
  onAddProvider,
  onDeleteProvider,
  onUpdateProvider,
  onUpdateProject,
}: {
  project: Project;
  serviceStats: any[];
  onAddMeasurement: (m: Measurement) => void;
  onAddMeasurements: (ms: Measurement[]) => void;
  onDeleteMeasurement: (id: string) => void;
  onUpdateMeasurement: (id: string, qty: number) => void;
  onAddPeriod: (p: MeasurementPeriod) => void;
  onDeletePeriod: (id: string) => void;
  onAddProvider: (p: Provider) => void;
  onDeleteProvider: (id: string) => void;
  onUpdateProvider: (id: string, updates: Partial<Provider>) => void;
  onUpdateProject: (p: Project) => void;
}) {
  const periods = project.measurementPeriods || [];
  const providers = project.providers || [];
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(
    periods.length > 0 ? periods[periods.length - 1].id : null,
  );
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [showProvidersModal, setShowProvidersModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    type: "period" | "measurement";
  } | null>(null);
  const [formData, setFormData] = useState({
    items: [
      {
        id: Math.random().toString(36).substr(2, 9),
        serviceId: "",
        quantity: "",
      },
    ],
  });
  const [periodFormData, setPeriodFormData] = useState({
    number: (periods.length + 1).toString(),
    date: new Date().toISOString().split("T")[0],
    providerId: "",
    retentionPercentage: "0",
  });
  const [expandedProviders, setExpandedProviders] = useState<
    Record<string, boolean>
  >({});
  const [error, setError] = useState("");

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId);
  const periodMeasurements = project.measurements.filter(
    (m) => m.periodId === selectedPeriodId,
  );
  const periodProvider = providers.find(
    (p) => p.id === selectedPeriod?.providerId,
  );

  const handleAddPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(periodFormData.number);
    if (isNaN(num) || num <= 0) {
      setError("O número da medição deve ser um valor positivo.");
      return;
    }
    if (!periodFormData.providerId) {
      setError("Selecione um prestador para esta medição.");
      return;
    }
    const newPeriod: MeasurementPeriod = {
      id: Math.random().toString(36).substr(2, 9),
      number: num,
      date: periodFormData.date,
      providerId: periodFormData.providerId,
      retentionPercentage: Number(periodFormData.retentionPercentage) || 0,
    };
    onAddPeriod(newPeriod);
    setSelectedPeriodId(newPeriod.id);
    setShowPeriodModal(false);
    setPeriodFormData({
      number: (periods.length + 2).toString(),
      date: new Date().toISOString().split("T")[0],
      providerId: "",
      retentionPercentage: "0",
    });
    setError("");
  };

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeriodId) return;

    // Validate items
    if (
      formData.items.length === 0 ||
      (formData.items.length === 1 && !formData.items[0].serviceId)
    ) {
      setError("Adicione pelo menos um serviço.");
      return;
    }

    for (const item of formData.items) {
      if (!item.serviceId) {
        setError("Selecione um serviço para todos os itens.");
        return;
      }
      const qty = Number(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        setError("A quantidade deve ser maior que zero.");
        return;
      }

      const stats = serviceStats.find((s) => s.id === item.serviceId);
      if (stats && qty > stats.balance) {
        setError(
          `Quantidade do serviço "${stats.name}" excede o saldo disponível (${stats.balance} ${stats.unit}).`,
        );
        return;
      }
    }

    const measuringDate =
      selectedPeriod?.date || new Date().toISOString().split("T")[0];

    const newMeasurements: Measurement[] = formData.items.map((item) => ({
      id: Math.random().toString(36).substr(2, 9),
      serviceId: item.serviceId,
      periodId: selectedPeriodId,
      date: measuringDate,
      quantity: Number(item.quantity),
    }));

    onAddMeasurements(newMeasurements);

    setShowMeasurementModal(false);
    setFormData({
      items: [
        {
          id: Math.random().toString(36).substr(2, 9),
          serviceId: "",
          quantity: "",
        },
      ],
    });
    setError("");
  };

  const groupedMeasurements = useMemo(() => {
    const providerName = periodProvider?.name || "Sem Prestador";
    return { [providerName]: periodMeasurements };
  }, [periodMeasurements, periodProvider]);

  const toggleProvider = (provider: string) => {
    setExpandedProviders((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const generatePDF = () => {
    if (!selectedPeriod) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    const hexToRgb = (hex: string): [number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
          ]
        : [26, 39, 68];
    };

    const cfg = project.reportConfig || {};
    const primaryRGB = hexToRgb(cfg.primaryColor || "#1a2744");
    const secondaryRGB = hexToRgb(cfg.secondaryColor || "#2d3e6b");

    const colors = {
      primary: primaryRGB,
      secondary: secondaryRGB,
      accent: [245, 158, 11] as [number, number, number],
      gray: [243, 244, 246] as [number, number, number],
      textDark: [31, 41, 55] as [number, number, number],
    };

    let currentY = 20;

    const drawHeader = (isFirstPage: boolean) => {
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, pageWidth, 55, "F");

      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, "bold");
      if (cfg.logoUrl && cfg.logoUrl.startsWith("data:image")) {
        try {
          doc.addImage(cfg.logoUrl, "JPEG", 4, 2, 84, 48);
        } catch (e) {
          doc.text("LOGO", 46, 26, { align: "center" });
        }
      } else {
        doc.text("LOGO", 46, 26, { align: "center" });
      }

      doc.setTextColor(255, 255, 255);
      const centerInfoX = (margin + 84 + (pageWidth - margin - 40)) / 2;
      doc.setFontSize(12);
      doc.text(
        cfg.companyName || "Empresa de Engenharia e Construções S/A",
        centerInfoX,
        22,
        { align: "center" },
      );
      doc.setFontSize(8);
      doc.setFont(undefined, "normal");
      doc.text(
        `CNPJ: ${cfg.cnpj || "00.000.000/0001-00"}  |  Telefone: ${cfg.phone || "(00) 0000-0000"}`,
        centerInfoX,
        29,
        { align: "center" },
      );
      doc.text(cfg.city || "Cidade - UF", centerInfoX, 34, { align: "center" });

      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      const medNumber = `MED-${selectedPeriod.number < 10 ? "0" : ""}${selectedPeriod.number}`;
      doc.text(medNumber, pageWidth - margin, 16, { align: "right" });
      doc.setFontSize(8);
      doc.setFont(undefined, "normal");
      doc.text(
        `Emissão: ${new Date().toLocaleDateString("pt-BR")}`,
        pageWidth - margin,
        21,
        { align: "right" },
      );
      doc.text(`Obra: ${project.name}`, pageWidth - margin, 26, {
        align: "right",
      });

      currentY = 65;
    };

    drawHeader(true);

    // Context box
    doc.setFontSize(12);
    doc.setFillColor(...colors.secondary);
    doc.rect(margin, currentY, contentWidth, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, "bold");
    doc.text(`${selectedPeriod.number}ª Medição`, margin + 4, currentY + 7);
    currentY += 15;

    doc.setFontSize(10);
    doc.setTextColor(...colors.textDark);
    doc.setFont(undefined, "bold");
    doc.text(
      `Prestador: ${periodProvider?.name || "Sem Prestador"}`,
      margin,
      currentY,
    );
    doc.setFont(undefined, "normal");

    if (periodProvider) {
      let providerInfo = [];
      if (periodProvider.cnpj)
        providerInfo.push(`CNPJ: ${periodProvider.cnpj}`);
      if (periodProvider.email)
        providerInfo.push(`Email: ${periodProvider.email}`);
      if (periodProvider.phone)
        providerInfo.push(`Tel: ${periodProvider.phone}`);

      if (providerInfo.length > 0) {
        currentY += 5;
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(providerInfo.join(" | "), margin, currentY);
      }
    }

    currentY += 7;
    doc.setFontSize(10);
    doc.setTextColor(...colors.textDark);
    doc.text(
      `Data de Referência: ${new Date(selectedPeriod.date).toLocaleDateString("pt-BR")}`,
      margin,
      currentY,
    );
    currentY += 10;

    const tableData = periodMeasurements.map((m) => {
      const service = project.services.find((s) => s.id === m.serviceId);
      const stats = serviceStats.find((s) => s.id === m.serviceId);
      const partialValue = m.quantity * (service?.unitPrice || 0);

      return [
        service?.name || "",
        `${m.quantity} ${service?.unit || ""}`,
        (service?.unitPrice || 0).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        partialValue.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        `${stats?.balance || 0} ${service?.unit || ""}`,
      ];
    });

    const currentPeriodNum = selectedPeriod.number;
    const previousPeriods = periods.filter((p) => p.number < currentPeriodNum);

    const totalMeasuredCurrent = periodMeasurements.reduce((sum, m) => {
      const service = project.services.find((s) => s.id === m.serviceId);
      return sum + m.quantity * (service?.unitPrice || 0);
    }, 0);

    const totalRetentionCurrent =
      (totalMeasuredCurrent * (selectedPeriod.retentionPercentage || 0)) / 100;

    const previousMeasurements = project.measurements.filter((m) =>
      previousPeriods.some((pp) => pp.id === m.periodId),
    );

    const totalMeasuredPrevious = previousMeasurements.reduce((sum, m) => {
      const service = project.services.find((s) => s.id === m.serviceId);
      return sum + m.quantity * (service?.unitPrice || 0);
    }, 0);

    const totalRetentionPrevious = previousPeriods.reduce((acc, p) => {
      const pMs = project.measurements.filter((m) => m.periodId === p.id);
      const gross = pMs.reduce((sum, m) => {
        const service = project.services.find((s) => s.id === m.serviceId);
        return sum + m.quantity * (service?.unitPrice || 0);
      }, 0);
      return acc + (gross * (p.retentionPercentage || 0)) / 100;
    }, 0);

    const totalRetentionAccumulated =
      totalRetentionCurrent + totalRetentionPrevious;

    autoTable(doc, {
      startY: currentY,
      head: [
        [
          "Serviço",
          "Qtd Executada",
          "Valor Unit.",
          "Valor Parcial",
          "Saldo a Medir",
        ],
      ],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: colors.primary },
      styles: { fontSize: 8, cellPadding: 3 },
    });

    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 10;

    doc.setFont(undefined, "bold");
    doc.setFontSize(10);
    doc.text("RESUMO DA MEDIÇÃO ATUAL", margin, currentY);
    currentY += 5;

    autoTable(doc, {
      startY: currentY,
      body: [
        [
          "VALOR BRUTO DESTA MEDIÇÃO",
          totalMeasuredCurrent.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
        ],
        [
          "RETENÇÃO DESTA MEDIÇÃO (" +
            (selectedPeriod.retentionPercentage || 0) +
            "%)",
          totalRetentionCurrent.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
        ],
        [
          "VALOR LÍQUIDO DESTA MEDIÇÃO",
          (totalMeasuredCurrent - totalRetentionCurrent).toLocaleString(
            "pt-BR",
            { style: "currency", currency: "BRL" },
          ),
        ],
      ],
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: "bold", fillColor: [245, 245, 245] },
        1: { halign: "right" },
      },
      didParseCell: (data) => {
        if (
          data.section === "body" &&
          data.row.index === 1 &&
          data.column.index === 1
        ) {
          data.cell.styles.textColor = [220, 38, 38];
        }
      },
    });

    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 15;

    const retentionHistoryData = periods
      .filter((p) => p.number <= selectedPeriod.number)
      .map((p) => {
        const periodMs = project.measurements.filter(
          (m) => m.periodId === p.id,
        );
        const gross = periodMs.reduce((sum, m) => {
          const service = project.services.find((s) => s.id === m.serviceId);
          return sum + m.quantity * (service?.unitPrice || 0);
        }, 0);
        const retention = (gross * (p.retentionPercentage || 0)) / 100;
        return [
          `${p.number}ª Medição`,
          new Date(p.date).toLocaleDateString("pt-BR"),
          retention.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
        ];
      });

    doc.setFont(undefined, "bold");
    doc.setFontSize(10);
    doc.text("RESUMO DE RETENÇÕES ACUMULADAS", margin, currentY);
    currentY += 5;

    autoTable(doc, {
      startY: currentY,
      head: [["Medição", "Data", "Valor Retido"]],
      body: retentionHistoryData,
      foot: [
        [
          "",
          "TOTAL ACUMULADO RETIDO",
          totalRetentionAccumulated.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: colors.secondary },
      styles: { fontSize: 8, cellPadding: 3 },
      footStyles: {
        fillColor: [243, 244, 246],
        textColor: [220, 38, 38],
        fontStyle: "bold",
      },
      didDrawPage: (data) => {
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Página " + pageCount, pageWidth - margin, pageHeight - 10, {
          align: "right",
        });
        doc.text("SPlan - Gestão de Obras", margin, pageHeight - 10);
      },
    });

    const fileName = `medicao_${selectedPeriod.number}_${(project.name || "obra").replace(/\s+/g, "_").toLowerCase()}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="space-y-6">
      {/* Real-time Status Period Selector */}
      <div className="flex gap-4 p-2 overflow-x-auto custom-scrollbar">
        {periods.map((p) => {
          const provider = providers.find((pub) => pub.id === p.providerId);
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPeriodId(p.id)}
              className={cn(
                "px-6 py-4 rounded-[2rem] cursor-pointer transition-all flex items-center gap-4 relative group shrink-0",
                selectedPeriodId === p.id
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20"
                  : "bg-slate-900/40 text-slate-400 border border-slate-800/50 hover:bg-slate-800",
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                  selectedPeriodId === p.id
                    ? "bg-slate-900/20"
                    : "bg-slate-800 group-hover:bg-slate-700",
                )}
              >
                <ClipboardList
                  className={cn(
                    "w-5 h-5",
                    selectedPeriodId === p.id ? "text-white" : "text-blue-500",
                  )}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                  {p.number}ª Medição
                </span>
                <span className="text-sm font-bold truncate leading-tight uppercase tracking-tight max-w-[120px]">
                  {provider?.name || "Sem Prestador"}
                </span>
              </div>
              {selectedPeriodId === p.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete({ id: p.id, type: "period" });
                  }}
                  className="absolute -top-1 -right-1 p-1.5 bg-red-500/100 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
        <button
          onClick={() => setShowPeriodModal(true)}
          className="px-8 py-4 rounded-[2rem] bg-slate-900 border-2 border-dashed border-slate-800 text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-all flex items-center gap-3 whitespace-nowrap group shrink-0"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            Nova Medição
          </span>
        </button>
        <button
          onClick={() => setShowProvidersModal(true)}
          className="px-4 py-3 rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-2 whitespace-nowrap group shrink-0 ml-auto"
        >
          <Users className="w-4 h-4 group-hover:text-blue-500 transition-colors" />
          <span className="text-[9px] font-bold uppercase tracking-widest">
            Prestadores
          </span>
        </button>
      </div>

      {selectedPeriod ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800/50 shadow-2xl">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-500/100/10 border border-blue-500/20 rounded-[2rem] flex items-center justify-center">
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-white uppercase tracking-tight">
                  {selectedPeriod.number}ª Medição
                </h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">
                  Ref:{" "}
                  {new Date(selectedPeriod.date).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={generatePDF}
                className="bg-slate-800 text-slate-300 px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all border border-slate-700/50"
              >
                <FileText className="w-4 h-4" /> Exportar PDF
              </button>
              <button
                onClick={() => setShowMeasurementModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:bg-blue-500/100 transition-all shadow-lg shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" /> Lançar Serviço
              </button>
            </div>
          </div>

          <div className="bg-slate-900/40 rounded-[2rem] border border-slate-800/50 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-[11px] min-w-[700px] whitespace-nowrap">
                <thead className="bg-slate-950 border-b border-slate-800/80">
                  <tr>
                    <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-[0.2em] w-[40%]">
                      Prestador / Serviço
                    </th>
                    <th className="px-4 py-5 font-black text-slate-500 uppercase tracking-[0.2em] text-right">
                      Qtd Executada
                    </th>
                    <th className="px-4 py-5 font-black text-slate-500 uppercase tracking-[0.2em] text-right">
                      Preço Unit.
                    </th>
                    <th className="px-4 py-5 font-black text-slate-500 uppercase tracking-[0.2em] text-right">
                      Subtotal
                    </th>
                    <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-[0.2em] text-center">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {Object.keys(groupedMeasurements).length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-slate-500 uppercase tracking-widest font-bold opacity-30 italic"
                      >
                        Nenhum serviço lançado nesta medição
                      </td>
                    </tr>
                  ) : (
                    <>
                      {Object.entries(groupedMeasurements).map(
                        ([provider, measurements]) => {
                          const providerTotalGross = measurements.reduce(
                            (sum, m) => {
                              const service = project.services.find(
                                (s) => s.id === m.serviceId,
                              );
                              return (
                                sum + m.quantity * (service?.unitPrice || 0)
                              );
                            },
                            0,
                          );

                          const retentionPercent =
                            selectedPeriod?.retentionPercentage || 0;
                          const retentionAmount =
                            (providerTotalGross * retentionPercent) / 100;
                          const providerTotalNet =
                            providerTotalGross - retentionAmount;

                          return (
                            <React.Fragment key={provider}>
                              {/* Macro Row: Provider */}
                              <tr
                                onClick={() => toggleProvider(provider)}
                                className="bg-slate-800/20 hover:bg-slate-800/40 cursor-pointer border-b border-slate-800/50 transition-all group"
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleProvider(provider);
                                        }}
                                        className={cn(
                                          "p-1.5 rounded-lg transition-all cursor-pointer",
                                          expandedProviders[provider]
                                            ? "bg-blue-600/20 text-blue-400"
                                            : "bg-slate-800 text-slate-500",
                                        )}
                                      >
                                        {expandedProviders[provider] ? (
                                          <ChevronDown size={14} />
                                        ) : (
                                          <ChevronRight size={14} />
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-bold text-white text-sm tracking-tight uppercase group-hover:text-blue-400 transition-colors">
                                          {provider}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                          {measurements.length}{" "}
                                          {measurements.length === 1
                                            ? "Lançamento"
                                            : "Lançamentos"}
                                        </p>
                                      </div>
                                    </div>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setFormData({
                                          items: [
                                            {
                                              id: Math.random()
                                                .toString(36)
                                                .substr(2, 9),
                                              serviceId: "",
                                              quantity: "",
                                            },
                                          ],
                                        });
                                        setShowMeasurementModal(true);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-2 bg-blue-600 text-white rounded-xl transition-all hover:bg-blue-500 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20"
                                    >
                                      <Plus size={12} strokeWidth={3} />
                                      Adicionar Micro
                                    </button>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-right">
                                  <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">
                                      Bruto
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">
                                      {providerTotalGross.toLocaleString(
                                        "pt-BR",
                                        { style: "currency", currency: "BRL" },
                                      )}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-right">
                                  <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-red-500/70 font-bold uppercase">
                                      Retenção ({retentionPercent}%)
                                    </span>
                                    <span className="text-xs font-bold text-red-400">
                                      -{" "}
                                      {retentionAmount.toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                      })}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-right">
                                  <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-emerald-500 font-bold uppercase">
                                      Líquido
                                    </span>
                                    <span className="text-sm font-black text-emerald-400">
                                      {providerTotalNet.toLocaleString(
                                        "pt-BR",
                                        { style: "currency", currency: "BRL" },
                                      )}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4"></td>
                              </tr>

                              {/* Micro Rows: Measurements */}
                              {expandedProviders[provider] &&
                                measurements.map((m) => {
                                  const service = project.services.find(
                                    (s) => s.id === m.serviceId,
                                  );
                                  return (
                                    <tr
                                      key={m.id}
                                      className="hover:bg-slate-800/30 transition-colors bg-slate-950/20"
                                    >
                                      <td className="px-6 py-5 pl-16">
                                        <div className="flex items-center gap-3">
                                          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                          <span className="font-bold text-slate-300">
                                            {service?.name}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-5 text-right font-mono">
                                        <EditableQuantity
                                          value={m.quantity}
                                          onSave={(qty) =>
                                            onUpdateMeasurement(m.id, qty)
                                          }
                                          unit={service?.unit}
                                        />
                                      </td>
                                      <td className="px-4 py-5 text-right font-mono text-slate-500">
                                        {(
                                          service?.unitPrice || 0
                                        ).toLocaleString("pt-BR", {
                                          style: "currency",
                                          currency: "BRL",
                                        })}
                                      </td>
                                      <td className="px-4 py-5 text-right font-black text-emerald-400 font-mono">
                                        {(
                                          m.quantity * (service?.unitPrice || 0)
                                        ).toLocaleString("pt-BR", {
                                          style: "currency",
                                          currency: "BRL",
                                        })}
                                      </td>
                                      <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                          <button
                                            onClick={() =>
                                              setConfirmDelete({
                                                id: m.id,
                                                type: "measurement",
                                              })
                                            }
                                            className="p-2.5 bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white rounded-xl transition-all"
                                            title="Remover"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </React.Fragment>
                          );
                        },
                      )}
                      {/* Current Totals */}
                      <tr className="bg-slate-950/80 border-t border-slate-800">
                        <td
                          colSpan={3}
                          className="px-6 py-4 text-right font-black text-slate-500 uppercase tracking-widest text-[9px]"
                        >
                          Total Bruto Medido
                        </td>
                        <td className="px-4 py-4 text-right text-blue-400 font-bold font-mono">
                          {periodMeasurements
                            .reduce((sum, m) => {
                              const service = project.services.find(
                                (s) => s.id === m.serviceId,
                              );
                              return (
                                sum + m.quantity * (service?.unitPrice || 0)
                              );
                            }, 0)
                            .toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                        </td>
                        <td></td>
                      </tr>
                      <tr className="bg-slate-950/80">
                        <td
                          colSpan={3}
                          className="px-6 py-4 text-right font-black text-red-500/50 uppercase tracking-widest text-[9px]"
                        >
                          Retenção desta Medição
                        </td>
                        <td className="px-4 py-4 text-right text-red-400 font-bold font-mono">
                          {periodMeasurements
                            .reduce((sum, m) => {
                              const p = periods.find(
                                (per) => per.id === m.periodId,
                              );
                              const service = project.services.find(
                                (s) => s.id === m.serviceId,
                              );
                              const gross =
                                m.quantity * (service?.unitPrice || 0);
                              return (
                                sum +
                                (gross * (p?.retentionPercentage || 0)) / 100
                              );
                            }, 0)
                            .toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                        </td>
                        <td></td>
                      </tr>

                      {/* Accumulated Totals */}
                      <tr className="bg-slate-900 border-t-2 border-blue-600/30">
                        <td
                          colSpan={3}
                          className="px-6 py-6 text-right font-black text-blue-400 uppercase tracking-[0.2em] text-[10px]"
                        >
                          Saldo Total Acumulado (Bruto)
                        </td>
                        <td className="px-4 py-6 text-right text-white text-lg font-black font-mono">
                          {project.measurements
                            .filter((m) => {
                              const p = periods.find(
                                (per) => per.id === m.periodId,
                              );
                              return (
                                p && p.number <= (selectedPeriod?.number || 0)
                              );
                            })
                            .reduce((sum, m) => {
                              const service = project.services.find(
                                (s) => s.id === m.serviceId,
                              );
                              return (
                                sum + m.quantity * (service?.unitPrice || 0)
                              );
                            }, 0)
                            .toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                        </td>
                        <td></td>
                      </tr>
                      <tr className="bg-slate-900">
                        <td
                          colSpan={3}
                          className="px-6 py-4 text-right font-black text-emerald-500/50 uppercase tracking-widest text-[10px]"
                        >
                          Total Retido Acumulado
                        </td>
                        <td className="px-4 py-4 text-right text-emerald-400 font-bold font-mono">
                          {project.measurements
                            .filter((m) => {
                              const p = periods.find(
                                (per) => per.id === m.periodId,
                              );
                              return (
                                p && p.number <= (selectedPeriod?.number || 0)
                              );
                            })
                            .reduce((sum, m) => {
                              const p = periods.find(
                                (per) => per.id === m.periodId,
                              );
                              const service = project.services.find(
                                (s) => s.id === m.serviceId,
                              );
                              const gross =
                                m.quantity * (service?.unitPrice || 0);
                              return (
                                sum +
                                (gross * (p?.retentionPercentage || 0)) / 100
                              );
                            }, 0)
                            .toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                        </td>
                        <td></td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-[3rem] p-24 text-center">
          <div className="bg-slate-950 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-slate-800">
            <ClipboardList className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-3xl font-extrabold text-white mb-3 font-display uppercase tracking-tight">
            Primeira Medição
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-12 font-medium leading-relaxed">
            Defina o período (ex: 1ª Medição) para iniciar o apontamento dos
            serviços executados em campo.
          </p>
          <button
            onClick={() => setShowPeriodModal(true)}
            className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-500/100 transition-all shadow-xl shadow-blue-600/30"
          >
            Iniciar Medição
          </button>
        </div>
      )}

      {/* Dashboard de Retenções */}
      <div className="mt-12 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600/20 p-2 rounded-xl">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-display uppercase tracking-tight">
              Histórico de Retenções
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">
              Acumulado por Prestador
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico */}
          <div className="lg:col-span-2 bg-slate-900/50 rounded-3xl border border-slate-800 p-8 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(
                  project.measurements.reduce(
                    (acc, m) => {
                      const p = periods.find((per) => per.id === m.periodId);
                      const providerObj = providers.find(
                        (pub) => pub.id === p?.providerId,
                      );
                      const providerName = providerObj?.name || "Sem Prestador";

                      const service = project.services.find(
                        (s) => s.id === m.serviceId,
                      );
                      const gross = m.quantity * (service?.unitPrice || 0);
                      const retention =
                        (gross * (p?.retentionPercentage || 0)) / 100;

                      if (!acc[providerName])
                        acc[providerName] = { name: providerName, total: 0 };
                      acc[providerName].total += retention;
                      return acc;
                    },
                    {} as Record<string, { name: string; total: number }>,
                  ),
                )
                  .map(([_, data]) => data)
                  .sort((a, b) => b.total - a.total)
                  .slice(0, 5)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  horizontal={false}
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#64748b"
                  fontSize={10}
                  fontWeight="bold"
                  tickFormatter={(val) =>
                    val.length > 15 ? val.substring(0, 15) + "..." : val
                  }
                />
                <Tooltip
                  cursor={{ fill: "#1e293b", opacity: 0.4 }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number) => [
                    value.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }),
                    "Total Retido",
                  ]}
                />
                <Bar
                  dataKey="total"
                  fill="#3b82f6"
                  radius={[0, 8, 8, 0]}
                  barSize={24}
                >
                  {Object.entries({}).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#barGradient)`} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Lista de Resumo */}
          <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-8 space-y-6">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Resumo por Prestador
            </h4>
            <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {Object.entries(
                project.measurements.reduce(
                  (acc, m) => {
                    const p = periods.find((per) => per.id === m.periodId);
                    const providerObj = providers.find(
                      (pub) => pub.id === p?.providerId,
                    );
                    const providerName = providerObj?.name || "Sem Prestador";

                    const service = project.services.find(
                      (s) => s.id === m.serviceId,
                    );
                    const gross = m.quantity * (service?.unitPrice || 0);
                    const retention =
                      (gross * (p?.retentionPercentage || 0)) / 100;

                    if (!acc[providerName]) acc[providerName] = 0;
                    acc[providerName] += retention;
                    return acc;
                  },
                  {} as Record<string, number>,
                ),
              )
                .sort((a, b) => b[1] - a[1])
                .map(([name, total]) => (
                  <div
                    key={name}
                    className="flex justify-between items-center bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50"
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-white uppercase tracking-tight truncate w-[140px]">
                        {name}
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold">
                        Total Retido
                      </span>
                    </div>
                    <span className="text-sm font-black text-blue-400 font-mono">
                      {total.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                ))}
            </div>
            {project.measurements.length === 0 && (
              <div className="text-center py-8 opacity-20">
                <Minus className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                <p className="text-[10px] uppercase font-black">Sem dados</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>

      {/* Period Modal */}
      {showPeriodModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-black text-white font-display uppercase tracking-tight">
                Nova Medição
              </h3>
              <button
                onClick={() => setShowPeriodModal(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddPeriod} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                    Nº da Medição
                  </label>
                  <input
                    type="number"
                    value={periodFormData.number}
                    onChange={(e) =>
                      setPeriodFormData({
                        ...periodFormData,
                        number: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-white px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={periodFormData.date}
                    onChange={(e) =>
                      setPeriodFormData({
                        ...periodFormData,
                        date: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-white px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Prestador
                </label>
                <select
                  required
                  value={periodFormData.providerId}
                  onChange={(e) =>
                    setPeriodFormData({
                      ...periodFormData,
                      providerId: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 text-white px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none"
                >
                  <option value="">Selecione um prestador</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {providers.length === 0 && (
                  <p className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Nenhum prestador cadastrado. Vá em "Prestadores" primeiro.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  % Retenção
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={periodFormData.retentionPercentage}
                    onChange={(e) =>
                      setPeriodFormData({
                        ...periodFormData,
                        retentionPercentage: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-white px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium pr-12"
                    placeholder="0"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-black">
                    %
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-bold">{error}</p>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowPeriodModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-5 rounded-2xl transition-all uppercase tracking-widest text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={providers.length === 0}
                  className={cn(
                    "flex-1 font-bold py-5 rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-xs",
                    providers.length === 0
                      ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20",
                  )}
                >
                  Criar Medição
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Measurement Modal */}
      {showMeasurementModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 w-full max-w-4xl shadow-2xl overflow-y-auto max-h-[90vh] relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-3xl font-black text-white font-display uppercase tracking-tight">
                  Lançar Items
                </h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">
                  {selectedPeriod?.number}ª Medição — {periodProvider?.name}
                </p>
              </div>
              <button
                onClick={() => setShowMeasurementModal(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Fechar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddMeasurement} className="space-y-6">
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex flex-col md:flex-row gap-4 items-start md:items-end bg-slate-950/50 p-6 rounded-3xl border border-slate-800/50 group hover:border-blue-500/30 transition-all"
                  >
                    <div className="flex-1 w-full space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                          Serviço
                        </label>
                        <select
                          value={item.serviceId}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[index].serviceId = e.target.value;
                            setFormData({ ...formData, items: newItems });
                          }}
                          className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                        >
                          <option value="">Selecione o serviço</option>
                          {serviceStats
                            .filter((s) => !s.isMacro)
                            .map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.unit}) — Saldo:{" "}
                                {s.balance.toFixed(2)}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="w-full md:w-40 space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-center block">
                          Quantidade
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[index].quantity = e.target.value;
                            setFormData({ ...formData, items: newItems });
                          }}
                          className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center font-mono font-bold"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = formData.items.filter(
                            (_, i) => i !== index,
                          );
                          setFormData({ ...formData, items: newItems });
                        }}
                        className="p-3 text-slate-500 hover:text-red-400 transition-colors mb-0.5"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    items: [
                      ...formData.items,
                      {
                        id: Math.random().toString(36).substr(2, 9),
                        serviceId: "",
                        quantity: "",
                      },
                    ],
                  })
                }
                className="w-full py-5 border-2 border-dashed border-slate-800 rounded-[2rem] text-slate-500 hover:text-blue-400 hover:border-blue-500/30 transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 bg-slate-900/30"
              >
                <Plus className="w-5 h-5" />
                Novo Item Micro
              </button>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-bold">{error}</p>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowMeasurementModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 uppercase tracking-widest text-xs"
                >
                  Confirmar Medição
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Providers Management Modal */}
      {showProvidersModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 w-full max-w-5xl shadow-2xl overflow-y-auto max-h-[90vh] relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-3xl font-black text-white font-display uppercase tracking-tight">
                  Prestadores
                </h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">
                  Gerenciamento de prestadores do projeto
                </p>
              </div>
              <button
                onClick={() => setShowProvidersModal(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Fechar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <TabPrestadores
              project={project}
              onAdd={onAddProvider}
              onDelete={onDeleteProvider}
              onUpdate={onUpdateProvider}
            />
          </motion.div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm text-center relative border border-slate-800 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-400" />
            <div className="w-20 h-20 bg-red-500/100/10 border border-red-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-extrabold mb-2 font-display tracking-tight text-white uppercase">
              Confirmar Exclusão
            </h3>
            <p className="text-slate-400 mb-8 font-medium text-sm">
              {confirmDelete.type === "period"
                ? "Deseja realmente excluir esta medição e TODOS os seus lançamentos? Esta ação não pode ser desfeita."
                : "Deseja realmente excluir este lançamento de serviço?"}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-4 border border-slate-800 text-slate-400 rounded-2xl hover:bg-slate-800 hover:text-white transition-all font-black uppercase tracking-widest text-xs"
              >
                Não, manter
              </button>
              <button
                onClick={() => {
                  if (confirmDelete.type === "period") {
                    onDeletePeriod(confirmDelete.id);
                    if (selectedPeriodId === confirmDelete.id)
                      setSelectedPeriodId(null);
                  } else {
                    onDeleteMeasurement(confirmDelete.id);
                  }
                  setConfirmDelete(null);
                }}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-500/100 transition-all shadow-lg shadow-red-600/20"
              >
                Sim, excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function TabFinanceiro({ project, stats }: { project: Project; stats: any }) {
  const pieData = [
    { name: "Medido", value: stats.totalMeasured, color: "#2563eb" }, // blue-600
    { name: "Saldo", value: stats.balance, color: "var(--color-slate-800)" }, // slate-800
  ];

  const timelineData = useMemo(() => {
    const data: Record<string, number> = {};
    project.measurements.forEach((m) => {
      const date = new Date(m.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      const service = project.services.find((s) => s.id === m.serviceId);
      const value = m.quantity * (service?.unitPrice || 0);
      data[monthYear] = (data[monthYear] || 0) + value;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const [mA, yA] = a.name.split("/").map(Number);
        const [mB, yB] = b.name.split("/").map(Number);
        return yA !== yB ? yA - yB : mA - mB;
      });
  }, [project.measurements, project.services]);

  return (
    <>
      <div className="space-y-8">
        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Contratado"
            value={stats.totalValue}
            type="currency"
            color="blue"
          />
          <StatCard
            label="Total Medido"
            value={stats.totalMeasured}
            type="currency"
            color="green"
          />
          <StatCard
            label="Saldo a Medir"
            value={stats.balance}
            type="currency"
            color="amber"
          />
          <StatCard
            label="Total em Notas"
            value={stats.totalInvoices}
            type="currency"
            color="rose"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Chart */}
          <div className="airo-card p-8 rounded-[2rem] border border-slate-800/50 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-50" />
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
                  Status Global
                </h3>
                <p className="text-lg font-bold text-white uppercase tracking-tight">
                  Progresso Financeiro
                </p>
              </div>
              <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-blue-600 transition-all shadow-lg">
                <TrendingUp className="w-5 h-5 text-blue-500 group-hover:text-white" />
              </div>
            </div>

            <div className="h-64 relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-white tracking-tighter">
                  {(
                    (stats.totalMeasured / stats.totalValue) * 100 || 0
                  ).toFixed(1)}
                  %
                </span>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">
                  Executado
                </span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      value.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    }
                    contentStyle={{
                      backgroundColor: "var(--color-slate-900)",
                      borderRadius: "1rem",
                      border: "1px solid #1e293b",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "var(--color-white)",
                    }}
                    itemStyle={{ color: "var(--color-white)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                  <span className="text-xs font-bold text-slate-400">
                    Total Medido
                  </span>
                </div>
                <span className="text-xs font-black text-white">
                  {stats.totalMeasured.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  <span className="text-xs font-bold text-slate-400">
                    Saldo
                  </span>
                </div>
                <span className="text-xs font-black text-white">
                  {stats.balance.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Chart */}
          <div className="lg:col-span-2 airo-card p-8 rounded-[2rem] border border-slate-800/50 shadow-2xl overflow-hidden group">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
                  Série Histórica
                </h3>
                <p className="text-lg font-bold text-white uppercase tracking-tight">
                  Evolução Mensal
                </p>
              </div>
              <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-blue-600 transition-all shadow-lg">
                <Calendar className="w-5 h-5 text-blue-500 group-hover:text-white" />
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--color-slate-800)"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 900, fill: "#64748b" }}
                    dy={15}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 900, fill: "#64748b" }}
                    tickFormatter={(value) =>
                      `R$ ${value >= 1000 ? (value / 1000).toFixed(0) + "k" : value}`
                    }
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(30, 41, 59, 0.4)", radius: 8 }}
                    contentStyle={{
                      backgroundColor: "var(--color-slate-900)",
                      borderRadius: "1rem",
                      border: "1px solid #1e293b",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "var(--color-white)",
                    }}
                    itemStyle={{ color: "var(--color-white)" }}
                    formatter={(value: number) =>
                      value.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    }
                  />
                  <Bar
                    dataKey="value"
                    fill="#2563eb"
                    radius={[10, 10, 0, 0]}
                    barSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Detailed Summary Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 card-shadow overflow-hidden">
          <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-wider">
              Resumo por Categoria
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800">
                  <th className="px-4 py-2.5 font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                    Serviço
                  </th>
                  <th className="px-4 py-2.5 font-bold text-slate-500 uppercase text-[10px] tracking-wider text-right">
                    Contratado
                  </th>
                  <th className="px-4 py-2.5 font-bold text-slate-500 uppercase text-[10px] tracking-wider text-right">
                    Medido
                  </th>
                  <th className="px-4 py-2.5 font-bold text-slate-500 uppercase text-[10px] tracking-wider text-right">
                    Saldo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {project.services
                  .filter((s) => s.isMacro)
                  .map((macro) => {
                    const children = project.services.filter(
                      (s) => s.parentId === macro.id,
                    );
                    const totalValue = children.reduce(
                      (sum, c) => sum + c.quantity * c.unitPrice,
                      0,
                    );
                    const measuredValue = children.reduce((sum, c) => {
                      const qty = project.measurements
                        .filter((m) => m.serviceId === c.id)
                        .reduce((s, m) => s + m.quantity, 0);
                      return sum + qty * c.unitPrice;
                    }, 0);
                    const balance = totalValue - measuredValue;

                    return (
                      <tr
                        key={macro.id}
                        className="hover:bg-slate-950 transition-colors"
                      >
                        <td className="px-4 py-2.5 font-bold text-white">
                          {macro.name}
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-400">
                          {totalValue.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                        <td className="px-4 py-2.5 text-right text-blue-600 font-bold">
                          {measuredValue.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                        <td className="px-4 py-2.5 text-right text-amber-600 font-medium">
                          {balance.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                {/* Services without parent (not in a macro) */}
                {project.services
                  .filter((s) => !s.isMacro && !s.parentId)
                  .map((s) => {
                    const totalValue = s.quantity * s.unitPrice;
                    const measuredValue = project.measurements
                      .filter((m) => m.serviceId === s.id)
                      .reduce((sum, m) => sum + m.quantity * s.unitPrice, 0);
                    const balance = totalValue - measuredValue;

                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-slate-950 transition-colors"
                      >
                        <td className="px-4 py-2.5 font-bold text-white">
                          {s.name}
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-400">
                          {totalValue.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                        <td className="px-4 py-2.5 text-right text-blue-600 font-bold">
                          {measuredValue.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                        <td className="px-4 py-2.5 text-right text-amber-600 font-medium">
                          {balance.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
              <tfoot className="bg-slate-950 font-black border-t border-slate-800">
                <tr>
                  <td className="px-4 py-3 text-white uppercase tracking-wider text-[10px]">
                    TOTAL
                  </td>
                  <td className="px-4 py-3 text-right text-white">
                    {stats.totalValue.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-700">
                    {stats.totalMeasured.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right text-amber-700">
                    {stats.balance.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

// --- UI Helpers ---

export function EditableName({
  value,
  onSave,
}: {
  value: string;
  onSave: (val: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    if (tempValue.trim()) {
      onSave(tempValue.trim());
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 w-full">
        <input
          type="text"
          className="px-3 py-1.5 border border-slate-700 rounded-lg text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 w-full bg-slate-900 shadow-sm"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setTempValue(value);
              setIsEditing(false);
            }
          }}
          autoFocus
        />
        <button
          onClick={handleSave}
          className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded-lg flex-shrink-0 transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setTempValue(value);
            setIsEditing(false);
          }}
          className="p-1.5 text-red-600 hover:bg-red-500/10 rounded-lg flex-shrink-0 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 group cursor-pointer w-full"
      onClick={() => setIsEditing(true)}
    >
      <span className="truncate font-medium">{value}</span>
      <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
    </div>
  );
}

export function EditableQuantity({
  value,
  onSave,
  unit,
}: {
  value: number;
  onSave: (val: number) => void;
  unit?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());

  const handleSave = () => {
    const num = Number(tempValue);
    if (isNaN(num) || num <= 0) {
      toast.error("Por favor, insira uma quantidade válida maior que zero.");
      return;
    }
    setShowConfirm(true);
  };

  const confirmSave = () => {
    onSave(Number(tempValue));
    setIsEditing(false);
    setShowConfirm(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center justify-end gap-1">
        <input
          type="number"
          step="0.01"
          className="w-24 px-3 py-1.5 border border-slate-700 rounded-lg text-right text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 bg-slate-900 shadow-sm"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setIsEditing(false);
          }}
        />
        <button
          onClick={handleSave}
          className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="p-1.5 text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="cursor-pointer hover:bg-slate-800 px-2 py-1 rounded-lg transition-all text-right flex items-center justify-end gap-2 group"
      onClick={() => setIsEditing(true)}
    >
      <span className="font-medium">
        {value} {unit}
      </span>
      <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-all" />

      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-2xl p-8 w-full max-w-sm text-center border border-slate-800 shadow-2xl"
          >
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-display text-white">
              Confirmar Alteração
            </h3>
            <p className="text-slate-400 mb-8 font-medium">
              Deseja confirmar a alteração da quantidade de{" "}
              <span className="text-white font-bold">{value}</span> para{" "}
              <span className="text-blue-600 font-bold">{tempValue}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 border border-slate-800 rounded-xl font-bold text-slate-400 hover:bg-slate-950 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSave}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export function EditableUnitPrice({
  value,
  onSave,
}: {
  value: number;
  onSave: (val: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());

  const handleSave = () => {
    const num = Number(tempValue);
    if (isNaN(num) || num < 0) {
      toast.error("Por favor, insira um valor unitário válido maior ou igual a zero.");
      return;
    }
    setShowConfirm(true);
  };

  const confirmSave = () => {
    onSave(Number(tempValue));
    setIsEditing(false);
    setShowConfirm(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center justify-end gap-1">
        <input
          type="number"
          step="0.01"
          className="w-24 px-3 py-1.5 border border-slate-700 rounded-lg text-right text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 bg-slate-900 shadow-sm"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setIsEditing(false);
          }}
        />
        <button
          onClick={handleSave}
          className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="p-1.5 text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="cursor-pointer hover:bg-slate-800 px-2 py-1 rounded-lg transition-all text-right flex items-center justify-end gap-2 group"
      onClick={() => {
        setTempValue(value.toString());
        setIsEditing(true);
      }}
    >
      <span className="font-medium text-slate-300">
        {value.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </span>
      <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-all" />

      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-2xl p-8 w-full max-w-sm text-center border border-slate-800 shadow-2xl"
          >
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-display text-white">
              Confirmar Alteração
            </h3>
            <p className="text-slate-400 mb-8 font-medium text-xs whitespace-normal text-center">
              Deseja confirmar a alteração do valor unitário de{" "}
              <span className="text-white font-bold">
                {value.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>{" "}
              para{" "}
              <span className="text-blue-600 font-bold">
                {Number(tempValue).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 border border-slate-800 rounded-xl font-bold text-slate-400 hover:bg-slate-950 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSave}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const colors = {
    "Em Execução":
      "bg-emerald-500/100/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    Pausada:
      "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
    Finalizada: "bg-slate-800 text-slate-400 border-slate-700",
  };
  return (
    <span
      className={cn(
        "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border backdrop-blur-md",
        colors[status],
      )}
    >
      {status}
    </span>
  );
}


function TabNotasFiscais({
  project,
  onAdd,
  onAddMultiple,
  onDelete,
  onUpdate,
}: {
  project: Project;
  onAdd: (inv: Invoice) => void;
  onAddMultiple: (invs: Invoice[]) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Invoice>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editProviderName, setEditProviderName] = useState("");
  const [formData, setFormData] = useState({
    number: "",
    date: new Date().toISOString().split("T")[0],
    value: "",
    fileName: "",
    fileData: "",
    natureza: "Obra civil",
    provider: "",
    ocNumber: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.warning("Por favor, anexe apenas arquivos PDF.");
        return;
      }
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          fileName: file.name,
          fileData: event.target?.result as string,
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInvoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      number: formData.number,
      date: formData.date,
      value: Number(formData.value),
      fileName: formData.fileName,
      fileData: formData.fileData,
      natureza: formData.natureza,
      provider: formData.provider,
      ocNumber: formData.ocNumber,
    };
    onAdd(newInvoice);
    setShowModal(false);
    setFormData({
      number: "",
      date: new Date().toISOString().split("T")[0],
      value: "",
      fileName: "",
      fileData: "",
      natureza: "Obra civil",
      provider: "",
      ocNumber: "",
    });
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log("Dados lidos do Excel:", jsonData);

        const newInvoices: Invoice[] = [];

        jsonData.forEach((row: any) => {
          // Normalize keys to lowercase and trim spaces
          const normalizedRow: Record<string, any> = {};
          for (const key in row) {
            if (Object.prototype.hasOwnProperty.call(row, key)) {
              normalizedRow[key.toString().toLowerCase().trim()] = row[key];
            }
          }

          // Helper to find a key that includes any of the search terms
          const findKey = (terms: string[]) =>
            Object.keys(normalizedRow).find((k) =>
              terms.some((t) => k.includes(t)),
            );

          // Try to find columns that might represent the invoice number
          const numberKey = findKey([
            "nota",
            "número",
            "numero",
            "nf",
            "documento",
          ]);
          const number = numberKey ? normalizedRow[numberKey] : "";

          // Try to find columns that might represent the value
          const valueKey = findKey([
            "valor",
            "total",
            "amount",
            "preço",
            "preco",
          ]);
          const valueRaw = valueKey ? normalizedRow[valueKey] : 0;
          let value = 0;
          if (typeof valueRaw === "number") {
            value = valueRaw;
          } else if (typeof valueRaw === "string") {
            // Remove R$, spaces, and replace comma with dot if necessary
            let cleanValue = valueRaw.replace(/[R$\s]/g, "");
            // If it contains both dot and comma, assume dot is thousand separator and comma is decimal
            if (cleanValue.includes(".") && cleanValue.includes(",")) {
              cleanValue = cleanValue.replace(/\./g, "").replace(",", ".");
            } else if (cleanValue.includes(",")) {
              // If it only has comma, it might be decimal separator
              cleanValue = cleanValue.replace(",", ".");
            }
            value = Number(cleanValue);
          }

          // Try to find date
          let date = new Date().toISOString().split("T")[0];
          const dateKey = findKey(["data", "emissão", "emissao", "date"]);
          const dateRaw = dateKey ? normalizedRow[dateKey] : undefined;
          if (dateRaw) {
            if (typeof dateRaw === "number") {
              // Excel date serial number
              const excelEpoch = new Date(Date.UTC(1899, 11, 30));
              const jsDate = new Date(
                excelEpoch.getTime() + dateRaw * 86400000,
              );
              date = jsDate.toISOString().split("T")[0];
            } else if (typeof dateRaw === "string") {
              // Try to parse DD/MM/YYYY
              const parts = dateRaw.split("/");
              if (parts.length === 3) {
                date = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
              } else {
                // Fallback to Date constructor
                const parsed = new Date(dateRaw);
                if (!isNaN(parsed.getTime())) {
                  date = parsed.toISOString().split("T")[0];
                }
              }
            }
          }

          // Try to find nature
          const natureKey = findKey(["natureza", "categoria", "tipo"]);
          let rawNatureza = natureKey ? normalizedRow[natureKey] : "";
          let natureza = "Não especificado";

          if (rawNatureza) {
            const normalizedNat = String(rawNatureza)
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");
            if (
              normalizedNat.includes("obra") ||
              normalizedNat.includes("civil")
            ) {
              natureza = "Obra civil";
            } else if (
              normalizedNat.includes("instalacao") ||
              normalizedNat.includes("Instalações") ||
              normalizedNat.includes("eletrica") ||
              normalizedNat.includes("hidraulica")
            ) {
              natureza = "Instalações";
            } else if (
              normalizedNat.includes("maquina") ||
              normalizedNat.includes("equipamento")
            ) {
              natureza = "Maquinas e Equipamentos";
            } else if (
              normalizedNat.includes("movel") ||
              normalizedNat.includes("Móveis") ||
              normalizedNat.includes("mobiliario")
            ) {
              natureza = "Móveis";
            } else {
              // Se não encontrar correspondência exata, mantém o texto original
              natureza = String(rawNatureza);
            }
          }

          // Try to find provider
          const providerKey = findKey([
            "prestador",
            "fornecedor",
            "empresa",
            "nome",
            "razao",
            "razão",
          ]);
          const provider = providerKey ? normalizedRow[providerKey] : "";

          // Try to find OC number
          const ocKey = findKey(["oc", "ordem", "compra"]);
          const ocNumber = ocKey ? String(normalizedRow[ocKey]) : "";

          if (number && !isNaN(value) && value > 0) {
            newInvoices.push({
              id: Math.random().toString(36).substr(2, 9),
              number: String(number),
              date,
              value,
              fileName: "Importado via Excel",
              natureza,
              provider: String(provider),
              ocNumber,
            });
          }
        });

        if (newInvoices.length > 0) {
          onAddMultiple(newInvoices);
          toast.success(
            `${newInvoices.length} notas fiscais importadas com sucesso!`,
          );
        } else {
          toast.warning(
            'Não foi possível encontrar notas válidas na planilha. Certifique-se de que as colunas "Nota" e "Valor" existam.',
          );
        }
      } catch (error) {
        console.error("Erro ao importar Excel:", error);
        toast.error(
          "Erro ao ler o arquivo Excel. Verifique o formato e tente novamente.",
        );
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const generateReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Relatório de Notas Fiscais", 14, 22);

    doc.setFontSize(12);
    doc.text(`Projeto: ${project.name}`, 14, 32);
    doc.text(
      `Data de Emissão: ${new Date().toLocaleDateString("pt-BR")}`,
      14,
      40,
    );

    const invoices = project.invoices || [];

    // Group and sum by nature
    const totalsByNature: Record<string, number> = {
      "Obra civil": 0,
      "Instalações": 0,
      "Maquinas e Equipamentos": 0,
      "Móveis": 0,
      "Não especificado": 0,
    };

    // Group and sum by provider
    const totalsByProvider: Record<string, number> = {};

    invoices.forEach((inv) => {
      const nat = inv.natureza || "Não especificado";
      if (totalsByNature[nat] !== undefined) {
        totalsByNature[nat] += inv.value;
      } else {
        totalsByNature["Não especificado"] += inv.value;
      }

      const prov = inv.provider || "Não especificado";
      totalsByProvider[prov] = (totalsByProvider[prov] || 0) + inv.value;
    });

    const summaryNatureData = Object.entries(totalsByNature)
      .filter(([_, value]) => value > 0)
      .map(([nature, value]) => [
        nature,
        value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      ]);

    autoTable(doc, {
      startY: 50,
      head: [["Natureza", "Total Gasto"]],
      body: summaryNatureData,
      theme: "grid",
      headStyles: { fillColor: [29, 78, 216] }, // blue-700
    });

    const summaryProviderData = Object.entries(totalsByProvider)
      .sort((a, b) => b[1] - a[1]) // Sort by value descending
      .map(([provider, value]) => [
        provider,
        value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [["Prestador de Serviço", "Total Emitido"]],
      body: summaryProviderData,
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129] }, // emerald-500
    });

    const detailedData = invoices.map((inv) => [
      inv.number,
      new Date(inv.date).toLocaleDateString("pt-BR"),
      inv.provider || "-",
      inv.natureza || "Não especificado",
      inv.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [["Número", "Data", "Prestador", "Natureza", "Valor"]],
      body: detailedData,
      theme: "striped",
      headStyles: { fillColor: [75, 85, 99] }, // gray-600
    });

    doc.save(`Relatorio_Notas_${project.name.replace(/\s+/g, "_")}.pdf`);
  };

  const viewPdf = (fileData: string) => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(
        `<iframe src="${fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`,
      );
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedProviders, setExpandedProviders] = useState<
    Record<string, boolean>
  >({});

  // Auto-expand groups when searching
  useEffect(() => {
    if (searchTerm.trim()) {
      const providersToExpand: Record<string, boolean> = {};
      const invoices = project.invoices || [];
      invoices.forEach((inv) => {
        const matches =
          inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (inv.provider || "").toLowerCase().includes(searchTerm.toLowerCase());

        if (matches && inv.provider) {
          providersToExpand[inv.provider] = true;
        } else if (matches && !inv.provider) {
          providersToExpand["Sem Prestador"] = true;
        }
      });
      setExpandedProviders((prev) => ({ ...prev, ...providersToExpand }));
    }
  }, [searchTerm, project.invoices]);

  const groupedInvoices = useMemo(() => {
    const groups: Record<string, Invoice[]> = {};
    const invoices = project.invoices || [];
    const term = searchTerm.trim().toLowerCase();

    const filteredInvoices = invoices.filter(
      (inv) =>
        inv.number.toLowerCase().includes(term) ||
        (inv.provider || "").toLowerCase().includes(term),
    );

    filteredInvoices.forEach((inv) => {
      const provider = inv.provider || "Sem Prestador";
      if (!groups[provider]) {
        groups[provider] = [];
      }
      groups[provider].push(inv);
    });

    // Sort providers by name and their invoices by date
    return Object.fromEntries(
      Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([provider, invs]) => [
          provider,
          invs.sort((a, b) => b.date.localeCompare(a.date)),
        ]),
    );
  }, [project.invoices]);

  const toggleProvider = (provider: string) => {
    setExpandedProviders((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const getProviderTotal = (invs: Invoice[]) => {
    return invs.reduce((sum, inv) => sum + inv.value, 0);
  };

  const Highlight = ({ text, term }: { text: string; term: string }) => {
    if (!term.trim()) return <>{text}</>;
    const regex = new RegExp(
      `(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark
              key={i}
              className="bg-blue-500/30 text-blue-200 px-0.5 rounded-sm ring-1 ring-blue-500/50"
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </>
    );
  };

  const renderInvoiceLine = (
    inv: Invoice,
    providerName: string,
    flat: boolean,
  ) => (
    <tr
      key={inv.id}
      className={cn(
        "hover:bg-slate-950 border-b border-slate-800/50 transition-colors bg-slate-950/30",
        searchTerm.trim() &&
          inv.number.toLowerCase().includes(searchTerm.trim().toLowerCase()) &&
          "bg-blue-500/5",
      )}
    >
      <td className={cn("px-6 py-3.5", !flat && "pl-16")}>
        <div className="flex items-center gap-3">
          {!flat ? (
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          ) : (
            <div className="flex flex-col">
              <span className="text-[9px] text-blue-500 font-bold uppercase tracking-widest leading-none mb-1">
                <Highlight text={providerName} term={searchTerm} />
              </span>
            </div>
          )}
          <span className="font-bold text-slate-200">
            NF <Highlight text={inv.number} term={searchTerm} />
          </span>
        </div>
      </td>
      <td className="px-4 py-3.5 text-slate-400 font-medium">
        {new Date(inv.date).toLocaleDateString("pt-BR")}
      </td>
      <td className="px-4 py-3.5">
        <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border border-slate-700/50">
          {inv.natureza || "Não especificado"}
        </span>
      </td>
      <td className="px-4 py-3.5">
        {inv.ocNumber ? (
          <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border border-blue-500/20">
            OC {inv.ocNumber}
          </span>
        ) : (
          <span className="text-slate-600 text-xs italic">-</span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <div
          className="flex items-center gap-2 group/file cursor-pointer"
          onClick={() => inv.fileData && viewPdf(inv.fileData)}
        >
          <div className="bg-red-500/10 p-1.5 rounded-lg group-hover/file:bg-red-500/20 transition-colors">
            <FileText className="w-3.5 h-3.5 text-red-500" />
          </div>
          <span className="text-slate-400 truncate max-w-[150px] text-[10px] font-bold group-hover/file:text-white transition-colors">
            {inv.fileName}
          </span>
        </div>
      </td>
      <td className="px-4 py-3.5 text-right font-bold text-white">
        {inv.value.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </td>
      <td className="px-6 py-3.5 text-center">
        <div className="flex items-center justify-center gap-1">
          {editingId === inv.id ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={editProviderName}
                onChange={(e) => setEditProviderName(e.target.value)}
                className="border border-slate-700 rounded-lg px-2 py-1 text-xs w-24 outline-none focus:ring-1 focus:ring-blue-500 bg-slate-900 text-white"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onUpdate(inv.id, { provider: editProviderName });
                    setEditingId(null);
                  } else if (e.key === "Escape") {
                    setEditingId(null);
                  }
                }}
              />
              <button
                onClick={() => {
                  onUpdate(inv.id, { provider: editProviderName });
                  setEditingId(null);
                }}
                className="text-emerald-500 hover:text-emerald-400 p-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditingId(inv.id);
                setEditProviderName(inv.provider || "");
              }}
              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
              title="Editar Prestador"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setConfirmDeleteId(inv.id)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );

  const invoices = project.invoices || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white font-display">
            Notas Fiscais
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar número da nota ou prestador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-500 w-64 shadow-inner"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <button
              onClick={generateReport}
              className="bg-slate-900 text-slate-400 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-950 transition-colors shadow-sm border border-slate-800 font-semibold text-xs h-9"
            >
              <FileText className="w-3.5 h-3.5" />
              Gerar Relatório
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm font-semibold text-xs h-9"
            >
              <Plus className="w-3.5 h-3.5" />
              Anexar Nota
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-6 py-4 font-bold">Prestador / Nota</th>
                <th className="px-4 py-4 font-bold">Data</th>
                <th className="px-4 py-4 font-bold">Natureza</th>
                <th className="px-4 py-4 font-bold">OC</th>
                <th className="px-4 py-4 font-bold">Arquivo</th>
                <th className="px-4 py-4 font-bold text-right">Valor</th>
                <th className="px-6 py-4 font-bold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {Object.keys(groupedInvoices).length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-20 text-center text-slate-500 italic font-medium"
                  >
                    Nenhuma nota fiscal anexada.
                  </td>
                </tr>
              ) : searchTerm.trim() ? (
                // Flat mode for search: Show only individual invoices
                Object.entries(groupedInvoices).flatMap(
                  ([provider, providerInvoices]) =>
                    providerInvoices.map((inv) =>
                      renderInvoiceLine(inv, provider, true),
                    ),
                )
              ) : (
                // Grouped mode
                Object.entries(groupedInvoices).map(
                  ([provider, providerInvoices]) => (
                    <React.Fragment key={provider}>
                      {/* Macro: Provider Row */}
                      <tr
                        className="bg-slate-900/50 hover:bg-slate-800/40 cursor-pointer transition-colors border-l-4 border-l-blue-500"
                        onClick={() => toggleProvider(provider)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-6 h-6 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 transition-transform",
                                expandedProviders[provider] ? "rotate-180" : "",
                              )}
                            >
                              <ChevronDown size={14} />
                            </div>
                            <div>
                              <p className="font-black text-white text-sm tracking-tight">
                                <Highlight text={provider} term={searchTerm} />
                              </p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                {providerInvoices.length}{" "}
                                {providerInvoices.length === 1
                                  ? "Nota"
                                  : "Notas"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td
                          colSpan={4}
                          className="px-4 py-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest italic"
                        >
                          Clique para expandir registros
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-white">
                              {getProviderTotal(
                                providerInvoices,
                              ).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                              Total Prestador
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center"></td>
                      </tr>

                      {/* Micro: Individual Invoices */}
                      {expandedProviders[provider] &&
                        providerInvoices.map((inv) =>
                          renderInvoiceLine(inv, provider, false),
                        )}
                    </React.Fragment>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-2xl p-6 w-full max-w-md relative shadow-xl"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-6 text-white font-display">
              Anexar Nota Fiscal
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">
                  Número da Nota
                </label>
                <input
                  required
                  className="w-full p-2.5 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">
                  Data de Emissão
                </label>
                <input
                  type="date"
                  required
                  className="w-full p-2.5 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">
                  Prestador de Serviço
                </label>
                <input
                  required
                  className="w-full p-2.5 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Nome do fornecedor ou prestador"
                  value={formData.provider}
                  onChange={(e) =>
                    setFormData({ ...formData, provider: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">
                  Natureza
                </label>
                <select
                  required
                  className="w-full p-2.5 border border-slate-700 rounded-xl text-white bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.natureza}
                  onChange={(e) =>
                    setFormData({ ...formData, natureza: e.target.value })
                  }
                >
                  <option value="Obra civil">Obra civil</option>
                  <option value="Instalações">Instalações</option>
                  <option value="Maquinas e Equipamentos">
                    Máquinas e Equipamentos
                  </option>
                  <option value="Móveis">Móveis</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">
                  Valor da Nota
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full p-2.5 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">
                  Vincular a OC (Opcional)
                </label>
                <select
                  className="w-full p-2.5 border border-slate-700 rounded-xl text-white bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.ocNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, ocNumber: e.target.value })
                  }
                >
                  <option value="">Nenhuma OC</option>
                  {(project.ocs || []).map((oc) => (
                    <option key={oc.id} value={oc.number}>
                      OC {oc.number}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">
                  Arquivo PDF
                </label>
                <div className="relative border-2 border-dashed border-slate-700 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-500/10/50 transition-colors group">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Upload className="w-6 h-6 text-slate-500 group-hover:text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-400 text-center">
                      {isUploading
                        ? "Lendo arquivo..."
                        : formData.fileName || "Clique ou arraste o PDF aqui"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-800 rounded-xl text-slate-400 font-semibold hover:bg-slate-950 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl font-semibold transition-colors shadow-sm",
                    isUploading
                      ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700",
                  )}
                >
                  Salvar Nota
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-2xl p-6 w-full max-w-sm text-center text-white shadow-xl"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-display">
              Confirmar Exclusão
            </h3>
            <p className="text-slate-400 mb-6">
              Deseja realmente excluir esta nota fiscal? Esta ação não pode ser
              desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 border border-slate-800 rounded-xl font-semibold hover:bg-slate-950 transition-colors text-slate-400"
              >
                Não, manter
              </button>
              <button
                onClick={() => {
                  onDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-sm"
              >
                Sim, excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export function OCStatusBadge({ status }: { status: OCStatus }) {
  const colors = {
    "Para aprovação": "bg-amber-50 text-amber-700 border-amber-100",
    Aprovado: "bg-emerald-500/10 text-emerald-700 border-emerald-100",
    Negado: "bg-rose-50 text-rose-700 border-rose-100",
  };
  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-xs font-bold border",
        colors[status],
      )}
    >
      {status}
    </span>
  );
}

function TabOcs({
  project,
  onAdd,
  onDelete,
  onUpdate,
}: {
  project: Project;
  onAdd: (oc: OC) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<OC>) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    number: "",
    paymentForecast: new Date().toISOString().split("T")[0],
    status: "Para aprovação" as OCStatus,
    totalValue: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      number: formData.number,
      paymentForecast: formData.paymentForecast,
      status: formData.status,
      totalValue: Number(formData.totalValue),
      description: formData.description,
      createdAt: Date.now(),
    });
    setFormData({
      number: "",
      paymentForecast: new Date().toISOString().split("T")[0],
      status: "Para aprovação",
      totalValue: "",
      description: "",
    });
    setShowModal(false);
  };

  const generateOCReport = () => {
    const doc = new jsPDF();
    const ocs = project.ocs || [];
    const invoices = project.invoices || [];

    doc.setFontSize(18);
    doc.text(`Relatório de Ordens de Compra - ${project.name}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 28);

    const tableData = ocs.map((oc) => {
      const linkedInvoices = invoices.filter(
        (inv) => inv.ocNumber === oc.number,
      );
      const paidValue = linkedInvoices.reduce((sum, inv) => sum + inv.value, 0);
      const totalValue = oc.totalValue || 0;
      const balance = totalValue - paidValue;

      return [
        oc.number,
        oc.description || "-",
        new Date(oc.paymentForecast).toLocaleDateString("pt-BR"),
        oc.status,
        totalValue.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        paidValue.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      ];
    });

    autoTable(doc, {
      startY: 35,
      head: [
        [
          "Número OC",
          "Descrição (Prestador/Serviço)",
          "Previsão",
          "Status",
          "Valor Total",
          "Valor Pago",
          "Saldo",
        ],
      ],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`Relatorio_OCs_${project.name.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white font-display">
          Ordens de Compra (Ocs)
        </h3>
        <div className="flex gap-3">
          <button
            onClick={generateOCReport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-slate-400 border border-slate-800 rounded-xl font-bold hover:bg-slate-950 transition-all shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Relatório OCs
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nova OC
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[800px] whitespace-nowrap">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800">
                <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  Número OC
                </th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  Descrição (Prestador / Serviço)
                </th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  Previsão
                </th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  Valor Total
                </th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  Valor Pago
                </th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  Saldo
                </th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  NFs
                </th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(project.ocs || []).length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-slate-400 font-medium italic"
                  >
                    Nenhuma OC cadastrada.
                  </td>
                </tr>
              ) : (
                [...(project.ocs || [])]
                  .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
                  .map((oc) => {
                  const linkedInvoices = (project.invoices || []).filter(
                    (inv) => inv.ocNumber === oc.number,
                  );
                  const paidValue = linkedInvoices.reduce(
                    (sum, inv) => sum + inv.value,
                    0,
                  );
                  const totalValue = oc.totalValue || 0;
                  const balance = totalValue - paidValue;

                  return (
                    <tr
                      key={oc.id}
                      className="hover:bg-slate-950 transition-colors group"
                    >
                      <td className="px-4 py-3 font-bold text-white">
                        {oc.number}
                      </td>
                      <td className="px-4 py-3 text-slate-300 min-w-[200px]">
                        <input
                          type="text"
                          className="bg-transparent border-b border-transparent hover:border-slate-700/50 focus:border-blue-500 focus:bg-slate-950 px-2 py-1 rounded text-xs text-white w-full outline-none transition-all placeholder:text-slate-600"
                          placeholder="Prestador e serviço..."
                          value={oc.description || ""}
                          onChange={(e) =>
                            onUpdate(oc.id, { description: e.target.value })
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(oc.paymentForecast).toLocaleDateString(
                          "pt-BR",
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative inline-block text-left">
                          <select
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            value={oc.status}
                            onChange={(e) =>
                              onUpdate(oc.id, {
                                status: e.target.value as OCStatus,
                              })
                            }
                          >
                            <option value="Para aprovação" className="text-slate-900 bg-white">
                              Para aprovação
                            </option>
                            <option value="Aprovado" className="text-slate-900 bg-white">
                              Aprovado
                            </option>
                            <option value="Negado" className="text-slate-900 bg-white">
                              Negado
                            </option>
                          </select>
                          <OCStatusBadge status={oc.status} />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-white">
                        {totalValue.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td className="px-4 py-3 font-medium text-emerald-600">
                        {paidValue.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "font-bold",
                            balance > 0
                              ? "text-blue-600"
                              : balance < 0
                                ? "text-red-600"
                                : "text-slate-400",
                          )}
                        >
                          {balance.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {linkedInvoices.length === 0 ? (
                            <span className="text-slate-400 text-[10px] italic">
                              Nenhuma NF
                            </span>
                          ) : (
                            linkedInvoices.map((inv) => (
                              <div
                                key={inv.id}
                                className="flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100 font-bold shadow-sm"
                              >
                                <FileText className="w-2.5 h-2.5" />
                                NF {inv.number}
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setConfirmDeleteId(oc.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-slate-800"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white font-display">
                Nova OC
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">
                  Número da OC
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">
                  Descrição (Prestador e Serviço)
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ex: Prestador XYZ - Pintura da Fachada"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">
                  Previsão de Pagamento
                </label>
                <input
                  type="date"
                  required
                  className="w-full p-2.5 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.paymentForecast}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentForecast: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">
                  Valor Total da OC
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full p-2.5 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.totalValue}
                  onChange={(e) =>
                    setFormData({ ...formData, totalValue: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">
                  Status Inicial
                </label>
                <select
                  className="w-full p-2.5 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as OCStatus,
                    })
                  }
                >
                  <option value="Para aprovação" className="text-slate-900 bg-white">Para aprovação</option>
                  <option value="Aprovado" className="text-slate-900 bg-white">Aprovado</option>
                  <option value="Negado" className="text-slate-900 bg-white">Negado</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-800 rounded-xl text-slate-400 font-semibold hover:bg-slate-950 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Salvar OC
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-2xl p-6 w-full max-w-sm text-center text-white shadow-xl"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-display">
              Confirmar Exclusão
            </h3>
            <p className="text-slate-400 mb-6">
              Deseja realmente excluir esta OC?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 border border-slate-800 rounded-xl font-semibold hover:bg-slate-950 transition-colors text-slate-400"
              >
                Não, manter
              </button>
              <button
                onClick={() => {
                  onDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-sm"
              >
                Sim, excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const parseCurrency = (val: string) => {
  if (!val) return 0;
  return parseFloat(val.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
};

export function CurrencyInput({
  value,
  onChange,
  className,
  required,
  placeholder,
}: {
  value: string | number;
  onChange: (val: string) => void;
  className?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const [localValue, setLocalValue] = useState(String(value));

  const formatValue = (val: string) => {
    if (!val) return "";
    const clean = val.replace(/[^\d,]/g, "").replace(",", ".");
    const num = parseFloat(clean);
    if (isNaN(num)) return val;
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(String(value));
    }
  }, [value]);

  const handleFinish = () => {
    const formatted = formatValue(localValue);
    setLocalValue(formatted);
    onChange(formatted);
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleFinish}
      onKeyDown={(e) => e.key === "Enter" && handleFinish()}
      className={className}
      required={required}
      placeholder={placeholder}
    />
  );
}

function TabDesembolso({
  location,
  onUpdateLocation,
}: {
  location: Location;
  onUpdateLocation: (l: Location) => void;
}) {
  const [editingDisbursement, setEditingDisbursement] = useState<Disbursement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isEditingGlobal, setIsEditingGlobal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    value: "",
    type: "Obra Civil" as DisbursementType,
    description: "",
    installment: "1ª Liberação",
  });

  const [showCustomInstallment, setShowCustomInstallment] = useState(false);
  const [customInstallment, setCustomInstallment] = useState("");

  useEffect(() => {
    if (editingDisbursement) {
      setFormData({
        date: editingDisbursement.date,
        value: editingDisbursement.value.toString(),
        type: editingDisbursement.type,
        description: editingDisbursement.description,
        installment: editingDisbursement.installment,
      });
      setShowModal(true);
    }
  }, [editingDisbursement]);

  const defaultInstallments = Array.from(
    { length: 12 },
    (_, i) => `${i + 1}ª Liberação`,
  );

  // Get unique installments already in use
  const usedInstallments = Array.from(
    new Set(
      (location.disbursements
        ?.map((d) => d.installment)
        .filter(Boolean) as string[]) || [],
    ),
  );

  // Merge defaults with used ones and sort them logically if possible
  const allInstallments = Array.from(
    new Set([...defaultInstallments, ...usedInstallments]),
  ).sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalInstallment = showCustomInstallment
      ? customInstallment
      : formData.installment;
    
    if (editingDisbursement) {
        // Update existing
        const updatedDisbursements = (location.disbursements || []).map(d => 
            d.id === editingDisbursement.id ? {
                ...d,
                date: formData.date,
                value: parseCurrency(formData.value),
                type: formData.type,
                description: formData.description,
                installment: finalInstallment,
            } : d
        );
        onUpdateLocation({
            ...location,
            disbursements: updatedDisbursements,
        });
        setEditingDisbursement(null);
    } else {
        // Create new
        const newDisbursement: Disbursement = {
          id: Math.random().toString(36).substr(2, 9),
          date: formData.date,
          value: parseCurrency(formData.value),
          type: formData.type,
          description: formData.description,
          installment: finalInstallment,
          status: "Aguardando Pagamento",
        };
        onUpdateLocation({
          ...location,
          disbursements: [...(location.disbursements || []), newDisbursement],
        });
    }

    setShowModal(false);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      value: "",
      type: "Obra Civil",
      description: "",
      installment: "1ª Liberação",
    });
    setCustomInstallment("");
    setShowCustomInstallment(false);
  };

  const disbursements = location.disbursements || [];

  const [expandedInstallments, setExpandedInstallments] = useState<
    Record<string, boolean>
  >({});

  const groupedDisbursements = useMemo(() => {
    const groups: Record<string, Disbursement[]> = {};
    disbursements.forEach((d) => {
      const inst = d.installment || "N/A";
      if (!groups[inst]) groups[inst] = [];
      groups[inst].push(d);
    });
    // Sort items within each group by date
    Object.keys(groups).forEach((key) => {
      groups[key].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    });
    return groups;
  }, [disbursements]);

  const sortedInstallmentKeys = useMemo(() => {
    return Object.keys(groupedDisbursements).sort((a, b) => {
      if (a === "N/A") return 1;
      if (b === "N/A") return -1;
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [groupedDisbursements]);

  const totalsByInstallment = useMemo(() => {
    const totals: Record<string, number> = {};
    disbursements.forEach((d) => {
      const inst = d.installment || "N/A";
      totals[inst] = (totals[inst] || 0) + d.value;
    });
    return totals;
  }, [disbursements]);

  const installmentStatuses = useMemo(() => {
    const statuses: Record<string, "Pago" | "Aguardando Pagamento"> = {};
    disbursements.forEach((d) => {
      const inst = d.installment || "N/A";
      // If any disbursement in the group is not 'Pago', the group is 'Aguardando Pagamento'
      if (!statuses[inst]) {
        statuses[inst] = d.status || "Aguardando Pagamento";
      } else if (d.status === "Aguardando Pagamento") {
        statuses[inst] = "Aguardando Pagamento";
      }
    });
    return statuses;
  }, [disbursements]);

  const handleToggleInstallmentStatus = (inst: string) => {
    const currentStatus = installmentStatuses[inst];
    const newStatus: "Pago" | "Aguardando Pagamento" =
      currentStatus === "Pago" ? "Aguardando Pagamento" : "Pago";

    const updatedDisbursements = disbursements.map((d) => {
      if ((d.installment || "N/A") === inst) {
        return { ...d, status: newStatus };
      }
      return d;
    });

    onUpdateLocation({ ...location, disbursements: updatedDisbursements });
  };

  const totalsByType = disbursements.reduce(
    (acc, d) => {
      if (d.status === "Pago") {
        acc[d.type] = (acc[d.type] || 0) + d.value;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const types: DisbursementType[] = [
    "Obra Civil",
    "Instalações",
    "Equipamento",
    "Móveis",
  ];

  const totalContract = types.reduce(
    (acc, type) =>
      acc +
      parseCurrency(
        String(location.disbursementConfig?.[type]?.contractValue || "0"),
      ),
    0,
  );
  const totalFinancing = types.reduce(
    (acc, type) =>
      acc +
      parseCurrency(
        String(location.disbursementConfig?.[type]?.financingValue || "0"),
      ),
    0,
  );
  const totalDisbursed = disbursements
    .filter((d) => d.status === "Pago")
    .reduce((acc, d) => acc + d.value, 0);
  const totalPending = disbursements
    .filter((d) => d.status === "Aguardando Pagamento")
    .reduce((acc, d) => acc + d.value, 0);
  const totalBalance = totalFinancing - totalDisbursed;

  const handleUpdateConfig = (
    type: DisbursementType,
    field: "contractValue" | "financingValue",
    value: string,
  ) => {
    const currentConfig = location.disbursementConfig || {};
    const typeConfig = currentConfig[type] || {
      contractValue: "",
      financingValue: "",
    };

    onUpdateLocation({
      ...location,
      disbursementConfig: {
        ...currentConfig,
        [type]: { ...typeConfig, [field]: value },
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white font-display">
            Desembolso (Receita do Financiamento)
          </h3>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Gerencie os valores de contrato, financiamento e acompanhe os
            desembolsos reais.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditingGlobal(!isEditingGlobal)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
              isEditingGlobal
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:border-slate-600 border border-slate-700 shadow-sm",
            )}
          >
            {isEditingGlobal ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Finalizar Edição
              </>
            ) : (
              <>
                <Settings2 className="w-4 h-4" />
                Editar Referências
              </>
            )}
          </button>
          <button
            onClick={() => {
              setEditingDisbursement(null);
              setShowModal(true);
            }}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-500 transition-colors shadow-sm font-semibold text-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Novo Desembolso
          </button>
        </div>
      </div>

      {/* Informativo de Saldos Totais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-500/10 rounded-md">
              <ClipboardList className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">
              Total do Contrato
            </p>
          </div>
          <p
            className="text-base font-black text-white font-mono truncate"
            title={totalContract.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          >
            {totalContract.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm hover:border-slate-700 transition-all font-mono">
          <div className="flex items-center gap-2 mb-2 font-sans">
            <div className="p-1.5 bg-indigo-500/10 rounded-md">
              <HardHat className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">
              Total Financiamento
            </p>
          </div>
          <p
            className="text-base font-black text-white truncate"
            title={totalFinancing.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          >
            {totalFinancing.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>

        <div className="bg-slate-900 border border-amber-500/10 p-4 rounded-xl shadow-sm hover:border-amber-500/30 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-amber-500/10 rounded-md">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">
              Aguardando Desembolso
            </p>
          </div>
          <p
            className="text-base font-black text-amber-500 font-mono truncate"
            title={totalPending.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          >
            {totalPending.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>

        <div className="bg-slate-900 border border-emerald-500/10 p-4 rounded-xl shadow-sm hover:border-emerald-500/30 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-500/10 rounded-md">
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">
              Total Desembolsado
            </p>
          </div>
          <p
            className="text-base font-black text-emerald-500 font-mono truncate"
            title={totalDisbursed.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          >
            {totalDisbursed.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>

        <div
          className={cn(
            "bg-slate-900 border p-4 rounded-xl shadow-sm hover:border-slate-700 transition-all",
            totalBalance >= 0 ? "border-blue-500/10" : "border-red-500/10",
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={cn(
                "p-1.5 rounded-md",
                totalBalance >= 0 ? "bg-blue-500/10" : "bg-red-500/10",
              )}
            >
              <LayoutGrid className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">
              Saldo Financiamento
            </p>
          </div>
          <p
            className={cn(
              "text-base font-black font-mono truncate",
              totalBalance >= 0 ? "text-blue-500" : "text-red-500",
            )}
            title={totalBalance.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          >
            {totalBalance.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px] whitespace-nowrap">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Categoria</th>
                <th className="px-6 py-4 font-semibold text-right">
                  Valor do Contrato
                </th>
                <th className="px-6 py-4 font-semibold text-right">
                  Valor do Financiamento
                </th>
                <th className="px-6 py-4 font-semibold text-right">
                  Valor Já Desembolsado
                </th>
                <th className="px-6 py-4 font-semibold text-right">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {types.map((type) => {
                const config = location.disbursementConfig?.[type] || {
                  contractValue: "",
                  financingValue: "",
                };
                const disbursed = totalsByType[type] || 0;
                const contractValueNum = parseCurrency(
                  String(config.contractValue),
                );
                const financingValueNum = parseCurrency(
                  String(config.financingValue),
                );
                const balance = financingValueNum - disbursed;
                return (
                  <tr
                    key={type}
                    className="hover:bg-slate-950 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-white">
                      {type}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditingGlobal ? (
                        <CurrencyInput
                          value={config.contractValue}
                          onChange={(val) =>
                            handleUpdateConfig(type, "contractValue", val)
                          }
                          className="w-32 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-right outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                        />
                      ) : (
                        <span className="font-bold text-slate-300">
                          {contractValueNum.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditingGlobal ? (
                        <CurrencyInput
                          value={config.financingValue}
                          onChange={(val) =>
                            handleUpdateConfig(type, "financingValue", val)
                          }
                          className="w-32 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-right outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                        />
                      ) : (
                        <span className="font-bold text-slate-300">
                          {financingValueNum.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-500">
                      {disbursed.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td
                      className={cn(
                        "px-6 py-4 text-right font-bold",
                        balance >= 0 ? "text-blue-500" : "text-red-500",
                      )}
                    >
                      {balance.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        {disbursements.length === 0 ? (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center text-slate-400 italic shadow-sm">
            Nenhum desembolso registrado.
          </div>
        ) : (
          sortedInstallmentKeys.map((inst) => {
            const items = groupedDisbursements[inst];
            const total = totalsByInstallment[inst];
            const isExpanded = expandedInstallments[inst] ?? true;

            return (
              <div
                key={inst}
                className={cn(
                  "bg-slate-900 rounded-2xl border overflow-hidden shadow-sm transition-all hover:border-slate-700",
                  installmentStatuses[inst] === "Pago"
                    ? "border-emerald-500/20 shadow-emerald-500/5"
                    : "border-slate-800",
                )}
              >
                <div className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() =>
                        setExpandedInstallments((prev) => ({
                          ...prev,
                          [inst]: !isExpanded,
                        }))
                      }
                      className="bg-slate-800 p-2 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-white font-bold text-lg font-display">
                          {inst}
                        </h4>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                          {items.length}{" "}
                          {items.length === 1 ? "Lançamento" : "Lançamentos"}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          onClick={() => handleToggleInstallmentStatus(inst)}
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95",
                            installmentStatuses[inst] === "Pago"
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                              : "bg-slate-800 text-slate-500 border border-slate-700",
                          )}
                        >
                          {installmentStatuses[inst] === "Pago" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Lançamento Pago
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              Aguardando Pagamento
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Total da Liberação
                    </p>
                    <p
                      className={cn(
                        "text-xl font-black font-mono",
                        installmentStatuses[inst] === "Pago"
                          ? "text-emerald-500"
                          : "text-slate-400",
                      )}
                    >
                      {total.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className="bg-slate-950/50 rounded-xl border border-slate-800/50 overflow-x-auto">
                          <table className="w-full text-left text-xs min-w-[700px]">
                            <thead className="bg-slate-950/80 text-slate-500 border-b border-slate-800">
                              <tr>
                                <th className="px-4 py-3 font-black uppercase tracking-widest">
                                  Data
                                </th>
                                <th className="px-4 py-3 font-black uppercase tracking-widest text-center">
                                  Tipo
                                </th>
                                <th className="px-4 py-3 font-black uppercase tracking-widest">
                                  Descrição
                                </th>
                                <th className="px-4 py-3 font-black uppercase tracking-widest text-right">
                                  Valor
                                </th>
                                <th className="px-4 py-3 font-black uppercase tracking-widest text-center">
                                  Ações
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                              {items.map((d) => (
                                <tr
                                  key={d.id}
                                  className="hover:bg-slate-800/20 transition-colors group"
                                >
                                  <td className="px-4 py-3 text-slate-400 font-mono">
                                    {new Date(d.date).toLocaleDateString(
                                      "pt-BR",
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span
                                      className={cn(
                                        "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                                        d.type === "Obra Civil"
                                          ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                          : d.type === "Instalações"
                                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                            : d.type === "Equipamento"
                                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                              : "bg-purple-500/10 text-purple-500 border-purple-500/20",
                                      )}
                                    >
                                      {d.type}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-slate-300 font-medium">
                                    {d.description}
                                  </td>
                                  <td className="px-4 py-3 text-right font-bold text-white">
                                    {d.value.toLocaleString("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                    })}
                                  </td>
                                  <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => setEditingDisbursement(d)}
                                        className="p-1.5 text-blue-500/50 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setConfirmDeleteId(d.id)}
                                      className="p-1.5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-2xl p-6 w-full max-w-md relative shadow-xl"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-6 text-white font-display">
              Registrar Desembolso
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-400">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full p-2.5 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-800"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-400">
                    Liberação
                  </label>
                  {!showCustomInstallment ? (
                    <select
                      className="w-full p-2.5 border border-slate-700 rounded-xl text-white bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={formData.installment}
                      onChange={(e) => {
                        if (e.target.value === "custom") {
                          setShowCustomInstallment(true);
                        } else {
                          setFormData({
                            ...formData,
                            installment: e.target.value,
                          });
                        }
                      }}
                    >
                      {allInstallments.map((inst) => (
                        <option key={inst} value={inst}>
                          {inst}
                        </option>
                      ))}
                      <option value="custom">+ Outra...</option>
                    </select>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Ex: 13ª Liberação"
                        className="w-full p-2.5 border border-slate-700 rounded-xl text-white bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={customInstallment}
                        onChange={(e) => setCustomInstallment(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCustomInstallment(false)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-400">
                    Tipo de Pagamento
                  </label>
                  <select
                    className="w-full p-2.5 border border-slate-700 rounded-xl text-white bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as DisbursementType,
                      })
                    }
                  >
                    <option value="Obra Civil">Obra Civil</option>
                    <option value="Instalações">Instalações</option>
                    <option value="Equipamento">Equipamento</option>
                    <option value="Móveis">Móveis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-400">
                    Valor
                  </label>
                  <CurrencyInput
                    required
                    className="w-full p-2.5 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-800"
                    value={formData.value}
                    onChange={(val) => setFormData({ ...formData, value: val })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">
                  Descrição
                </label>
                <textarea
                  className="w-full p-2.5 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[100px] bg-slate-800"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-800 rounded-xl text-slate-400 font-semibold hover:bg-slate-950 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Salvar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-2xl p-6 w-full max-w-sm text-center text-white shadow-xl"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-display">
              Confirmar Exclusão
            </h3>
            <p className="text-slate-400 mb-6">
              Deseja realmente excluir este registro de desembolso?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 border border-slate-800 rounded-xl font-semibold hover:bg-slate-950 transition-colors text-slate-400"
              >
                Não, manter
              </button>
              <button
                onClick={() => {
                  onUpdateLocation({
                    ...location,
                    disbursements: (location.disbursements || []).filter(
                      (d) => d.id !== confirmDeleteId,
                    ),
                  });
                  setConfirmDeleteId(null);
                  toast.success("Registro excluído com sucesso!");
                }}
                className="flex-1 py-2.5 bg-red-600 rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-sm"
              >
                Sim, excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function TabPrestacaoContas() {
  return null;
}

function DisabledTabPrestacaoContas({
  location,
  onUpdateLocation,
}: {
  location: Location;
  onUpdateLocation: (l: Location) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [textSearch, setTextSearch] = useState<string>("");

  // Dynamic Release Creation Dialog state
  const [showNewReleaseModal, setShowNewReleaseModal] = useState(false);
  const [newReleaseName, setNewReleaseName] = useState("");

  // Rename release dialog state
  const [renamingReleaseOld, setRenamingReleaseOld] = useState<string | null>(null);
  const [renamingReleaseNew, setRenamingReleaseNew] = useState("");

  // Dropdown filter to focus on a single release
  const [selectedReleaseFilter, setSelectedReleaseFilter] = useState<string>("Todas");

  // Accordion expanded state tracking
  const [expandedReleases, setExpandedReleases] = useState<Record<string, boolean>>({});
  const toggleAccordion = (name: string) => {
    setExpandedReleases((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Form states for adding sent R$ amount (notas enviadas / comprovantes)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    value: "",
    description: "",
    notes: "",
    installment: "",
    providerName: "",
    type: "Obra Civil" as DisbursementType,
  });

  const entries = location.accountability || [];

  // Determine dynamic custom installments
  const allInstallments = useMemo(() => {
    return location.accountabilityInstallments && location.accountabilityInstallments.length > 0
      ? location.accountabilityInstallments
      : ["1ª Liberação", "2ª Liberação", "3ª Liberação"];
  }, [location.accountabilityInstallments]);

  // Set default selection of installment in the form on changes
  useEffect(() => {
    if (!formData.installment && allInstallments.length > 0) {
      setFormData((prev) => ({ ...prev, installment: allInstallments[0] }));
    }
  }, [allInstallments, formData.installment]);

  // State for inline local inputs of reference targets, synchronized with real state
  const [localRefValues, setLocalRefValues] = useState<Record<string, string>>({});

  // States for fallback reference configuration popup modal
  const [editingMetaRelease, setEditingMetaRelease] = useState<string | null>(null);
  const [localMetaObra, setLocalMetaObra] = useState("");
  const [localMetaInst, setLocalMetaInst] = useState("");
  const [localMetaEquip, setLocalMetaEquip] = useState("");
  const [localMetaMovel, setLocalMetaMovel] = useState("");

  // Populate local meta values when the popup opens
  useEffect(() => {
    if (editingMetaRelease) {
      const refs = location.releaseReferences || {};
      setLocalMetaObra(refs[`${editingMetaRelease}_Obra Civil`] ? String(refs[`${editingMetaRelease}_Obra Civil`]) : "");
      setLocalMetaInst(refs[`${editingMetaRelease}_Instalações`] ? String(refs[`${editingMetaRelease}_Instalações`]) : "");
      setLocalMetaEquip(refs[`${editingMetaRelease}_Equipamento`] ? String(refs[`${editingMetaRelease}_Equipamento`]) : "");
      setLocalMetaMovel(refs[`${editingMetaRelease}_Móveis`] ? String(refs[`${editingMetaRelease}_Móveis`]) : "");
    }
  }, [editingMetaRelease, location.releaseReferences]);

  // Filters computed display list of releases
  const visibleInstallments = useMemo(() => {
    if (selectedReleaseFilter === "Todas") return allInstallments;
    return allInstallments.filter((x) => x === selectedReleaseFilter);
  }, [allInstallments, selectedReleaseFilter]);

  useEffect(() => {
    const refs = location.releaseReferences || {};
    const newLocalRefs: Record<string, string> = {};
    allInstallments.forEach((inst) => {
      (["Obra Civil", "Instalações", "Equipamento", "Móveis"] as DisbursementType[]).forEach((cat) => {
        const key = `${inst}_${cat}`;
        const val = refs[key] ?? 0;
        newLocalRefs[key] = val > 0 ? String(val) : "";
      });
    });
    setLocalRefValues(newLocalRefs);
  }, [location.releaseReferences, allInstallments]);

  // Handle saving of inline meta to state instantly on blur (exactly like Excel!)
  const handleLocalMetaChange = (inst: string, cat: string, valStr: string) => {
    setLocalRefValues((prev) => ({
      ...prev,
      [`${inst}_${cat}`]: valStr,
    }));
  };

  const handleLocalMetaBlur = (inst: string, cat: string) => {
    const valStr = localRefValues[`${inst}_${cat}`] || "";
    const numericVal = parseCurrency(valStr);
    const key = `${inst}_${cat}`;

    const updatedReferences = {
      ...(location.releaseReferences || {}),
      [key]: numericVal,
    };

    onUpdateLocation({
      ...location,
      releaseReferences: updatedReferences,
    });
    toast.success(`Meta de "${cat}" no lote "${inst}" atualizada para R$ ${numericVal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
  };

  const statsByInstallment = useMemo(() => {
    const stats: Record<
      string,
      {
        metaObra: number;
        metaInst: number;
        metaEquip: number;
        metaMovel: number;
        metaSum: number;
        sentObra: number;
        sentInst: number;
        sentEquip: number;
        sentMovel: number;
        sentSum: number;
        balanceObra: number;
        balanceInst: number;
        balanceEquip: number;
        balanceMovel: number;
        balanceSum: number;
      }
    > = {};

    allInstallments.forEach((inst) => {
      // Metas for each category
      const metaObra = location.releaseReferences?.[`${inst}_Obra Civil`] ?? 0;
      const metaInst = location.releaseReferences?.[`${inst}_Instalações`] ?? 0;
      const metaEquip = location.releaseReferences?.[`${inst}_Equipamento`] ?? 0;
      const metaMovel = location.releaseReferences?.[`${inst}_Móveis`] ?? 0;
      const metaSum = metaObra + metaInst + metaEquip + metaMovel;

      // Sent entries for this installment
      const groupEntries = entries.filter((e) => e.installment === inst);
      const sentObra = groupEntries.filter((e) => e.type === "Obra Civil").reduce((sum, curr) => sum + curr.value, 0);
      const sentInst = groupEntries.filter((e) => e.type === "Instalações").reduce((sum, curr) => sum + curr.value, 0);
      const sentEquip = groupEntries.filter((e) => e.type === "Equipamento").reduce((sum, curr) => sum + curr.value, 0);
      const sentMovel = groupEntries.filter((e) => e.type === "Móveis").reduce((sum, curr) => sum + curr.value, 0);
      const sentSum = sentObra + sentInst + sentEquip + sentMovel;

      const balanceObra = Math.max(0, metaObra - sentObra);
      const balanceInst = Math.max(0, metaInst - sentInst);
      const balanceEquip = Math.max(0, metaEquip - sentEquip);
      const balanceMovel = Math.max(0, metaMovel - sentMovel);
      const balanceSum = Math.max(0, metaSum - sentSum);

      stats[inst] = {
        metaObra,
        metaInst,
        metaEquip,
        metaMovel,
        metaSum,
        sentObra,
        sentInst,
        sentEquip,
        sentMovel,
        sentSum,
        balanceObra,
        balanceInst,
        balanceEquip,
        balanceMovel,
        balanceSum,
      };
    });

    return stats;
  }, [allInstallments, entries, location.releaseReferences]);

  const overallStats = useMemo(() => {
    let totalReference = 0;
    let totalSent = 0;

    allInstallments.forEach((inst) => {
      const s = statsByInstallment[inst];
      if (s) {
        totalReference += s.metaSum;
        totalSent += s.sentSum;
      }
    });

    const balance = Math.max(0, totalReference - totalSent);
    const progressPercent = totalReference > 0 
      ? Math.min(100, Math.round((totalSent / totalReference) * 100)) 
      : 0;

    return {
      totalReference,
      totalSent,
      balance,
      progressPercent,
    };
  }, [allInstallments, statsByInstallment]);

  const handleOpenAddModal = (initialInstallment?: string, initialType?: DisbursementType) => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      value: "",
      description: "",
      notes: "",
      installment: initialInstallment || allInstallments[0] || "1ª Liberação",
      providerName: "",
      type: initialType || "Obra Civil",
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) {
      toast.warning("Por favor, preencha a descrição do valor enviado.");
      return;
    }
    const val = parseCurrency(formData.value);
    if (val <= 0) {
      toast.warning("Por favor, informe um valor em R$ válido e maior que zero.");
      return;
    }

    const newEntry: AccountabilityEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: formData.date,
      description: formData.description,
      value: val,
      category: "Material / Suprimentos",
      status: "Aprovado",
      notes: formData.notes || undefined,
      installment: formData.installment,
      providerName: formData.providerName || undefined,
      type: formData.type,
    };

    onUpdateLocation({
      ...location,
      accountability: [...entries, newEntry],
    });

    toast.success("Valor enviado registrado com sucesso!");
    setShowModal(false);
  };

  const handleDeleteEntry = (id: string) => {
    onUpdateLocation({
      ...location,
      accountability: entries.filter((e) => e.id !== id),
    });
    setConfirmDeleteId(null);
    toast.success("Lançamento removido com sucesso.");
  };

  // Add a new custom release
  const handleAddRelease = (name: string) => {
    if (!name.trim()) {
      toast.warning("Informe um nome válido para a liberação.");
      return;
    }
    const updated = [...allInstallments, name.trim()];
    onUpdateLocation({
      ...location,
      accountabilityInstallments: updated,
    });
    setNewReleaseName("");
    setShowNewReleaseModal(false);
    toast.success(`Liberação "${name}" adicionada!`);
  };

  // Rename a custom release
  const handleRenameReleaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const oldName = renamingReleaseOld;
    const newName = renamingReleaseNew.trim();
    if (!oldName || !newName) return;

    const updated = allInstallments.map((i) => (i === oldName ? newName : i));
    const updatedEntries = entries.map((entry) => 
      entry.installment === oldName ? { ...entry, installment: newName } : entry
    );

    const updatedRefs = { ...(location.releaseReferences || {}) };
    const categories: DisbursementType[] = ["Obra Civil", "Instalações", "Equipamento", "Móveis"];
    categories.forEach((cat) => {
      const oldKey = `${oldName}_${cat}`;
      const newKey = `${newName}_${cat}`;
      if (oldKey in updatedRefs) {
        updatedRefs[newKey] = updatedRefs[oldKey];
        delete updatedRefs[oldKey];
      }
    });

    onUpdateLocation({
      ...location,
      accountabilityInstallments: updated,
      accountability: updatedEntries,
      releaseReferences: updatedRefs,
    });

    setRenamingReleaseOld(null);
    setRenamingReleaseNew("");
    toast.success("Nome da liberação alterado!");
  };

  // Delete a custom release completely
  const handleDeleteRelease = (name: string) => {
    const updated = allInstallments.filter((i) => i !== name);
    const updatedEntries = entries.filter((e) => e.installment !== name);
    onUpdateLocation({
      ...location,
      accountabilityInstallments: updated,
      accountability: updatedEntries,
    });
    toast.success(`Liberação "${name}" excluída com sucesso!`);
  };

  const handleSavePopupReferences = () => {
    if (!editingMetaRelease) return;
    const refCopy = { ...(location.releaseReferences || {}) };
    refCopy[`${editingMetaRelease}_Obra Civil`] = parseCurrency(localMetaObra);
    refCopy[`${editingMetaRelease}_Instalações`] = parseCurrency(localMetaInst);
    refCopy[`${editingMetaRelease}_Equipamento`] = parseCurrency(localMetaEquip);
    refCopy[`${editingMetaRelease}_Móveis`] = parseCurrency(localMetaMovel);

    onUpdateLocation({
      ...location,
      releaseReferences: refCopy,
    });

    setLocalRefValues((prev) => ({
      ...prev,
      [`${editingMetaRelease}_Obra Civil`]: localMetaObra,
      [`${editingMetaRelease}_Instalações`]: localMetaInst,
      [`${editingMetaRelease}_Equipamento`]: localMetaEquip,
      [`${editingMetaRelease}_Móveis`]: localMetaMovel,
    }));

    setEditingMetaRelease(null);
    toast.success(`Metas da "${editingMetaRelease}" atualizadas!`);
  };

  const getFilteredEntries = (inst?: string) => {
    return entries.filter((e) => {
      if (inst && e.installment !== inst) return false;
      if (selectedReleaseFilter !== "Todas" && e.installment !== selectedReleaseFilter) return false;

      const matchSearch = textSearch === "" ||
        e.description.toLowerCase().includes(textSearch.toLowerCase()) ||
        (e.notes && e.notes.toLowerCase().includes(textSearch.toLowerCase())) ||
        (e.providerName && e.providerName.toLowerCase().includes(textSearch.toLowerCase()));

      return matchSearch;
    });
  };

  const exportPDF = () => {
    const doc = new jsPDF() as any;
    doc.setFont("Helvetica", "bold");
    doc.text(`Relatório de Prestação de Contas - ${location.name}`, 14, 15);
    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 22);

    doc.text(`Metas Consolidadas: ${overallStats.totalReference.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`, 14, 28);
    doc.text(`Total Lançado: ${overallStats.totalSent.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`, 14, 33);
    doc.text(`Saldo Restante a Cobrir: ${overallStats.balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`, 14, 38);

    const tableHeaders = [["Liberação", "Data Lançamento", "Tipo Categoria", "Identificador/Fornecedor", "Descrição", "Valor em R$"]];
    const tableRows = entries.map((e) => [
      e.installment,
      new Date(e.date + "T12:00:00").toLocaleDateString("pt-BR"),
      e.type || "Obra Civil",
      e.providerName || "-",
      e.description,
      e.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    ]);

    autoTable(doc, {
      head: tableHeaders,
      body: tableRows,
      startY: 45,
      theme: "striped",
      headStyles: { fillColor: [124, 58, 237] },
    });

    doc.save(`planilha-prestacao-${location.name.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  };

  const exportExcel = () => {
    const worksheetData = entries.map((e) => ({
      "Liberação": e.installment,
      "Data Lançamento": new Date(e.date + "T12:00:00").toLocaleDateString("pt-BR"),
      "Tipo de Categoria": e.type || "Obra Civil",
      "Fornecedor / Ref": e.providerName || "",
      "Descrição": e.description,
      "Valor Lançado": e.value,
      "Observações": e.notes || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lançamentos de Lotes");
    XLSX.writeFile(workbook, `tabela-financeira-${location.name.toLowerCase().replace(/\s+/g, "-")}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Upper header block */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
            <Receipt className="w-6 h-6 text-purple-500" />
            Planilha Geral de Prestação de Contas (Excel Link)
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Veja todas as metas e valores realizados em uma grade única, exatamente como no Microsoft Excel. Edite o orçamento diretamente nas caixas de texto.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportPDF}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-colors"
          >
            <Download className="w-4 h-4 text-purple-400" />
            PDF
          </button>
          <button
            onClick={exportExcel}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Excel
          </button>
          <button
            onClick={() => setShowNewReleaseModal(true)}
            className="bg-slate-900 border border-purple-900/40 text-purple-400 hover:text-purple-300 px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            Criar Lote/Liberação
          </button>
          <button
            onClick={() => handleOpenAddModal()}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:to-indigo-500 hover:from-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 text-xs font-black shadow-lg shadow-purple-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Lançar Novo Valor R$
          </button>
        </div>
      </div>

      {/* Simplified KPI indicators cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-sans">Soma de Orçamentos</span>
            <span className="p-1 bg-purple-500/10 text-purple-404 border border-purple-500/20 rounded-md">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-purple-400 font-mono">
              {overallStats.totalReference.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
            <p className="text-slate-500 text-[10px] mt-0.5 font-bold">Total previsto nas liberações</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-sans">Soma de Realizados</span>
            <span className="p-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-emerald-400 font-mono">
              {overallStats.totalSent.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
            <p className="text-slate-500 text-[10px] mt-0.5 font-bold">Total de comprovantes/valores registrados</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-sans">Diferença a Realizar</span>
            <span className="p-1 bg-amber-500/10 text-amber-505 border border-amber-500/20 rounded-md">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className={`text-xl font-black font-mono ${overallStats.balance > 0 ? "text-yellow-400" : "text-emerald-400"}`}>
              {overallStats.balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
            <p className="text-slate-500 text-[10px] mt-0.5 font-bold">Saldo restante para atingir metas</p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-sans">Porcentagem Coberta</span>
            <span className="text-xs font-black text-slate-400 font-mono">{overallStats.progressPercent}%</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60 font-medium">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${overallStats.progressPercent}%` }}
              />
            </div>
            <p className="text-slate-500 text-[9px] font-bold">Percentual consolidado do projeto coberto</p>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS & TABLE TOOLS */}
      <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800/80 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Release exhibit view switcher */}
          <div className="flex flex-col gap-1 w-52">
            <label className="text-[9px] text-slate-500 font-black uppercase tracking-wider font-sans">Filtro de Lote / Liberação</label>
            <select
              value={selectedReleaseFilter}
              onChange={(e) => setSelectedReleaseFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs font-bold text-white p-1.5 px-3 rounded-lg outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="Todas" className="text-slate-900">Exibir Todos os Lotes (Grade Geral)</option>
              {allInstallments.map((inst) => (
                <option key={inst} value={inst} className="text-slate-900">{inst}</option>
              ))}
            </select>
          </div>

          {/* Quick search input */}
          <div className="flex flex-col gap-1 w-56">
            <label className="text-[9px] text-slate-500 font-black uppercase tracking-wider font-sans">Buscar nos Lançamentos</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Descrição, fornecedor..."
                value={textSearch}
                onChange={(e) => setTextSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-purple-500 font-bold"
              />
            </div>
          </div>
        </div>

        <div className="text-right self-end sm:self-center">
          <span className="text-[10px] text-slate-505 font-bold bg-slate-950 px-2 py-1 border border-slate-850 rounded-md">
            Excel Mode • Clique e digite nas caixas de texto de metas
          </span>
        </div>
      </div>

      {/* EXECUTIVE EXCEL WORKSTATEMENT GRID SPREADSHEET */}
      <div className="bg-slate-900/30 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="p-3 border-r border-slate-800 w-44">Lote / Liberação</th>
                <th className="p-3 border-r border-slate-800 w-36">Tipo de Pagamento</th>
                <th className="p-3 border-r border-slate-800 text-right w-44">Meta Prevista (R$ - Clique para Editar)</th>
                <th className="p-3 border-r border-slate-800 text-right w-40">Valor Lançado Realizado (R$)</th>
                <th className="p-3 border-r border-slate-800 text-right w-40">Saldo Pendente (A Realizar R$)</th>
                <th className="p-3 border-r border-slate-800 w-44">Cobertura %</th>
                <th className="p-3 text-center w-28">Ações</th>
              </tr>
            </thead>
            {visibleInstallments.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 font-bold italic bg-slate-950/20">
                    Nenhuma liberação elegível correspondente nos filtros. Crie uma nova liberação utilizando o botão acima.
                  </td>
                </tr>
              </tbody>
            ) : (
              visibleInstallments.map((inst) => {
                const s = statsByInstallment[inst] || {
                  metaObra: 0,
                  metaInst: 0,
                  metaEquip: 0,
                  metaMovel: 0,
                  metaSum: 0,
                  sentObra: 0,
                  sentInst: 0,
                  sentEquip: 0,
                  sentMovel: 0,
                  sentSum: 0,
                  balanceObra: 0,
                  balanceInst: 0,
                  balanceEquip: 0,
                  balanceMovel: 0,
                  balanceSum: 0,
                };

                const categoriesList: { label: DisbursementType; meta: number; sent: number; balance: number }[] = [
                  { label: "Obra Civil", meta: s.metaObra, sent: s.sentObra, balance: s.balanceObra },
                  { label: "Instalações", meta: s.metaInst, sent: s.sentInst, balance: s.balanceInst },
                  { label: "Equipamento", meta: s.metaEquip, sent: s.sentEquip, balance: s.balanceEquip },
                  { label: "Móveis", meta: s.metaMovel, sent: s.sentMovel, balance: s.balanceMovel },
                ];

                return (
                  <tbody key={inst} className="border-b border-slate-800/80 last:border-0">
                    {categoriesList.map((cat, catIdx) => {
                      const refKey = `${inst}_${cat.label}`;
                      const coveragePercentage = cat.meta > 0 ? Math.min(100, Math.round((cat.sent / cat.meta) * 100)) : 0;

                      return (
                        <tr key={cat.label} className="group hover:bg-slate-900/15 border-b border-slate-800/40 last:border-0 transition-colors">
                          {/* Installment Spanned block column (shows once for 4 rows) */}
                          {catIdx === 0 && (
                            <td rowSpan={4} className="p-4 align-top border-r border-slate-800 bg-slate-950/40 w-44">
                              <div className="flex flex-col h-full justify-between gap-6">
                                <div>
                                  <span className="font-extrabold text-white text-[13px] tracking-tight block">{inst}</span>
                                  <span className="text-[9px] text-slate-500 font-bold mt-1 block uppercase tracking-wider">
                                    Total de 4 categorias
                                  </span>
                                </div>
                                <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-800/60 font-medium">
                                  <button
                                    onClick={() => {
                                      setRenamingReleaseOld(inst);
                                      setRenamingReleaseNew(inst);
                                    }}
                                    className="px-2 py-1 bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-400 border border-slate-800 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 transition-all"
                                  >
                                    <Edit2 className="w-2.5 h-2.5 text-purple-400" />
                                    Renomear Lote
                                  </button>
                                  {allInstallments.length > 1 && (
                                    <button
                                      onClick={() => handleDeleteRelease(inst)}
                                      className="px-2 py-1 bg-slate-900 hover:bg-rose-950/25 hover:text-red-400 text-slate-500 border border-slate-800 hover:border-red-950/10 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 transition-all"
                                    >
                                      <Trash2 className="w-2.5 h-2.5 text-rose-500" />
                                      Excluir Lote
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                          )}

                          {/* Category Name Column */}
                          <td className="p-3 border-r border-slate-800/60 font-medium text-slate-300">
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              cat.label === "Obra Civil" ? "bg-blue-500/10 text-blue-400 border border-blue-500/10" :
                              cat.label === "Instalações" ? "bg-amber-500/10 text-amber-400 border border-amber-500/10" :
                              cat.label === "Equipamento" ? "bg-purple-500/10 text-purple-400 border border-purple-500/10" :
                              "bg-rose-500/10 text-rose-455 border border-rose-500/10"
                            }`}>
                              {cat.label}
                            </span>
                          </td>

                          {/* Editable Meta Cell Input Box (Excel Feel) */}
                          <td className="p-2 border-r border-slate-800/60 bg-slate-950/15 w-44">
                            <div className="relative flex items-center group/input">
                              <span className="absolute left-2.5 text-slate-650 text-[10px] font-mono font-bold select-none">R$</span>
                              <CurrencyInput
                                value={localRefValues[refKey] || ""}
                                onChange={(val) => handleLocalMetaChange(inst, cat.label, val)}
                                className="w-full bg-slate-950/85 border border-slate-800 hover:border-slate-705 focus:border-purple-600 rounded-lg pl-7 p-1 text-right font-mono font-bold text-[11px] text-white outline-none focus:ring-1 focus:ring-purple-600 placeholder:text-slate-800 transition-colors"
                                placeholder="0,00"
                              />
                              <button
                                onClick={() => handleLocalMetaBlur(inst, cat.label)}
                                className="ml-1 px-1.5 py-1 bg-purple-950/40 border border-purple-800/40 hover:border-purple-650 text-purple-400 hover:text-white rounded-md text-[9px] font-bold opacity-0 group-hover/input:opacity-100 focus:opacity-100 transition-all shadow-sm shrink-0"
                                title="Salvar orçamento desta célula"
                              >
                                Tab
                              </button>
                            </div>
                          </td>

                          {/* Sent Lançado Column */}
                          <td className="p-3 font-mono font-black text-emerald-450 border-r border-slate-800/60 text-right w-40">
                            {cat.sent > 0 ? (
                              <span className="bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 font-sans">
                                {cat.sent.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </span>
                            ) : (
                              <span className="text-slate-600 font-medium">-</span>
                            )}
                          </td>

                          {/* Pending Balance Column */}
                          <td className={`p-3 font-mono font-black text-right border-r border-slate-800/60 w-40 ${
                            cat.balance === 0 ? "text-emerald-400 bg-emerald-950/10" : "text-amber-500 bg-yellow-950/5 text-shadow-sm"
                          }`}>
                            {cat.balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </td>

                          {/* Cell Progress Level Indicator Grid */}
                          <td className="p-3 border-r border-slate-800/60 w-44 font-medium">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    coveragePercentage >= 100 ? "bg-emerald-500 animate-pulse" : "bg-gradient-to-r from-purple-500 to-indigo-505"
                                  }`}
                                  style={{ width: `${coveragePercentage}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono font-extrabold text-slate-400 w-9 text-right shrink-0">
                                {coveragePercentage}%
                              </span>
                            </div>
                          </td>

                          {/* Row Action Trigger '+' Add Value Link */}
                          <td className="p-2 text-center w-28">
                            <button
                              onClick={() => handleOpenAddModal(inst, cat.label)}
                              className="px-2.5 py-1 bg-gradient-to-r from-purple-950 to-slate-900 border border-purple-900/40 hover:border-purple-700/60 text-purple-400 hover:text-purple-300 rounded-lg text-[9px] font-black flex items-center gap-1 mx-auto transition-all transform hover:scale-[1.03]"
                              title={`Lançar novo valor de ${cat.label} especificamente nesta liberação`}
                            >
                              <Plus className="w-2.5 h-2.5" />
                              Lançar
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Integrated Subtotal Summary Line for this Installment group (Excel subtotal style) */}
                    <tr className="bg-slate-950/70 font-bold border-b border-slate-800/80">
                      <td colSpan={2} className="p-3 text-right font-black text-[10px] text-slate-450 uppercase tracking-widest bg-slate-950/40 select-none font-sans">
                        Soma Acumulada {inst}:
                      </td>
                      {/* Meta Total */}
                      <td className="p-3 text-right font-mono font-extrabold text-[#9588fa] text-[11px] border-r border-slate-800 bg-slate-950/50">
                        {s.metaSum.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      {/* Realizado Total */}
                      <td className="p-3 text-right font-mono font-black text-emerald-450 text-[11px] border-r border-slate-800 bg-slate-950/55">
                        {s.sentSum.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      {/* Saldo Total */}
                      <td className={`p-3 text-right font-mono font-black text-[11px] border-r border-slate-800 bg-slate-950/60 ${
                        s.balanceSum === 0 ? "text-emerald-400 bg-emerald-950/15" : "text-yellow-500 bg-yellow-950/10"
                      }`}>
                        {s.balanceSum.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      <td colSpan={2} className="p-3 text-slate-500 text-[10px] font-extrabold italic bg-slate-950/20 select-none">
                        Meta Global do lote cumprida em {s.metaSum > 0 ? Math.min(100, Math.round((s.sentSum / s.metaSum) * 100)) : 0}%
                      </td>
                    </tr>
                  </tbody>
                );
              })
            )}
          </table>
        </div>
      </div>

      {/* TRANSACTION LOGS / LEDGER */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/85 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/40 pb-3">
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-400" />
              Histórico Detalhado de Lançamentos Realizados
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Lista analítica dos valores informados nos lotes. Excluindo um item aqui, o saldo da planilha é recalculado automaticamente.
            </p>
          </div>
          <button
            onClick={() => handleOpenAddModal()}
            className="text-[10px] font-black text-purple-400 hover:text-purple-300 flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 hover:border-slate-755 transition-all self-start sm:self-center"
          >
            <Plus className="w-3.5 h-3.5" />
            Lançar Valor R$
          </button>
        </div>

        {getFilteredEntries().length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-slate-800 bg-slate-950/20 text-center text-xs text-slate-500 font-semibold italic">
            Nenhum lançamento encontrado correspondente aos filtros. Registre um novo valor clicando no botão.
          </div>
        ) : (
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap text-xs">
                <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-bold text-[9px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">Ação</th>
                    <th className="px-4 py-3 w-28">Data Envio</th>
                    <th className="px-4 py-3 w-36">Lote / Liberação</th>
                    <th className="px-4 py-3 w-36">Categoria</th>
                    <th className="px-4 py-3 w-44">Fornecedor / Ref</th>
                    <th className="px-4 py-3">Descrição / Notas</th>
                    <th className="px-4 py-3 w-36 text-right font-bold">Valor Realizado (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 font-medium">
                  {getFilteredEntries().map((e) => {
                    const badgeColor = 
                      e.type === "Obra Civil" ? "border-blue-500/15 bg-blue-500/5 text-blue-400" :
                      e.type === "Instalações" ? "border-amber-500/15 bg-amber-500/5 text-amber-400" :
                      e.type === "Equipamento" ? "border-purple-500/15 bg-purple-500/5 text-purple-400" :
                      "border-rose-500/15 bg-rose-500/5 text-rose-450";

                    return (
                      <tr key={e.id} className="hover:bg-slate-900/10">
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => setConfirmDeleteId(e.id)}
                            className="bg-rose-950/10 hover:bg-rose-900/20 text-rose-400 hover:text-rose-350 p-1 rounded-lg border border-rose-900/20 transition-all font-bold"
                            title="Remover Lançamento de Valor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        <td className="px-4 py-2 font-mono text-slate-400">
                          {new Date(e.date + "T12:00:00").toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-2 font-bold text-white">
                          {e.installment}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded border font-bold text-[9px] uppercase ${badgeColor}`}>
                            {e.type || "Obra Civil"}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-bold text-slate-200">
                          {e.providerName || <span className="text-slate-600 italic">Geral / Não informado</span>}
                        </td>
                        <td className="px-4 py-2 truncate max-w-sm">
                          <span className="font-bold text-slate-350">{e.description}</span>
                          {e.notes && <span className="text-[10px] text-slate-500 block">{e.notes}</span>}
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-black text-emerald-450">
                          {e.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
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

      {/* BLOCK OBSOLETE ACCORDION REMAINING HOOK */}
      <div className="hidden space-y-4" />

      {/* MODAL 1: Create Custom Dynamic Release */}
      {showNewReleaseModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-55">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/40">
              <h3 className="text-base font-black text-white">Criar Nova Liberação</h3>
              <button onClick={() => setShowNewReleaseModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5 select-none">Nome da Liberação</label>
                <input
                  type="text"
                  placeholder="Ex: 4ª Liberação, Lote Extra"
                  value={newReleaseName}
                  onChange={(e) => setNewReleaseName(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-700 outline-none focus:ring-2 focus:ring-purple-500 text-xs font-bold"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewReleaseModal(false)}
                  className="flex-1 py-2.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl hover:text-white text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleAddRelease(newReleaseName)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:to-indigo-500 hover:from-purple-500 text-white rounded-xl text-xs font-black shadow-lg shadow-purple-650/20"
                >
                  Salvar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: Rename Release */}
      {renamingReleaseOld && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-55">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/40">
              <h3 className="text-base font-black text-white">Editar Nome da Liberação</h3>
              <button onClick={() => setRenamingReleaseOld(null)} className="text-slate-400 hover:text-white">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <form onSubmit={handleRenameReleaseSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">De: <span className="text-white italic">{renamingReleaseOld}</span></label>
                <input
                  type="text"
                  required
                  value={renamingReleaseNew}
                  onChange={(e) => setRenamingReleaseNew(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500 text-xs font-bold"
                  placeholder="Novo Nome"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenamingReleaseOld(null)}
                  className="flex-1 py-12 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl hover:text-white text-xs font-bold py-2.5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-black shadow-lg"
                >
                  Alterar Nome
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 3: Configure Metas de Referência via Popup Pop (just as requested) */}
      {editingMetaRelease && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-55">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
          >
            <div className="p-4 border-b border-slate-850 flex justify-between items-center bg-slate-950/30">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5 leading-none">
                  <Settings className="w-4 h-4 text-purple-400" />
                  Metas de Referência
                </h3>
                <span className="text-[10px] text-slate-500 mt-1 block">Configuração de {editingMetaRelease}</span>
              </div>
              <button onClick={() => setEditingMetaRelease(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-3">
                {/* Obra Civil meta */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Obra Civil (R$)</label>
                  <CurrencyInput
                    value={localMetaObra}
                    onChange={setLocalMetaObra}
                    className="w-full p-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-black text-xs outline-none focus:ring-2 focus:ring-purple-500 text-right"
                    placeholder="R$ 0,00"
                  />
                </div>
                {/* Instalações meta */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Instalações (R$)</label>
                  <CurrencyInput
                    value={localMetaInst}
                    onChange={setLocalMetaInst}
                    className="w-full p-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-black text-xs outline-none focus:ring-2 focus:ring-purple-500 text-right"
                    placeholder="R$ 0,00"
                  />
                </div>
                {/* Equipamento meta */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Equipamento (R$)</label>
                  <CurrencyInput
                    value={localMetaEquip}
                    onChange={setLocalMetaEquip}
                    className="w-full p-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-black text-xs outline-none focus:ring-2 focus:ring-purple-500 text-right"
                    placeholder="R$ 0,00"
                  />
                </div>
                {/* Móveis meta */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Móveis (R$)</label>
                  <CurrencyInput
                    value={localMetaMovel}
                    onChange={setLocalMetaMovel}
                    className="w-full p-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-black text-xs outline-none focus:ring-2 focus:ring-purple-500 text-right"
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMetaRelease(null)}
                  className="flex-1 py-2.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSavePopupReferences}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:to-indigo-550 text-white rounded-xl text-xs font-black shadow-md"
                >
                  Salvar Metas
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirmation to delete dialogue */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-55 animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl"
          >
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/10">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">Excluir Lançamento</h3>
            <p className="text-slate-400 text-xs mb-6">
              Tem certeza que deseja remover este lançamento de valor enviado? Essa ação é definitiva e alterará o saldo da liberação dita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl font-semibold transition-colors text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteEntry(confirmDeleteId)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-750 text-white rounded-xl font-semibold transition-colors text-xs shadow-sm"
              >
                Sim, excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal - Register/Add Sent Value */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden my-8"
          >
            <div className="p-6 border-b border-slate-800/80 flex justify-between items-center bg-slate-950/20">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-500" />
                Registrar Lançamento de Valor Enviado
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Liberação selection dropdown */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Vincular à Liberação</label>
                  <select
                    value={formData.installment}
                    onChange={(e) => setFormData({ ...formData, installment: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500 text-xs font-semibold"
                  >
                    {allInstallments.map((inst) => (
                      <option key={inst} value={inst} className="text-slate-900 bg-white">
                        {inst}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Pagamento selection dropdown */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Tipo de Pagamento</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as DisbursementType })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500 text-xs font-semibold"
                  >
                    <option value="Obra Civil" className="text-slate-900 bg-white">Obra Civil</option>
                    <option value="Instalações" className="text-slate-900 bg-white">Instalações</option>
                    <option value="Equipamento" className="text-slate-900 bg-white">Equipamento</option>
                    <option value="Móveis" className="text-slate-900 bg-white">Móveis</option>
                  </select>
                </div>

                {/* Emission date */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Data do Envio</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Note Value (R$) */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Valor Enviado (R$)</label>
                  <CurrencyInput
                    value={formData.value}
                    onChange={(val) => setFormData({ ...formData, value: val })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500 text-xs font-mono font-black"
                    placeholder="R$ 0,00"
                  />
                </div>

                {/* Provider Name */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Fornecedor / Ref</label>
                  <input
                    type="text"
                    placeholder="Ex: Leroy Merlin, Fornecedor X"
                    value={formData.providerName}
                    onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-750 outline-none focus:ring-2 focus:ring-purple-500 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Descrição Sumária</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Envio correspondente aos recibos de materiais"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-purple-500 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Observações (Opcional)</label>
                <textarea
                  placeholder="Selecione observações adicionais sobre este envio"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-purple-500 text-xs h-18 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl font-bold transition-all text-xs outline-none"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-black text-xs hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/25 outline-none transition-all"
                >
                  SALVAR LANÇAMENTO
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

type EnrichedMacroType = EnvioMacro & {
  creditsReceived: Record<string, number>;
  effectiveMetas: Record<string, number>;
  saldos: Record<string, number>;
  creditsPassedToNext: Record<string, number>;
};

function TabControleEnvios({
  location,
  onUpdateLocation,
}: {
  location: Location;
  onUpdateLocation: (l: Location) => void;
}) {
  const [showMacroModal, setShowMacroModal] = useState(false);
  const [macroName, setMacroName] = useState("");
  const [macroDate, setMacroDate] = useState(new Date().toISOString().split("T")[0]);
  const [metaInputs, setMetaInputs] = useState({
    obraCivil: "",
    instalacoes: "",
    equipamentos: "",
    moveis: "",
  });

  const envios = location.enviosMacros || [];

  const catKeys = ["obraCivil", "instalacoes", "equipamentos", "moveis"] as const;
  
  const enviosOrdenados = [...envios].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let currentCredits = { obraCivil: 0, instalacoes: 0, equipamentos: 0, moveis: 0 };
  
  const enrichedEnvios = enviosOrdenados.map(macro => {
    const creditsReceived = { ...currentCredits };
    const effectiveMetas = { obraCivil: 0, instalacoes: 0, equipamentos: 0, moveis: 0 };
    const saldos = { obraCivil: 0, instalacoes: 0, equipamentos: 0, moveis: 0 };
    
    catKeys.forEach(cat => {
      const metaOriginal = macro.metas[cat];
      const credit = currentCredits[cat];
      const enviado = macro.enviados[cat];
      
      const effectiveMeta = Math.max(0, metaOriginal - credit);
      effectiveMetas[cat] = effectiveMeta;
      
      saldos[cat] = effectiveMeta - enviado;
      
      const unusedCredit = Math.max(0, credit - metaOriginal);
      const overpayment = Math.max(0, enviado - effectiveMeta);
      
      currentCredits[cat] = unusedCredit + overpayment;
    });
    
    return {
      ...macro,
      creditsReceived,
      effectiveMetas,
      saldos,
      creditsPassedToNext: { ...currentCredits }
    } as EnrichedMacroType;
  });

  const totalContract = {
    obraCivil: parseCurrency(String(location.disbursementConfig?.["Obra Civil"]?.contractValue || "0")),
    instalacoes: parseCurrency(String(location.disbursementConfig?.["Instalações"]?.contractValue || "0")),
    equipamentos: parseCurrency(String(location.disbursementConfig?.["Equipamento"]?.contractValue || "0")),
    moveis: parseCurrency(String(location.disbursementConfig?.["Móveis"]?.contractValue || "0")),
  };

  const totalEnviadoGlobal = {
    obraCivil: envios.reduce((acc, m) => acc + (m.enviados.obraCivil || 0), 0),
    instalacoes: envios.reduce((acc, m) => acc + (m.enviados.instalacoes || 0), 0),
    equipamentos: envios.reduce((acc, m) => acc + (m.enviados.equipamentos || 0), 0),
    moveis: envios.reduce((acc, m) => acc + (m.enviados.moveis || 0), 0),
  };

  const overallContract = Object.values(totalContract).reduce((a,b) => a+b, 0);
  const overallEnviado = Object.values(totalEnviadoGlobal).reduce((a,b) => a+b, 0);

  const handleCreateMacro = () => {
    if (!macroName) return;
    const newMacro: EnvioMacro = {
      id: crypto.randomUUID(),
      name: macroName,
      date: macroDate,
      metas: {
        obraCivil: Number(metaInputs.obraCivil) || 0,
        instalacoes: Number(metaInputs.instalacoes) || 0,
        equipamentos: Number(metaInputs.equipamentos) || 0,
        moveis: Number(metaInputs.moveis) || 0,
      },
      enviados: {
        obraCivil: 0,
        instalacoes: 0,
        equipamentos: 0,
        moveis: 0,
      }
    };

    onUpdateLocation({
      ...location,
      enviosMacros: [...envios, newMacro],
    });
    setShowMacroModal(false);
    setMacroName("");
    setMetaInputs({ obraCivil: "", instalacoes: "", equipamentos: "", moveis: "" });
  };

  const handleUpdateEnviados = (macroId: string, type: keyof EnvioMacro['metas'], value: number) => {
    onUpdateLocation({
      ...location,
      enviosMacros: envios.map(e => e.id === macroId ? {
        ...e,
        enviados: { ...e.enviados, [type]: value }
      } : e)
    });
  };

  const handleUpdateDate = (macroId: string, date: string) => {
    onUpdateLocation({
      ...location,
      enviosMacros: envios.map(e => e.id === macroId ? { ...e, date } : e)
    });
  };

  const handleDeleteMacro = (macroId: string) => {
    onUpdateLocation({
      ...location,
      enviosMacros: envios.filter(e => e.id !== macroId)
    });
  };

  return (
    <div className="space-y-6">
      {/* Resumo removido por solicitação */}


      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: "obraCivil", label: "Obra Civil", contract: totalContract.obraCivil, sent: totalEnviadoGlobal.obraCivil },
          { key: "Instalações", label: "Instalações", contract: totalContract.instalacoes, sent: totalEnviadoGlobal.instalacoes },
          { key: "equipamentos", label: "Equipamento", contract: totalContract.equipamentos, sent: totalEnviadoGlobal.equipamentos },
          { key: "Móveis", label: "Móveis", contract: totalContract.moveis, sent: totalEnviadoGlobal.moveis },
        ].map((cat) => {
          const sentPercent = cat.contract > 0 ? (cat.sent / cat.contract) * 100 : 0;
          const isOver = cat.sent > cat.contract;
          return (
            <div key={cat.key} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-black text-slate-500 uppercase flex items-center justify-between">
                <span>{cat.label}</span>
                <span className={isOver ? 'text-rose-400' : 'text-slate-400'}>{sentPercent.toFixed(1)}%</span>
              </p>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Contrato:</span>
                  <span className="font-mono text-slate-300">{cat.contract.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Enviado:</span>
                  <span className={`font-mono font-bold ${isOver ? 'text-rose-400' : 'text-purple-400'}`}>
                    {cat.sent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-slate-800/50 mt-1">
                  <span className="text-slate-500">Saldo:</span>
                  <span className={`font-mono font-bold ${cat.contract - cat.sent < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {(cat.contract - cat.sent).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row justify-between lg:items-center bg-slate-900 p-6 rounded-[2rem] border border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-3">
            <div className="bg-purple-500/20 p-2 rounded-xl border border-purple-500/30">
              <Send className="w-5 h-5 text-purple-400" />
            </div>
            Controle de Envios (Macros)
          </h2>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            Gerencie e acompanhe as metas e envios financeiros por liberação.
          </p>
        </div>
        <button
          onClick={() => {
            setMacroName(`${envios.length + 1}º liberação`);
            setShowMacroModal(true);
          }}
          className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20 flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
          Novo Envio (Macro)
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {enrichedEnvios.map(macro => (
          <MacroCard 
            key={macro.id} 
            macro={macro} 
            onUpdate={handleUpdateEnviados}
            onUpdateDate={handleUpdateDate} 
            onDelete={() => handleDeleteMacro(macro.id)} 
          />
        ))}
        {envios.length === 0 && (
          <div className="text-center p-12 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
             <Send className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-50" />
             <p className="text-slate-400 font-bold text-lg">Nenhum envio registrado.</p>
             <p className="text-slate-500 text-sm mt-1">Clique em "Novo Envio" para começar o planejamento.</p>
          </div>
        )}
      </div>

      {showMacroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-purple-400" />
                Criar Envio Macro
              </h3>
              <button
                onClick={() => setShowMacroModal(false)}
                className="text-slate-500 hover:text-white transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                  Nome da Referência
                </label>
                <input
                  autoFocus
                  type="text"
                  placeholder="Ex: Liberação Fase 1, Medição Julho..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-purple-500 transition-colors"
                  value={macroName}
                  onChange={(e) => setMacroName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-purple-500 transition-colors color-scheme-dark"
                  value={macroDate}
                  onChange={(e) => setMacroDate(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-slate-800/60">
                <label className="block text-[11px] font-black uppercase tracking-wider text-purple-400 mb-4">
                  Metas de Referência (R$)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {([
                    { key: "obraCivil", label: "Obra Civil" },
                    { key: "Instalações", label: "Instalações" },
                    { key: "equipamentos", label: "Equipamentos" },
                    { key: "Móveis", label: "Móveis" },
                  ] as const).map(cat => (
                    <div key={cat.key}>
                      <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">{cat.label}</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors"
                        value={metaInputs[cat.key as keyof typeof metaInputs]}
                        onChange={(e) => setMetaInputs({...metaInputs, [cat.key]: e.target.value})}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button
                  onClick={handleCreateMacro}
                  disabled={!macroName}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-3 rounded-xl font-black transition-all"
                >
                  Criar Macro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MacroCard({
  macro,
  onUpdate,
  onUpdateDate,
  onDelete
}: {
  macro: EnrichedMacroType;
  onUpdate: (id: string, type: keyof EnvioMacro['metas'], value: number) => void;
  onUpdateDate: (id: string, date: string) => void;
  onDelete: () => void;
}) {
  const [editingType, setEditingType] = useState<keyof EnvioMacro['metas'] | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editingDate, setEditingDate] = useState(false);
  const [editDateValue, setEditDateValue] = useState(macro.date);
  const [isExpanded, setIsExpanded] = useState(true);

  const categories = [
    { key: "obraCivil" as const, label: "Obra Civil", color: "blue" },
    { key: "instalacoes" as const, label: "Instalações", color: "amber" },
    { key: "equipamentos" as const, label: "Equipamentos", color: "purple" },
    { key: "moveis" as const, label: "Móveis", color: "emerald" },
  ];

  const totalMetaOriginal = macro.metas.obraCivil + macro.metas.instalacoes + macro.metas.equipamentos + macro.metas.moveis;
  const totalEffectiveMeta = macro.effectiveMetas.obraCivil + macro.effectiveMetas.instalacoes + macro.effectiveMetas.equipamentos + macro.effectiveMetas.moveis;
  const totalEnviado = macro.enviados.obraCivil + macro.enviados.instalacoes + macro.enviados.equipamentos + macro.enviados.moveis;
  const totalSaldo = macro.saldos.obraCivil + macro.saldos.instalacoes + macro.saldos.equipamentos + macro.saldos.moveis;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-5 flex justify-between items-center bg-slate-950/40 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isExpanded ? "Minimizar" : "Expandir"}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-400" />
              {macro.name}
            </h3>
            <div className="text-xs text-slate-500 mt-1 font-mono flex items-center gap-2 group/date">
              {editingDate ? (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:border-purple-500"
                  value={editDateValue}
                  onChange={e => setEditDateValue(e.target.value)}
                />
                <button 
                  onClick={() => {
                    onUpdateDate(macro.id, editDateValue);
                    setEditingDate(false);
                  }}
                  className="bg-emerald-600/20 text-emerald-400 p-1 rounded hover:bg-emerald-600/40"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => {
                    setEditDateValue(macro.date);
                    setEditingDate(false);
                  }}
                  className="bg-slate-800 text-slate-400 p-1 rounded hover:bg-slate-700 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                {new Date(macro.date + "T12:00:00").toLocaleDateString('pt-BR')}
                <button
                  onClick={() => setEditingDate(true)}
                  className="opacity-0 group-hover/date:opacity-100 text-purple-400 hover:text-purple-300 p-0.5 rounded transition-all"
                  title="Editar Data"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>
        </div>
        <button
          onClick={onDelete}
          className="p-2 border border-slate-800 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-all font-bold group flex items-center justify-center"
          title="Excluir"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {isExpanded && (
        <div className="p-5 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr>
                <th className="pb-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Categoria</th>
              <th className="pb-4 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">Valor Meta</th>
              <th className="pb-4 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">Valor Enviado</th>
              <th className="pb-4 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {categories.map((cat) => {
               const metaOriginal = macro.metas[cat.key];
               const credit = macro.creditsReceived[cat.key];
               const effectiveMeta = macro.effectiveMetas[cat.key];
               const enviado = macro.enviados[cat.key];
               const saldo = macro.saldos[cat.key];
               return (
                 <tr key={cat.key} className="hover:bg-slate-800/10 transition-colors">
                   <td className="py-3">
                     <span className="font-bold text-slate-300 text-xs uppercase tracking-wide">
                       {cat.label}
                     </span>
                   </td>
                   <td className="py-3 text-right">
                     <span className="font-mono text-xs text-slate-400">
                       {effectiveMeta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                     </span>
                     {credit > 0 && (
                       <span className="block text-[9px] text-purple-400 mt-0.5" title={`Crédito de ${credit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}>
                         Meta inicial: {metaOriginal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                       </span>
                     )}
                   </td>
                   <td className="py-3 text-right">
                     {editingType === cat.key ? (
                       <div className="flex items-center justify-end gap-2">
                         <input
                           autoFocus
                           type="number"
                           className="w-28 bg-slate-950 border border-slate-700 text-white rounded px-2 py-1 text-xs font-mono text-right"
                           value={editValue}
                           onChange={e => setEditValue(e.target.value)}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') {
                               onUpdate(macro.id, cat.key, Number(editValue) || 0);
                               setEditingType(null);
                             } else if (e.key === 'Escape') {
                               setEditingType(null);
                             }
                           }}
                         />
                         <button 
                           onClick={() => {
                             onUpdate(macro.id, cat.key, Number(editValue) || 0);
                             setEditingType(null);
                           }}
                           className="bg-emerald-600/20 text-emerald-400 p-1 rounded hover:bg-emerald-600/40"
                         >
                           <Check className="w-3 h-3" />
                         </button>
                         <button 
                           onClick={() => setEditingType(null)}
                           className="bg-slate-800 text-slate-400 p-1 rounded hover:bg-slate-700 hover:text-white"
                         >
                           <X className="w-3 h-3" />
                         </button>
                       </div>
                     ) : (
                       <div className="flex items-center justify-end gap-2 group/edit">
                         <span className="font-mono text-sm font-black text-white">
                           {enviado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                         </span>
                         <button
                           onClick={() => {
                             setEditValue(String(enviado));
                             setEditingType(cat.key);
                           }}
                           className="opacity-0 group-hover/edit:opacity-100 text-purple-400 hover:text-purple-300 p-1 rounded transition-all"
                         >
                           <Edit2 className="w-3 h-3" />
                         </button>
                       </div>
                     )}
                   </td>
                   <td className="py-3 text-right">
                     <span className={`font-mono text-xs font-black ${saldo <= 0 && effectiveMeta > 0 ? 'text-emerald-400' : 'text-yellow-500'}`}>
                       {Math.abs(saldo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                     </span>
                   </td>
                 </tr>
               );
            })}
          </tbody>
          <tfoot className="border-t-2 border-slate-800">
            <tr>
              <td className="py-4 text-xs font-black uppercase text-slate-400">Total</td>
              <td className="py-4 text-right">
                <span className="font-mono text-xs font-black text-slate-400">
                  {totalEffectiveMeta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                {totalEffectiveMeta !== totalMetaOriginal && (
                  <span className="block text-[10px] text-purple-400 mt-1">
                    Inicial: {totalMetaOriginal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                )}
              </td>
              <td className="py-4 text-right">
                <span className="font-mono text-sm font-black text-purple-400">
                  {totalEnviado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </td>
              <td className="py-4 text-right">
                <span className={`font-mono py-1 px-2 rounded font-black text-xs ${totalSaldo <= 0 && totalEffectiveMeta > 0 ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50' : totalSaldo > 0 ? 'bg-yellow-950/50 text-yellow-500 border border-yellow-900/50' : 'text-slate-500'}`}>
                  {Math.abs(totalSaldo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      )}
    </div>
  );
}

function TabCronograma({
  project,
  onUpdateService,
}: {
  project: Project;
  onUpdateService: (id: string, updates: Partial<Service>) => void;
}) {
  const today = new Date();

  // Initialize simulation date string to today (YYYY-MM-DD local time equivalent for convenience, or just use today's string)
  const [simulationDateStr, setSimulationDateStr] = useState<string>(() => {
    const tzOffset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - tzOffset).toISOString().split("T")[0];
  });

  const simulationDate = useMemo(() => {
    if (!simulationDateStr) return today;
    const [y, m, d] = simulationDateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [simulationDateStr]);

  const [expandedMacros, setExpandedMacros] = useState<Record<string, boolean>>(
    {},
  );
  const [scheduleView, setScheduleView] = useState<"gantt" | "semanal" | "lista">(
    "gantt",
  );

  const toggleMacro = (id: string) => {
    setExpandedMacros((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString("pt-BR") : "-";

  const handleUpdateService = (
    serviceId: string,
    updates: Partial<Service>,
  ) => {
    const current = project.services.find((service) => service.id === serviceId);
    if (!current) {
      onUpdateService(serviceId, updates);
      return;
    }

    const dateChanged =
      ("startDate" in updates && updates.startDate !== current.startDate) ||
      ("endDate" in updates && updates.endDate !== current.endDate);

    const nextUpdates: Partial<Service> = { ...updates };

    if (dateChanged) {
      if (!current.baselineStartDate && current.startDate) {
        nextUpdates.baselineStartDate = current.startDate;
      }
      if (!current.baselineEndDate && current.endDate) {
        nextUpdates.baselineEndDate = current.endDate;
      }
      nextUpdates.reprogrammingHistory = [
        ...(current.reprogrammingHistory || []),
        {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          previousStartDate: current.startDate,
          previousEndDate: current.endDate,
          newStartDate:
            "startDate" in updates ? updates.startDate : current.startDate,
          newEndDate: "endDate" in updates ? updates.endDate : current.endDate,
        },
      ];
    }

    onUpdateService(serviceId, nextUpdates);
  };

  const servicesWithStatus = useMemo(() => {
    const calculateStatus = (service: any) => {
      const start = service.startDate ? new Date(service.startDate) : null;
      const end = service.endDate ? new Date(service.endDate) : null;
      const progress = service.progress || 0;

      let expectedProgress = 0;
      let status:
        | "Adiantada"
        | "Atrasada"
        | "No Prazo"
        | "Não Iniciada"
        | "Finalizada" = "Não Iniciada";

      if (start && end) {
        const totalDuration = end.getTime() - start.getTime();
        const elapsed = simulationDate.getTime() - start.getTime();

        if (elapsed < 0) {
          expectedProgress = 0;
        } else if (elapsed > totalDuration) {
          expectedProgress = 100;
        } else {
          expectedProgress = Math.round((elapsed / totalDuration) * 100);
        }

        if (progress >= 100) {
          status = "Finalizada";
        } else if (progress === 0 && elapsed < 0) {
          status = "Não Iniciada";
        } else if (progress > expectedProgress + 5) {
          status = "Adiantada";
        } else if (progress < expectedProgress - 5) {
          status = "Atrasada";
        } else {
          status = "No Prazo";
        }
      }

      return { ...service, expectedProgress, status };
    };

    const nonMacrosWithStatus = project.services
      .filter((s) => !s.isMacro)
      .map(calculateStatus);
    const macros = project.services.filter((s) => s.isMacro);

    let result: any[] = [];

    macros.forEach((macro) => {
      const children = nonMacrosWithStatus.filter(
        (s) => s.parentId === macro.id,
      );

      // Calculate macro dates and progress
      let macroStart: Date | null = null;
      let macroEnd: Date | null = null;
      let totalProgress = 0;
      let validChildrenCount = 0;

      children.forEach((child) => {
        if (child.startDate) {
          const d = new Date(child.startDate);
          if (!macroStart || d < macroStart) macroStart = d;
        }
        if (child.endDate) {
          const d = new Date(child.endDate);
          if (!macroEnd || d > macroEnd) macroEnd = d;
        }
        totalProgress += child.progress || 0;
        validChildrenCount++;
      });

      const macroProgress =
        validChildrenCount > 0
          ? Math.round(totalProgress / validChildrenCount)
          : 0;

      // Determine macro status based on children
      let macroStatus = "No Prazo"; // Default green
      if (children.length === 0) {
        macroStatus = "Não Iniciada";
      } else if (children.every((c) => c.status === "Finalizada")) {
        macroStatus = "Finalizada";
      } else if (children.every((c) => c.status === "Não Iniciada")) {
        macroStatus = "Não Iniciada";
      } else if (children.some((c) => c.status === "Atrasada")) {
        macroStatus = "Atrasada";
      } else {
        macroStatus = "No Prazo"; // Green
      }

      // Calculate expected progress for macro
      let expectedProgress = 0;
      if (macroStart && macroEnd) {
        const totalDuration = macroEnd.getTime() - macroStart.getTime();
        const elapsed = simulationDate.getTime() - macroStart.getTime();
        if (elapsed < 0) expectedProgress = 0;
        else if (elapsed > totalDuration) expectedProgress = 100;
        else expectedProgress = Math.round((elapsed / totalDuration) * 100);
      }

      const macroService = {
        ...macro,
        startDate: macroStart
          ? macroStart.toISOString().split("T")[0]
          : undefined,
        endDate: macroEnd ? macroEnd.toISOString().split("T")[0] : undefined,
        progress: macroProgress,
        status: macroStatus,
        expectedProgress,
      };

      result.push(macroService);
      result = [...result, ...children];
    });

    const itemsWithoutParent = nonMacrosWithStatus.filter((s) => !s.parentId);
    result = [...result, ...itemsWithoutParent];

    return result;
  }, [project.services, simulationDate]);

  // Gantt Chart Calculations
  const timelineRange = useMemo(() => {
    const dates = servicesWithStatus
      .flatMap((s) => [s.startDate, s.endDate])
      .filter(Boolean)
      .map((d) => new Date(d!).getTime());

    // Ensure simulation date is also included in range so we can see the marker
    dates.push(simulationDate.getTime());
    dates.push(today.getTime());

    if (dates.length === 0) return null;

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    // Add some padding (7 days)
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    return { min: minDate, max: maxDate };
  }, [project.services, simulationDate, today]);

  const getPosition = (dateStr: string | undefined) => {
    if (!dateStr || !timelineRange) return 0;
    const date = new Date(dateStr).getTime();
    const total = timelineRange.max.getTime() - timelineRange.min.getTime();
    const current = date - timelineRange.min.getTime();
    return (current / total) * 100;
  };

  const statusColors = {
    Adiantada: "bg-blue-500/100",
    Atrasada: "bg-red-500/100",
    "No Prazo": "bg-emerald-500/100",
    "Não Iniciada": "bg-gray-400",
    Finalizada: "bg-indigo-500",
  };

  const statusTextColors = {
    Adiantada: "text-blue-700 bg-blue-100",
    Atrasada: "text-red-700 bg-red-100",
    "No Prazo": "text-emerald-700 bg-emerald-100",
    "Não Iniciada": "text-slate-500 bg-slate-800",
    Finalizada: "text-indigo-700 bg-indigo-100",
  };

  const isSimulatedFuture =
    simulationDateStr > today.toISOString().split("T")[0];

  const overallSimulation = useMemo(() => {
    const nonMacros = servicesWithStatus.filter(
      (s) => !s.isMacro && s.startDate && s.endDate,
    );
    if (nonMacros.length === 0)
      return { real: 0, expected: 0, diff: 0, isLate: false };

    // We can weight progress by duration so that bigger tasks matter more.
    // However, a simple average is the most direct map to what the table shows.
    // Let's use simple average across the lowest-level tasks for consistency.
    const totalReal = nonMacros.reduce(
      (acc, curr) => acc + (curr.progress || 0),
      0,
    );
    const totalExpected = nonMacros.reduce(
      (acc, curr) => acc + (curr.expectedProgress || 0),
      0,
    );

    const real = Math.round(totalReal / nonMacros.length);
    const expected = Math.round(totalExpected / nonMacros.length);
    const diff = real - expected;

    return {
      real,
      expected,
      diff,
      isLate: real < expected - 5, // giving a 5% margin of error like in the tasks
    };
  }, [servicesWithStatus]);

  const scheduleInsights = useMemo(() => {
    const nonMacros = servicesWithStatus.filter((s) => !s.isMacro);
    const dated = nonMacros.filter((s) => s.startDate && s.endDate);
    const late = dated.filter((s) => s.status === "Atrasada");
    const noDates = nonMacros.filter((s) => !s.startDate || !s.endDate);
    const dueSoon = dated.filter((s) => {
      if (!s.endDate || s.progress >= 100) return false;
      const days =
        (new Date(s.endDate).getTime() - simulationDate.getTime()) /
        (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 7;
    });
    const reprogrammed = nonMacros.filter(
      (s) => (s.reprogrammingHistory || []).length > 0,
    );
    const critical = [...late]
      .sort((a, b) => {
        const aGap = (a.expectedProgress || 0) - (a.progress || 0);
        const bGap = (b.expectedProgress || 0) - (b.progress || 0);
        return bGap - aGap;
      })
      .slice(0, 5);

    return { late, noDates, dueSoon, reprogrammed, critical };
  }, [servicesWithStatus, simulationDate]);

  const weeklySchedule = useMemo(() => {
    const start = new Date(simulationDate);
    start.setDate(start.getDate() - start.getDay());

    return Array.from({ length: 6 }, (_, index) => {
      const weekStart = new Date(start);
      weekStart.setDate(start.getDate() + index * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const services = servicesWithStatus.filter((service) => {
        if (service.isMacro || !service.startDate || !service.endDate) return false;
        const serviceStart = new Date(service.startDate);
        const serviceEnd = new Date(service.endDate);
        return serviceStart <= weekEnd && serviceEnd >= weekStart;
      });

      return {
        id: weekStart.toISOString(),
        label: `${formatDate(weekStart.toISOString())} - ${formatDate(
          weekEnd.toISOString(),
        )}`,
        services,
        lateCount: services.filter((service) => service.status === "Atrasada")
          .length,
      };
    });
  }, [servicesWithStatus, simulationDate]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap gap-4 items-center bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-white font-display flex items-center gap-2">
          Cronograma da Obra
          {isSimulatedFuture && (
            <span className="text-xs bg-blue-500 border border-blue-400 text-white px-2 py-0.5 rounded-full font-bold ml-2 shadow-[0_0_10px_rgba(37,99,235,0.4)]">
              MODO SIMULAÇÃO ATIVO
            </span>
          )}
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-950 p-1">
            {[
              { id: "gantt", label: "Gantt", icon: Calendar },
              { id: "semanal", label: "Semanal", icon: Clock },
              { id: "lista", label: "Lista", icon: List },
            ].map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() =>
                    setScheduleView(view.id as "gantt" | "semanal" | "lista")
                  }
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black transition-colors",
                    scheduleView === view.id
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {view.label}
                </button>
              );
            })}
          </div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" /> Data Base Real vs
            Previsto
          </label>
          <input
            type="date"
            value={simulationDateStr}
            onChange={(e) => setSimulationDateStr(e.target.value)}
            className="p-2 border border-slate-700 rounded-lg bg-slate-950 text-sm font-black text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
          />
        </div>
      </div>

      {project.services.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Avanço Global Real
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-white tracking-tighter">
                    {overallSimulation.real}%
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-6 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${overallSimulation.real}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Planejado na Data
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-white tracking-tighter">
                    {overallSimulation.expected}%
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <div className="mt-6 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-1000 opacity-50"
                style={{ width: `${overallSimulation.expected}%` }}
              />
            </div>
          </div>

          <div
            className={cn(
              "p-6 rounded-2xl border relative overflow-hidden flex flex-col justify-center",
              overallSimulation.isLate
                ? "bg-red-950/20 border-red-900/50"
                : "bg-emerald-950/20 border-emerald-900/50",
            )}
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Status Geral da Obra
            </p>
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "p-3 rounded-2xl",
                  overallSimulation.isLate
                    ? "bg-red-500/10 text-red-500"
                    : "bg-emerald-500/10 text-emerald-500",
                )}
              >
                {overallSimulation.isLate ? (
                  <AlertCircle className="w-8 h-8" />
                ) : (
                  <CheckCircle2 className="w-8 h-8" />
                )}
              </div>
              <div>
                <p
                  className={cn(
                    "text-2xl font-black tracking-tight",
                    overallSimulation.isLate
                      ? "text-red-500"
                      : "text-emerald-500",
                  )}
                >
                  {overallSimulation.isLate
                    ? "Atrasada"
                    : "No Prazo / Adiantada"}
                </p>
                {overallSimulation.diff !== 0 && (
                  <p className="text-sm font-medium text-slate-400">
                    Desvio de {Math.abs(overallSimulation.diff)}% em relação ao
                    planejado.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Caminho critico
                </p>
                <p className="text-4xl font-black text-white tracking-tighter">
                  {scheduleInsights.critical.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-400">
              Servicos atrasados com maior desvio entre previsto e realizado.
            </p>
          </div>
        </div>
      )}

      {project.services.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 xl:col-span-2">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  Alertas do cronograma
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Pontos que precisam de acompanhamento na data base selecionada.
                </p>
              </div>
              <AlertCircle className="h-5 w-5 text-amber-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  label: "Atrasados",
                  value: scheduleInsights.late.length,
                  tone: "text-red-400 bg-red-500/10 border-red-500/20",
                },
                {
                  label: "Vencem em 7 dias",
                  value: scheduleInsights.dueSoon.length,
                  tone: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                },
                {
                  label: "Sem datas",
                  value: scheduleInsights.noDates.length,
                  tone: "text-slate-300 bg-slate-800 border-slate-700",
                },
              ].map((alert) => (
                <div
                  key={alert.label}
                  className={cn("rounded-xl border p-4", alert.tone)}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                    {alert.label}
                  </p>
                  <p className="mt-2 text-3xl font-black">{alert.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4">
              Top prioridades
            </h4>
            <div className="space-y-3">
              {scheduleInsights.critical.length === 0 ? (
                <p className="text-sm font-semibold text-slate-400">
                  Nenhum servico critico no momento.
                </p>
              ) : (
                scheduleInsights.critical.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-white truncate">
                        {service.name}
                      </p>
                      <span className="text-[10px] font-black text-red-400">
                        -{Math.max(0, (service.expectedProgress || 0) - (service.progress || 0))}%
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">
                      Fim previsto: {formatDate(service.endDate)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gantt Chart */}
      {scheduleView === "gantt" && timelineRange && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 card-shadow overflow-x-auto">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
            Gráfico de Gantt
          </h4>
          <div className="min-w-[800px] relative pb-4">
            {/* Timeline Header */}
            <div className="flex border-b border-slate-800 mb-4 pb-2">
              <div className="w-48 flex-shrink-0 font-bold text-xs text-slate-400 uppercase tracking-wider">
                Atividade
              </div>
              <div className="flex-1 relative h-6">
                {/* Month markers could go here, for now just a simple line */}
                <div className="absolute inset-0 flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>
                    {timelineRange.min.toLocaleDateString("pt-BR", {
                      month: "short",
                      year: "2-digit",
                    })}
                  </span>
                  <span>
                    {timelineRange.max.toLocaleDateString("pt-BR", {
                      month: "short",
                      year: "2-digit",
                    })}
                  </span>
                </div>
                {/* Today marker */}
                <div
                  className="absolute top-0 bottom-[-400px] w-px bg-slate-600 z-10 opacity-50"
                  style={{
                    left: `${getPosition(today.toISOString())}%`,
                    height: `calc(100% + 20px + ${servicesWithStatus.length * 44}px)`,
                  }}
                >
                  <div className="bg-slate-800 text-slate-400 border border-slate-700 text-[8px] font-bold px-1.5 py-0.5 rounded absolute -top-4 -left-4 shadow-sm">
                    HOJE
                  </div>
                </div>
                {/* Simulation marker */}
                <div
                  className="absolute top-0 bottom-[-400px] w-px bg-blue-500 z-10"
                  style={{
                    left: `${getPosition(simulationDate.toISOString())}%`,
                    height: `calc(100% + 20px + ${servicesWithStatus.length * 44}px)`,
                  }}
                >
                  <div className="bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded absolute -top-4 -left-4 shadow-[0_0_10px_rgba(37,99,235,0.4)]">
                    {isSimulatedFuture ? "SIMULAÇÃO" : "HOJE"}
                  </div>
                </div>
              </div>
            </div>

            {/* Rows */}
            <div className="space-y-4">
              {servicesWithStatus.map((service) => {
                if (
                  service.parentId &&
                  expandedMacros[service.parentId] === false
                )
                  return null;

                const left = getPosition(service.startDate);
                const right = getPosition(service.endDate);
                const width = Math.max(right - left, 2); // Min width for visibility

                return (
                  <div
                    key={service.id}
                    className={cn(
                      "flex items-center group transition-colors",
                      service.isMacro
                        ? "bg-slate-950 py-1.5 rounded-lg"
                        : "hover:bg-slate-950 rounded-lg",
                    )}
                  >
                    <div
                      className={cn(
                        "w-48 flex-shrink-0 pr-4 flex items-center gap-1.5",
                        service.parentId ? "pl-5" : "pl-1",
                      )}
                    >
                      {service.isMacro && (
                        <button
                          onClick={() => toggleMacro(service.id)}
                          className="p-0.5 hover:bg-slate-700 rounded text-slate-500 transition-colors"
                        >
                          {expandedMacros[service.id] === false ? (
                            <ChevronRight className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-xs truncate",
                            service.isMacro
                              ? "font-bold text-white"
                              : "font-semibold text-slate-400",
                          )}
                          title={service.name}
                        >
                          {service.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {service.isMacro
                            ? `Média: ${service.progress}%`
                            : `${service.progress || 0}% concluído`}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 h-6 bg-slate-950 rounded-full relative overflow-hidden">
                      {service.startDate && service.endDate ? (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${width}%`, left: `${left}%` }}
                          className={cn(
                            "absolute h-full rounded-full shadow-sm flex items-center justify-center overflow-hidden",
                            service.isMacro
                              ? service.status === "Atrasada"
                                ? "bg-red-500/100"
                                : "bg-emerald-500/100"
                              : statusColors[
                                  service.status as keyof typeof statusColors
                                ],
                          )}
                        >
                          {/* Progress overlay */}
                          <div
                            className="absolute inset-0 bg-black/20"
                            style={{ width: `${service.progress || 0}%` }}
                          />
                        </motion.div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">
                          Sem datas definidas
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap gap-4 pt-4 border-t border-gray-100">
            {Object.entries(statusTextColors).map(([status, classes]) => (
              <div key={status} className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full",
                    statusColors[status as keyof typeof statusColors],
                  )}
                />
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {scheduleView === "semanal" && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Visao semanal
              </h4>
              <p className="text-sm text-slate-400 mt-1">
                Proximas seis semanas a partir da data base.
              </p>
            </div>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {weeklySchedule.map((week) => (
              <div
                key={week.id}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-4 min-h-[180px]"
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <p className="text-xs font-black text-white">{week.label}</p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-[10px] font-black",
                      week.lateCount > 0
                        ? "bg-red-500/10 text-red-400"
                        : "bg-emerald-500/10 text-emerald-400",
                    )}
                  >
                    {week.services.length} servicos
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {week.services.length === 0 ? (
                    <p className="text-xs font-semibold text-slate-500">
                      Sem servicos programados.
                    </p>
                  ) : (
                    week.services.slice(0, 5).map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-slate-900 px-3 py-2"
                      >
                        <p className="text-xs font-bold text-slate-300 truncate">
                          {service.name}
                        </p>
                        <span
                          className={cn(
                            "h-2 w-2 flex-shrink-0 rounded-full",
                            statusColors[
                              service.status as keyof typeof statusColors
                            ],
                          )}
                        />
                      </div>
                    ))
                  )}
                  {week.services.length > 5 && (
                    <p className="text-[10px] font-bold text-slate-500">
                      +{week.services.length - 5} servicos nesta semana
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {scheduleView === "lista" && (
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px] whitespace-nowrap">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Serviço</th>
                <th className="px-6 py-4 font-semibold">Início</th>
                <th className="px-6 py-4 font-semibold">Fim</th>
                <th className="px-6 py-4 font-semibold">Linha Base</th>
                <th className="px-6 py-4 font-semibold">Progresso (%)</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Acompanhamento</th>
                <th className="px-6 py-4 font-semibold">Reprogramacoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {servicesWithStatus.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-slate-400 italic"
                  >
                    Nenhum serviço cadastrado.
                  </td>
                </tr>
              ) : (
                servicesWithStatus.map((service) => {
                  if (
                    service.parentId &&
                    expandedMacros[service.parentId] === false
                  )
                    return null;

                  const duration =
                    service.startDate && service.endDate
                      ? Math.ceil(
                          (new Date(service.endDate).getTime() -
                            new Date(service.startDate).getTime()) /
                            (1000 * 60 * 60 * 24),
                        )
                      : "-";

                  return (
                    <tr
                      key={service.id}
                      className={cn(
                        "hover:bg-slate-950 border-b border-slate-800 transition-colors",
                        service.isMacro ? "bg-slate-950/50" : "",
                        service.parentId ? "pl-8" : "",
                      )}
                    >
                      <td className="px-6 py-4 text-white font-medium">
                        <div
                          className={cn(
                            "flex items-center gap-3",
                            service.parentId ? "ml-6" : "",
                          )}
                        >
                          {service.isMacro && (
                            <button
                              onClick={() => toggleMacro(service.id)}
                              className="p-1 hover:bg-slate-700 rounded text-slate-500 transition-colors"
                            >
                              {expandedMacros[service.id] === false ? (
                                <ChevronRight className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {service.isMacro && (
                            <Folder className="w-4 h-4 text-blue-600" />
                          )}
                          <div>
                            <span
                              className={cn(
                                service.isMacro
                                  ? "font-bold text-white"
                                  : "font-semibold text-slate-400",
                              )}
                            >
                              {service.name}
                            </span>
                            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                              {duration} dias de duração
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {service.isMacro ? (
                          <span className="text-xs text-slate-500 font-medium">
                            {service.startDate
                              ? new Date(service.startDate).toLocaleDateString(
                                  "pt-BR",
                                )
                              : "-"}
                          </span>
                        ) : (
                          <input
                            type="date"
                            className="p-1.5 border border-slate-700 rounded-lg text-xs text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={service.startDate || ""}
                            onChange={(e) =>
                              handleUpdateService(service.id, {
                                startDate: e.target.value,
                              })
                            }
                          />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[11px] font-semibold text-slate-500">
                          <p>Inicio: {formatDate(service.baselineStartDate || service.startDate)}</p>
                          <p>Fim: {formatDate(service.baselineEndDate || service.endDate)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {service.isMacro ? (
                          <span className="text-xs text-slate-500 font-medium">
                            {service.endDate
                              ? new Date(service.endDate).toLocaleDateString(
                                  "pt-BR",
                                )
                              : "-"}
                          </span>
                        ) : (
                          <input
                            type="date"
                            className="p-1.5 border border-slate-700 rounded-lg text-xs text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={service.endDate || ""}
                            onChange={(e) =>
                              handleUpdateService(service.id, {
                                endDate: e.target.value,
                              })
                            }
                          />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {service.isMacro ? (
                          <span className="text-sm font-bold text-white">
                            {service.progress || 0}%
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="w-16 p-1.5 border border-slate-700 rounded-lg text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                              value={service.progress || 0}
                              onChange={(e) =>
                                handleUpdateService(service.id, {
                                  progress: Number(e.target.value),
                                })
                              }
                            />
                            <span className="text-slate-400 font-medium">
                              %
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            statusTextColors[
                              service.status as keyof typeof statusTextColors
                            ],
                          )}
                        >
                          {service.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 w-48">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                            <span>Real: {service.progress || 0}%</span>
                            <span>Esp: {service.expectedProgress}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
                            {/* Expected bar (subtle) */}
                            <div
                              className="absolute inset-0 bg-slate-600 opacity-30 transition-all duration-500"
                              style={{ width: `${service.expectedProgress}%` }}
                            />
                            {/* Real bar */}
                            <div
                              className={cn(
                                "absolute h-full transition-all duration-500",
                                service.isMacro
                                  ? service.status === "Atrasada"
                                    ? "bg-red-500/100"
                                    : "bg-emerald-500/100"
                                  : statusColors[
                                      service.status as keyof typeof statusColors
                                    ],
                              )}
                              style={{ width: `${service.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-black text-slate-300">
                          {(service.reprogrammingHistory || []).length}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}

export function StatCard({
  label,
  value,
  type,
  color,
  onClick,
}: {
  label: string;
  value: number;
  type: "currency" | "percent";
  color: string;
  onClick?: () => void;
}) {
  const colorClasses = {
    blue: "text-blue-400 bg-blue-500/100/10 border-blue-500/20",
    green: "text-emerald-400 bg-emerald-500/100/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    emerald: "text-emerald-400 bg-emerald-500/100/10 border-emerald-500/20",
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "airo-card p-6 rounded-[1.5rem] border border-slate-800/50 flex flex-col justify-between min-h-[120px] relative overflow-hidden group",
        onClick &&
          "cursor-pointer hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.1)]",
      )}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <TrendingUp className="w-12 h-12" />
      </div>

      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 group-hover:text-blue-400 transition-colors">
        {label}
      </p>

      <div
        className={cn(
          "px-4 py-2 rounded-xl border w-fit backdrop-blur-md",
          (colorClasses as any)[color],
        )}
      >
        <p className="text-xl font-black tracking-tight">
          {type === "currency"
            ? value.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
            : `${value.toFixed(1)}%`}
        </p>
      </div>

      {onClick && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
          <ChevronRight className="w-5 h-5 text-blue-400" />
        </div>
      )}
    </motion.div>
  );
}

export function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-6 py-4 text-sm font-black transition-all rounded-[1.2rem] whitespace-nowrap border-2 shrink-0",
        active
          ? "bg-blue-600/10 border-blue-600 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.15)] scale-[1.05] z-10"
          : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50",
      )}
    >
      <span className={cn(active ? "text-blue-400" : "text-slate-500")}>
        {icon}
      </span>
      <span className="tracking-widest uppercase text-[10px]">{label}</span>
    </button>
  );
}

function RdoTab({
  project,
  onUpdateProject,
}: {
  project: Project;
  onUpdateProject: (p: Project) => void;
}) {
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [supabasePhotos, setSupabasePhotos] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSupabasePhotos() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from("rdo_fotos")
          .select("*")
          .eq("obra_id", project.id);

        if (error) throw error;
        setSupabasePhotos(data || []);
      } catch (err) {
        console.error("Erro ao carregar fotos na tab", err);
      }
    }
    fetchSupabasePhotos();
  }, [project.id]);

  const getRdoPhotosCount = (rdoDate: string, rdoPhotos: any[]) => {
    const oldPhotos = (rdoPhotos || []).filter(
      (cp) => !supabasePhotos.find((sp) => sp.url_foto === cp.url),
    );
    const newPhotos = supabasePhotos.filter(
      (p) => p.data_registro && p.data_registro.startsWith(rdoDate),
    );
    return oldPhotos.length + newPhotos.length;
  };

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportModalTab, setReportModalTab] = useState<"gerar" | "config">(
    "gerar",
  );
  const [reportStartDate, setReportStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [reportEndDate, setReportEndDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  const [configForm, setConfigForm] = useState<any>(
    project.reportConfig || {
      companyName: "",
      cnpj: "",
      phone: "",
      city: "",
      logoUrl: "",
      primaryColor: "#1a2744",
      secondaryColor: "#2d3e6b",
    },
  );

  const generateReport = async () => {
    const rdos = project.rdos || [];
    const filteredRdos = rdos
      .filter((r) => r.date >= reportStartDate && r.date <= reportEndDate)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (filteredRdos.length === 0) {
      toast.warning("Nenhum RDO encontrado neste período.");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    // Paleta Corporativa
    const hexToRgb = (hex: string): [number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
          ]
        : [26, 39, 68];
    };

    const cfg = project.reportConfig || {};
    const primaryRGB = hexToRgb(cfg.primaryColor || "#1a2744");
    const secondaryRGB = hexToRgb(cfg.secondaryColor || "#2d3e6b");

    const colors = {
      primary: primaryRGB,
      secondary: secondaryRGB,
      accent: [245, 158, 11] as [number, number, number],
      accentLight: [254, 243, 199] as [number, number, number],
      gray: [243, 244, 246] as [number, number, number],
      textDark: [31, 41, 55] as [number, number, number],
      textLight: [107, 114, 128] as [number, number, number],
      border: [229, 231, 235] as [number, number, number],
    };

    const projectStats = calculateProjectStats(project);
    const progressPercent = projectStats.percent;

    let currentY = 20;

    // Função auxiliar para desenhar o Cabeçalho Corporativo e Barra de Progresso
    const drawHeader = (isFirstPage: boolean) => {
      // Background do cabeçalho
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, pageWidth, 55, "F");

      // Logo
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, "bold");
      if (cfg.logoUrl && cfg.logoUrl.startsWith("data:image")) {
        try {
          doc.addImage(cfg.logoUrl, "JPEG", 4, 2, 84, 48); // Logo moved to top-left corner
        } catch (e) {
          doc.text("LOGO", 46, 26, { align: "center" });
        }
      } else {
        doc.text("LOGO", 46, 26, { align: "center" });
      }

      // Dados da Empresa
      doc.setTextColor(255, 255, 255);
      const centerInfoX = (margin + 84 + (pageWidth - margin - 40)) / 2; // Midpoint between logo end and RDO start (approx 40mm wide)
      doc.setFontSize(12);
      doc.text(
        cfg.companyName || "Empresa de Engenharia e Construções S/A",
        centerInfoX,
        22,
        { align: "center" },
      );
      doc.setFontSize(8);
      doc.setFont(undefined, "normal");
      doc.text(
        `CNPJ: ${cfg.cnpj || "00.000.000/0001-00"}  |  Telefone: ${cfg.phone || "(00) 0000-0000"}`,
        centerInfoX,
        29,
        { align: "center" },
      );
      doc.text(cfg.city || "Cidade - UF", centerInfoX, 34, { align: "center" });

      // Dados do Documento à direita
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      const rdoNumber = `RDO-${filteredRdos[0].date.replace(/-/g, "").substring(2, 8)}`;
      doc.text(rdoNumber, pageWidth - margin, 16, { align: "right" });
      doc.setFontSize(8);
      doc.setFont(undefined, "normal");
      doc.text(
        `Emissão: ${new Date().toLocaleDateString("pt-BR")}`,
        pageWidth - margin,
        21,
        { align: "right" },
      );
      doc.text(`Obra: ${project.name}`, pageWidth - margin, 26, {
        align: "right",
      });

      currentY = 65;

      if (isFirstPage) {
        // Barra de avanço
        doc.setFontSize(10);
        doc.setTextColor(...colors.textDark);
        doc.setFont(undefined, "bold");
        doc.text(
          `Avanço Físico Acumulado da Obra: ${progressPercent.toFixed(2)}%`,
          margin,
          currentY,
        );

        // Desenhar a barra
        const barY = currentY + 3;
        doc.setFillColor(...colors.gray);
        doc.rect(margin, barY, contentWidth, 6, "F"); // Fundo

        // Barra preenchida
        if (progressPercent > 0) {
          doc.setFillColor(34, 197, 94); // emerald-500
          const filledWidth = Math.min(
            (progressPercent / 100) * contentWidth,
            contentWidth,
          );
          doc.rect(margin, barY, filledWidth, 6, "F");
        }

        currentY = barY + 15;
      }
    };

    drawHeader(true);

    for (let rdoIdx = 0; rdoIdx < filteredRdos.length; rdoIdx++) {
      const rdo = filteredRdos[rdoIdx];
      const dateStr = new Date(rdo.date + "T12:00:00").toLocaleDateString(
        "pt-BR",
      );

      // Verifica espaço para o cabeçalho do dia
      if (currentY > pageHeight - 60) {
        doc.addPage();
        drawHeader(false);
      }

      // Cabeçalho do dia (Azul Médio)
      doc.setFontSize(12);
      doc.setFillColor(...colors.secondary);
      doc.rect(margin, currentY, contentWidth, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, "bold");
      doc.text(`Registro do Dia: ${dateStr}`, margin + 4, currentY + 7);
      currentY += 15;

      // Clima
      const weatherMap: Record<string, string> = {
        bom: "Bom",
        nublado: "Nublado",
        chuvoso: "Chuvoso",
        impraticavel: "Impraticável",
      };
      doc.setFontSize(10);
      doc.setTextColor(...colors.textDark);
      doc.setFont(undefined, "bold");
      doc.text("Condições Climáticas:", margin, currentY);
      doc.setFont(undefined, "normal");
      doc.text(
        `Manhã: ${weatherMap[rdo.weatherMorning] || "-"}   |   Tarde: ${weatherMap[rdo.weatherAfternoon] || "-"}   |   Noite: ${weatherMap[rdo.weatherNight] || "-"}`,
        margin + 45,
        currentY,
      );
      currentY += 10;

      // Efetivo e Equipamentos (Lado a Lado usando autoTable)
      const laborData = (rdo.labor || []).map((l) => [
        l.role,
        l.quantity.toString(),
      ]);
      const equipData = (rdo.equipments || []).map((e) => [
        e.name,
        e.quantity.toString(),
      ]);

      if (laborData.length > 0 || equipData.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [["Mão de Obra (Função)", "Qtd", "Equipamentos", "Qtd"]],
          body: Array.from({
            length: Math.max(laborData.length, equipData.length),
          }).map((_, idx) => [
            laborData[idx]?.[0] || "",
            laborData[idx]?.[1] || "",
            equipData[idx]?.[0] || "",
            equipData[idx]?.[1] || "",
          ]),
          theme: "grid",
          headStyles: {
            fillColor: colors.secondary,
            textColor: 255,
            fontStyle: "bold",
          },
          styles: {
            fontSize: 9,
            cellPadding: 3,
            lineColor: colors.border,
            lineWidth: 0.1,
          },
          margin: { left: margin, right: margin },
        });
        currentY = (doc as any).lastAutoTable.finalY + 10;
      }

      // Serviços Executados
      const dayMeasurements = (project.measurements || []).filter(
        (m) => m.date === rdo.date,
      );

      doc.setFont(undefined, "bold");
      doc.text("Serviços Executados do Dia", margin, currentY);
      doc.setFont(undefined, "normal");
      doc.setDrawColor(...colors.border);
      doc.line(margin, currentY + 2, margin + contentWidth, currentY + 2);
      currentY += 8;

      if (dayMeasurements.length > 0) {
        const servicesData = dayMeasurements.map((m) => {
          const srv = project.services.find((s) => s.id === m.serviceId);
          return [
            srv?.name || "Serviço desconhecido",
            m.quantity.toString(),
            srv?.unit || "",
          ];
        });

        autoTable(doc, {
          startY: currentY,
          head: [["Descrição do Serviço", "Quantidade Medida", "Unid."]],
          body: servicesData,
          theme: "plain",
          headStyles: {
            fillColor: colors.gray,
            textColor: colors.textDark,
            fontStyle: "bold",
          },
          styles: { fontSize: 9, cellPadding: 3, textColor: colors.textDark },
          margin: { left: margin, right: margin },
        });
        currentY = (doc as any).lastAutoTable.finalY + 5;
      }

      if (rdo.activities) {
        const splitActivities = doc.splitTextToSize(
          rdo.activities,
          contentWidth,
        );
        doc.setFontSize(9);
        doc.text(splitActivities, margin, currentY);
        currentY += splitActivities.length * 4 + 6;
      }

      if (dayMeasurements.length === 0 && !rdo.activities) {
        doc.setFontSize(9);
        doc.setTextColor(...colors.textLight);
        doc.text("Nenhum serviço registrado.", margin, currentY);
        currentY += 5;
        doc.setTextColor(...colors.textDark);
      }

      currentY += 5;

      // Ocorrências (Destacado em Ambar)
      if (rdo.occurrences) {
        const splitOccurrences = doc.splitTextToSize(
          rdo.occurrences,
          contentWidth - 10,
        );
        const occBoxHeight = splitOccurrences.length * 5 + 12;

        if (currentY + occBoxHeight > pageHeight - 40) {
          doc.addPage();
          drawHeader(false);
        }

        // Fundo ambar claro
        doc.setFillColor(...colors.accentLight);
        doc.rect(margin, currentY, contentWidth, occBoxHeight, "F");

        // Borda lateral esquerda ambar
        doc.setFillColor(...colors.accent);
        doc.rect(margin, currentY, 3, occBoxHeight, "F");

        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.setTextColor(...colors.accent);
        doc.text("Ocorrências / Interferências:", margin + 8, currentY + 8);

        doc.setFont(undefined, "normal");
        doc.setTextColor(...colors.textDark);
        doc.setFontSize(9);
        doc.text(splitOccurrences, margin + 8, currentY + 14);

        currentY += occBoxHeight + 10;
      }

      // Fotos
      const oldPhotos = (rdo.photos || []).filter(
        (cp) => !supabasePhotos.find((sp) => sp.url_foto === cp.url),
      );
      const newPhotos = supabasePhotos
        .filter((p) => p.data_registro && p.data_registro.startsWith(rdo.date))
        .map((p) => ({
          url: p.url_foto,
          description: p.descricao,
          timestamp: p.data_registro
            ? new Date(p.data_registro).getTime()
            : undefined,
        }));
      const photos = [...oldPhotos, ...newPhotos];

      if (photos.length > 0) {
        if (currentY > pageHeight - 60) {
          doc.addPage();
          drawHeader(false);
        }

        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.setTextColor(...colors.textDark);
        doc.text(`Anexos Fotográficos (${photos.length}):`, margin, currentY);
        doc.setDrawColor(...colors.border);
        doc.line(margin, currentY + 2, margin + contentWidth, currentY + 2);
        currentY += 10;

        // Layout das fotos em grade 2x2
        let photoIndex = 0;
        doc.setFontSize(8);
        while (photoIndex < photos.length) {
          if (currentY > pageHeight - 90) {
            // precisa de bastante espaço para as fotos
            doc.addPage();
            drawHeader(false);
          }

          let lineHeight = 0;

          for (
            let i = photoIndex;
            i < Math.min(photoIndex + 2, photos.length);
            i++
          ) {
            const p = photos[i];
            const diff = i - photoIndex;

            const imgWidth = (contentWidth - 10) / 2;
            const imgHeight = (imgWidth * 9) / 16; // proporção 16:9

            const xCoord = margin + (diff === 0 ? 0 : imgWidth + 10);

            let imgData = p.url;

            if (!imgData.startsWith("data:image")) {
              try {
                const res = await fetch(imgData);
                if (!res.ok) throw new Error("Erro fetch");
                const blob = await res.blob();
                imgData = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                });
              } catch (e) {
                console.error("Erro no fetch da imagem pdf", e);
              }
            }

            if (imgData && imgData.startsWith("data:image")) {
              try {
                doc.addImage(
                  imgData,
                  "JPEG",
                  xCoord,
                  currentY,
                  imgWidth,
                  imgHeight,
                );

                // Legenda e Data
                const legendY = currentY + imgHeight + 5;
                doc.setFont(undefined, "normal");
                doc.setTextColor(...colors.textDark);
                doc.setFontSize(8);
                const splitDesc = doc.splitTextToSize(
                  p.description || `Foto ${i + 1}`,
                  imgWidth,
                );
                doc.text(splitDesc, xCoord, legendY);

                const descHeight = splitDesc.length * 4;
                if (p.timestamp || rdo.date) {
                  doc.setFontSize(7);
                  doc.setTextColor(...colors.textLight);
                  const timeStr = p.timestamp
                    ? new Date(p.timestamp).toLocaleString("pt-BR")
                    : dateStr;
                  doc.text(`Data: ${timeStr}`, xCoord, legendY + descHeight);
                  doc.setFontSize(8);
                }

                lineHeight = Math.max(lineHeight, imgHeight + descHeight + 10);
              } catch (e) {
                doc.text(`Erro ao renderizar imagem.`, xCoord, currentY);
                lineHeight = Math.max(lineHeight, 10);
              }
            } else {
              // Trata URL que falhou como texto
              doc.text(
                `Link Imagem: ${p.url.substring(0, 30)}...`,
                xCoord,
                currentY,
              );
              doc.text(p.description || "", xCoord, currentY + 5);
              lineHeight = Math.max(lineHeight, 15);
            }
          }

          currentY += lineHeight + 10;
          photoIndex += 2;
        }
      }

      currentY += 10;
    }

    // Passar por todas as páginas para adicionar Rodapé
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Número da Página e Nome RDO
      doc.setFontSize(8);
      doc.setTextColor(...colors.textLight);
      const rdoNumber = `RDO-${filteredRdos[0].date.replace(/-/g, "").substring(2, 8)}`;
      doc.text(
        `${rdoNumber} | Página ${i} de ${pageCount}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: "center" },
      );
    }

    // Salvar arquivo
    const rdoFilename = `RDO_${project.name.replace(/\s+/g, "_")}_${reportStartDate}_A_${reportEndDate}.pdf`;
    doc.save(rdoFilename);
    setShowReportModal(false);
  };

  if (editingDate === null) {
    const rdos = project.rdos || [];
    const sortedRdos = [...rdos].sort((a, b) => b.date.localeCompare(a.date));

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-white font-display">
              Diários de Obra (RDO)
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Histórico de relatórios salvos
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowReportModal(true)}
              className="bg-slate-900 border border-slate-700 px-5 py-2.5 text-slate-300 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-colors font-bold text-sm"
            >
              <FileText className="w-5 h-5" /> Gerar Relatório
            </button>
            <button
              onClick={() =>
                setEditingDate(new Date().toISOString().split("T")[0])
              }
              className="bg-blue-600 px-5 py-2.5 text-white rounded-xl flex items-center gap-2 hover:bg-blue-700 font-bold text-sm"
            >
              <Plus className="w-5 h-5" /> Novo RDO
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRdos.length === 0 ? (
            <div className="col-span-full border border-dashed border-slate-700 bg-slate-900/50 rounded-2xl flex flex-col items-center justify-center py-20 text-slate-500">
              <ClipboardList className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-bold text-lg">Nenhum RDO criado.</p>
              <p className="text-sm mt-1">Clique em Novo RDO para começar.</p>
            </div>
          ) : (
            sortedRdos.map((rdo) => (
              <div
                key={rdo.id}
                onClick={() => setEditingDate(rdo.date)}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-blue-500/50 transition-colors card-shadow group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors font-display">
                    {new Date(rdo.date + "T12:00:00").toLocaleDateString(
                      "pt-BR",
                    )}
                  </div>
                  <div className="bg-slate-800 p-2 rounded-lg">
                    <Camera className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
                <p className="text-sm text-slate-400 line-clamp-2 h-10 mb-4">
                  {rdo.activities ||
                    "Sem descrição de atividades registradas..."}
                </p>

                <div className="pt-4 border-t border-slate-800 flex gap-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />{" "}
                    {rdo.labor?.length || 0} Cargos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-amber-400" />{" "}
                    {rdo.equipments?.length || 0} Equip.
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />{" "}
                    {getRdoPhotosCount(rdo.date, rdo.photos || [])} Fotos
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-800"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  Gerar Relatório RDO
                </h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex border-b border-slate-800 mb-6 font-semibold">
                <button
                  onClick={() => setReportModalTab("gerar")}
                  className={`flex-1 pb-3 transition-colors ${reportModalTab === "gerar" ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  Gerar
                </button>
                <button
                  onClick={() => setReportModalTab("config")}
                  className={`flex-1 pb-3 transition-colors ${reportModalTab === "config" ? "text-purple-400 border-b-2 border-purple-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  Personalizar Título
                </button>
              </div>

              {reportModalTab === "gerar" ? (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Data Inicial
                    </label>
                    <input
                      type="date"
                      value={reportStartDate}
                      onChange={(e) => setReportStartDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Data Final
                    </label>
                    <input
                      type="date"
                      value={reportEndDate}
                      onChange={(e) => setReportEndDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Nome da Empresa / Logo
                    </label>
                    <input
                      type="text"
                      value={configForm.companyName || ""}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          companyName: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none mb-2"
                      placeholder="Ex: Engenharia S/A"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        CNPJ
                      </label>
                      <input
                        type="text"
                        value={configForm.cnpj || ""}
                        onChange={(e) =>
                          setConfigForm({ ...configForm, cnpj: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                        placeholder="00.000.000/0001-00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Telefone
                      </label>
                      <input
                        type="text"
                        value={configForm.phone || ""}
                        onChange={(e) =>
                          setConfigForm({
                            ...configForm,
                            phone: e.target.value,
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                        placeholder="(11) 9999-9999"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Cidade - UF
                    </label>
                    <input
                      type="text"
                      value={configForm.city || ""}
                      onChange={(e) =>
                        setConfigForm({ ...configForm, city: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                      placeholder="São Paulo - SP"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Logo (Imagem)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const reader = new FileReader();
                          reader.onloadend = () =>
                            setConfigForm({
                              ...configForm,
                              logoUrl: reader.result as string,
                            });
                          reader.readAsDataURL(f);
                        }
                      }}
                      className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700"
                    />
                    {configForm.logoUrl && (
                      <img
                        src={configForm.logoUrl}
                        alt="Logo"
                        className="mt-2 h-12 object-contain bg-white rounded p-1"
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Cor Primária
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={configForm.primaryColor || "#1a2744"}
                          onChange={(e) =>
                            setConfigForm({
                              ...configForm,
                              primaryColor: e.target.value,
                            })
                          }
                          className="w-10 h-10 rounded border-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={configForm.primaryColor || "#1a2744"}
                          onChange={(e) =>
                            setConfigForm({
                              ...configForm,
                              primaryColor: e.target.value,
                            })
                          }
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none uppercase text-center"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Cor Secundária
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={configForm.secondaryColor || "#2d3e6b"}
                          onChange={(e) =>
                            setConfigForm({
                              ...configForm,
                              secondaryColor: e.target.value,
                            })
                          }
                          className="w-10 h-10 rounded border-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={configForm.secondaryColor || "#2d3e6b"}
                          onChange={(e) =>
                            setConfigForm({
                              ...configForm,
                              secondaryColor: e.target.value,
                            })
                          }
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none uppercase text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onUpdateProject({ ...project, reportConfig: configForm });
                      toast.success("Configurações do relatório salvas!");
                    }}
                    className="w-full py-3 mt-4 bg-slate-800/80 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    Salvar Design no Projeto
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={generateReport}
                  className="flex-1 py-3 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Confirmar e Gerar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  return (
    <RdoEditor
      project={project}
      onUpdateProject={onUpdateProject}
      date={editingDate}
      onBack={() => setEditingDate(null)}
    />
  );
}

function RdoEditor({
  project,
  onUpdateProject,
  date,
  onBack,
}: {
  project: Project;
  onUpdateProject: (p: Project) => void;
  date: string;
  onBack: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState(date);
  const [uploadQueue, setUploadQueue] = useState<
    { id: string; previewUrl: string; isUploading: boolean }[]
  >([]);
  const [supabasePhotos, setSupabasePhotos] = useState<any[]>([]);

  const uploadingDescriptionsRef = useRef<Record<string, string>>({});
  const projectRef = useRef(project);

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  useEffect(() => {
    async function fetchSupabasePhotos() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from("rdo_fotos")
          .select("*")
          .eq("obra_id", project.id);

        if (error) throw error;
        setSupabasePhotos(data || []);
      } catch (err) {
        console.error("Erro ao carregar fotos do Supabase", err);
      }
    }
    fetchSupabasePhotos();
  }, [project.id]);

  const rdos = project.rdos || [];
  const existingRdo = rdos.find((r) => r.date === selectedDate);
  const fallbackRdo: RDO = {
    id: Date.now().toString(),
    date: selectedDate,
    weatherMorning: "bom",
    weatherAfternoon: "bom",
    weatherNight: "bom",
    labor: [],
    equipments: [],
    activities: "",
    occurrences: "",
    photos: [],
  };

  const [localRdo, setLocalRdo] = useState<RDO>(existingRdo || fallbackRdo);
  const localRdoRef = useRef(localRdo);
  const [isSaving, setIsSaving] = useState(false);
  const isDirtyRef = useRef(false);
  const uploadQueueRef = useRef(uploadQueue);

  useEffect(() => {
    localRdoRef.current = localRdo;
  }, [localRdo]);

  useEffect(() => {
    uploadQueueRef.current = uploadQueue;
  }, [uploadQueue]);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const savePendingChanges = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    if (!isDirtyRef.current) {
      setIsSaving(false);
      return;
    }
    const currentRdoState = localRdoRef.current;
    if (!currentRdoState) return;
    const latestProject = projectRef.current;
    if (!latestProject) return;
    const latestRdos = latestProject.rdos || [];
    
    const latestExistingRdo = latestRdos.find((r) => r.date === currentRdoState.date);
    if (JSON.stringify(latestExistingRdo) !== JSON.stringify(currentRdoState)) {
      let newRdos = [...latestRdos];
      if (latestExistingRdo) {
        newRdos = newRdos.map((r) => (r.date === currentRdoState.date ? currentRdoState : r));
      } else {
        newRdos.push(currentRdoState);
      }
      onUpdateProject({ ...latestProject, rdos: newRdos });
    }
    isDirtyRef.current = false;
    setIsSaving(false);
  };

  useEffect(() => {
    savePendingChanges();

    const existing = rdos.find((r) => r.date === selectedDate);
    isDirtyRef.current = false;
    setLocalRdo(existing || {
      id: Date.now().toString(),
      date: selectedDate,
      weatherMorning: "bom",
      weatherAfternoon: "bom",
      weatherNight: "bom",
      labor: [],
      equipments: [],
      activities: "",
      occurrences: "",
      photos: [],
    });
  }, [selectedDate]);

  useEffect(() => {
    const existing = rdos.find((r) => r.date === selectedDate);
    if (existing) {
      if (!debounceTimeoutRef.current) {
        setLocalRdo((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(existing)) {
            return existing;
          }
          return prev;
        });
      }
    }
  }, [project.rdos, selectedDate]);

  useEffect(() => {
    return () => {
      savePendingChanges();
      uploadQueueRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const handleUpdateRdo = (updates: Partial<RDO>) => {
    isDirtyRef.current = true;
    setIsSaving(true);
    let updated: RDO;
    setLocalRdo((prev) => {
      updated = { ...prev, ...updates };
      localRdoRef.current = updated;
      return updated;
    });

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      debounceTimeoutRef.current = null;
      if (!isDirtyRef.current) return;
      const latestProject = projectRef.current;
      const latestRdos = latestProject.rdos || [];
      const latestExistingRdo = latestRdos.find((r) => r.date === selectedDate);

      let newRdos = [...latestRdos];
      if (latestExistingRdo) {
        newRdos = newRdos.map((r) => (r.date === selectedDate ? updated : r));
      } else {
        newRdos.push(updated);
      }
      onUpdateProject({ ...latestProject, rdos: newRdos });
      isDirtyRef.current = false;
      setIsSaving(false);
    }, 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const fileToCompressedDataUrl = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;
            const maxWidth = 1200;
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("Sem contexto 2D"));
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.78));
          };
          img.onerror = () => reject(new Error("Erro ao carregar imagem"));
          img.src = event.target?.result as string;
        };
        reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
        reader.readAsDataURL(file);
      });

    // Create optimistic previews
    const filePreviews = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      isUploading: true,
    }));

    filePreviews.forEach((fp) => {
      uploadingDescriptionsRef.current[fp.id] = "";
    });

    setUploadQueue((prev) => [
      ...prev,
      ...filePreviews.map((fp) => ({
        id: fp.id,
        previewUrl: fp.previewUrl,
        isUploading: true,
      })),
    ]);
    if (e.target) e.target.value = "";

    filePreviews.forEach(async (fp) => {
      try {
        let finalUrl = "";

        if (supabase) {
          // Compressão moderada para economizar banda (opcional, mas recomendado)
          const blob = await new Promise<Blob>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                const maxWidth = 1200; // Resolução boa para relatórios
                if (width > maxWidth) {
                  height = Math.round((height * maxWidth) / width);
                  width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.drawImage(img, 0, 0, width, height);
                  canvas.toBlob(
                    (b) => {
                      if (b) resolve(b);
                      else reject(new Error("Erro no fallback de Canvas"));
                    },
                    "image/jpeg",
                    0.8,
                  );
                } else {
                  reject(new Error("Sem contexto 2D"));
                }
              };
              img.onerror = () => reject(new Error("Erro ao carregar imagem"));
              img.src = event.target?.result as string;
            };
            reader.readAsDataURL(fp.file);
          }).catch(() => fp.file); // Fallback para o arquivo original em caso de erro

          // 1. Upload para o Supabase Storage (bucket: rdo-fotos)
          const fileExt = fp.file.name.split(".").pop() || "jpg";
          const filename = `${project.id}/${selectedDate}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("rdo-fotos")
            .upload(filename, blob, { contentType: "image/jpeg" });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from("rdo-fotos")
            .getPublicUrl(filename);

          finalUrl = publicUrlData.publicUrl;

          // 2. Salvar metadados na tabela rdo_fotos no Supabase
          const novaFotoMeta = {
            obra_id: project.id,
            data_registro: new Date(`${selectedDate}T12:00:00`).toISOString(),
            descricao: uploadingDescriptionsRef.current[fp.id] || "",
            url_foto: finalUrl,
            uploaded_by: auth.currentUser?.email,
          };
          const { data: dbData, error: dbError } = await supabase
            .from("rdo_fotos")
            .insert(novaFotoMeta)
            .select();

          if (dbError) {
            throw dbError;
          } else if (dbData) {
            setSupabasePhotos((prev) => [...prev, ...dbData]);
          }
        } else {
          finalUrl = await fileToCompressedDataUrl(fp.file);
          const localPhoto: RDOPhoto = {
            id: fp.id,
            url: finalUrl,
            description: uploadingDescriptionsRef.current[fp.id] || "",
            timestamp: Date.now(),
          };
          handleUpdateRdo({
            photos: [...(localRdoRef.current.photos || []), localPhoto],
          });
          toast.success("Foto anexada localmente ao RDO.");
        }

        setUploadQueue((currentQueue) =>
          currentQueue.filter((q) => q.id !== fp.id),
        );
        URL.revokeObjectURL(fp.previewUrl);
        delete uploadingDescriptionsRef.current[fp.id];
      } catch (singleError: any) {
        console.error("Erro na foto: ", singleError);

        let errorMsg = "Erro desconhecido";
        if (singleError?.message === "Bucket not found") {
          errorMsg =
            "Bucket 'rdo-fotos' não encontrado. Crie um bucket PÚBLICO chamado 'rdo-fotos' no painel do Supabase.";
        } else if (
          singleError?.message?.includes("row-level security policy")
        ) {
          errorMsg =
            "Erro de permissão no Supabase. Desative o RLS da tabela 'rdo_fotos' ou crie uma política (policy) permitindo inserções.";
        } else if (
          singleError?.message?.includes("invalid input syntax for type uuid")
        ) {
          errorMsg =
            "O tipo da coluna 'obra_id' na tabela 'rdo_fotos' do Supabase deve ser 'text' (ou 'varchar'), pois os IDs do painel não são UUIDs válidos. Altere o tipo da coluna lá no painel do Supabase e tente novamente.";
        } else if (singleError?.message) {
          errorMsg = singleError.message;
        }

        toast.error("Erro ao enviar foto: " + errorMsg);
        setUploadQueue((currentQueue) =>
          currentQueue.filter((q) => q.id !== fp.id),
        );
        URL.revokeObjectURL(fp.previewUrl);
        delete uploadingDescriptionsRef.current[fp.id];
      }
    });
  };

  const UnifiedPhotos = [
    // 1. Fotos antigas do Firestore (retrocompatibilidade)
    ...(localRdo.photos || [])
      .filter((cp) => !supabasePhotos.find((sp) => sp.url_foto === cp.url))
      .map((p) => ({ ...p, isUploading: false })),

    // 2. Fotos do Supabase filtradas pela data do RDO atual
    ...supabasePhotos
      .filter(
        (p) => p.data_registro && p.data_registro.startsWith(selectedDate),
      )
      .map((p) => ({
        id: p.id,
        url: p.url_foto,
        description: p.descricao,
        isUploading: false,
      })),

    // 3. Fila de upload
    ...uploadQueue.map((q) => ({
      id: q.id,
      url: q.previewUrl,
      description: uploadingDescriptionsRef.current[q.id] || "",
      isUploading: true,
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 border border-slate-700 bg-slate-800 rounded-xl hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-white font-display">
              Edição RDO
            </h2>
            <p className="text-sm font-medium mt-1 flex items-center gap-1.5 transition-colors duration-300">
              {isSaving ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-amber-500">Salvando alterações...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-500">Todas as alterações salvas</span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 flex items-center gap-3 relative shadow-inner">
            <Calendar className="w-5 h-5 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white border-none focus:outline-none focus:ring-0 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full cursor-pointer font-medium"
            />
          </div>
          <button
            onClick={onBack}
            className="bg-emerald-600 px-5 py-2 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-sm transition-colors"
          >
            Salvar e Voltar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lado Esquerdo - Detalhes */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden card-shadow">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <h3 className="font-bold text-white flex items-center gap-2 font-display">
                <Cloud className="w-4 h-4 text-sky-400" /> Condições Climáticas
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {(["Morning", "Afternoon", "Night"] as const).map((period) => (
                <div key={period} className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                    {period === "Morning"
                      ? "Manhã"
                      : period === "Afternoon"
                        ? "Tarde"
                        : "Noite"}
                  </label>
                  <select
                    value={localRdo[`weather${period}`]}
                    onChange={(e) =>
                      handleUpdateRdo({ [`weather${period}`]: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="bom">Bom</option>
                    <option value="nublado">Nublado</option>
                    <option value="chuvoso">Chuvoso</option>
                    <option value="impraticavel">Impraticável</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Efetivo */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden card-shadow flex flex-col">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2 font-display">
                  <Users className="w-4 h-4 text-emerald-400" /> Efetivo
                </h3>
                <button
                  onClick={() =>
                    handleUpdateRdo({
                      labor: [
                        ...(localRdo.labor || []),
                        { id: Date.now().toString(), role: "", quantity: 1 },
                      ],
                    })
                  }
                  className="text-emerald-500 hover:text-emerald-400 text-sm font-semibold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="p-4 flex-1 space-y-3">
                {(!localRdo.labor || localRdo.labor.length === 0) && (
                  <p className="text-sm text-slate-500 italic text-center py-4">
                    Nenhum efetivo registrado.
                  </p>
                )}
                {(localRdo.labor || []).map((l, idx) => (
                  <div key={l.id} className="flex items-center gap-2">
                    <input
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white"
                      placeholder="Cargo (ex: Pedreiro)"
                      value={l.role}
                      onChange={(e) => {
                        const newL = localRdo.labor.map((item, i) =>
                          i === idx ? { ...item, role: e.target.value } : item
                        );
                        handleUpdateRdo({ labor: newL });
                      }}
                    />
                    <input
                      type="number"
                      min="1"
                      className="w-20 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white text-center"
                      value={l.quantity}
                      onChange={(e) => {
                        const newL = localRdo.labor.map((item, i) =>
                          i === idx ? { ...item, quantity: Number(e.target.value) } : item
                        );
                        handleUpdateRdo({ labor: newL });
                      }}
                    />
                    <button
                      onClick={() => {
                        handleUpdateRdo({
                          labor: localRdo.labor.filter((x) => x.id !== l.id),
                        });
                      }}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipamentos */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden card-shadow flex flex-col">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2 font-display">
                  <Settings className="w-4 h-4 text-amber-400" /> Equipamentos
                </h3>
                <button
                  onClick={() =>
                    handleUpdateRdo({
                      equipments: [
                        ...(localRdo.equipments || []),
                        { id: Date.now().toString(), name: "", quantity: 1 },
                      ],
                    })
                  }
                  className="text-amber-500 hover:text-amber-400 text-sm font-semibold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="p-4 flex-1 space-y-3">
                {(!localRdo.equipments ||
                  localRdo.equipments.length === 0) && (
                  <p className="text-sm text-slate-500 italic text-center py-4">
                    Nenhum equipamento.
                  </p>
                )}
                {(localRdo.equipments || []).map((eq, idx) => (
                  <div key={eq.id} className="flex items-center gap-2">
                    <input
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white"
                      placeholder="Equip. (ex: Betoneira)"
                      value={eq.name}
                      onChange={(e) => {
                        const newEq = localRdo.equipments.map((item, i) =>
                          i === idx ? { ...item, name: e.target.value } : item
                        );
                        handleUpdateRdo({ equipments: newEq });
                      }}
                    />
                    <input
                      type="number"
                      min="1"
                      className="w-20 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white text-center"
                      value={eq.quantity}
                      onChange={(e) => {
                        const newEq = localRdo.equipments.map((item, i) =>
                          i === idx ? { ...item, quantity: Number(e.target.value) } : item
                        );
                        handleUpdateRdo({ equipments: newEq });
                      }}
                    />
                    <button
                      onClick={() => {
                        handleUpdateRdo({
                          equipments: localRdo.equipments.filter(
                            (x) => x.id !== eq.id,
                          ),
                        });
                      }}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Textos */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden card-shadow">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <h3 className="font-bold text-white flex items-center gap-2 font-display">
                <ClipboardList className="w-4 h-4 text-blue-400" /> Atividades e
                Ocorrências
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                  Atividades do Dia
                </label>
                <textarea
                  value={localRdo.activities || ""}
                  onChange={(e) =>
                    handleUpdateRdo({ activities: e.target.value })
                  }
                  placeholder="Descreva as atividades realizadas..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                  Ocorrências / Interferências
                </label>
                <textarea
                  value={localRdo.occurrences || ""}
                  onChange={(e) =>
                    handleUpdateRdo({ occurrences: e.target.value })
                  }
                  placeholder="Acidentes, chuvas, faltas de material..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 min-h-[100px] resize-y"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito - Fotos */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden card-shadow sticky top-6">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2 font-display">
                <Camera className="w-4 h-4 text-purple-400" /> Fotos
              </h3>
              <label className="text-purple-400 hover:text-purple-300 font-bold cursor-pointer flex items-center gap-1 text-sm bg-purple-500/10 px-3 py-1.5 rounded-lg transition-colors">
                {uploadQueue.length > 0 ? (
                  <>
                    <div className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full mr-1" />{" "}
                    {uploadQueue.length}
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" /> Add
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {UnifiedPhotos.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-sm font-medium">Nenhuma foto anexada</p>
                </div>
              ) : (
                UnifiedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group bg-slate-800 rounded-xl overflow-hidden border border-slate-700"
                  >
                    <div className="aspect-video bg-slate-950">
                      <img
                        src={photo.url}
                        alt="RDO"
                        className={cn(
                          "w-full h-full object-cover",
                          photo.isUploading && "opacity-50 blur-sm grayscale",
                        )}
                      />
                      {photo.isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-spin w-6 h-6 border-2 border-white/30 border-t-white rounded-full"></div>
                        </div>
                      )}
                      {!photo.isUploading && (
                        <button
                          onClick={async () => {
                            if (photo.url.includes("supabase")) {
                              try {
                                await supabase
                                  ?.from("rdo_fotos")
                                  .delete()
                                  .eq("id", photo.id);
                                setSupabasePhotos((prev) =>
                                  prev.filter((p) => p.id !== photo.id),
                                );
                              } catch (e) {}
                            } else {
                              handleUpdateRdo({
                                photos: (localRdo.photos || []).filter(
                                  (p) => p.id !== photo.id,
                                ),
                              });
                            }
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                        >
                          < Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="p-3">
                      <textarea
                        defaultValue={photo.description}
                        onBlur={async (e) => {
                          if (!photo.isUploading) {
                            const newDesc = e.target.value;
                            if (photo.url.includes("supabase")) {
                              await supabase
                                ?.from("rdo_fotos")
                                .update({ descricao: newDesc })
                                .eq("id", photo.id);
                              setSupabasePhotos((prev) =>
                                prev.map((p) =>
                                  p.id === photo.id
                                    ? { ...p, descricao: newDesc }
                                    : p,
                                ),
                              );
                            } else {
                              const newPhotos = [...(localRdo.photos || [])];
                              const p = newPhotos.find(
                                (x) => x.id === photo.id,
                              );
                              if (p) {
                                p.description = newDesc;
                                handleUpdateRdo({ photos: newPhotos });
                              }
                            }
                          }
                        }}
                        onChange={(e) => {
                          if (photo.isUploading) {
                            uploadingDescriptionsRef.current[photo.id] =
                              e.target.value;
                          }
                        }}
                        placeholder={
                          photo.isUploading
                            ? "Enviando..."
                            : "Adicione uma legenda..."
                        }
                        className="w-full bg-transparent border-none text-[11px] font-medium text-slate-300 placeholder:text-slate-500 focus:ring-0 p-0 resize-none min-h-[40px]"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabCompartilharProjeto({
  project,
  onUpdateProject,
}: {
  project: Project;
  onUpdateProject: (p: Project) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");

  const handleAdd = () => {
    if (!email) return;
    const cleanEmail = email.trim().toLowerCase();
    const sharedWith = {
      ...(project.sharedWith || {}),
      [cleanEmail]: { role, allowedTabs: AVAILABLE_TABS.map((t) => t.id) },
    };
    const sharedEmails = Object.keys(sharedWith);
    onUpdateProject({ ...project, sharedWith, sharedEmails });
    setEmail("");
  };

  const handleRemove = (email: string) => {
    const sharedWith = { ...(project.sharedWith || {}) };
    delete sharedWith[email];
    const sharedEmails = Object.keys(sharedWith);
    onUpdateProject({ ...project, sharedWith, sharedEmails });
  };

  return (
    <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 card-shadow space-y-6 max-w-3xl">
      <h3 className="text-xl font-bold text-white font-display">
        Compartilhar Obra
      </h3>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 p-3 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
            placeholder="E-mail do usuário"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "viewer" | "editor")}
            className="p-3 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white bg-slate-900"
          >
            <option value="viewer">Visualizador</option>
            <option value="editor">Editor</option>
          </select>
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Adicionar
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {Object.entries(project.sharedWith || {}).map(
          ([email, share]: [string, any]) => (
            <div
              key={email}
              className="flex justify-between items-center p-4 bg-slate-950 border border-slate-800 rounded-xl transition-colors hover:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{email}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                    {(share.role || share) === "viewer"
                      ? "Visualizador"
                      : "Editor"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(email)}
                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ),
        )}
        {Object.keys(project.sharedWith || {}).length === 0 && (
          <div className="text-center py-8 text-slate-500 italic bg-slate-950 rounded-xl border border-slate-800">
            Nenhum usuário compartilhado ainda.
          </div>
        )}
      </div>
    </div>
  );
}

function TabCompartilhar({
  location,
  onUpdateLocation,
}: {
  location: Location;
  onUpdateLocation: (l: Location) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");

  const handleAdd = () => {
    if (!email) return;
    const cleanEmail = email.trim().toLowerCase();
    const sharedWith = {
      ...(location.sharedWith || {}),
      [cleanEmail]: { role, allowedTabs: AVAILABLE_TABS.map((t) => t.id) },
    };
    const sharedEmails = Object.keys(sharedWith);
    onUpdateLocation({ ...location, sharedWith, sharedEmails });
    setEmail("");
  };

  const handleRemove = (email: string) => {
    const sharedWith = { ...(location.sharedWith || {}) };
    delete sharedWith[email];
    const sharedEmails = Object.keys(sharedWith);
    onUpdateLocation({ ...location, sharedWith, sharedEmails });
  };

  return (
    <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 card-shadow space-y-6 max-w-3xl">
      <h3 className="text-xl font-bold text-white font-display">
        Compartilhar Local de Obra
      </h3>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 p-3 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
            placeholder="E-mail do usuário"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "viewer" | "editor")}
            className="p-3 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white bg-slate-900"
          >
            <option value="viewer">Visualizador</option>
            <option value="editor">Editor</option>
          </select>
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Adicionar
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {Object.entries(location.sharedWith || {}).map(([email, share]) => (
          <div
            key={email}
            className="flex justify-between items-center p-4 bg-slate-950 border border-slate-800 rounded-xl transition-colors hover:bg-slate-800"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-white">{email}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  {share.role === "viewer" ? "Visualizador" : "Editor"}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleRemove(email)}
              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {Object.keys(location.sharedWith || {}).length === 0 && (
          <div className="text-center py-8 text-slate-500 italic bg-slate-950 rounded-xl border border-slate-800">
            Nenhum usuário compartilhado ainda.
          </div>
        )}
      </div>
    </div>
  );
}
