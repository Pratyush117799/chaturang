package com.pratyush.chaturanga.ui.screens

import android.net.Uri
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.pratyush.chaturanga.ui.components.*
import com.pratyush.chaturanga.ui.theme.*
import com.pratyush.chaturanga.viewmodel.LanViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun JoinLobbyScreen(
    onRoomJoined: (String) -> Unit,
    onBack: () -> Unit,
    viewModel: LanViewModel = hiltViewModel()
) {
    val isConnected by viewModel.isConnected.collectAsState()
    val isConnecting by viewModel.isConnecting.collectAsState()
    val rooms by viewModel.rooms.collectAsState()
    val connectionError by viewModel.connectionError.collectAsState()
    val currentRoom by viewModel.currentRoom.collectAsState()

    var manualIpInput by remember { mutableStateOf("") }
    var useScanner by remember { mutableStateOf(false) }

    LaunchedEffect(currentRoom) {
        currentRoom?.let { room ->
            onRoomJoined(room.roomId)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Join Tournament",
                        fontFamily = CormorantGaramond,
                        fontWeight = FontWeight.Bold,
                        color = Gold,
                        fontSize = 22.sp
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
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
                    .fillMaxWidth(0.9f)
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                if (!isConnected) {
                    // Connect screen
                    Text(
                        text = "Connect to Host",
                        fontFamily = Cinzel,
                        fontWeight = FontWeight.Bold,
                        color = Gold,
                        fontSize = 20.sp
                    )

                    connectionError?.let {
                        Text(
                            text = "Error: $it",
                            color = Red,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                    }

                    if (useScanner) {
                        // QR Code Scanner View
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(250.dp)
                                .background(Dark2),
                            contentAlignment = Alignment.Center
                        ) {
                            QrScannerView(
                                onQrScanned = { qrContent ->
                                    try {
                                        // Deep link scheme: chaturanga://join?host=192.168.1.100&ws=8765
                                        val uri = Uri.parse(qrContent)
                                        val host = uri.getQueryParameter("host")
                                        val port = uri.getQueryParameter("ws") ?: "8765"
                                        if (host != null) {
                                            viewModel.connectToHost("ws://$host:$port")
                                            useScanner = false
                                        }
                                    } catch (e: Exception) {
                                        // Ignore malformed QR
                                    }
                                },
                                modifier = Modifier.fillMaxSize()
                            )
                        }

                        GhostButton(
                            text = "Use Manual IP",
                            onClick = { useScanner = false },
                            modifier = Modifier.fillMaxWidth()
                        )
                    } else {
                        // Manual IP field
                        ParchmentCard(modifier = Modifier.fillMaxWidth()) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "Enter Host IP Address",
                                    color = Gold,
                                    fontFamily = CormorantGaramond,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                OutlinedTextField(
                                    value = manualIpInput,
                                    onValueChange = { manualIpInput = it },
                                    placeholder = { Text("e.g. 192.168.1.100", color = Muted) },
                                    singleLine = true,
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = Gold,
                                        unfocusedBorderColor = Border,
                                        focusedTextColor = TextColor,
                                        unfocusedTextColor = TextColor,
                                        cursorColor = Gold
                                    ),
                                    modifier = Modifier.fillMaxWidth()
                                )
                            }
                        }

                        ChaturangaButton(
                            text = if (isConnecting) "Connecting..." else "Connect",
                            onClick = {
                                if (manualIpInput.isNotBlank()) {
                                    viewModel.connectToHost("ws://${manualIpInput.trim()}:8765")
                                }
                            },
                            enabled = !isConnecting && manualIpInput.isNotBlank(),
                            modifier = Modifier.fillMaxWidth()
                        )

                        GhostButton(
                            text = "Scan Host QR Code",
                            onClick = { useScanner = true },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                } else {
                    // Lobby Rooms list
                    Text(
                        text = "Available Rooms",
                        fontFamily = Cinzel,
                        fontWeight = FontWeight.Bold,
                        color = Gold,
                        fontSize = 20.sp
                    )

                    if (rooms.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(200.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "No active game lobbies. Waiting for host to create a room...",
                                color = Muted,
                                fontSize = 13.sp,
                                textAlign = TextAlign.Center
                            )
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            items(rooms) { room ->
                                ParchmentCard(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable { viewModel.joinRoom(room.roomId) }
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(16.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column {
                                            Text(
                                                text = room.name,
                                                fontWeight = FontWeight.Bold,
                                                color = Gold,
                                                fontSize = 16.sp
                                            )
                                            Spacer(modifier = Modifier.height(2.dp))
                                            Text(
                                                text = "${room.players.size}/${room.maxPlayers} Players Joined",
                                                color = TextColor,
                                                fontSize = 12.sp
                                            )
                                        }
                                        Text(
                                            text = "Join →",
                                            color = Gold,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp
                                        )
                                    }
                                }
                            }
                        }
                    }

                    GhostButton(
                        text = "Disconnect",
                        onClick = { viewModel.stopHosting() },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
    }
}
