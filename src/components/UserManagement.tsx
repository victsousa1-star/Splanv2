import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  UserPlus, 
  Users, 
  Shield, 
  Mail, 
  Lock, 
  Search, 
  Trash2, 
  Check, 
  X, 
  AlertCircle,
  HardHat,
  ChevronRight,
  Plus,
  MapPin,
  Building2,
  Type,
  ImageIcon,
  Save,
  Trash,
  Upload
} from 'lucide-react';
import { 
  db, 
  adminAuth, 
  createUserWithEmailAndPassword, 
  signOut as adminSignOut,
  collection, 
  query, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  orderBy, 
  updateDoc, 
  getDocs, 
  where, 
  writeBatch 
} from '../firebase-compat';
import { supabase } from '../supabase';
import { AppConfig } from '../types';
import { handleFirestoreError, OperationType } from '../firestoreError';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name?: string;
  accessProfile?: AccessProfileId;
  needsPasswordReset: boolean;
}

interface Location {
  id: string;
  name: string;
  type?: 'shopping' | 'obra' | 'allowance';
  sharedWith?: Record<string, any>;
  sharedEmails?: string[];
}

type AccessProfileId =
  | "admin"
  | "gestor_shopping"
  | "fiscal"
  | "leitura";

const TEST_PROFILES: Array<{
  id: AccessProfileId;
  label: string;
  description: string;
}> = [
  { id: "admin", label: "Administrador", description: "Ve todos os modulos e acoes." },
  { id: "gestor_shopping", label: "Gerentes", description: "Opera Lojas, Obras e Checklists do shopping." },
  { id: "fiscal", label: "Operacoes", description: "Acesso apenas ao modulo Checklists." },
  { id: "leitura", label: "Somente leitura", description: "Ve somente o que for compartilhado." },
];

const getProfileLabel = (profile?: AccessProfileId | null) =>
  TEST_PROFILES.find((item) => item.id === profile)?.label || "Gerentes";

