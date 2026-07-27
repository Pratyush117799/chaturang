package com.pratyush.chaturanga.lan

import android.content.Context
import fi.iki.elonen.NanoHTTPD
import java.io.InputStream

class ChaturangaHttpServer(
    private val context: Context,
    private val roomManager: RoomManager,
    private val wsPort: Int = 8765
) : NanoHTTPD(8080) {

    override fun serve(session: IHTTPSession): Response {
        val uri = session.uri.trimStart('/')
        return when {
            uri == "" || uri == "index.html" -> serveAsset("game/index.html", "text/html")
            uri == "game" || uri == "game.html" -> serveAsset("game/game.html", "text/html")
            uri == "api/rooms" -> serveRoomsJson()
            uri == "ws-url" -> serveWsUrl()
            uri.endsWith(".js")    -> serveAsset("game/$uri", "application/javascript")
            uri.endsWith(".css")   -> serveAsset("game/$uri", "text/css")
            uri.endsWith(".woff2") -> serveAsset("game/$uri", "font/woff2")
            uri.endsWith(".json")  -> serveAsset("game/$uri", "application/json")
            uri.endsWith(".html")  -> serveAsset("game/$uri", "text/html")
            uri.endsWith(".png")   -> serveAsset("game/$uri", "image/png")
            uri.endsWith(".svg")   -> serveAsset("game/$uri", "image/svg+xml")
            else -> newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "Not found: $uri")
        }
    }

    private fun serveAsset(assetPath: String, mimeType: String): Response {
        return try {
            val stream: InputStream = context.assets.open(assetPath)
            val length = stream.available().toLong()
            newFixedLengthResponse(Response.Status.OK, mimeType, stream, length)
        } catch (e: Exception) {
            newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "Asset not found: $assetPath")
        }
    }

    private fun serveRoomsJson(): Response {
        val rooms = roomManager.getAllRooms()
        val json = buildString {
            append("[")
            rooms.forEachIndexed { i, r ->
                if (i > 0) append(",")
                append("""{"id":"${r.roomId}","name":"${r.name}","players":${r.players.size},"status":"${r.status}"}""")
            }
            append("]")
        }
        return newFixedLengthResponse(Response.Status.OK, "application/json", json)
    }

    private fun serveWsUrl(): Response {
        val ip = try {
            java.net.NetworkInterface.getNetworkInterfaces().toList()
                .flatMap { it.inetAddresses.toList() }
                .firstOrNull { !it.isLoopbackAddress && it is java.net.Inet4Address }
                ?.hostAddress ?: "127.0.0.1"
        } catch (e: Exception) { "127.0.0.1" }
        return newFixedLengthResponse(Response.Status.OK, "application/json", """{"url":"ws://$ip:$wsPort"}""")
    }
}
