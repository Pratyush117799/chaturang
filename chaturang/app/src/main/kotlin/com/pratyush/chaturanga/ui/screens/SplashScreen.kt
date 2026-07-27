package com.pratyush.chaturanga.ui.screens

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pratyush.chaturanga.ui.theme.CinzelFontFamily
import com.pratyush.chaturanga.ui.theme.Dark
import com.pratyush.chaturanga.ui.theme.Gold
import com.pratyush.chaturanga.ui.theme.Gold2
import com.pratyush.chaturanga.ui.theme.MutedColor
import com.pratyush.chaturanga.ui.theme.OutfitFontFamily
import com.pratyush.chaturanga.ui.theme.Typography
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    onNavigateToMenu: () -> Unit
) {
    val infiniteTransition = rememberInfiniteTransition(label = "SplashPulsing")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.96f,
        targetValue = 1.08f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "CrownPulsingScale"
    )

    LaunchedEffect(Unit) {
        delay(1500)
        onNavigateToMenu()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Dark)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Pulsing crown icon
        Text(
            text = "♚",
            fontSize = 80.sp,
            color = Gold,
            modifier = Modifier.scale(pulseScale)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Devanagari text
        Text(
            text = "चतुरङ्ग",
            fontFamily = CinzelFontFamily,
            fontSize = 18.sp,
            color = Gold.copy(alpha = 0.6f),
            fontWeight = FontWeight.Bold,
            letterSpacing = 6.sp,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(10.dp))

        // English Title
        Text(
            text = "CHATURANGA",
            style = Typography.displayLarge,
            color = Gold2,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(6.dp))

        // Description
        Text(
            text = "Ancient Indian Chess",
            style = Typography.bodySmall.copy(
                fontFamily = OutfitFontFamily,
                fontWeight = FontWeight.Light,
                fontSize = 13.sp,
                color = MutedColor
            ),
            textAlign = TextAlign.Center
        )
    }
}
