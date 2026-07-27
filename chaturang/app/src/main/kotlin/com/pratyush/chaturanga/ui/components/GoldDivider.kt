package com.pratyush.chaturanga.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pratyush.chaturanga.ui.theme.Gold
import com.pratyush.chaturanga.ui.theme.OutfitFontFamily

@Composable
fun GoldDivider(
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Left gradient line
        Box(
            modifier = Modifier
                .weight(1f)
                .height(1.dp)
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(Color.Transparent, Gold.copy(alpha = 0.4f))
                    )
                )
        )

        // Center diamond
        Text(
            text = "◆",
            fontFamily = OutfitFontFamily,
            fontSize = 12.sp,
            color = Gold.copy(alpha = 0.4f),
            modifier = Modifier.padding(horizontal = 8.dp)
        )

        // Right gradient line
        Box(
            modifier = Modifier
                .weight(1f)
                .height(1.dp)
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(Gold.copy(alpha = 0.4f), Color.Transparent)
                    )
                )
        )
    }
}
