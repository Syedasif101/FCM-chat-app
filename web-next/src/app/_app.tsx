
import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { setupMessaging } from '../firebase';

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);

          // Messaging setup
          setupMessaging().then(({ token }) => {
            if (token) {
              console.log("FCM Token:", token);
            } else {
              console.warn("No FCM token received");
            }
          });

        })
        .catch(err => console.error('Service Worker registration failed:', err));
    }
  }, []);

  return <Component {...pageProps} />;
}
