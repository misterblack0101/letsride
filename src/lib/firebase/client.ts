// firebase/client.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getEnvironmentConfig } from "../env";

const config = getEnvironmentConfig();
const app = getApps().length ? getApps()[0] : initializeApp(config.firebase);

export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
