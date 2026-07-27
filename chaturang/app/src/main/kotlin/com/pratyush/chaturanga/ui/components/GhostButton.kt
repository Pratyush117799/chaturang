package com.pratyush.chaturanga.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.pratyush.chaturanga.ui.theme.Gold
import com.pratyush.chaturanga.ui.theme.Gold2
import com.pratyush.chaturanga.ui.theme.OutfitFontFamily
import com.pratyush.chaturanga.ui.theme.Typography

@Composable
fun GhostButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()

    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.96f else 1.0f,
        label = "GhostButtonScale"
    )

    val borderColor by animateColorAsState(
        targetValue = if (!enabled) Color(0x33C9A84C) else if (isPressed) Gold2 else Gold,
        label = "GhostButtonBorder"
    )

    val backgroundColor by animateColorAsState(
        targetValue = if (isPressed && enabled) Color(0x14C9A84C) else Color.Transparent, // 8% gold tint
        label = "GhostButtonBg"
    )

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(50.dp)
            .scale(scale)
            .clip(RoundedCornerShape(8.dp))
            .background(backgroundColor)
            .border(1.dp, borderColor, RoundedCornerShape(8.dp))
            .clickable(
                enabled = enabled,
                interactionSource = interactionSource,
                indication = null,
                onClick = onClick
            ),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            style = Typography.bodyLarge.copy(
                fontFamily = OutfitFontFamily,
                fontWeight = FontWeight.Medium,
                color = if (enabled) borderColor else Color(0x66C9A84C),
                textAlign = TextAlign.Center
            )
        )
    }
}
