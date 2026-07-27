package com.pratyush.chaturanga.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pratyush.chaturanga.ui.components.ParchmentCard
import com.pratyush.chaturanga.ui.theme.CinzelFontFamily
import com.pratyush.chaturanga.ui.theme.Dark
import com.pratyush.chaturanga.ui.theme.Gold
import com.pratyush.chaturanga.ui.theme.Gold2
import com.pratyush.chaturanga.ui.theme.MutedColor
import com.pratyush.chaturanga.ui.theme.OutfitFontFamily
import com.pratyush.chaturanga.ui.theme.Typography
import kotlinx.coroutines.delay

@Composable
fun MainMenuScreen(
    onModeSelect: () -> Unit,
    onPuzzles: () -> Unit,
    onLessons: () -> Unit,
    onLanLobby: () -> Unit,
    onSettings: () -> Unit
) {
    var animateCards by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        delay(100)
        animateCards = true
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Dark)
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(24.dp))

        // Top Logo Block
        Text(
            text = "♚",
            fontSize = 40.sp,
            color = Gold
        )
        Text(
            text = "CHATURANGA",
            style = Typography.displayMedium,
            color = Gold2,
            letterSpacing = 1.sp
        )
        Text(
            text = "Ancient Indian Chess",
            style = Typography.bodySmall.copy(
                fontFamily = OutfitFontFamily,
                color = MutedColor
            )
        )

        Spacer(modifier = Modifier.height(36.dp))

        // Staggered Entrance Cards
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            AnimatedVisibility(
                visible = animateCards,
                enter = slideInVertically(animationSpec = tween(400)) { it / 2 } + fadeIn(animationSpec = tween(400))
            ) {
                MenuCard(
                    icon = "⚔",
                    title = "Play",
                    subtitle = "Hot Seat · Pass & Play · vs Bot",
                    onClick = onModeSelect
                )
            }

            AnimatedVisibility(
                visible = animateCards,
                enter = slideInVertically(animationSpec = tween(400, delayMillis = 100)) { it / 2 } + fadeIn(animationSpec = tween(400, delayMillis = 100))
            ) {
                MenuCard(
                    icon = "🧩",
                    title = "Puzzles",
                    subtitle = "50 sophisticated challenges",
                    onClick = onPuzzles
                )
            }

            AnimatedVisibility(
                visible = animateCards,
                enter = slideInVertically(animationSpec = tween(400, delayMillis = 200)) { it / 2 } + fadeIn(animationSpec = tween(400, delayMillis = 200))
            ) {
                MenuCard(
                    icon = "📖",
                    title = "Lessons",
                    subtitle = "Learn the ancient rules step-by-step",
                    onClick = onLessons
                )
            }

            AnimatedVisibility(
                visible = animateCards,
                enter = slideInVertically(animationSpec = tween(400, delayMillis = 300)) { it / 2 } + fadeIn(animationSpec = tween(400, delayMillis = 300))
            ) {
                MenuCard(
                    icon = "🏟",
                    title = "Tournament",
                    subtitle = "Local WiFi multiplayer · 2-4 active players",
                    onClick = onLanLobby
                )
            }
        }

        Spacer(modifier = Modifier.height(36.dp))

        // Bottom Bar with Settings Button
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 12.dp),
            contentAlignment = Alignment.CenterEnd
        ) {
            ParchmentCard(
                modifier = Modifier
                    .width(48.dp)
                    .height(48.dp)
                    .clickable { onSettings() },
                isOrnate = false
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "⚙",
                        fontSize = 18.sp,
                        color = Gold,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
fun MenuCard(
    icon: String,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    ParchmentCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = icon,
                fontSize = 24.sp,
                color = Gold,
                modifier = Modifier.padding(end = 16.dp)
            )

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = Typography.titleLarge.copy(
                        fontFamily = CinzelFontFamily,
                        color = Gold2
                    )
                )
                Text(
                    text = subtitle,
                    style = Typography.bodySmall.copy(
                        fontFamily = OutfitFontFamily,
                        color = MutedColor
                    )
                )
            }

            Text(
                text = "›",
                fontSize = 20.sp,
                color = Gold.copy(alpha = 0.4f),
                modifier = Modifier.padding(start = 8.dp)
            )
        }
    }
}
