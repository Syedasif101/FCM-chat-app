"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { setupMessaging, onForegroundMessage } from "@/firebase";

type Msg = { id: string; from: "me" | "them"; text: string; ts: number };

export default function Page() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<any>(null);
  const [countInWindow, setCountInWindow] = useState(0);
  const tRef = useRef<NodeJS.Timeout | null>(null);

  // Setup FCM web
  useEffect(() => {
    (async () => {
      const { token } = await setupMessaging();
      setToken(token);
      onForegroundMessage((payload) => {
        setLastPayload(payload);
        // Simple toast/banner
        const el = document.getElementById("toast");
        if (el) {
          el.textContent = payload?.notification?.title ?? "New message";
          el.classList.add("show");
          setTimeout(() => el.classList.remove("show"), 2000);
        }
      });
      // Register service worker for background notifications
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/firebase-messaging-sw.js");
          console.log("Service worker registered for FCM");
        } catch (e) {
          console.error("SW registration failed", e);
        }
      }
    })();
  }, []);

  // Optional rate limiting: max 3 messages per 60s
  const canSend = useMemo(() => countInWindow < 3, [countInWindow]);
  const send = () => {
    if (!input.trim()) return;
    if (!canSend) {
      alert("Rate limit: max 3 messages/minute");
      return;
    }
    const now = Date.now();
    setMessages((m) => [...m, { id: String(now), from: "me", text: input.trim(), ts: now }]);
    setInput("");

    setCountInWindow((c) => c + 1);
    if (!tRef.current) {
      tRef.current = setTimeout(() => {
        setCountInWindow(0);
        tRef.current && clearTimeout(tRef.current);
        tRef.current = null;
      }, 60_000);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1>FCM Chat (Web)</h1>
      <p><strong>FCM Token:</strong> <code>{token ?? "Permission not granted or not supported"}</code></p>
      <details>
        <summary>Last Notification Payload (Foreground)</summary>
        <pre>{JSON.stringify(lastPayload, null, 2)}</pre>
      </details>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, minHeight: 300 }}>
        {messages.map((m) => (
          <div key={m.id} style={{
            display: "flex",
            justifyContent: m.from === "me" ? "flex-end" : "flex-start",
            margin: "8px 0"
          }}>
            <div style={{
              background: m.from === "me" ? "#DCF8C6" : "#F1F1F1",
              padding: "8px 12px",
              borderRadius: 12
            }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
        />
        <button onClick={send} style={{ padding: "10px 16px", borderRadius: 8 }}>Send</button>
      </div>

      <div id="toast" style={{
        position: "fixed",
        left: 16,
        bottom: 16,
        background: "#333",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: 8,
        opacity: 0,
        transition: "opacity 0.2s"
      }} className="">
        Toast
      </div>
      <style>{`
        #toast.show { opacity: 1; }
      `}</style>
    </div>
  );
}
