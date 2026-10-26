// Suppress noisy Firestore idle stream disconnect logs and quota notices
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (
    args.some(
      (arg) =>
        typeof arg === 'string' &&
        (arg.includes('GrpcConnection') ||
          arg.includes('Disconnecting idle stream') ||
          arg.includes('Quota limit exceeded') ||
          arg.includes('Could not reach Cloud Firestore backend') ||
          arg.includes('Connection failed') ||
          arg.includes('unavailable'))
    )
  ) {
    return;
  }
  originalConsoleError(...args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    args.some(
      (arg) =>
        typeof arg === 'string' &&
        (arg.includes('GrpcConnection') ||
          arg.includes('Disconnecting idle stream') ||
          arg.includes('Quota limit exceeded') ||
          arg.includes('Could not reach Cloud Firestore backend') ||
          arg.includes('Connection failed') ||
          arg.includes('unavailable'))
    )
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Force long-polling to prevent Cloud Firestore 10-second backend connection timeout in proxy/iframe environments
let dbInstance: ReturnType<typeof initializeFirestore>;
try {
  dbInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId || undefined
  );
} catch {
  dbInstance = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
}

export const db = dbInstance;
export const auth = getAuth(app);

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
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection verification test as required by Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch {}
}
testConnection().catch(() => {});
