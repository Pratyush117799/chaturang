package com.pratyush.chaturanga.utils

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.WifiManager
import java.net.NetworkInterface

object NetworkUtils {
    fun getLocalWifiIpAddress(context: Context): String? {
        return try {
            // Prefer NetworkInterface enumeration (more reliable)
            NetworkInterface.getNetworkInterfaces()?.toList()
                ?.flatMap { it.inetAddresses.toList() }
                ?.firstOrNull { addr ->
                    !addr.isLoopbackAddress && addr is java.net.Inet4Address
                }
                ?.hostAddress
        } catch (e: Exception) {
            // Fallback to WifiManager
            try {
                val wm = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as? WifiManager
                val ip = wm?.dhcpInfo?.ipAddress ?: return null
                if (ip == 0) return null
                String.format(
                    "%d.%d.%d.%d",
                    (ip and 0xff), (ip shr 8 and 0xff),
                    (ip shr 16 and 0xff), (ip shr 24 and 0xff)
                )
            } catch (ex: Exception) { null }
        }
    }

    fun isOnWifi(context: Context): Boolean {
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return false
        val network = cm.activeNetwork ?: return false
        val caps = cm.getNetworkCapabilities(network) ?: return false
        return caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)
    }
}
