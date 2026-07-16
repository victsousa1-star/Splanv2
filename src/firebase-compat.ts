import { supabase } from "./supabase";
import { toast } from "sonner";

// ==========================================
// TYPES & MOCKS COEXISTENCE ENGINE
// ==========================================

export const auth = {
  currentUser: null as any,
};

export const adminAuth = {
  currentUser: null as any,
};

export const db = {
  type: "supabase-compat-db",
};

export const storage = {
  type: "supabase-compat-storage",
};

// --- In-memory/LocalStorage Database Sync ---
let localDbState: Record<string, Record<string, any>> = {};

function loadLocalDb() {
  try {
    const saved = localStorage.getItem("splan_local_db");
    if (saved) {
      localDbState = JSON.parse(saved);
    }
  } catch (err) {
    console.error("Failed to load local DB state:", err);
  }
}

function saveLocalDb() {
  try {
    localStorage.setItem("splan_local_db", JSON.stringify(localDbState));
  } catch (err) {
    console.error("Failed to save local DB state:", err);
  }
}

loadLocalDb();

function isMissingTableError(error: any): boolean {
  return !!(
    error &&
    (error.code === "42P01" ||
      error.message?.includes("relation") ||
      error.message?.includes("does not exist") ||
      error.message?.includes("splan_data"))
  );
}

function isMissingColumnError(error: any): boolean {
  return !!(
    error &&
    (error.code === "PGRST204" ||
      error.message?.includes("column") ||
      error.message?.includes("schema cache"))
  );
}

function getDocumentIdFromSupabaseRow(collectionName: string, row: any): string {
  if (row.doc_id) return row.doc_id;
  if (row.data?.id) return row.data.id;
  if (typeof row.id === "string" && row.id.startsWith(`${collectionName}_`)) {
    return row.id.slice(collectionName.length + 1);
  }
  return row.id;
}

function toEmailList(data: any): string[] {
  const fromArray = Array.isArray(data?.sharedEmails) ? data.sharedEmails : [];
  const fromMap =
    data?.sharedWith && typeof data.sharedWith === "object"
      ? Object.keys(data.sharedWith)
      : [];
  return Array.from(new Set([...fromArray, ...fromMap].map((email) => String(email).toLowerCase())));
}

function getRecordOwnerId(collectionName: string, docId: string, data: any): string | null {
  if (typeof data?.ownerId === "string" && data.ownerId) return data.ownerId;
  if (collectionName === "users" || collectionName === "admins") return docId;
  return auth.currentUser?.uid || null;
}

function buildSupabasePayload(collectionName: string, docId: string, data: any) {
  return {
    id: `${collectionName}_${docId}`,
    doc_id: docId,
    collection: collectionName,
    owner_id: getRecordOwnerId(collectionName, docId, data),
    shared_emails: toEmailList(data),
    data,
    updated_at: new Date().toISOString(),
  };
}

function matchesQueryConstraint(item: any, constraint: any): boolean {
  if (!constraint) return true;

  if (constraint.type === "or") {
    return (constraint.conditions || []).some((condition: any) =>
      matchesQueryConstraint(item, condition),
    );
  }

  if (constraint.type !== "where") return true;

  const { field, op, value } = constraint;
  const itemVal = item[field];
  if (op === "==") return itemVal === value;
  if (op === "!=") return itemVal !== value;
  if (op === ">") return itemVal > value;
  if (op === ">=") return itemVal >= value;
  if (op === "<") return itemVal < value;
  if (op === "<=") return itemVal <= value;
  if (op === "in") return Array.isArray(value) && value.includes(itemVal);
  if (op === "array-contains") return Array.isArray(itemVal) && itemVal.includes(value);
  return true;
}

