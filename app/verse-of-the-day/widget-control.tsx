"use client";

import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";
import { openVerseWallpaperChooser, syncVerseScheduleToAndroid } from "../lib/native-verse";

export default function WidgetControl() {
  const [status, setStatus] = useState("");
  const android = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
  useEffect(() => { if (android) syncVerseScheduleToAndroid().catch(() => {}); }, [android]);
  if (!android) return null;
  return <section className="verse-screen-control" aria-labelledby="verse-screen-title">
    <p className="eyebrow">On your phone</p>
    <h2 id="verse-screen-title">Keep the verse where you can see it.</h2>
    <p>Add the Leela widget to your Android Home screen for today’s verse. It refreshes automatically from Leela’s saved verse schedule.</p>
    <ol>
      <li>Touch and hold an empty area of your Home screen.</li>
      <li>Choose <b>Widgets</b>, then find <b>Leela · Daily Verse</b>.</li>
      <li>Drag it onto your screen.</li>
    </ol>
    <button type="button" onClick={async () => { try { await openVerseWallpaperChooser(); setStatus("Android opened the wallpaper chooser. Select Leela Verse, then choose where to use it."); } catch { setStatus("The wallpaper chooser could not open. Try again from your phone settings."); } }}>Set as verse wallpaper</button>
    <small>{status || "Some Android phones also offer the wallpaper on the lock screen; that choice is made in your phone’s wallpaper screen."}</small>
  </section>;
}
