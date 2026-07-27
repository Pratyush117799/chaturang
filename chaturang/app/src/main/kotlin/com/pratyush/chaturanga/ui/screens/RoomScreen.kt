package com.pratyush.chaturanga.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.pratyush.chaturanga.ui.components.*
import com.pratyush.chaturanga.ui.theme.*
import com.pratyush.chaturanga.viewmodel.LanViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RoomScreen(
    roomId: String,
    isHost: Boolean,
    onMatchStarted: (String, String) -> Unit,
    onBack: () -> Unit,
    viewModel: LanViewModel = hiltViewModel()
) {
    val currentRoom by viewModel.currentRoom.collectAsState()
    val gameStartUrl by viewModel.gameStartUrl.collectAsState()

    LaunchedEffect(gameStartUrl) {
        gameStartUrl?.let { url ->
            onMatchStarted(roomId, url)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        currentRoom?.name ?: "Waiting Room",
                        fontFamily = CormorantGaramond,
                        fontWeight = FontWeight.Bold,
                        color = Gold,
                        fontSize = 22.sp
                    )
                },
                navigationIcon = {
                    IconButton(
                        onClick = {
                            viewModel.leaveRoom()
                            onBack()
                        }
                    ) {
                        Text("←", color = Gold, fontSize = 24.sp)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Dark,
                    titleContentColor = Gold
                )
            )
        },
        containerColor = Dark
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Dark),
            contentAlignment = Alignment.Center
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth(0.85f)
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                Text(
                    text = "Room Code: $roomId",
                    fontFamily = Cinzel,
                    fontWeight = FontWeight.Bold,
                    color = Gold,
                    fontSize = 24.sp
                )

                Text(
                    text = "Players in Lobby",
                    color = Muted,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )

                // List of players currently in the lobby
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    val playersList = currentRoom?.players ?: emptyList()
                    repeat(4) { idx ->
                        val hasPlayer = idx < playersList.size
                        ParchmentCard(
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = if (hasPlayer) playersList[idx] else "Empty Slot",
                                    color = if (hasPlayer) TextColor else Muted,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )

                                if (hasPlayer) {
                                    Text(
                                        text = if (idx == 0) "👑 Host" else "✓ Joined",
                                        color = if (idx == 0) Gold else Muted,
                                        fontSize = 12.sp
                                    )
                                } else {
                                    Text(
                                        text = "...",
                                        color = Muted,
                                        fontSize = 12.sp
                                    )
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                if (isHost) {
                    val canStart = (currentRoom?.players?.size ?: 0) >= 2
                    ChaturangaButton(
                        text = "Start Tournament",
                        onClick = { viewModel.readyUp() },
                        enabled = canStart,
                        modifier = Modifier.fillMaxWidth()
                    )
                    if (!canStart) {
                        Text(
                            text = "Waiting for at least 2 players to join...",
                            color = Muted,
                            fontSize = 11.sp,
                            textAlign = TextAlign.Center
                        )
                    }
                } else {
                    Box(
                        modifier = Modifier.fillMaxWidth(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = Gold, strokeWidth = 2.dp)
                    }
                    Text(
                        text = "Waiting for host to start the battle...",
                        color = Muted,
                        fontSize = 13.sp,
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
    }
}