export function UserManagement({
  appConfig,
  onUpdateAppConfig,
  permissionTestProfile,
  onChangePermissionTestProfile,
}: {
  appConfig: AppConfig;
  onUpdateAppConfig: (cfg: AppConfig) => void;
  permissionTestProfile?: AccessProfileId | null;
  onChangePermissionTestProfile?: (profile: AccessProfileId | null) => void;
}) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'permissions' | 'branding'>('users');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Branding State
  const [appName, setAppName] = useState(appConfig.name);
  const [appLogo, setAppLogo] = useState(appConfig.logoUrl);
  const [savingBranding, setSavingBranding] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState<UserProfile | null>(null);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');
  const [newUserAccessProfile, setNewUserAccessProfile] = useState<AccessProfileId>('gestor_shopping');
  const [newUserPassword, setNewUserPassword] = useState('@12345678'); // Standard initial password
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [updatingAccess, setUpdatingAccess] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const qUsers = query(collection(db, 'users'), orderBy('email'));
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    const qLocations = query(collection(db, 'locations'), orderBy('name'));
    const unsubscribeLocations = onSnapshot(qLocations, (snapshot) => {
      const locationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location));
      setLocations(locationsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'locations');
    });

    return () => {
      unsubscribeUsers();
      unsubscribeLocations();
    };
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;

    setCreating(true);
    const id = toast.loading("Criando novo usuário...");

    try {
      // 1. Create in Firebase Auth using adminAuth instance
      const credential = await createUserWithEmailAndPassword(adminAuth, newUserEmail, newUserPassword);
      const uid = credential.user.uid;

      // 2. Create profile in Firestore
      await setDoc(doc(db, 'users', uid), {
        email: newUserEmail,
        name: newUserName,
        role: newUserRole,
        accessProfile: newUserRole === 'admin' ? 'admin' : newUserAccessProfile,
        needsPasswordReset: true,
        createdAt: new Date().toISOString()
      });

      // 3. If admin, add to admins collection
      if (newUserRole === 'admin') {
        await setDoc(doc(db, 'admins', uid), {
          email: newUserEmail
        });
      }

      // 4. Update shared locations
      if (selectedLocations.length > 0) {
        const batch = writeBatch(db);
        for (const locId of selectedLocations) {
          const loc = locations.find(l => l.id === locId);
          if (loc) {
            const sharedWith = { ...(loc.sharedWith || {}), [newUserEmail.toLowerCase()]: { role: 'editor', allowedTabs: ['resumo', 'servicos', 'medicoes', 'financeiro', 'notas', 'ocs', 'cronograma', 'rdo'] } };
            const sharedEmails = Object.keys(sharedWith);
            batch.update(doc(db, 'locations', locId), { sharedWith, sharedEmails });
            
            // Sync with projects
            const projectsQuery = query(collection(db, 'projects'), where('locationId', '==', locId));
            const projectsSnap = await getDocs(projectsQuery);
            projectsSnap.forEach(projectDoc => {
              batch.update(doc(db, 'projects', projectDoc.id), { sharedWith, sharedEmails });
            });

            const storesQuery = query(collection(db, 'stores'), where('shoppingId', '==', locId));
            const storesSnap = await getDocs(storesQuery);
            storesSnap.forEach(storeDoc => {
              batch.update(doc(db, 'stores', storeDoc.id), { sharedWith, sharedEmails });
            });
          }
        }
        await batch.commit();
      }

      // 5. Important: Sign out from adminAuth auth immediately
      await adminSignOut(adminAuth);

      toast.success("Usuário criado com sucesso! Informe-o para trocar a senha no primeiro acesso.", { id });
      setShowAddModal(false);
      setNewUserEmail('');
      setNewUserName('');
      setNewUserRole('user');
      setNewUserAccessProfile('gestor_shopping');
      setSelectedLocations([]);
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error("Erro ao criar usuário: " + (error.message || "Tente novamente."), { id });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateUserAccess = async (
    user: UserProfile,
    newLocationIds: string[],
    newAccessProfile: AccessProfileId,
  ) => {
    setUpdatingAccess(true);
    const id = toast.loading("Atualizando permissões e acessos...");

    try {
      const batch = writeBatch(db);
      const userEmail = user.email.toLowerCase();
      const isAdmin = newAccessProfile === "admin";

      batch.update(doc(db, 'users', user.id), {
        role: isAdmin ? 'admin' : 'user',
        accessProfile: newAccessProfile,
      });

      if (isAdmin) {
        batch.set(doc(db, 'admins', user.id), { email: user.email });
      } else {
        batch.delete(doc(db, 'admins', user.id));
      }

      // For each location, check if user should have access or not
      for (const loc of locations) {
        const currentlyHasAccess = loc.sharedEmails?.includes(userEmail);
        const shouldHaveAccess = newLocationIds.includes(loc.id);

        if (shouldHaveAccess && !currentlyHasAccess) {
          // Grant access
          const sharedWith = { ...(loc.sharedWith || {}), [userEmail]: { role: 'editor', allowedTabs: ['resumo', 'servicos', 'medicoes', 'financeiro', 'notas', 'ocs', 'cronograma', 'rdo'] } };
          const sharedEmails = Object.keys(sharedWith);
          batch.update(doc(db, 'locations', loc.id), { sharedWith, sharedEmails });

          // Sync with projects
          const projectsQuery = query(collection(db, 'projects'), where('locationId', '==', loc.id));
          const projectsSnap = await getDocs(projectsQuery);
          projectsSnap.forEach(projectDoc => {
            batch.update(doc(db, 'projects', projectDoc.id), { sharedWith, sharedEmails });
          });

          const storesQuery = query(collection(db, 'stores'), where('shoppingId', '==', loc.id));
          const storesSnap = await getDocs(storesQuery);
          storesSnap.forEach(storeDoc => {
            batch.update(doc(db, 'stores', storeDoc.id), { sharedWith, sharedEmails });
          });
        } else if (!shouldHaveAccess && currentlyHasAccess) {
          // Revoke access
          const sharedWith = { ...(loc.sharedWith || {}) };
          delete sharedWith[userEmail];
          const sharedEmails = Object.keys(sharedWith);
          batch.update(doc(db, 'locations', loc.id), { sharedWith, sharedEmails });

          // Sync with projects
          const projectsQuery = query(collection(db, 'projects'), where('locationId', '==', loc.id));
          const projectsSnap = await getDocs(projectsQuery);
          projectsSnap.forEach(projectDoc => {
            batch.update(doc(db, 'projects', projectDoc.id), { sharedWith, sharedEmails });
          });

          const storesQuery = query(collection(db, 'stores'), where('shoppingId', '==', loc.id));
          const storesSnap = await getDocs(storesQuery);
          storesSnap.forEach(storeDoc => {
            batch.update(doc(db, 'stores', storeDoc.id), { sharedWith, sharedEmails });
          });
        }
      }

      await batch.commit();
      toast.success("Permissões atualizadas com sucesso!", { id });
      setShowAccessModal(null);
    } catch (error: any) {
      console.error("Error updating access:", error);
      toast.error("Erro ao atualizar permissões: " + error.message, { id });
    } finally {
      setUpdatingAccess(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid));
      await deleteDoc(doc(db, 'admins', uid)); // Try delete, fail silently if not exists
      toast.success("Perfil removido do banco de dados.");
    } catch (error: any) {
      toast.error("Erro ao remover: " + error.message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleLocationSelection = (locId: string) => {
    setSelectedLocations(prev => 
      prev.includes(locId) ? prev.filter(id => id !== locId) : [...prev, locId]
    );
  };

  const handleSaveBranding = async () => {
    setSavingBranding(true);
    let finalLogoUrl = appLogo;

    if (appLogo && appLogo.startsWith('data:image')) {
      try {
        const compressedBlob = await new Promise<Blob>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;
            const maxWidth = 512;
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
          img.src = appLogo;
        });

        const fileName = `app/logo_${Date.now()}.webp`;

        if (supabase) {
          const { error: uploadError } = await supabase.storage
            .from("rdo-fotos")
            .upload(fileName, compressedBlob, { contentType: "image/webp" });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from("rdo-fotos")
            .getPublicUrl(fileName);

          finalLogoUrl = publicUrlData.publicUrl;
        }
      } catch (err) {
        console.warn("Nao foi possivel otimizar/enviar o logo. Usando imagem local.", err);
        finalLogoUrl = appLogo;
        toast.warning("Logo salvo sem otimizacao de arquivo.");
      }
    }

    onUpdateAppConfig({
      name: appName,
      logoUrl: finalLogoUrl
    });
    setSavingBranding(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <h2 className="text-3xl font-bold text-white font-display tracking-tight">Painel Administrativo</h2>
          <p className="text-slate-400 text-sm mt-1 font-medium">Configurações globais, gerenciamento de acessos e identidade visual do sistema.</p>
        </div>
        <div className="flex bg-slate-950/40 p-1.5 rounded-2xl border border-slate-800/40 self-start md:self-auto">
          <button 
            onClick={() => setActiveTab('users')}
            className={cn(
              "px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer",
              activeTab === 'users' ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Users className="w-4 h-4" /> Usuários
          </button>
          <button 
            onClick={() => setActiveTab('permissions')}
            className={cn(
              "px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer",
              activeTab === 'permissions' ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Shield className="w-4 h-4" /> Permissões
          </button>
          <button 
            onClick={() => setActiveTab('branding')}
            className={cn(
              "px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer",
              activeTab === 'branding' ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <ImageIcon className="w-4 h-4" /> Branding
          </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <>
          <div className="flex justify-between items-center px-1">
             <div className="text-slate-400 font-bold text-xs flex items-center gap-2 uppercase tracking-wider">
                <div className="w-1 h-4 bg-blue-500 rounded-full" />
                Colaboradores Cadastrados
             </div>
             <button 
              onClick={() => setShowAddModal(true)}
              className="btn-primary py-2 px-4 text-xs font-bold uppercase tracking-wider shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              Convidar Integrante
            </button>
          </div>
          
          <div className="airo-card p-6 shadow-xl">
            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Buscar colaborador por nome ou e-mail..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-5 py-3.5 bg-slate-950 border border-slate-800/80 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-white font-medium text-sm placeholder:text-slate-500/80"
              />
            </div>

            <div className="overflow-x-auto custom-scrollbar rounded-xl border border-slate-800/40">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>E-mail</th>
                    <th>Cargo</th>
                    <th>Status</th>
                    <th className="text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td className="font-bold text-white">{user.name || 'Sem nome'}</td>
                      <td className="text-slate-400 font-medium">{user.email}</td>
                      <td>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          user.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {user.role === 'admin' ? 'Administrador' : getProfileLabel(user.accessProfile)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {user.needsPasswordReset ? (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse" />
                              <span className="text-xs font-semibold text-amber-500">Pendente de Reset</span>
                            </>
                          ) : (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              <span className="text-xs font-semibold text-emerald-500 font-medium">Ativo</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => setShowAccessModal(user)}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all cursor-pointer"
                            title="Gerenciar Acessos"
                          >
                            <Building2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                            title="Excluir Perfil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic font-medium bg-slate-950/10">
                        Nenhum colaborador encontrado com os critérios de busca.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : activeTab === 'permissions' ? (
        <div className="space-y-6">
          <div className="airo-card p-6 shadow-xl">
            {onChangePermissionTestProfile && (
              <div className="mb-6 p-5 rounded-2xl bg-slate-950/35 border border-slate-800/70">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs font-black text-cyan-400 uppercase tracking-[0.22em]">
                      Modo teste
                    </p>
                    <h3 className="text-xl font-black text-white font-display mt-1">
                      Simular perfil de acesso
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Use para conferir como o app se comporta para cada tipo de usuário, sem alterar permissões reais.
                    </p>
                  </div>
                  <button
                    onClick={() => onChangePermissionTestProfile(null)}
                    disabled={!permissionTestProfile}
                    className="btn-secondary px-4 py-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Desativar teste
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {TEST_PROFILES.map((profile) => {
                    const active = permissionTestProfile === profile.id;
                    return (
                      <button
                        key={profile.id}
                        onClick={() => onChangePermissionTestProfile(profile.id)}
                        className={cn(
                          "text-left p-4 rounded-2xl border transition-all",
                          active
                            ? "bg-cyan-500/10 border-cyan-500/40 text-white"
                            : "bg-slate-900/35 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/70",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-black text-sm">{profile.label}</p>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              {profile.description}
                            </p>
                          </div>
                          {active && (
                            <span className="px-2 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-black uppercase tracking-widest">
                              ativo
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-cyan-500/10 p-4 rounded-xl text-cyan-400">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-display">
                  Matriz de permissões
                </h3>
                <p className="text-slate-400 text-sm font-medium mt-1">
                  Base para controlar módulos, ações e escopos de acesso por perfil.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar rounded-xl border border-slate-800/40">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Perfil</th>
                    <th>Escopo recomendado</th>
                    <th>Obras</th>
                    <th>Checklists</th>
                    <th>Usuários</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Administrador", "Global", "Total", "Total", "Gerencia"],
                    ["Gerentes", "Shopping autorizado", "Criar e editar", "Criar, editar e PDF", "Consulta"],
                    ["Operacoes", "Shopping autorizado", "Sem acesso", "Criar, editar e PDF", "Sem acesso"],
                    ["Somente leitura", "Obra ou loja compartilhada", "Somente se compartilhado", "Somente se compartilhado", "Sem acesso"],
                  ].map(([profile, scope, obras, checklists, userAccess]) => (
                    <tr key={profile}>
                      <td className="font-bold text-white">{profile}</td>
                      <td>{scope}</td>
                      <td>{obras}</td>
                      <td>{checklists}</td>
                      <td>{userAccess}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-950/35 border border-slate-800 rounded-2xl p-4">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Módulo</p>
                <p className="text-sm text-slate-300 mt-2">Define se a pessoa vê Obras, Checklists ou Administração.</p>
              </div>
              <div className="bg-slate-950/35 border border-slate-800 rounded-2xl p-4">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Ação</p>
                <p className="text-sm text-slate-300 mt-2">Controla visualizar, criar, editar, excluir e exportar PDF.</p>
              </div>
              <div className="bg-slate-950/35 border border-slate-800 rounded-2xl p-4">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Escopo</p>
                <p className="text-sm text-slate-300 mt-2">Limita o acesso a global, shopping, obra ou loja específica.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="airo-card p-8 shadow-xl max-w-2xl">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600/10 p-4 rounded-xl text-indigo-400">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-display">Personalização da Identidade</h3>
                <p className="text-slate-400 text-sm font-medium">Configure o nome da plataforma e o logotipo oficial.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                  <Type className="w-4 h-4 text-blue-500" /> Nome do Aplicativo
                </label>
                <input 
                  type="text"
                  value={appName}
                  onChange={e => setAppName(e.target.value)}
                  className="premium-input text-base font-bold"
                  placeholder="Ex: SPlan"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-500" /> Logo Principal
                </label>
                
                <div className="flex flex-col md:flex-row gap-6 items-center bg-slate-950/40 p-6 rounded-2xl border border-slate-800/60">
                  <div className={cn(
                    "w-32 h-32 rounded-xl flex items-center justify-center overflow-hidden group relative transition-all",
                    appLogo 
                      ? "border border-slate-800/80 bg-slate-900/30" 
                      : "bg-slate-900/40 border border-dashed border-slate-700/80"
                  )}>
                    {appLogo ? (
                      <>
                        <img src={appLogo} alt="Preview" className="max-w-full max-h-full object-contain p-2" />
                        <button 
                          onClick={() => setAppLogo(null)}
                          className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold cursor-pointer"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <HardHat className="w-8 h-8 text-slate-700" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-3 text-center md:text-left">
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Este logo substituirá o ícone padrão do capacete no cabeçalho e na tela de login. Use preferencialmente uma imagem com fundo transparente (PNG ou WebP).
                    </p>
                    <input 
                      type="file"
                      id="app-logo-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setAppLogo(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label 
                      htmlFor="app-logo-upload"
                      className="inline-flex items-center gap-2.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" /> Selecionar Imagem
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-800/60 flex justify-end">
                <button 
                  onClick={handleSaveBranding}
                  disabled={savingBranding}
                  className="btn-primary px-8 py-3 text-xs font-bold uppercase tracking-wider shadow-md disabled:opacity-50"
                >
                  {savingBranding ? (
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800/80 rounded-[2rem] p-6 md:p-8 w-full max-w-lg shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
            
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-blue-600/10 p-3.5 rounded-xl text-blue-400">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-white">Convidar Integrante</h3>
                <p className="text-slate-400 text-xs font-medium">Cadastre um novo integrante na plataforma.</p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400">Nome Completo</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required 
                    value={newUserName} 
                    onChange={e => setNewUserName(e.target.value)}
                    className="premium-input pl-11"
                    placeholder="Ex: João Silva"
                  />
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400">E-mail de Acesso</label>
                <div className="relative">
                  <input 
                    type="email" 
                    required 
                    value={newUserEmail} 
                    onChange={e => setNewUserEmail(e.target.value)}
                    className="premium-input pl-11"
                    placeholder="email@empresa.com"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400">Cargo</label>
                  <div className="relative">
                    <select 
                      value={newUserRole} 
                      onChange={e => setNewUserRole(e.target.value as any)}
                      className="premium-input pl-11 pr-10 appearance-none cursor-pointer"
                    >
                      <option value="user" className="bg-slate-900">Usuário Comum</option>
                      <option value="admin" className="bg-slate-900">Administrador</option>
                    </select>
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  </div>
                </div>
                <div className="space-y-1.5">
                   <label className="block text-xs font-semibold text-amber-500 flex items-center gap-1"> <Lock className="w-3 h-3" /> Senha Inicial</label>
                   <input 
                    disabled
                    value={newUserPassword}
                    className="w-full px-4 py-3.5 bg-slate-800 border border-slate-700/40 rounded-xl text-slate-400 font-mono text-xs cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400">
                  Perfil de permissão
                </label>
                <div className="relative">
                  <select
                    value={newUserRole === 'admin' ? 'admin' : newUserAccessProfile}
                    disabled={newUserRole === 'admin'}
                    onChange={e => setNewUserAccessProfile(e.target.value as AccessProfileId)}
                    className="premium-input pl-11 pr-10 appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {TEST_PROFILES.map(profile => (
                      <option key={profile.id} value={profile.id} className="bg-slate-900">
                        {profile.label}
                      </option>
                    ))}
                  </select>
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                </div>
                <p className="text-[11px] text-slate-500">
                  O perfil define os módulos e ações. Os acessos abaixo definem onde ele poderá atuar.
                </p>
              </div>

              {/* Location selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400">Acessos iniciais autorizados</label>
                <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {locations.filter(loc => loc.type !== 'allowance').map(loc => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => toggleLocationSelection(loc.id)}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left group cursor-pointer",
                        selectedLocations.includes(loc.id) 
                          ? "bg-blue-600/10 border-blue-500/50 text-blue-400 font-bold text-sm" 
                          : "bg-slate-950 border-slate-800/80 text-slate-500 hover:border-slate-700 hover:text-slate-300 text-sm"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                        selectedLocations.includes(loc.id) ? "bg-blue-600 border-blue-600" : "border-slate-800 group-hover:border-slate-700"
                      )}>
                        {selectedLocations.includes(loc.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <MapPin className="w-4 h-4 opacity-50" />
                      <span className="truncate">{loc.name}</span>
                    </button>
                  ))}
                  {locations.length === 0 && (
                    <p className="text-xs text-slate-500 italic">Nenhum local de obra disponível.</p>
                  )}
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex gap-3 items-start">
                 <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                 <p className="text-xs text-amber-200/70 leading-relaxed font-medium">
                   O usuário será criado com a senha padrão acima e será <strong>obrigado</strong> a alterá-la no primeiro acesso por segurança.
                 </p>
              </div>

              <button 
                type="submit"
                disabled={creating}
                className="w-full btn-primary py-3.5 text-xs font-bold uppercase tracking-wider mt-2 shadow-md"
              >
                {creating ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Criar e Enviar Acesso <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {showAccessModal && (
        <AccessManager 
          user={showAccessModal} 
          locations={locations} 
          onClose={() => setShowAccessModal(null)}
          onSave={(newIds, profile) => handleUpdateUserAccess(showAccessModal, newIds, profile)}
          loading={updatingAccess}
        />
      )}
    </motion.div>
  );
}

function AccessManager({ user, locations, onClose, onSave, loading }: { 
  user: UserProfile, 
  locations: Location[], 
  onClose: () => void, 
  onSave: (ids: string[], profile: AccessProfileId) => void,
  loading: boolean
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<AccessProfileId>(
    user.role === 'admin' ? 'admin' : user.accessProfile || 'gestor_shopping',
  );
  const userEmail = user.email.toLowerCase();

  useEffect(() => {
    // Determine which locations this user already has access to
    const initialIds = locations
      .filter(loc => loc.sharedEmails?.includes(userEmail))
      .map(loc => loc.id);
    setSelectedIds(initialIds);
  }, [locations, userEmail]);

  const toggle = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[110]">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800/80 rounded-[2rem] p-6 md:p-8 w-full max-w-2xl shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-600 to-teal-600" />
        
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="bg-emerald-600/10 p-3.5 rounded-xl text-emerald-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-white">Editar permissões</h3>
            <p className="text-slate-400 text-xs font-medium truncate max-w-[280px]">{user.name || user.email}</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Perfil de permissão
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TEST_PROFILES.map((item) => {
              const active = profile === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setProfile(item.id)}
                  className={cn(
                    "p-3.5 rounded-xl border text-left transition-all",
                    active
                      ? "bg-blue-600/10 border-blue-500/50 text-blue-300"
                      : "bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-white">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    {active && <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Shoppings e locais autorizados
          </label>
          <p className="text-xs text-slate-500 mt-1">
            O perfil define o que ele pode fazer. A lista abaixo define onde ele pode atuar.
          </p>
        </div>

        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-2 custom-scrollbar mb-6">
          {locations.filter(loc => loc.type !== 'allowance').map(loc => (
            <button
              key={loc.id}
              onClick={() => toggle(loc.id)}
              className={cn(
                "w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left cursor-pointer",
                selectedIds.includes(loc.id) 
                  ? "bg-blue-600/10 border-blue-500/50 text-blue-400 font-bold text-sm" 
                  : "bg-slate-950 border-slate-800/80 text-slate-500 hover:border-slate-700 hover:text-slate-300 text-sm"
              )}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 opacity-50" />
                <span>{loc.name}</span>
              </div>
              <div className={cn(
                "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                selectedIds.includes(loc.id) ? "bg-blue-600 border-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]" : "border-slate-800"
              )}>
                {selectedIds.includes(loc.id) && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
            </button>
          ))}
          {locations.length === 0 && (
            <p className="text-center py-10 text-slate-500 italic text-xs font-medium">Nenhum local cadastrado no sistema.</p>
          )}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 btn-secondary text-xs font-bold uppercase tracking-wider py-2.5"
          >
            Cancelar
          </button>
          <button 
            onClick={() => onSave(selectedIds, profile)}
            disabled={loading}
            className="flex-1 btn-primary text-xs font-bold uppercase tracking-wider py-2.5 shadow-md"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Salvar Alterações"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
