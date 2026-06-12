package com.fintrack.collector

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.view.View
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.android.material.floatingactionbutton.FloatingActionButton
import java.net.URL

class MainActivity : AppCompatActivity() {

    private val PERMISSION_REQUEST_CODE = 101
    private lateinit var webView: WebView
    private lateinit var settingsLayout: LinearLayout
    private lateinit var settingsFab: FloatingActionButton
    private lateinit var openWebviewBtn: Button

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val urlInput = findViewById<EditText>(R.id.webhook_url_input)
        val apiKeyInput = findViewById<EditText>(R.id.api_key_input)
        val saveButton = findViewById<Button>(R.id.save_settings_btn)
        val permissionStatus = findViewById<TextView>(R.id.permission_status)
        
        webView = findViewById(R.id.dashboard_webview)
        settingsLayout = findViewById(R.id.settings_layout)
        settingsFab = findViewById(R.id.settings_fab)
        openWebviewBtn = findViewById(R.id.open_webview_btn)

        // Configure WebView settings for Next.js support
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                if (url != null) {
                    view?.loadUrl(url)
                }
                return true
            }
        }
        val webSettings = webView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

        // Load saved configurations
        val prefs = getSharedPreferences("fintrack_prefs", Context.MODE_PRIVATE)
        val savedUrl = prefs.getString("webhook_url", "")
        urlInput.setText(savedUrl)
        apiKeyInput.setText(prefs.getString("api_key", ""))

        if (!savedUrl.isNullOrEmpty()) {
            openWebviewBtn.visibility = View.VISIBLE
        }

        saveButton.setOnClickListener {
            val url = urlInput.text.toString().trim()
            val apiKey = apiKeyInput.text.toString().trim()

            if (url.isEmpty() || apiKey.isEmpty()) {
                Toast.makeText(this, "Please fill in all configuration parameters", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            prefs.edit().apply {
                putString("webhook_url", url)
                putString("api_key", apiKey)
                apply()
            }
            Toast.makeText(this, "Settings Saved Successfully", Toast.LENGTH_SHORT).show()
            openWebviewBtn.visibility = View.VISIBLE
            switchToWebView(url)
        }

        openWebviewBtn.setOnClickListener {
            val url = urlInput.text.toString().trim()
            if (url.isNotEmpty()) {
                switchToWebView(url)
            }
        }

        settingsFab.setOnClickListener {
            switchToSettings()
        }

        checkAndRequestPermissions(permissionStatus)
        requestBatteryExemption()
    }

    private fun switchToWebView(webhookUrl: String) {
        val dashboardUrl = getDashboardUrl(webhookUrl)
        webView.loadUrl(dashboardUrl)
        
        settingsLayout.visibility = View.GONE
        webView.visibility = View.VISIBLE
        settingsFab.visibility = View.VISIBLE
    }

    private fun switchToSettings() {
        webView.visibility = View.GONE
        settingsFab.visibility = View.GONE
        settingsLayout.visibility = View.VISIBLE
    }

    // Auto-detect dashboard IP address based on webhook settings
    private fun getDashboardUrl(webhookUrl: String): String {
        return try {
            val parsedUrl = URL(webhookUrl)
            val protocol = parsedUrl.protocol
            val host = parsedUrl.host
            // Default Next.js port is 3001 in our local docker dev configuration
            val port = 3001 
            "$protocol://$host:$port"
        } catch (e: Exception) {
            "http://10.0.2.2:3001" // Fallback to emulator localhost loopback
        }
    }

    override fun onBackPressed() {
        if (webView.visibility == View.VISIBLE && webView.canGoBack()) {
            webView.goBack()
        } else if (webView.visibility == View.VISIBLE) {
            switchToSettings()
        } else {
            super.onBackPressed()
        }
    }

    private fun checkAndRequestPermissions(statusText: TextView) {
        val receiveSms = ContextCompat.checkSelfPermission(this, Manifest.permission.RECEIVE_SMS)
        val readSms = ContextCompat.checkSelfPermission(this, Manifest.permission.READ_SMS)

        if (receiveSms != PackageManager.PERMISSION_GRANTED || readSms != PackageManager.PERMISSION_GRANTED) {
            statusText.text = "Permissions: DENIED (SMS capture disabled)"
            statusText.setTextColor(ContextCompat.getColor(this, android.R.color.holo_red_dark))
            
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS),
                PERMISSION_REQUEST_CODE
            )
        } else {
            statusText.text = "Permissions: GRANTED (SMS interceptor active)"
            statusText.setTextColor(ContextCompat.getColor(this, android.R.color.holo_green_dark))
        }
    }

    private fun requestBatteryExemption() {
        try {
            val intent = Intent()
            val packageName = packageName
            val pm = getSystemService(Context.POWER_SERVICE) as android.os.PowerManager
            if (!pm.isIgnoringBatteryOptimizations(packageName)) {
                intent.action = Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS
                intent.data = Uri.parse("package:$packageName")
                startActivity(intent)
            }
        } catch (e: Exception) {
            android.util.Log.e("MainActivity", "Failed to request battery exemption: ${e.message}")
        }
    }
}
