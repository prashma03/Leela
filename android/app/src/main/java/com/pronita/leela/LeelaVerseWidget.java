package com.pronita.leela;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class LeelaVerseWidget extends AppWidgetProvider {
    static String[] verseForToday(Context context) {
        String fallbackReference = "Leela · Daily Verse";
        String fallbackReflection = "Open Leela to prepare today’s reflection.";
        try {
            SharedPreferences prefs = context.getSharedPreferences(LeelaVersePlugin.PREFS, Context.MODE_PRIVATE);
            JSONArray entries = new JSONArray(prefs.getString(LeelaVersePlugin.SCHEDULE, "[]"));
            String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
            for (int index = 0; index < entries.length(); index++) {
                JSONObject entry = entries.getJSONObject(index);
                if (today.equals(entry.optString("date"))) return new String[]{entry.optString("reference", fallbackReference), entry.optString("reflection", fallbackReflection)};
            }
        } catch (Exception ignored) { }
        return new String[]{fallbackReference, fallbackReflection};
    }

    static void updateAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, LeelaVerseWidget.class);
        int[] ids = manager.getAppWidgetIds(component);
        if (ids.length > 0) update(context, manager, ids);
    }

    private static void update(Context context, AppWidgetManager manager, int[] ids) {
        String[] verse = verseForToday(context);
        for (int id : ids) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.leela_verse_widget);
            views.setTextViewText(R.id.verse_reference, verse[0]);
            views.setTextViewText(R.id.verse_reflection, verse[1]);
            manager.updateAppWidget(id, views);
        }
    }

    @Override public void onUpdate(Context context, AppWidgetManager manager, int[] ids) { update(context, manager, ids); }
}
