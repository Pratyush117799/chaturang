package com.pratyush.chaturanga.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pratyush.chaturanga.ui.theme.CinzelFontFamily
import com.pratyush.chaturanga.ui.theme.Gold
import com.pratyush.chaturanga.ui.theme.MutedColor
import com.pratyush.chaturanga.ui.theme.PlayerRed
import com.pratyush.chaturanga.ui.theme.Typography

@Composable
fun DharmaBar(
    score: Int,
    modifier: Modifier = Modifier,
    animated: Boolean = true
) {
    var triggerAnimation by remember { mutableStateOf(false) }

    LaunchedEffect(score) {
        triggerAnimation = true
    }

    val targetProgress = (score.coerceIn(0, 100) / 100f)
    val progress by animateFloatAsState(
        targetValue = if (triggerAnimation && animated) targetProgress else if (animated) 0f else targetProgress,
        animationSpec = tween(durationMillis = 1500),
        label = "DharmaProgress"
    )

    val fillColor by animateColorAsState(
        targetValue = if (score < 40) PlayerRed else Gold,
        animationSpec = tween(durationMillis = 500),
        label = "DharmaBarColor"
    )

    Column(modifier = modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(bottom = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "DHARMA LEVEL",
                style = Typography.bodySmall.copy(
                    fontSize = 11.sp,
                    color = MutedColor
                )
            )
            Spacer(modifier = Modifier.weight(1f))
            Text(
                text = "$score",
                style = Typography.titleMedium.copy(
                    fontFamily = CinzelFontFamily,
                    color = fillColor
                )
            )
        }

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(Color.White.copy(alpha = 0.08f))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(progress)
                    .fillMaxHeight()
                    .clip(RoundedCornerShape(4.dp))
                    .background(fillColor)
            )
        }
    }
}
