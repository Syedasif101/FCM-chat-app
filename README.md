<<<<<<< HEAD
# FCM-chat-app
A simple web chat application with Firebase Cloud Messaging (FCM) integration. Supports foreground and background notifications.
=======
# FCM Push Notification Integration (Web + Mobile)

This starter includes:
- **Web** (Next.js + TypeScript): FCM Web push (token + foreground handler + background SW)
- **Mobile** (React Native via **Expo + config plugins**): FCM push on Android with background handler

> Focus: Android. iOS requires APNs setup which is not included here.

## Quick Start

### 1) Firebase Console
- You said Firebase is already set up. Ensure you have:
  - **Android app** added with package `com.example.fcmchat` (or change in `app.json` and `google-services.json`).
  - Download `google-services.json` and replace the placeholder at `mobile-expo/android/app/google-services.json`.
  - **Web app** added and copy config + **VAPID key** (Web Push certificates).

### 2) Web (Next.js)
```
cd web-next
cp .env.local.example .env.local   # fill values from Firebase web config + VAPID
# Edit public/firebase-messaging-sw.js and set your messagingSenderId
npm i
npm run dev
```
- Open the app, allow notifications. The **FCM token** prints in console and on screen.
- Use **Firebase Console > Cloud Messaging** to send a **Notification** message to that token.
  - Foreground: you will see a toast + payload in UI.
  - Background/Closed: service worker displays a system notification.

### 3) Mobile (Expo + RNFirebase, Android)
```
cd mobile-expo
# Put your google-services.json in android/app (already present as placeholder)
npm i
npm run prebuild    # generates native Android project with config plugins
npm run android     # or: expo run:android
```
- The app prints/logs the **FCM token** (also shown in UI).
- In Firebase Console, send a **Notification** message to this token.
  - **Foreground:** in-app Toast (Android) / Alert (iOS).
  - **Background/Closed:** Android shows native push automatically for notification messages.

### 4) Simulated Chat + Rate Limit
Both clients include a minimal chat UI. The **Send** button only simulates sending.
Optional **rate limit**: max 3 messages per minute in UI.

## Notes

- **Foreground handling:** We show a toast/alert and capture the raw payload on screen.
- **Background/closed:** For Android, **notification** messages (not data-only) show system notifications automatically.
- **Data-only messages:** If you plan to use data-only payloads, add a local notification library (e.g., Notifee) inside the background handler.
- **iOS:** You’ll need APNs certs, capabilities, and `@react-native-firebase/messaging` iOS setup if you want to support iOS.
- **Service Worker:** Make sure `/firebase-messaging-sw.js` is served at the root. Next.js serves files from `/public` at the root.

## Debugging

- Web:
  - Check the **browser console** for token errors.
  - Ensure **VAPID key** is set and the **service worker** registers.
- Mobile:
  - `adb logcat` for Android logs.
  - If notifications don’t show in background, verify you’re sending **notification** messages (not data-only).

## Security

- Do not commit secrets. Keep `.env.local` private.
- You can add server logic later to map **userId -> device tokens** and trigger cloud functions to send FCM messages.

Good luck!
>>>>>>> d382d34 (Initial commit: FCM Chat Web project with README and .gitignore)
