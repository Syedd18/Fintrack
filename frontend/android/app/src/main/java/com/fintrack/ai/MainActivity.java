package com.fintrack.ai;

import android.Manifest;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Bundle;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int SMS_PERMISSION_CODE = 101;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        checkAndRequestSmsPermissions();
        seedDefaultPreferences();
    }

    private void checkAndRequestSmsPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECEIVE_SMS) != PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.READ_SMS) != PackageManager.PERMISSION_GRANTED) {
            
            ActivityCompat.requestPermissions(this, 
                new String[]{Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS}, 
                SMS_PERMISSION_CODE);
        }
    }

    private void seedDefaultPreferences() {
        SharedPreferences prefs = getSharedPreferences("fintrack_prefs", Context.MODE_PRIVATE);
        if (!prefs.contains("webhook_url")) {
            prefs.edit()
                .putString("webhook_url", "http://10.0.2.2:8080/api/webhook/sms")
                .putString("api_key", "dev_api_key_123")
                .apply();
        }
    }
}
