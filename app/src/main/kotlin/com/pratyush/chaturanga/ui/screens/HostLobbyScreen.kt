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
fun HostLobbyScreen(
    onRoomCreated: (String) -> Unit,
    onBack: () -> Unit,
    viewModel: LanViewModel = hiltViewModel()
) {
    val localIpAddress by viewModel.localIpAddress.collectAsState()
    val qrCodeBitmap by viewModel.qrCodeBitmap.collectAsState()
    val currentRoom by viewModel.currentRoom.collectAsState()

    var lobbyNameInput by remember { mutableStateOf("Tournament Arena") }

    LaunchedEffect(currentRoom) {
        currentRoom?.let { room ->
            onRoomCreated(room.roomId)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Host Tournament",
                        fontFamily = CormorantGaramond,
                        fontWeight = FontWeight.Bold,
                        color = Gold,
                        fontSize = 22.sp
                    )
                },
                navigationIcon = {
                    IconButton(
                        onClick = {
                            viewModel.stopHosting()
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
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "Lobby QR Code",
                    fontFamily = Cinzel,
                    fontWeight = FontWeight.Bold,
                    color = Gold,
                    fontSize = 18.sp
                )

                QrCodeDisplay(
                    bitmap = qrCodeBitmap,
                    size = 200.dp
                )

                Spacer(modifier = Modifier.height(8.dp))

                localIpAddress?.let { ip ->
                    Text(
                        text = "IP: $ip",
                        fontFamily = Cinzel,
                        fontWeight = FontWeight.Bold,
                        color = Gold,
                        fontSize = 14.sp
                    )
                    Text(
                        text = "Make sure guests are connected to the same WiFi connection, then scan the QR code above or browse to: http://$ip:8080",
                        color = Muted,
                        fontSize = 12.sp,
                        textAlign = TextAlign.Center,
                        lineHeight = 16.sp
                    )
                } ?: Text(
                    text = "No Wi-Fi Connection. Please connect to a local WiFi network to host a tournament.",
                    color = Red,
                    fontSize = 12.sp,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = lobbyNameInput,
                    onValueChange = { lobbyNameInput = it },
                    label = { Text("Lobby Arena Name", color = Muted) },
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

                ChaturangaButton(
                    text = "Create Lobby",
                    onClick = {
                        viewModel.createRoom(lobbyNameInput)
                    },
                    enabled = localIpAddress != null,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}