function applyQueryConstraints(items: any[], constraints?: any[]): any[] {
  if (!constraints) return items;
  let filtered = [...items];
  constraints.forEach((constraint: any) => {
    if (constraint.type === "where" || constraint.type === "or") {
      filtered = filtered.filter((item) => matchesQueryConstraint(item, constraint));
    }
  });

  const orderConstraint = constraints.find((constraint: any) => constraint.type === "orderBy");
  if (orderConstraint) {
    const direction = orderConstraint.direction === "desc" ? -1 : 1;
    filtered.sort((a, b) => {
      const left = a[orderConstraint.field];
      const right = b[orderConstraint.field];
      if (left === right) return 0;
      if (left === undefined || left === null) return 1;
      if (right === undefined || right === null) return -1;
      return left > right ? direction : -direction;
    });
  }

  return filtered;
}

// Active listener callbacks for live updates
const listeners: Record<string, Array<{
  callback: (snapshot: any) => void;
  isDoc: boolean;
  docId?: string;
  constraints?: any[];
}>> = {};

function triggerListeners(collectionName: string) {
  const list = listeners[collectionName];
  if (!list) return;

  list.forEach(({ callback, isDoc, docId, constraints }) => {
    try {
      if (isDoc && docId) {
        const item = localDbState[collectionName]?.[docId];
        callback({
          id: docId,
          exists: () => !!item,
          data: () => item || null,
        });
      } else {
        let items = getDocsFromLocalOrCache(collectionName);
        if (constraints) {
          items = applyQueryConstraints(items, constraints);
        }
        callback({
          docs: items.map((d) => ({
            id: d.id,
            exists: () => true,
            data: () => d,
          })),
          empty: items.length === 0,
          size: items.length,
          forEach: (cb: (doc: any) => void) => {
            items.forEach((d) => cb({ id: d.id, exists: () => true, data: () => d }));
          },
        });
      }
    } catch (e) {
      console.error("Error in listener callback for collection:", collectionName, e);
    }
  });
}

// ==========================================
// SUPABASE CONNECTIVITY STATUS TRACKER
// ==========================================

export let supabaseStatus: {
  connected: boolean;
  error: string | null;
  tableMissing: boolean;
} = {
  connected: !!supabase,
  error: null,
  tableMissing: false,
};

let statusListeners: Array<(status: typeof supabaseStatus) => void> = [];

export function onSupabaseStatusChange(cb: (status: typeof supabaseStatus) => void) {
  statusListeners.push(cb);
  cb(supabaseStatus);
  return () => {
    statusListeners = statusListeners.filter((l) => l !== cb);
  };
}

function updateStatus(newStatus: Partial<typeof supabaseStatus>) {
  supabaseStatus = { ...supabaseStatus, ...newStatus };
  statusListeners.forEach((cb) => {
    try {
      cb(supabaseStatus);
    } catch (e) {
      console.error("Error in status listener callback:", e);
    }
  });
}

function getDocsFromLocalOrCache(collectionName: string): any[] {
  const col = localDbState[collectionName] || {};
  return Object.values(col);
}

// Sync with Supabase if online/keys provided
async function syncFromSupabase(collectionName: string) {
  if (!supabase) {
    updateStatus({ connected: false, error: "Chaves do Supabase não configuradas", tableMissing: false });
    return;
  }
  try {
    const { data, error } = await supabase
      .from("splan_data")
      .select("*")
      .eq("collection", collectionName);

    if (error) {
      const isMissingTable = isMissingTableError(error);
      
      if (isMissingTable) {
        updateStatus({ connected: true, error: "Tabela splan_data não encontrada no Supabase", tableMissing: true });
        console.warn(`Supabase table "splan_data" not found. Falling back to local storage.`);
      } else {
        updateStatus({ connected: false, error: error.message, tableMissing: false });
        console.warn("Supabase select warning:", error.message);
      }
      return;
    }

    updateStatus({ connected: true, error: null, tableMissing: false });

    if (data) {
      if (!localDbState[collectionName]) {
        localDbState[collectionName] = {};
      }
      data.forEach((row: any) => {
        const docId = getDocumentIdFromSupabaseRow(collectionName, row);
        localDbState[collectionName][docId] = { ...(row.data || {}), id: docId };
      });
      saveLocalDb();
      triggerListeners(collectionName);
    }
  } catch (err: any) {
    updateStatus({ connected: false, error: err?.message || String(err), tableMissing: false });
    console.warn("Error syncing from Supabase:", err);
  }
}

