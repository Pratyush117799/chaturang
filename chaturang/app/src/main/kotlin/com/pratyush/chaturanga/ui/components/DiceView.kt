package com.pratyush.chaturanga.ui.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.sp
import com.pratyush.chaturanga.ui.theme.Gold

@Composable
fun DiceView(
    face: Int, // 0 = 🎲, 1 = ⚀, 2 = ⚁, 3 = ⚂, 4 = ⚃, 5 = ⚄, 6 = ⚅
    isSpinning: Boolean,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "DiceRotation")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 600, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "DiceRotationVal"
    )

    val faces = listOf("🎲", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅")
    val diceFace = faces.getOrElse(face) { "🎲" }

    Text(
        text = diceFace,
        fontSize = 42.sp,
        color = Gold,
        textAlign = TextAlign.Center,
        modifier = modifier.rotate(if (isSpinning) rotation else 0f)
    )
}
