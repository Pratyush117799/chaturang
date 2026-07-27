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
fun LanLobbyScreen(
    onHost: () -> Unit,
    onJoin: () -> Unit,
    onBack: () -> Unit,
    viewModel: LanViewModel = hiltViewModel()
) {
    var nameInput by remember { mutableStateOf("") }
    val currentName by viewModel.playerName.collectAsState()

    LaunchedEffect(currentName) {
        if (nameInput.isEmpty()) {
            nameInput = currentName
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Local Tournament",
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
                    .fillMaxWidth(0.85f)
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                Text(
                    text = "✦ Battle over WiFi ✦",
                    fontFamily = Cinzel,
                    fontWeight = FontWeight.Bold,
                    color = Gold,
                    fontSize = 22.sp,
                    textAlign = TextAlign.Center
                )

                Text(
                    text = "Establish a local lobby to challenge up to three other players on the same network connection.",
                    color = Muted,
                    fontSize = 13.sp,
                    textAlign = TextAlign.Center,
                    lineHeight = 18.sp
                )

                ParchmentCard(modifier = Modifier.fillMaxWidth()) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Your Warrior Identity",
                            color = Gold,
                            fontFamily = CormorantGaramond,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        OutlinedTextField(
                            value = nameInput,
                            onValueChange = {
                                nameInput = it
                                viewModel.setPlayerName(it)
                            },
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

                Spacer(modifier = Modifier.height(8.dp))

                ChaturangaButton(
                    text = "Host Tournament",
                    onClick = {
                        viewModel.startHosting()
                        onHost()
                    },
                    modifier = Modifier.fillMaxWidth()
                )

                GhostButton(
                    text = "Join Match",
                    onClick = onJoin,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}
