package com.pronita.leela;

import android.service.wallpaper.WallpaperService;
import android.view.SurfaceHolder;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.os.Handler;

public class LeelaVerseWallpaperService extends WallpaperService {
    @Override public Engine onCreateEngine() { return new VerseEngine(); }
    private class VerseEngine extends Engine {
        private final Handler handler = new Handler();
        private final Runnable dailyRefresh = new Runnable() { @Override public void run() { draw(); handler.postDelayed(this, 30 * 60 * 1000L); } };
        @Override public void onVisibilityChanged(boolean visible) { if (visible) { draw(); handler.removeCallbacks(dailyRefresh); handler.postDelayed(dailyRefresh, 30 * 60 * 1000L); } else handler.removeCallbacks(dailyRefresh); }
        @Override public void onSurfaceChanged(SurfaceHolder holder, int format, int width, int height) { draw(); }
        @Override public void onDestroy() { handler.removeCallbacks(dailyRefresh); super.onDestroy(); }
        private void draw() {
            SurfaceHolder holder = getSurfaceHolder();
            Canvas canvas = null;
            try {
                canvas = holder.lockCanvas();
                if (canvas == null) return;
                int width = canvas.getWidth(), height = canvas.getHeight();
                canvas.drawColor(Color.rgb(9, 79, 76));
                Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
                paint.setColor(Color.rgb(244, 213, 137)); paint.setTextSize(Math.max(22, width * .05f)); paint.setTypeface(Typeface.create(Typeface.SERIF, Typeface.BOLD));
                canvas.drawText("Leela", width * .09f, height * .2f, paint);
                String[] verse = LeelaVerseWidget.verseForToday(LeelaVerseWallpaperService.this);
                paint.setTextSize(Math.max(17, width * .038f)); paint.setColor(Color.rgb(255, 249, 231)); paint.setTypeface(Typeface.create(Typeface.SERIF, Typeface.NORMAL));
                float y = height * .42f;
                for (String line : wrap(verse[1], paint, width * .82f)) { canvas.drawText(line, width * .09f, y, paint); y += paint.getTextSize() * 1.45f; }
                paint.setTextSize(Math.max(13, width * .027f)); paint.setColor(Color.rgb(244, 213, 137)); paint.setTypeface(Typeface.DEFAULT_BOLD);
                canvas.drawText(verse[0], width * .09f, y + 36, paint);
            } finally { if (canvas != null) holder.unlockCanvasAndPost(canvas); }
        }
        private String[] wrap(String text, Paint paint, float maxWidth) {
            String[] words = text.split(" "); java.util.ArrayList<String> lines = new java.util.ArrayList<>(); String line = "";
            for (String word : words) { String candidate = line.isEmpty() ? word : line + " " + word; if (paint.measureText(candidate) > maxWidth && !line.isEmpty()) { lines.add(line); line = word; } else line = candidate; }
            if (!line.isEmpty()) lines.add(line); return lines.toArray(new String[0]);
        }
    }
}
