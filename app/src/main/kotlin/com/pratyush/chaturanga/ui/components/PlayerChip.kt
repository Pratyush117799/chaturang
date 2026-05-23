package com.pratyush.chaturanga.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pratyush.chaturanga.ui.theme.OutfitFontFamily
import com.pratyush.chaturanga.ui.theme.PlayerColors
import com.pratyush.chaturanga.ui.theme.TextColor
import com.pratyush.chaturanga.ui.theme.Typography

@Composable
fun PlayerChip(
    playerIndex: Int,
    name: String,
    isActive: Boolean,
    modifier: Modifier = Modifier
) {
    val playerColor = PlayerColors.getOrElse(playerIndex) { Color.Gray }
    
    val borderModifier = if (isActive) {
        Modifier.border(1.2.dp, playerColor, RoundedCornerShape(8.dp))
    } else {
        Modifier.border(1.dp, playerColor.copy(alpha = 0.25f), RoundedCornerShape(8.dp))
    }

    Row(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(playerColor.copy(alpha = if (isActive) 0.15f else 0.06f))
            .then(borderModifier)
            .padding(horizontal = 10.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Player color indicator dot
        Box(
            modifier = Modifier
                .size(8.dp)
                .clip(CircleShape)
                .background(playerColor)
        )
        
        Spacer(modifier = Modifier.width(8.dp))
        
        Text(
            text = name,
            style = Typography.bodyMedium.copy(
                fontFamily = OutfitFontFamily,
                color = if (isActive) TextColor else TextColor.copy(alpha = 0.7f),
                fontSize = 13.sp
            )
        )
    }
}
