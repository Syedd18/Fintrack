package com.fintrack.collector

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.TimeUnit

class TransactionWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    private val TAG = "FintrackTransactionWorker"

    override suspend fun doWork(): Result {
        val sender = inputData.getString("sender") ?: return Result.failure()
        val body = inputData.getString("body") ?: return Result.failure()
        val timestamp = inputData.getLong("timestamp", System.currentTimeMillis())

        val prefs = applicationContext.getSharedPreferences("fintrack_prefs", Context.MODE_PRIVATE)
        val webhookUrl = prefs.getString("webhook_url", null)
        val apiKey = prefs.getString("api_key", null)

        if (webhookUrl.isNullOrEmpty() || apiKey.isNullOrEmpty()) {
            Log.e(TAG, "Worker missing API credentials. Check settings configuration.")
            return Result.failure()
        }

        try {
            // Build request payload
            val json = JSONObject().apply {
                put("sender", sender)
                put("text", body)
                put("timestamp", timestamp)
            }

            val mediaType = "application/json; charset=utf-8".toMediaType()
            val requestBody = json.toString().toRequestBody(mediaType)

            val client = OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(15, TimeUnit.SECONDS)
                .build()

            val request = Request.Builder()
                .url(webhookUrl)
                .post(requestBody)
                .addHeader("Content-Type", "application/json")
                .addHeader("X-FINTRACK-API-KEY", apiKey)
                .build()

            client.newCall(request).execute().use { response ->
                if (response.isSuccessful) {
                    Log.i(TAG, "Transaction webhook relayed successfully: Code ${response.code}")
                    return Result.success()
                } else {
                    Log.w(TAG, "Gateway server rejected payload: Code ${response.code}. Retrying...")
                    return Result.retry()
                }
            }

        } catch (e: IOException) {
            Log.e(TAG, "Network timeout / socket connection error: ${e.message}")
            return Result.retry()
        } catch (e: Exception) {
            Log.e(TAG, "Unexpected crash inside worker task: ${e.message}")
            return Result.failure()
        }
    }
}