async function writeToSupabase(collectionName: string, docId: string, data: any) {
  if (!supabase) return;
  try {
    const payload = buildSupabasePayload(collectionName, docId, data);
    let { error } = await supabase
      .from("splan_data")
      .upsert(payload);

    if (isMissingColumnError(error)) {
      const retry = await supabase.from("splan_data").upsert({
        id: `${collectionName}_${docId}`,
        collection: collectionName,
        data,
        updated_at: payload.updated_at,
      });
      error = retry.error;
    }

    if (error) {
      const isMissingTable = isMissingTableError(error);
                             
      if (isMissingTable) {
        updateStatus({ connected: true, error: "Tabela splan_data não encontrada no Supabase", tableMissing: true });
        console.warn(`Supabase table "splan_data" doesn't exist. Using local storage mode.`);
      } else {
        updateStatus({ connected: false, error: error.message, tableMissing: false });
        console.warn("Supabase upsert warning:", error.message);
      }
    } else {
      updateStatus({ connected: true, error: null, tableMissing: false });
    }
  } catch (err: any) {
    console.warn("Error writing to Supabase:", err);
  }
}

async function deleteFromSupabase(collectionName: string, docId: string) {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from("splan_data")
      .delete()
      .eq("id", `${collectionName}_${docId}`);

    if (error) {
      const isMissingTable = isMissingTableError(error);
                             
      if (isMissingTable) {
        updateStatus({ connected: true, error: "Tabela splan_data não encontrada no Supabase", tableMissing: true });
      } else {
        console.warn("Supabase delete warning:", error.message);
      }
    }
  } catch (err: any) {
    console.warn("Error deleting from Supabase:", err);
  }
}


// ==========================================
// AUTH ENGINE EMULATION
// ==========================================

// Mock session persistent store
let mockUsersList: any[] = [];
try {
  const savedUsers = localStorage.getItem("splan_mock_users");
  if (savedUsers) {
    mockUsersList = JSON.parse(savedUsers);
  }
} catch (e) {}

let authListeners: Array<(user: any) => void> = [];

function notifyAuthListeners() {
  authListeners.forEach((cb) => cb(auth.currentUser));
}

// Attempt to load Supabase auth session if available
if (supabase) {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      const fbUser = {
        uid: session.user.id,
        email: session.user.email,
        displayName: session.user.user_metadata?.name || session.user.email?.split("@")[0],
        emailVerified: true,
        providerData: [],
      };
      auth.currentUser = fbUser;
      adminAuth.currentUser = fbUser;
      notifyAuthListeners();
    }
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      const fbUser = {
        uid: session.user.id,
        email: session.user.email,
        displayName: session.user.user_metadata?.name || session.user.email?.split("@")[0],
        emailVerified: true,
        providerData: [],
      };
      auth.currentUser = fbUser;
      adminAuth.currentUser = fbUser;
    } else {
      auth.currentUser = null;
      adminAuth.currentUser = null;
    }
    notifyAuthListeners();
  });
} else {
  // Local persistence for mock user
  try {
    const savedSession = localStorage.getItem("splan_mock_session");
    if (savedSession) {
      auth.currentUser = JSON.parse(savedSession);
      adminAuth.currentUser = auth.currentUser;
    }
  } catch (e) {}
}

