package com.pratyush.chaturanga.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import com.pratyush.chaturanga.viewmodel.SettingsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onBack: () -> Unit,
    viewModel: SettingsViewModel = hiltViewModel()
) {
    val prefs by viewModel.preferences.collectAsState()
    val scrollState = rememberScrollState()
    var showResetDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Settings",
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(scrollState),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Player Names Configuration Card
            ParchmentCard(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "Player Names",
                        fontFamily = CormorantGaramond,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = Gold
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    val names = listOf(prefs.player1Name, prefs.player2Name, prefs.player3Name, prefs.player4Name)
                    names.forEachIndexed { index, name ->
                        var tempName by remember(name) { mutableStateOf(name) }
                        OutlinedTextField(
                            value = tempName,
                            onValueChange = {
                                tempName = it
                                viewModel.updatePlayerName(index, it)
                            },
                            label = { Text("Player ${index + 1}", color = Muted) },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Gold,
                                unfocusedBorderColor = Border,
                                focusedLabelColor = Gold,
                                cursorColor = Gold,
                                focusedTextColor = TextColor,
                                unfocusedTextColor = TextColor
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                        )
                    }
                }
            }

            // Audio & Haptics Card
            ParchmentCard(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "Preferences",
                        fontFamily = CormorantGaramond,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = Gold
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Haptic Feedback", color = TextColor, fontSize = 14.sp)
                            Text("Vibrate on moves and rolls", color = Muted, fontSize = 11.sp)
                        }
                        Switch(
                            checked = prefs.hapticEnabled,
                            onCheckedChange = { viewModel.updateHapticEnabled(it) },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Dark,
                                checkedTrackColor = Gold,
                                uncheckedThumbColor = Muted,
                                uncheckedTrackColor = Dark2
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Show Hints", color = TextColor, fontSize = 14.sp)
                            Text("Highlight eligible tiles in-game", color = Muted, fontSize = 11.sp)
                        }
                        Switch(
                            checked = prefs.showHints,
                            onCheckedChange = { viewModel.updateShowHints(it) },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Dark,
                                checkedTrackColor = Gold,
                                uncheckedThumbColor = Muted,
                                uncheckedTrackColor = Dark2
                            )
                        )
                    }
                }
            }

            // System Reset
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp),
                color = Dark2,
                border = BorderStroke(1.dp, Red.copy(alpha = 0.5f))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "Danger Zone",
                        fontFamily = CormorantGaramond,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = Red
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Wipe all local records including solved puzzles and completed lessons.",
                        color = Muted,
                        fontSize = 12.sp
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    ChaturangaButton(
                        text = "Reset All Progress",
                        onClick = { showResetDialog = true },
                        modifier = Modifier.fillMaxWidth(),
                        color = Red
                    )
                }
            }
        }

        // Reset dialog confirmation
        if (showResetDialog) {
            AlertDialog(
                onDismissRequest = { showResetDialog = false },
                title = {
                    Text(
                        "Reset Progress?",
                        fontFamily = CormorantGaramond,
                        fontWeight = FontWeight.Bold,
                        color = Red
                    )
                },
                text = {
                    Text(
                        "This will permanently delete all completed puzzles and lessons. This action cannot be undone.",
                        color = TextColor
                    )
                },
                confirmButton = {
                    TextButton(
                        onClick = {
                            viewModel.resetAllProgress()
                            showResetDialog = false
                        }
                    ) {
                        Text("Reset", color = Red)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showResetDialog = false }) {
                        Text("Cancel", color = Gold)
                    }
                },
                containerColor = Dark2
            )
        }
    }
}
