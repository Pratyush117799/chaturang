package com.pratyush.chaturanga

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.navigation.compose.rememberNavController
import com.pratyush.chaturanga.navigation.ChaturangaNavGraph
import com.pratyush.chaturanga.ui.theme.ChaturangaTheme
import com.pratyush.chaturanga.ui.theme.Dark
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // Handle splash screen transition natively before setting content
        installSplashScreen()
        super.onCreate(savedInstanceState)
        
        setContent {
            ChaturangaTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Dark
                ) {
                    val navController = rememberNavController()
                    ChaturangaNavGraph(navController = navController)
                }
            }
        }
    }
}
