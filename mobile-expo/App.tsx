import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, FlatList, PermissionsAndroid, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, ToastAndroid, View } from "react-native";
import messaging, { FirebaseMessagingTypes } from "@react-native-firebase/messaging";

type Msg = { id: string; from: "me" | "them"; text: string; ts: number };

export default function App() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<any>(null);
  const [countInWindow, setCountInWindow] = useState(0);
  const tRef = useRef<NodeJS.Timeout | null>(null);

  // Request notifications permission (Android 13+) and FCM token
  useEffect(() => {
    (async () => {
      if (Platform.OS === "android") {
        const res = await PermissionsAndroid.request("android.permission.POST_NOTIFICATIONS");
        if (res !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Notification permission denied");
        }
      }
      // iOS would use messaging().requestPermission(), but focusing on Android here.
      try {
        // Ensure auto-init enabled
        await messaging().setAutoInitEnabled(true);
        const fcmToken = await messaging().getToken();
        console.log("Mobile FCM token:", fcmToken);
        setToken(fcmToken);
      } catch (e) {
        console.log("Failed to get FCM token", e);
      }

      // Foreground message listener
      const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        setLastPayload(remoteMessage);
        const title = remoteMessage.notification?.title || "New message";
        const body = remoteMessage.notification?.body || "You have a new message.";
        if (Platform.OS === "android") {
          ToastAndroid.show(`${title}: ${body}`, ToastAndroid.SHORT);
        } else {
          Alert.alert(title, body);
        }
      });

      // App opened from quit/background by tapping notification
      const unsubscribeOpened = messaging().onNotificationOpenedApp(remoteMessage => {
        setLastPayload(remoteMessage);
      });
      messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage) setLastPayload(remoteMessage);
      });

      return () => {
        unsubscribe();
        unsubscribeOpened();
      };
    })();
  }, []);

  // Optional rate limiting: 3 messages per 60s
  const canSend = useMemo(() => countInWindow < 3, [countInWindow]);
  const send = () => {
    if (!input.trim()) return;
    if (!canSend) {
      Platform.OS === "android"
        ? ToastAndroid.show("Rate limit reached", ToastAndroid.SHORT)
        : Alert.alert("Rate limit", "Max 3 messages per minute");
      return;
    }
    const now = Date.now();
    setMessages((m) => [...m, { id: String(now), from: "me", text: input.trim(), ts: now }]);
    setInput("");

    setCountInWindow((c) => c + 1);
    if (!tRef.current) {
      // @ts-ignore - setTimeout returns number in RN
      tRef.current = setTimeout(() => {
        setCountInWindow(0);
        // @ts-ignore
        clearTimeout(tRef.current);
        tRef.current = null;
      }, 60_000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <Text style={styles.h1}>FCM Chat (Mobile)</Text>
      <Text style={styles.label}>FCM Token:</Text>
      <Text selectable style={styles.code}>{token ?? "Permission denied or failed"}</Text>

      <View style={styles.chat}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.from === "me" ? styles.right : styles.left]}>
              <Text>{item.text}</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message…"
        />
        <Button title="Send" onPress={send} />
      </View>

      <View style={styles.debug}>
        <Text style={styles.label}>Last Notification Payload:</Text>
        <Text style={styles.code}>{JSON.stringify(lastPayload, null, 2)}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  h1: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  label: { fontWeight: "600", marginTop: 8 },
  code: { fontFamily: Platform.select({ ios: "Courier", android: "monospace" }), backgroundColor: "#f4f4f4", padding: 8, borderRadius: 8 },
  chat: { flex: 1, borderWidth: 1, borderColor: "#eee", borderRadius: 12, padding: 8, marginVertical: 8 },
  bubble: { padding: 8, borderRadius: 10, marginVertical: 4, maxWidth: "80%" },
  left: { alignSelf: "flex-start", backgroundColor: "#f1f1f1" },
  right: { alignSelf: "flex-end", backgroundColor: "#DCF8C6" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10 },
  debug: { marginTop: 12 }
});
