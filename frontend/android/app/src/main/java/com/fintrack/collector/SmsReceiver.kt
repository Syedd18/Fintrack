package com.fintrack.collector

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.SmsMessage
import android.util.Log
import androidx.work.Data
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import java.util.Locale

class SmsReceiver : BroadcastReceiver() {

    private val TAG = "FintrackSmsReceiver"

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != "android.provider.Telephony.SMS_RECEIVED") return

        val bundle = intent.extras ?: return
        try {
            val pdus = bundle.get("pdus") as Array<*>? ?: return
            for (pdu in pdus) {
                val sms = SmsMessage.createFromPdu(pdu as ByteArray)
                val sender = sms.originatingAddress ?: "Unknown"
                val body = sms.messageBody ?: ""
                val timestamp = sms.timestampMillis

                Log.d(TAG, "SMS received from: $sender")

                if (isTransactionSms(sender, body)) {
                    Log.i(TAG, "Transaction SMS match. Spawning WorkManager thread for gateway upload.")
                    enqueueUpload(context, sender, body, timestamp)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception in SMS Receiver: ${e.message}")
        }
    }

    private fun isTransactionSms(sender: String, body: String): Boolean {
        val cleanBody = body.toLowerCase(Locale.ROOT)
        
        // Filter criteria: contains typical banking transaction keywords
        val matchesKeywords = cleanBody.contains("debited") || 
                cleanBody.contains("credited") || 
                cleanBody.contains("spent") || 
                cleanBody.contains("txn of") ||
                cleanBody.contains("transferred") ||
                cleanBody.contains("paid Rs")

        // Sender validation: Indian shortcodes usually end with bank descriptors (e.g. HDFCBK, SBINB)
        val matchesShortcode = sender.length >= 6 && (
                sender.contains("BK") || 
                sender.contains("BNK") || 
                sender.contains("SBI") || 
                sender.contains("HDFC") || 
                sender.contains("ICICI") || 
                sender.contains("AXIS") ||
                sender.contains("PAYTM")
        )

        return matchesKeywords || matchesShortcode
    }

    private fun enqueueUpload(context: Context, sender: String, body: String, timestamp: Long) {
        val inputData = Data.Builder()
            .putString("sender", sender)
            .putString("body", body)
            .putLong("timestamp", timestamp)
            .build()

        val uploadWorkRequest = OneTimeWorkRequestBuilder<TransactionWorker>()
            .setInputData(inputData)
            .build()

        WorkManager.getInstance(context).enqueue(uploadWorkRequest)
    }
}
