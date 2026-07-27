package com.pratyush.chaturanga.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pratyush.chaturanga.ui.theme.BorderColor
import com.pratyush.chaturanga.ui.theme.Dark2
import com.pratyush.chaturanga.ui.theme.Gold
import com.pratyush.chaturanga.ui.theme.OutfitFontFamily

@Composable
fun ParchmentCard(
    modifier: Modifier = Modifier,
    isOrnate: Boolean = false,
    content: @Composable () -> Unit
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(Dark2)
            .border(1.dp, BorderColor, RoundedCornerShape(10.dp))
            .padding(if (isOrnate) 12.dp else 16.dp)
    ) {
        content()

        if (isOrnate) {
            // Ornate corner ✦ decorations in all 4 corners
            Text(
                text = "✦",
                fontFamily = OutfitFontFamily,
                fontSize = 10.sp,
                color = Gold.copy(alpha = 0.4f),
                modifier = Modifier.align(Alignment.TopStart)
            )
            Text(
                text = "✦",
                fontFamily = OutfitFontFamily,
                fontSize = 10.sp,
                color = Gold.copy(alpha = 0.4f),
                modifier = Modifier.align(Alignment.TopEnd)
            )
            Text(
                text = "✦",
                fontFamily = OutfitFontFamily,
                fontSize = 10.sp,
                color = Gold.copy(alpha = 0.4f),
                modifier = Modifier.align(Alignment.BottomStart)
            )
            Text(
                text = "✦",
                fontFamily = OutfitFontFamily,
                fontSize = 10.sp,
                color = Gold.copy(alpha = 0.4f),
                modifier = Modifier.align(Alignment.BottomEnd)
            )
        }
    }
}
