// public/firebase-messaging-sw.js
importScripts(
  'https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js'
);

firebase.initializeApp({
  apiKey: 'AIzaSyD0Y2yPA1-juRrL33NqiiEVvMlKX04tpUU',
  authDomain: 'fcm-chat-project.firebaseapp.com',
  projectId: 'fcm-chat-project',
  storageBucket: 'fcm-chat-project.firebasestorage.app',
  messagingSenderId: '568108980421',
  appId: '1:568108980421:web:80ac61a3e1b037ee4f78ac',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );

  const notificationTitle =
    payload.notification?.title || 'Background Message Title';
  const notificationOptions = {
    body: payload.notification?.body || 'Background Message body.',
    icon: '/firebase-logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
