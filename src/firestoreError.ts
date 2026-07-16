import { auth } from './firebase-compat';
import { toast } from 'sonner';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

let lastQuotaToastTime = 0;

export function handleFirestoreError(error: any, operationType: OperationType, path: string | null): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isPermissionDenied = error?.code === 'permission-denied' || errorMessage.includes('permission-denied');
  
  const isQuotaExceeded = 
    error?.code === 'resource-exhausted' || 
    error?.code === 'quota-exceeded' ||
    errorMessage.includes('resource-exhausted') || 
    errorMessage.includes('Quota limit exceeded') ||
    errorMessage.includes('quota');

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  
  console.error('Firestore Error:', errInfo);
  
  if (isQuotaExceeded) {
    const now = Date.now();
    // Throttle the warning toast to once every 45 seconds to avoid spamming the user
    if (now - lastQuotaToastTime > 45000) {
      lastQuotaToastTime = now;
      toast.error(
        'Limite diário de uso gratuito do banco de dados (Firebase Spark Plan) foi atingido. As operações de gravação e leitura estão temporariamente suspensas pelo Google Firebase. A cota será reiniciada automaticamente em breve ou ao ativar o faturamento do projeto.',
        {
          duration: 12000,
          id: 'quota-exceeded-toast',
        }
      );
    }
    return;
  }

  if (isPermissionDenied) {
    toast.error('Acesso negado. Você não tem permissão para esta operação.');
  } else {
    toast.error(`Erro no banco de dados (${operationType}): ${errorMessage}`);
  }
}

