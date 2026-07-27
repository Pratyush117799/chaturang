package com.pratyush.chaturanga.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pratyush.chaturanga.ui.components.ChaturangaButton
import com.pratyush.chaturanga.ui.components.GhostButton
import com.pratyush.chaturanga.ui.components.GoldDivider
import com.pratyush.chaturanga.ui.components.ParchmentCard
import com.pratyush.chaturanga.ui.theme.CinzelFontFamily
import com.pratyush.chaturanga.ui.theme.Dark
import com.pratyush.chaturanga.ui.theme.Gold
import com.pratyush.chaturanga.ui.theme.Gold2
import com.pratyush.chaturanga.ui.theme.MutedColor
import com.pratyush.chaturanga.ui.theme.OutfitFontFamily
import com.pratyush.chaturanga.ui.theme.Typography

@Composable
fun ModeSelectScreen(
    onStartGame: (mode: String, botDifficulty: Int) -> Unit,
    onBack: () -> Unit
) {
    var selectedMode by remember { mutableStateOf("hotseat") } // "hotseat" | "passplay" | "vsbot"
    var selectedDifficulty by remember { mutableStateOf(600) } // 400 | 600 | 900

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Dark)
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        // Title block
        Text(
            text = "BATTLE SETUP",
            style = Typography.displayMedium,
            color = Gold2,
            textAlign = TextAlign.Center
        )
        Text(
            text = "Select your play mode and parameters",
            style = Typography.bodySmall.copy(
                fontFamily = OutfitFontFamily,
                color = MutedColor
            ),
            textAlign = TextAlign.Center
        )

        GoldDivider()

        Spacer(modifier = Modifier.height(8.dp))

        // Mode Selection list
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            ModeSelectCard(
                icon = "⚔",
                title = "Hot Seat",
                description = "2 players, same device, alternate turns.",
                isSelected = selectedMode == "hotseat",
                onClick = { selectedMode = "hotseat" }
            )

            ModeSelectCard(
                icon = "🤝",
                title = "Pass & Play",
                description = "Pass the phone between turns. Active turn overlay blocks the screen between moves for tactical privacy.",
                isSelected = selectedMode == "passplay",
                onClick = { selectedMode = "passplay" }
            )

            ModeSelectCard(
                icon = "🤖",
                title = "vs Drona",
                description = "Play against the ancient chess grandmaster bot.",
                isSelected = selectedMode == "vsbot",
                onClick = { selectedMode = "vsbot" }
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Bot Difficulty Section (Animated appearance)
        AnimatedVisibility(
            visible = selectedMode == "vsbot",
            enter = expandVertically() + fadeIn(),
            exit = shrinkVertically() + fadeOut()
        ) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Drona Difficulty Strength",
                    style = Typography.titleMedium.copy(
                        fontFamily = CinzelFontFamily,
                        color = Gold
                    ),
                    modifier = Modifier.padding(bottom = 12.dp)
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color.White.copy(alpha = 0.04f))
                        .border(1.dp, Gold.copy(alpha = 0.25f), RoundedCornerShape(8.dp))
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    DifficultySegment(
                        text = "Shishya",
                        elo = "ELO 400",
                        isSelected = selectedDifficulty == 400,
                        onClick = { selectedDifficulty = 400 },
                        modifier = Modifier.weight(1f)
                    )
                    DifficultySegment(
                        text = "Kshatriya",
                        elo = "ELO 600",
                        isSelected = selectedDifficulty == 600,
                        onClick = { selectedDifficulty = 600 },
                        modifier = Modifier.weight(1f)
                    )
                    DifficultySegment(
                        text = "Drona",
                        elo = "ELO 900",
                        isSelected = selectedDifficulty == 900,
                        onClick = { selectedDifficulty = 900 },
                        modifier = Modifier.weight(1f)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = when (selectedDifficulty) {
                        400 -> "Shishya (Student) plays casual moves, suitable for beginners."
                        600 -> "Kshatriya (Warrior) plays active moves with sound tactical fundamentals."
                        else -> "Drona (Master) executes near-perfect tactical defenses and attacks."
                    },
                    style = Typography.bodySmall.copy(
                        fontFamily = OutfitFontFamily,
                        color = MutedColor
                    ),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 8.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(36.dp))

        // Buttons
        ChaturangaButton(
            text = "Begin Battle ⚔",
            onClick = { onStartGame(selectedMode, selectedDifficulty) }
        )

        Spacer(modifier = Modifier.height(12.dp))

        GhostButton(
            text = "← Back",
            onClick = onBack
        )

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
fun ModeSelectCard(
    icon: String,
    title: String,
    description: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val borderColor = if (isSelected) Gold2 else Gold.copy(alpha = 0.18f)
    val cardBackground = if (isSelected) Color(0x14C9A84C) else Color.Transparent

    ParchmentCard(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .background(cardBackground)
            .border(1.dp, borderColor, RoundedCornerShape(10.dp))
            .clickable { onClick() }
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = icon,
                fontSize = 24.sp,
                color = if (isSelected) Gold else Gold.copy(alpha = 0.5f),
                modifier = Modifier.padding(end = 16.dp)
            )

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = Typography.titleLarge.copy(
                        fontFamily = CinzelFontFamily,
                        color = if (isSelected) Gold2 else Gold.copy(alpha = 0.8f)
                    )
                )
                Text(
                    text = description,
                    style = Typography.bodySmall.copy(
                        fontFamily = OutfitFontFamily,
                        color = if (isSelected) TextColor else MutedColor
                    )
                )
            }

            if (isSelected) {
                Text(
                    text = "✓",
                    fontSize = 18.sp,
                    color = Gold2,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(start = 8.dp)
                )
            }
        }
    }
}

@Composable
fun DifficultySegment(
    text: String,
    elo: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val segmentBg = if (isSelected) Gold else Color.Transparent
    val textColor = if (isSelected) Color(0xFF1A0E00) else TextColor
    val eloColor = if (isSelected) Color(0xFF1A0E00).copy(alpha = 0.7f) else MutedColor

    Column(
        modifier = modifier
            .clip(RoundedCornerShape(6.dp))
            .background(segmentBg)
            .clickable { onClick() }
            .padding(vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = text,
            style = Typography.titleMedium.copy(
                fontFamily = CinzelFontFamily,
                color = textColor,
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp
            )
        )
        Text(
            text = elo,
            style = Typography.bodySmall.copy(
                fontFamily = OutfitFontFamily,
                color = eloColor,
                fontSize = 10.sp
            )
        )
    }
}
