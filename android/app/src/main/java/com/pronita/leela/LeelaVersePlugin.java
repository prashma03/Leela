package com.pronita.leela;

import android.app.WallpaperManager;
import android.content.ComponentName;
import android.content.Intent;
import android.content.SharedPreferences;

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
}
