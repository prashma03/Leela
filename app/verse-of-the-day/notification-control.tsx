"use client";

import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { useEffect, useState } from "react";

const preferenceKey = "leelaDailyVerseNotifications";
const browserDeliveryKey = "leelaDailyVerseNotificationDate";
const dailyNotificationId = 2401;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function showBrowserVerseNotification() {
  if (!("serviceWorker" in navigator) || Notification.permission !== "granted") return;
  if (window.localStorage.getItem(browserDeliveryKey) === todayKey()) return;
  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification("Leela · Verse of the Day", {
    body: "A gentle Gita reflection is ready for you.",
    icon: "/icons/leela-192.png",
    badge: "/icons/leela-192.png",
    tag: "leela-daily-verse",
  });
  window.localStorage.setItem(browserDeliveryKey, todayKey());
}

export default function NotificationControl() {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(preferenceKey) === "true";
    setEnabled(saved);
    if (saved && !Capacitor.isNativePlatform()) showBrowserVerseNotification().catch(() => {});
  }, []);

  async function enableNotifications() {
    if (busy) return;
    setBusy(true);
    setStatus("");
    try {
      if (Capacitor.isNativePlatform()) {
        const permission = await LocalNotifications.requestPermissions();
        if (permission.display !== "granted") throw new Error("Notifications were not allowed. You can enable them later in your phone settings.");
        await LocalNotifications.cancel({ notifications: [{ id: dailyNotificationId }] });
        await LocalNotifications.schedule({
          notifications: [{
            id: dailyNotificationId,
            title: "Leela · Verse of the Day",
            body: "A gentle Gita reflection is ready for you.",
            schedule: { on: { hour: 9, minute: 0 }, repeats: true, allowWhileIdle: true },
          }],
        });
        setStatus("Daily verse reminders are on for around 9:00 AM.");
      } else {
        if (!("Notification" in window)) throw new Error("Notifications are not supported in this browser.");
        const permission = await Notification.requestPermission();
        if (permission !== "granted") throw new Error("Notifications were not allowed. You can change this in your browser settings.");
        await showBrowserVerseNotification();
        setStatus("Verse notifications are on. Keep Leela installed or allow browser notifications.");
      }
      window.localStorage.setItem(preferenceKey, "true");
      setEnabled(true);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Notifications could not be enabled.");
    } finally {
      setBusy(false);
    }
  }

  async function disableNotifications() {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.cancel({ notifications: [{ id: dailyNotificationId }] }).catch(() => {});
    }
    window.localStorage.removeItem(preferenceKey);
    setEnabled(false);
    setStatus("Daily verse reminders are off.");
  }

  return <section className="verse-notifications" aria-labelledby="verse-notification-title">
    <span aria-hidden="true">◉</span>
    <div>
      <b id="verse-notification-title">Daily verse reminder</b>
      <p>Allow Leela to gently remind you when a new verse is ready.</p>
      {status && <small role="status">{status}</small>}
    </div>
    {enabled
      ? <button type="button" onClick={disableNotifications}>Turn off</button>
      : <button type="button" onClick={enableNotifications} disabled={busy}>{busy ? "Asking…" : "Allow notifications"}</button>}
  </section>;
}
