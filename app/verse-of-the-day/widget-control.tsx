"use client";

import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";
import { openVerseWallpaperChooser, syncVerseScheduleToAndroid } from "../lib/native-verse";

export default function WidgetControl() {
  const [status, setStatus] = useState("");
  const android = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
  useEffect(() => { if (android) syncVerseScheduleToAndroid().catch(() => {}); }, [android]);
  return <section className="verse-screen-control" aria-labelledby="verse-screen-title">
    <p className="eyebrow">Home screen verse</p>
    <h2 id="verse-screen-title">Add today’s verse to your Home screen.</h2>
    <p>The Leela Android app includes a Daily Verse widget. Add it from your phone’s widget menu and it will refresh automatically from Leela’s saved verse schedule.</p>
    <ol>
      <li>Touch and hold an empty area of your Home screen.</li>
      <li>Choose <b>Widgets</b>, then find <b>Leela · Daily Verse</b>.</li>
      <li>Drag it onto your screen.</li>
    </ol>
    {android && <button type="button" onClick={async () => { try { await openVerseWallpaperChooser(); setStatus("Android opened the wallpaper chooser. Select Leela Verse, then choose where to use it."); } catch { setStatus("The wallpaper chooser could not open. Try again from your phone settings."); } }}>Set as verse wallpaper</button>}
    <small>{status || (android ? "Some Android phones also offer the wallpaper on the lock screen; that choice is made in your phone’s wallpaper screen." : "Open Leela on your Android phone to use the widget and wallpaper tools. This preview shows the setup steps so the option is easy to find.")}</small>
  </section>;
}
