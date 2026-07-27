package com.pratyush.chaturanga.webview

import android.annotation.SuppressLint
import android.view.ViewGroup
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.pratyush.chaturanga.model.GameConfig
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun GameWebView(
    config: GameConfig,
    onEvent: (JsBridgeEvent) -> Unit,
    modifier: Modifier = Modifier
) {
    val currentConfig = rememberUpdatedState(config)
    val currentOnEvent = rememberUpdatedState(onEvent)

    AndroidView(
        modifier = modifier,
        factory = { context ->
            WebView(context).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )

                // High fidelity and security WebView configuration
                settings.apply {
                    javaScriptEnabled = true
                    allowFileAccess = true
                    domStorageEnabled = true
                    allowFileAccessFromFileURLs = false
                    allowUniversalAccessFromFileURLs = false
                    loadWithOverviewMode = true
                    useWideViewPort = true
                    setSupportZoom(false)
                    builtInZoomControls = false
                    displayZoomControls = false
                }

                // Inject the JS bridge under window.Android reference
                addJavascriptInterface(
                    JsBridge { event ->
                        currentOnEvent.value(event)
                    },
                    "Android"
                )

                webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView?, url: String?) {
                        super.onPageFinished(view, url)
                        
                        // Inject serialized GameConfig into local WebView
                        val configJson = Json.encodeToString(currentConfig.value)
                        view?.evaluateJavascript(
                            "window.CHATURANGA_CONFIG = $configJson;",
                            null
                        )
                        // Trigger initialization of active game modes
                        view?.evaluateJavascript(
                            "if (typeof initMode === 'function') initMode(window.CHATURANGA_CONFIG);",
                            null
                        )
                    }

                    override fun shouldOverrideUrlLoading(
                        view: WebView?,
                        request: WebResourceRequest?
                    ): Boolean {
                        // Keep navigation strictly inside our local offline files
                        return false
                    }
                }

                loadUrl("file:///android_asset/game/index.html")
            }
        },
        update = { webView ->
            // Update config if needed while avoiding full page reloads
        }
    )

    // Clean memory footprint on leaving active screens
    DisposableEffect(Unit) {
        onDispose {
            // Handled automatically by garbage collector, or can explicitly invoke destroy on view reference if kept
        }
    }
}