export async function signInWithEmailAndPassword(authInstance: any, email: string, pass: string) {
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    const fbUser = {
      uid: data.user!.id,
      email: data.user!.email,
      displayName: data.user!.user_metadata?.name || data.user!.email?.split("@")[0],
      emailVerified: true,
      providerData: [],
    };
    auth.currentUser = fbUser;
    adminAuth.currentUser = fbUser;
    notifyAuthListeners();
    return { user: fbUser };
  } else {
    // Local check
    const matched = mockUsersList.find((u) => u.email === email && u.password === pass);
    if (!matched) {
      // Auto-create user if they are logging in for the first time with standard password for easier testing
      if (email === "vict.sousa1@gmail.com" || email.includes("@")) {
        const newUser = {
          uid: Math.random().toString(36).substring(2, 11),
          email,
          displayName: email.split("@")[0],
          emailVerified: true,
          providerData: [],
        };
        mockUsersList.push({ email, password: pass, user: newUser });
        localStorage.setItem("splan_mock_users", JSON.stringify(mockUsersList));
        auth.currentUser = newUser;
        adminAuth.currentUser = newUser;
        localStorage.setItem("splan_mock_session", JSON.stringify(newUser));
        notifyAuthListeners();
        return { user: newUser };
      }
      throw new Error("auth/invalid-credential");
    }
    auth.currentUser = matched.user;
    adminAuth.currentUser = matched.user;
    localStorage.setItem("splan_mock_session", JSON.stringify(matched.user));
    notifyAuthListeners();
    return { user: matched.user };
  }
}

export async function createUserWithEmailAndPassword(authInstance: any, email: string, pass: string) {
  if (supabase) {
    let result;
    try {
      result = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { name: email.split("@")[0] } },
      });
    } catch (err: any) {
      const errMsg = err?.message || "";
      if (errMsg.toLowerCase().includes("rate limit") || errMsg.toLowerCase().includes("limit exceeded")) {
        throw new Error("Limite de taxa de email do Supabase excedido. Para resolver isso, vá em Project Settings -> Auth -> Rate Limits no seu painel do Supabase e aumente o limite ou remova-o.");
      }
      throw err;
    }

    const { data, error } = result;
    if (error) {
      const errMsg = error.message || "";
      if (errMsg.toLowerCase().includes("rate limit") || errMsg.toLowerCase().includes("limit exceeded")) {
        throw new Error("Limite de taxa de email do Supabase excedido. Vá no painel do Supabase -> Project Settings -> Auth -> role até a seção 'Rate Limits' e aumente o limite de envios (ou desative o limite temporariamente).");
      }
      throw error;
    }
    if (!data.user) {
      throw new Error("Não foi possível criar o usuário. Este e-mail já pode estar cadastrado no Supabase. Tente fazer login usando a aba 'Entrar' ou desative a opção 'Confirm email' nas configurações do Supabase.");
    }
    if (data.user && !data.session) {
      throw new Error("Conta criada! Mas precisa ser confirmada por e-mail. Verifique sua caixa de entrada ou desative a opção 'Confirm email' no painel do Supabase para entrar imediatamente.");
    }
    const fbUser = {
      uid: data.user.id,
      email: data.user.email,
      displayName: data.user.user_metadata?.name || data.user.email?.split("@")[0],
      emailVerified: true,
      providerData: [],
    };
    auth.currentUser = fbUser;
    adminAuth.currentUser = fbUser;
    notifyAuthListeners();
    return { user: fbUser };
  } else {
    // Local sign up
    const exists = mockUsersList.find((u) => u.email === email);
    if (exists) {
      throw { code: "auth/email-already-in-use", message: "E-mail já cadastrado" };
    }
    const newUser = {
      uid: Math.random().toString(36).substring(2, 11),
      email,
      displayName: email.split("@")[0],
      emailVerified: true,
      providerData: [],
    };
    mockUsersList.push({ email, password: pass, user: newUser });
    localStorage.setItem("splan_mock_users", JSON.stringify(mockUsersList));
    auth.currentUser = newUser;
    adminAuth.currentUser = newUser;
    localStorage.setItem("splan_mock_session", JSON.stringify(newUser));
    notifyAuthListeners();
    return { user: newUser };
  }
}

export async function signOut(authInstance: any) {
  if (supabase) {
    await supabase.auth.signOut();
  }
  auth.currentUser = null;
  adminAuth.currentUser = null;
  localStorage.removeItem("splan_mock_session");
  notifyAuthListeners();
}

export function onAuthStateChanged(authInstance: any, callback: (user: any) => void) {
  authListeners.push(callback);
  // Immediate invocation
  callback(auth.currentUser);
  return () => {
    authListeners = authListeners.filter((l) => l !== callback);
  };
}

