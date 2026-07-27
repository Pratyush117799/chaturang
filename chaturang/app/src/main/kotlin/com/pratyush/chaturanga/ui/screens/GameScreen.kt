package com.pratyush.chaturanga.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.pratyush.chaturanga.model.GameConfig
import com.pratyush.chaturanga.model.GameResult
import com.pratyush.chaturanga.ui.components.*
import com.pratyush.chaturanga.ui.theme.*
import com.pratyush.chaturanga.utils.HapticUtils
import com.pratyush.chaturanga.viewmodel.GameViewModel
import com.pratyush.chaturanga.webview.GameWebView
import com.pratyush.chaturanga.webview.JsBridgeEvent
import kotlinx.coroutines.flow.collectLatest

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GameScreen(
    config: GameConfig,
    onGameOver: (GameResult) -> Unit,
    onBack: () -> Unit,
    viewModel: GameViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val passDevicePrompt by viewModel.passDevicePrompt.collectAsState()
    val diceValue by viewModel.diceValue.collectAsState()
    val isDiceSpinning by viewModel.isDiceSpinning.collectAsState()
    val lastMoveInfo by viewModel.lastMoveInfo.collectAsState()
    val gameResult by viewModel.gameResult.collectAsState()

    var showForfeitDialog by remember { mutableStateOf(false) }
    var webViewRef by remember { mutableStateOf<android.webkit.WebView?>(null) }
    
    // Config states
    var currentPlayerIndex by remember { mutableIntStateOf(0) }
    var playerNames by remember { mutableStateOf(listOf("Player 1", "Player 2", "Player 3", "Player 4")) }

    LaunchedEffect(config) {
        viewModel.setConfig(config)
    }

    LaunchedEffect(gameResult) {
        gameResult?.let {
            onGameOver(it)
            viewModel.clearResult()
        }
    }

    // Monitor bridge events to play haptics
    LaunchedEffect(Unit) {
        viewModel.gameEvent.collectLatest { event ->
            when (event) {
                is JsBridgeEvent.DiceRolled -> {
                    HapticUtils.vibrateDice(context)
                }
                is JsBridgeEvent.MoveExecuted -> {
                    if (event.capturedPiece != null) {
                        HapticUtils.vibrateCapture(context)
                    } else {
                        HapticUtils.vibrateMove(context)
                    }
                }
                is JsBridgeEvent.GameOver -> {
                    HapticUtils.vibrateGameOver(context)
                }
                is JsBridgeEvent.PlayerTurnChanged -> {
                    currentPlayerIndex = event.playerIndex
                }
                else -> {}
            }
        }
    }

    BackPressHandler(
        onBackPressed = { showForfeitDialog = true }
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = when (config.mode) {
                                "hotseat" -> "Hot Seat Match"
                                "passplay" -> "Pass & Play"
                                "vsbot" -> "vs Drona (AI)"
                                "lan_client" -> "LAN Tournament"
                                else -> "Chaturanga Match"
                            },
                            fontFamily = CormorantGaramond,
                            fontWeight = FontWeight.Bold,
                            color = Gold,
                            fontSize = 20.sp
                        )
                        lastMoveInfo?.let {
                            Text(
                                text = "Last Move: $it",
                                fontSize = 12.sp,
                                color = Muted,
                                fontFamily = FontFamily.SansSerif
                            )
                        }
                    }
                },
                navigationIcon = {
                    IconButton(onClick = { showForfeitDialog = true }) {
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
                .background(Dark)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                // Players list / chips
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    playerNames.take(if (config.mode == "vsbot") 2 else 4).forEachIndexed { index, name ->
                        PlayerChip(
                            name = name,
                            colorIndex = index,
                            isActive = currentPlayerIndex == index,
                            modifier = Modifier.weight(1f).padding(horizontal = 2.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // The WebView container
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .aspectRatio(1f)
                        .background(Dark2),
                    contentAlignment = Alignment.Center
                ) {
                    GameWebView(
                        gameMode = config.mode,
                        botDifficulty = config.botDifficulty,
                        lanRoomId = config.lanRoomId ?: "",
                        lanServerUrl = config.lanServerUrl ?: "",
                        onBridgeEvent = { viewModel.onBridgeEvent(it) },
                        onWebViewCreated = { webViewRef = it },
                        modifier = Modifier.fillMaxSize()
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Dice area
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 24.dp),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    DiceView(
                        diceValue = diceValue,
                        isSpinning = isDiceSpinning,
                        onClick = {
                            // Tell web engine to roll dice
                            webViewRef?.evaluateJavascript("window.triggerDiceRoll();", null)
                        }
                    )
                }
            }

            // Pass Device Modal Overlay
            AnimatedVisibility(
                visible = passDevicePrompt != null,
                enter = fadeIn(),
                exit = fadeOut()
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.9f)),
                    contentAlignment = Alignment.Center
                ) {
                    ParchmentCard(
                        modifier = Modifier
                            .fillMaxWidth(0.85f)
                            .padding(16.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "✦ Pass Device ✦",
                                fontFamily = CormorantGaramond,
                                fontWeight = FontWeight.Bold,
                                color = Gold,
                                fontSize = 24.sp
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Pass the device to",
                                color = TextColor,
                                fontSize = 16.sp
                            )
                            Text(
                                text = passDevicePrompt ?: "",
                                fontFamily = Cinzel,
                                fontWeight = FontWeight.Bold,
                                color = Gold,
                                fontSize = 20.sp,
                                modifier = Modifier.padding(vertical = 8.dp)
                            )
                            Text(
                                text = "Tap ready when you are holding the device.",
                                color = Muted,
                                fontSize = 12.sp,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(24.dp))
                            ChaturangaButton(
                                text = "I am Ready",
                                onClick = {
                                    webViewRef?.evaluateJavascript("window.confirmPassDevice();", null)
                                    viewModel.dismissPassDevicePrompt()
                                }
                            )
                        }
                    }
                }
            }

            // Forfeit dialog
            if (showForfeitDialog) {
                AlertDialog(
                    onDismissRequest = { showForfeitDialog = false },
                    title = {
                        Text(
                            text = "Forfeit Match?",
                            fontFamily = CormorantGaramond,
                            fontWeight = FontWeight.Bold,
                            color = Gold
                        )
                    },
                    text = {
                        Text(
                            text = "Are you sure you want to end this game? Your progress will be lost.",
                            color = TextColor
                        )
                    },
                    confirmButton = {
                        TextButton(
                            onClick = {
                                showForfeitDialog = false
                                onBack()
                            }
                        ) {
                            Text("Yes, Forfeit", color = Red)
                        }
                    },
                    dismissButton = {
                        TextButton(onClick = { showForfeitDialog = false }) {
                            Text("Resume Game", color = Gold)
                        }
                    },
                    containerColor = Dark2
                )
            }
        }
    }
}
