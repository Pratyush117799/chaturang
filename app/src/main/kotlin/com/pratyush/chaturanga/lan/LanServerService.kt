package com.pratyush.chaturanga.lan

import android.app.*
import android.content.Intent
import android.net.wifi.WifiManager
import android.os.*
import androidx.core.app.NotificationCompat
import com.pratyush.chaturanga.MainActivity
import kotlinx.coroutines.*

class LanServerService : Service() {

    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var wsServer: ChaturangaWsServer? = null
    private var httpServer: ChaturangaHttpServer? = null
    private var wifiLock: WifiManager.WifiLock? = null
    private val roomManager = RoomManager()

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(NOTIF_ID, buildNotification())
        acquireWifiLock()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        serviceScope.launch {
            try {
                wsServer = ChaturangaWsServer(roomManager).also {
                    it.isReuseAddr = true
                    it.start()
                }
                httpServer = ChaturangaHttpServer(applicationContext, roomManager).also {
                    it.start(NanoHTTPDConnectionTimeout, false)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        return START_STICKY
    }

    override fun onDestroy() {
        wsServer?.shutdown()
        httpServer?.stop()
        wifiLock?.release()
        serviceScope.cancel()
        super.onDestroy()
    }

    private fun acquireWifiLock() {
        val wm = applicationContext.getSystemService(WIFI_SERVICE) as? WifiManager ?: return
        wifiLock = wm.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "chaturanga_lan_lock")
        wifiLock?.acquire()
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID, "Tournament Server", NotificationManager.IMPORTANCE_LOW
        ).apply { description = "Chaturanga LAN tournament server" }
        (getSystemService(NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(channel)
    }

    private fun buildNotification(): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pi = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_IMMUTABLE)
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Chaturanga Tournament")
            .setContentText("Hosting local tournament — tap to return")
            .setSmallIcon(android.R.drawable.ic_menu_share)
            .setContentIntent(pi)
            .setOngoing(true)
            .build()
    }

    companion object {
        private const val NOTIF_ID = 1001
        private const val CHANNEL_ID = "chaturanga_lan"
        private const val NanoHTTPDConnectionTimeout = 5000
    }
}
