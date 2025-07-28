// firebase/admin.ts
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getEnvironmentConfig } from '../env';

const config = getEnvironmentConfig();

let app: App;

if (!getApps().length) {
    app = initializeApp({
        credential: cert({
            projectId: 'letsridecycles',
            clientEmail: config.firebase.clientEmail!,
            privateKey: config.firebase.privateKey!,
        }),
    });
} else {
    app = getApps()[0];
}

export const adminDb = getFirestore(app);
