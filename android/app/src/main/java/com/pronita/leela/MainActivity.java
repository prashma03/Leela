package com.pronita.leela;

import android.app.AlertDialog;
import android.widget.Toast;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private long lastBackPressedAt = 0L;

    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(LeelaVersePlugin.class);
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onBackPressed() {
        if (bridge != null && bridge.getWebView() != null && bridge.getWebView().canGoBack()) {
            bridge.getWebView().goBack();
            return;
        }

        long now = System.currentTimeMillis();
        if (now - lastBackPressedAt < 1400L) {
            new AlertDialog.Builder(this)
                .setTitle("Exit Leela?")
                .setMessage("Do you want to close the app?")
                .setNegativeButton("Stay", null)
                .setPositiveButton("Exit", (dialog, which) -> finish())
                .show();
            lastBackPressedAt = 0L;
            return;
        }

        lastBackPressedAt = now;
        Toast.makeText(this, "Press back again to exit Leela.", Toast.LENGTH_SHORT).show();
    }
}
