package com.pronita.leela;

import android.app.WallpaperManager;
import android.content.ComponentName;
import android.content.Intent;
import android.content.SharedPreferences;
import android.speech.tts.TextToSpeech;

import java.util.Locale;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "LeelaVerse")
public class LeelaVersePlugin extends Plugin {
    static final String PREFS = "leela_daily_verse";
    static final String SCHEDULE = "schedule";
    private TextToSpeech narrator;

    @PluginMethod
    public void saveVerseSchedule(PluginCall call) {
        JSArray entries = call.getArray("entries");
        if (entries == null) { call.reject("Verse schedule is missing."); return; }
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS, android.content.Context.MODE_PRIVATE);
        prefs.edit().putString(SCHEDULE, entries.toString()).apply();
        LeelaVerseWidget.updateAll(getContext());
        call.resolve();
    }

    @PluginMethod
    public void openWallpaperChooser(PluginCall call) {
        Intent intent = new Intent(WallpaperManager.ACTION_CHANGE_LIVE_WALLPAPER);
        intent.putExtra(WallpaperManager.EXTRA_LIVE_WALLPAPER_COMPONENT, new ComponentName(getContext(), LeelaVerseWallpaperService.class));
        getActivity().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void speak(PluginCall call) {
        String text = call.getString("text", "").trim();
        if (text.isEmpty()) { call.reject("Nothing to read aloud."); return; }
        double rate = call.getDouble("rate", 0.8);
        double pitch = call.getDouble("pitch", 0.92);
        if (narrator == null) {
            narrator = new TextToSpeech(getContext(), status -> {
                if (status != TextToSpeech.SUCCESS) { call.reject("Android text-to-speech is not available."); return; }
                readAloud(call, text, rate, pitch);
            });
        } else readAloud(call, text, rate, pitch);
    }

    private void readAloud(PluginCall call, String text, double rate, double pitch) {
        narrator.setLanguage(Locale.getDefault());
        narrator.setSpeechRate((float) Math.max(0.5, Math.min(1.25, rate)));
        narrator.setPitch((float) Math.max(0.75, Math.min(1.15, pitch)));
        int result = narrator.speak(text, TextToSpeech.QUEUE_FLUSH, null, "leela-narration");
        if (result == TextToSpeech.ERROR) call.reject("Android text-to-speech could not start.");
        else call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        if (narrator != null) { narrator.stop(); narrator.shutdown(); narrator = null; }
        super.handleOnDestroy();
    }
}
