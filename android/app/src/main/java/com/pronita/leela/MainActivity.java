package com.pronita.leela;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(LeelaVersePlugin.class);
        super.onCreate(savedInstanceState);

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (bridge == null || bridge.getWebView() == null) {
                    return;
                }

                bridge.getWebView().post(() -> bridge.getWebView().evaluateJavascript(
                    "window.dispatchEvent(new Event('leela:native-back'))",
                    null
                ));
            }
        });
    }
}