export async function sendPasswordResetEmail(authInstance: any, email: string) {
  if (supabase) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
  } else {
    console.log(`Password reset email mocked for ${email}`);
  }
}

export async function updatePassword(userInstance: any, newPassword: string) {
  if (supabase) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  } else {
    console.log(`Password updated mock for current user.`);
  }
}


export function serverTimestamp() {
  return new Date().toISOString();
}

// ==========================================
// FIRESTORE EMULATION (db)
// ==========================================

export function collection(dbInstance: any, collectionName: string) {
  return { type: "collection", name: collectionName };
}

export function doc(parent: any, ...paths: string[]) {
  if (parent.type === "collection") {
    return { type: "doc", collection: parent.name, id: paths[0] };
  }
  // If parent is DB instance,paths contain [collectionName, docId]
  return { type: "doc", collection: paths[0], id: paths[1] };
}

export function query(colRef: any, ...constraints: any[]) {
  return { type: "query", collection: colRef.name, constraints };
}

export function where(field: string, op: string, value: any) {
  return { type: "where", field, op, value };
}

export function or(...conditions: any[]) {
  return { type: "or", conditions };
}

export function orderBy(field: string, direction: "asc" | "desc" = "asc") {
  return { type: "orderBy", field, direction };
}

export async function getDoc(docRef: any) {
  const colName = docRef.collection;
  const docId = docRef.id;

  // Attempt sync
  if (supabase) {
    await syncFromSupabase(colName);
  }

  const item = localDbState[colName]?.[docId];
  return {
    id: docId,
    exists: () => !!item,
    data: () => item || null,
  };
}

export async function getDocs(queryOrCol: any) {
  const colName = queryOrCol.collection;
  if (supabase) {
    await syncFromSupabase(colName);
  }

  let items = getDocsFromLocalOrCache(colName);

  if (queryOrCol.type === "query" && queryOrCol.constraints) {
    items = applyQueryConstraints(items, queryOrCol.constraints);
  }

  return {
    docs: items.map((item) => ({
      id: item.id,
      exists: () => true,
      data: () => item,
    })),
    empty: items.length === 0,
    size: items.length,
    forEach: (cb: (doc: any) => void) => {
      items.forEach((item) => cb({ id: item.id, exists: () => true, data: () => item }));
    },
  };
}

export async function addDoc(colRef: any, data: any) {
  const colName = colRef.name;
  const id = Math.random().toString(36).substring(2, 11);
  const dataWithId = { ...data, id };

  if (!localDbState[colName]) {
    localDbState[colName] = {};
  }
  localDbState[colName][id] = dataWithId;
  saveLocalDb();

  // Async push to Supabase
  await writeToSupabase(colName, id, dataWithId);
  triggerListeners(colName);

  return { id, path: `${colName}/${id}` };
}

export async function setDoc(docRef: any, data: any) {
  const colName = docRef.collection;
  const id = docRef.id;
  const dataWithId = { ...data, id };

  if (!localDbState[colName]) {
    localDbState[colName] = {};
  }
  localDbState[colName][id] = dataWithId;
  saveLocalDb();

  // Async push to Supabase
  await writeToSupabase(colName, id, dataWithId);
  triggerListeners(colName);
}

export async function updateDoc(docRef: any, data: any) {
  const colName = docRef.collection;
  const id = docRef.id;

  if (!localDbState[colName]) {
    localDbState[colName] = {};
  }
  const existing = localDbState[colName][id] || {};
  const updated = { ...existing, ...data, id };
  localDbState[colName][id] = updated;
  saveLocalDb();

  // Async push to Supabase
  await writeToSupabase(colName, id, updated);
  triggerListeners(colName);
}

export async function deleteDoc(docRef: any) {
  const colName = docRef.collection;
  const id = docRef.id;

  if (localDbState[colName]) {
    delete localDbState[colName][id];
    saveLocalDb();
  }

  // Async delete from Supabase
  await deleteFromSupabase(colName, id);
  triggerListeners(colName);
}

