package com.pronita.leela;

import android.app.WallpaperManager;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;

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
    private String currentSpeechText = "";
    private double currentSpeechRate = 0.8;
    private double currentSpeechPitch = 0.92;
    private int speechBaseOffset = 0;
    private int currentSpeechOffset = 0;
    private boolean paused;

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
    public void pinVerseWidget(PluginCall call) {
        JSObject result = new JSObject();
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            result.put("supported", false);
            call.resolve(result);
            return;
        }
        AppWidgetManager manager = getContext().getSystemService(AppWidgetManager.class);
        ComponentName widget = new ComponentName(getContext(), LeelaVerseWidget.class);
        if (manager == null || !manager.isRequestPinAppWidgetSupported()) {
            result.put("supported", false);
            call.resolve(result);
            return;
        }
        manager.requestPinAppWidget(widget, null, null);
        result.put("supported", true);
        call.resolve(result);
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
        currentSpeechText = text;
        currentSpeechRate = rate;
        currentSpeechPitch = pitch;
        speechBaseOffset = 0;
        currentSpeechOffset = 0;
        paused = false;
        configureNarrator(rate, pitch);
        int result = narrator.speak(text, TextToSpeech.QUEUE_FLUSH, null, "leela-narration");
        if (result == TextToSpeech.ERROR) call.reject("Android text-to-speech could not start.");
        else call.resolve();
    }

    private void configureNarrator(double rate, double pitch) {
        narrator.setLanguage(Locale.getDefault());
        narrator.setSpeechRate((float) Math.max(0.5, Math.min(1.25, rate)));
        narrator.setPitch((float) Math.max(0.75, Math.min(1.15, pitch)));
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            narrator.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override
                public void onStart(String utteranceId) {}

                @Override
                public void onDone(String utteranceId) {
                    if (!paused) currentSpeechOffset = 0;
                }

                @Override
                public void onError(String utteranceId) {}

                @Override
                public void onRangeStart(String utteranceId, int start, int end, int frame) {
                    int offset = speechBaseOffset + start;
                    currentSpeechOffset = Math.max(0, Math.min(currentSpeechText.length(), offset));
                }
            });
        }
    }

    @PluginMethod
    public void pauseSpeaking(PluginCall call) {
        paused = true;
        if (narrator != null) narrator.stop();
        call.resolve();
    }

    @PluginMethod
    public void resumeSpeaking(PluginCall call) {
        if (narrator == null || currentSpeechText.isEmpty()) { call.resolve(); return; }
        paused = false;
        configureNarrator(currentSpeechRate, currentSpeechPitch);
        speechBaseOffset = Math.max(0, Math.min(currentSpeechText.length(), currentSpeechOffset));
        String remaining = currentSpeechText.substring(speechBaseOffset).trim();
        if (remaining.isEmpty()) { call.resolve(); return; }
        int result = narrator.speak(remaining, TextToSpeech.QUEUE_FLUSH, null, "leela-narration-resume");
        if (result == TextToSpeech.ERROR) call.reject("Android text-to-speech could not resume.");
        else call.resolve();
    }

    @PluginMethod
    public void stopSpeaking(PluginCall call) {
        if (narrator != null) narrator.stop();
        currentSpeechText = "";
        speechBaseOffset = 0;
        currentSpeechOffset = 0;
        paused = false;
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        if (narrator != null) { narrator.stop(); narrator.shutdown(); narrator = null; }
        super.handleOnDestroy();
    }
}
