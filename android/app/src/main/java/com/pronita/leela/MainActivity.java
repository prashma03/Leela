package com.pronita.leela;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(LeelaVersePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
