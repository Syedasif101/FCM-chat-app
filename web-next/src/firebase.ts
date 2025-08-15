import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export async function setupMessaging(): Promise<{messaging: Messaging | null, token: string | null}> {
  const supported = await isSupported().catch(() => false);
  if (!supported) return { messaging: null, token: null };

  const messaging = getMessaging(app);
  try {
    const status = await Notification.requestPermission();
    if (status !== "granted") {
      console.warn("Notification permission not granted:", status);
      return { messaging, token: null };
    }
    const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
    if (!vapidKey) {
      console.warn("Missing NEXT_PUBLIC_FCM_VAPID_KEY");
      return { messaging, token: null };
    }
    const token = await getToken(messaging, { vapidKey });
    console.log("Web FCM token:", token);
    return { messaging, token };
  } catch (e) {
    console.error("Error getting FCM token", e);
    return { messaging, token: null };
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  isSupported().then((yes) => {
    if (!yes) return;
    const messaging = getMessaging(app);
    onMessage(messaging, callback);
  });
}
