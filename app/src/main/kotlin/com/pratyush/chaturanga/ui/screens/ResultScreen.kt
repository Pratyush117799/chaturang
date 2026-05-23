package com.pratyush.chaturanga.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pratyush.chaturanga.model.GameResult
import com.pratyush.chaturanga.ui.components.*
import com.pratyush.chaturanga.ui.theme.*

@Composable
fun ResultScreen(
    result: GameResult,
    onPlayAgain: () -> Unit,
    onMainMenu: () -> Unit
) {
    val scrollState = rememberScrollState()

    // Pick lore based on results
    val loreNarrative = when {
        result.winnerName.lowercase().contains("forfeit") -> {
            "\"He who runs from a battle loses honor before he loses his head.\" — Chanakya Niti"
        }
        result.winnerId == 0 -> {
            "\"Victory belongs to the side of righteousness and strategy.\" — Mahabharata"
        }
        result.mode == "puzzle" -> {
            "\"The wise solver unravels the knots of destiny. Drona smiles upon your intellect.\""
        }
        else -> {
            "\"The field is conquered, the Raja is captured. A new emperor claims the Ashtāpada!\""
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Dark)
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth(0.9f)
                .verticalScroll(scrollState),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "✦ Battle Concluded ✦",
                fontFamily = Cinzel,
                fontWeight = FontWeight.Bold,
                color = Gold,
                fontSize = 28.sp,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            GoldDivider(modifier = Modifier.width(180.dp))

            Spacer(modifier = Modifier.height(24.dp))

            ParchmentCard(
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "VICTORIOUS",
                        fontFamily = CormorantGaramond,
                        fontWeight = FontWeight.Bold,
                        color = Muted,
                        fontSize = 14.sp
                    )

                    Text(
                        text = result.winnerName.ifBlank { "Player 1" },
                        fontFamily = Cinzel,
                        fontWeight = FontWeight.Bold,
                        color = Gold,
                        fontSize = 24.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = loreNarrative,
                        fontFamily = CormorantGaramond,
                        color = TextColor,
                        fontSize = 16.sp,
                        textAlign = TextAlign.Center,
                        lineHeight = 22.sp
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    // Stats summary
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("TURNS", fontSize = 11.sp, color = Muted)
                            Text("${result.turnCount}", fontSize = 18.sp, color = Gold, fontWeight = FontWeight.Bold)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("DHARMA", fontSize = 11.sp, color = Muted)
                            Text("+${result.dharmaScore}", fontSize = 18.sp, color = Gold, fontWeight = FontWeight.Bold)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("CAPTURES", fontSize = 11.sp, color = Muted)
                            Text("${result.captures}", fontSize = 18.sp, color = Gold, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            ChaturangaButton(
                text = "Play Again",
                onClick = onPlayAgain,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(12.dp))

            GhostButton(
                text = "Main Menu",
                onClick = onMainMenu,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}
