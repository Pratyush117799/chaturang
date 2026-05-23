package com.pratyush.chaturanga.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import com.google.accompanist.systemuicontroller.rememberSystemUiController

private val DarkColorScheme = darkColorScheme(
    primary = Gold,
    onPrimary = Color(0xFF1A0E00),
    secondary = Gold2,
    onSecondary = Color(0xFF1A0E00),
    background = Dark,
    onBackground = TextColor,
    surface = Dark2,
    onSurface = TextColor,
    surfaceVariant = Dark3,
    onSurfaceVariant = MutedColor
)

object ChaturangaColors {
    val gold: Color = Gold
    val gold2: Color = Gold2
    val gold3: Color = Gold3
    val dark: Color = Dark
    val dark2: Color = Dark2
    val dark3: Color = Dark3
    val border: Color = BorderColor
    val text: Color = TextColor
    val muted: Color = MutedColor
    val playerColors: List<Color> = PlayerColors
    val boardLight: Color = BoardLight
    val boardDark: Color = BoardDark
    val oracle: Color = OracleColor
}

@Composable
fun ChaturangaTheme(
    content: @Composable () -> Unit
) {
    // We force a dark status bar & navigation bar for the immersive parchment look
    // We import basic side effect controllers for immersive experience.
    SideEffect {
        // Handled via Activity status bar settings or custom system controller if available
    }

    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