export function onSnapshot(
  queryOrCol: any,
  onNext: (snapshot: any) => void,
  onError?: (error: any) => void
) {
  const colName = queryOrCol.collection || queryOrCol.name;
  const isDoc = queryOrCol.type === "doc";
  const docId = isDoc ? queryOrCol.id : undefined;
  const constraints = queryOrCol.type === "query" ? queryOrCol.constraints : undefined;

  if (!listeners[colName]) {
    listeners[colName] = [];
  }

  const listenerObj = {
    callback: onNext,
    isDoc,
    docId,
    constraints,
  };
  listeners[colName].push(listenerObj);

  // Initial push
  if (isDoc && docId) {
    const item = localDbState[colName]?.[docId];
    onNext({
      id: docId,
      exists: () => !!item,
      data: () => item || null,
    });
  } else {
    let items = getDocsFromLocalOrCache(colName);
    if (constraints) {
      items = applyQueryConstraints(items, constraints);
    }
    onNext({
      docs: items.map((d) => ({
        id: d.id,
        exists: () => true,
        data: () => d,
      })),
      empty: items.length === 0,
      size: items.length,
      forEach: (cb: (doc: any) => void) => {
        items.forEach((d) => cb({ id: d.id, exists: () => true, data: () => d }));
      },
    });
  }

  // Fetch from Supabase once
  syncFromSupabase(colName).catch((err) => {
    if (onError) onError(err);
  });

  // Return unsubscribe function
  return () => {
    listeners[colName] = listeners[colName].filter((l) => l !== listenerObj);
  };
}

export function writeBatch(dbInstance: any) {
  const ops: Array<() => Promise<void>> = [];
  return {
    set: (docRef: any, data: any) => {
      ops.push(() => setDoc(docRef, data));
    },
    update: (docRef: any, data: any) => {
      ops.push(() => updateDoc(docRef, data));
    },
    delete: (docRef: any) => {
      ops.push(() => deleteDoc(docRef));
    },
    commit: async () => {
      for (const op of ops) {
        await op();
      }
    },
  };
}


// ==========================================
// STORAGE EMULATION (storage)
// ==========================================

export function ref(storageInstance: any, path: string) {
  return { type: "storage-ref", path };
}

export async function uploadBytes(refInstance: any, fileOrBlob: Blob | Uint8Array): Promise<{ ref: any }> {
  const path = refInstance.path;

  if (supabase) {
    const { error } = await supabase.storage
      .from("rdo-fotos")
      .upload(path, fileOrBlob, { contentType: "image/webp", upsert: true });

    if (error) throw error;
    return { ref: refInstance };
  } else {
    // Offline base64 storage fallback
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const base64data = reader.result as string;
          // Save mock file in local storage
          localStorage.setItem(`splan_storage_file_${path}`, base64data);
          resolve({ ref: refInstance });
        } catch (e) {
          reject(new Error("Storage limit exceeded in mock fallback. Provide VITE_SUPABASE_URL and key to use cloud storage."));
        }
      };
      reader.onerror = () => reject(new Error("FileReader failed"));
      if (fileOrBlob instanceof Blob) {
        reader.readAsDataURL(fileOrBlob);
      } else {
        const blob = new Blob([fileOrBlob], { type: "image/webp" });
        reader.readAsDataURL(blob);
      }
    });
  }
}

export async function getDownloadURL(refInstance: any) {
  const path = refInstance.path;

  if (supabase) {
    const { data } = supabase.storage.from("rdo-fotos").getPublicUrl(path);
    return data.publicUrl;
  } else {
    const saved = localStorage.getItem(`splan_storage_file_${path}`);
    if (saved) return saved;
    // Fallback placeholder image if not found locally
    return `https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600`;
  }
}

export async function deleteObject(refInstance: any) {
  const path = refInstance.path;

  if (supabase) {
    const { error } = await supabase.storage.from("rdo-fotos").remove([path]);
    if (error) throw error;
  } else {
    localStorage.removeItem(`splan_storage_file_${path}`);
  }
}
