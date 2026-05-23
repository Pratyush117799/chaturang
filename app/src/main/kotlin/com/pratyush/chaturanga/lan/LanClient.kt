package com.pratyush.chaturanga.lan

import com.pratyush.chaturanga.model.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import okhttp3.*
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LanClient @Inject constructor() {

    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(0, TimeUnit.SECONDS)
        .build()

    private var webSocket: WebSocket? = null
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    private val _events = MutableSharedFlow<Any>(extraBufferCapacity = 32)
    val events: SharedFlow<Any> = _events.asSharedFlow()

    private var retryCount = 0
    private val maxRetries = 3

    fun connect(url: String) {
        retryCount = 0
        connectInternal(url)
    }

    private fun connectInternal(url: String) {
        val request = Request.Builder().url(url).build()
        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                retryCount = 0
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                scope.launch {
                    parseInboundMessage(text)?.let { _events.emit(it) }
                }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                if (retryCount < maxRetries) {
                    retryCount++
                    val delayMs = (1000L shl retryCount).coerceAtMost(8000L)
                    scope.launch {
                        delay(delayMs)
                        connectInternal(url)
                    }
                }
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                // connection closed cleanly
            }
        })
    }

    fun send(message: String) {
        webSocket?.send(message)
    }

    fun disconnect() {
        webSocket?.close(1000, "Client disconnect")
        webSocket = null
    }
}
