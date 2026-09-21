"use client";

import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";
import { openVerseWallpaperChooser, pinVerseWidgetToHomeScreen, syncVerseScheduleToAndroid } from "../lib/native-verse";

export default function WidgetControl() {
  const [status, setStatus] = useState("");
  const android = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
  useEffect(() => { if (android) syncVerseScheduleToAndroid().catch(() => {}); }, [android]);
  return <section className="verse-screen-control" aria-labelledby="verse-screen-title">
    <p className="eyebrow">Home screen verse</p>
    <h2 id="verse-screen-title">Add today’s verse to your Home screen.</h2>
    <p>The Leela Android app includes a Daily Verse widget box. On supported Android phones, Leela can ask your Home screen to add it directly.</p>
    {android && <button type="button" onClick={async () => { try { const supported = await pinVerseWidgetToHomeScreen(); setStatus(supported ? "Android opened the widget add request. Confirm it to place the Leela verse box on your Home screen." : "This launcher does not allow apps to add widgets directly. Use the widget menu steps below."); } catch { setStatus("Android could not open the widget add request. Use the widget menu steps below."); } }}>Add verse widget box</button>}
    <ol>
      <li>Touch and hold an empty area of your Home screen.</li>
      <li>Choose <b>Widgets</b>, then find <b>Leela · Daily Verse</b>.</li>
      <li>Drag it onto your screen.</li>
    </ol>
    {android && <button type="button" onClick={async () => { try { await openVerseWallpaperChooser(); setStatus("Android opened the wallpaper chooser. Select Leela Verse, then choose where to use it."); } catch { setStatus("The wallpaper chooser could not open. Try again from your phone settings."); } }}>Set as verse wallpaper</button>}
    <small>{status || (android ? "If your launcher blocks direct widget adding, the steps above still work. Lock screen support depends on your phone’s wallpaper options." : "Open Leela in the Android app to use the direct widget and wallpaper tools. Browsers can only add page shortcuts, not real widget boxes.")}</small>
  </section>;
}
