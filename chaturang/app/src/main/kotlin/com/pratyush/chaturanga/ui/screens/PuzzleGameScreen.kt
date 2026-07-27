package com.pratyush.chaturanga.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.pratyush.chaturanga.data.PuzzleRepository
import com.pratyush.chaturanga.model.Puzzle
import com.pratyush.chaturanga.ui.components.*
import com.pratyush.chaturanga.ui.theme.*
import com.pratyush.chaturanga.utils.HapticUtils
import com.pratyush.chaturanga.viewmodel.PuzzleViewModel
import com.pratyush.chaturanga.webview.GameWebView
import com.pratyush.chaturanga.webview.JsBridgeEvent

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PuzzleGameScreen(
    puzzleId: String,
    onSolved: (String, Int) -> Unit,
    onBack: () -> Unit,
    viewModel: PuzzleViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    var puzzle by remember { mutableStateOf<Puzzle?>(null) }
    var webViewRef by remember { mutableStateOf<android.webkit.WebView?>(null) }
    var currentTurnIndex by remember { mutableIntStateOf(0) }
    var showHintDialog by remember { mutableStateOf(false) }

    // Fetch the puzzle details
    LaunchedEffect(puzzleId) {
        val repo = PuzzleRepository(context)
        puzzle = repo.getPuzzleById(puzzleId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = puzzle?.title ?: "Chaturanga Puzzle",
                            fontFamily = CormorantGaramond,
                            fontWeight = FontWeight.Bold,
                            color = Gold,
                            fontSize = 20.sp
                        )
                        puzzle?.let {
                            Text(
                                text = "Difficulty: ${it.difficulty.replaceFirstChar { c -> c.uppercase() }} (ELO ${it.rating})",
                                fontSize = 11.sp,
                                color = Muted,
                                fontFamily = FontFamily.SansSerif
                            )
                        }
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Text("←", color = Gold, fontSize = 24.sp)
                    }
                },
                actions = {
                    IconButton(onClick = { showHintDialog = true }) {
                        Text("💡", fontSize = 20.sp)
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
                // Goal description banner
                puzzle?.let { p ->
                    ParchmentCard(
                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                text = "Objective: ${p.goalDescription}",
                                fontWeight = FontWeight.Bold,
                                color = Gold,
                                fontSize = 13.sp
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = p.description,
                                color = TextColor,
                                fontSize = 12.sp
                            )
                        }
                    }
                }

                // WebView containing board State
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .aspectRatio(1f)
                        .background(Dark2),
                    contentAlignment = Alignment.Center
                ) {
                    puzzle?.let { p ->
                        GameWebView(
                            gameMode = "puzzle",
                            botDifficulty = 600,
                            lanRoomId = p.id,
                            lanServerUrl = "",
                            onBridgeEvent = { event ->
                                when (event) {
                                    is JsBridgeEvent.MoveExecuted -> {
                                        currentTurnIndex++
                                        HapticUtils.vibrateMove(context)
                                    }
                                    is JsBridgeEvent.GameOver -> {
                                        HapticUtils.vibrateGameOver(context)
                                        // Mark puzzle as solved locally
                                        viewModel.markPuzzleSolved(p.id)
                                        onSolved(p.id, currentTurnIndex)
                                    }
                                    else -> {}
                                }
                            },
                            onWebViewCreated = { webViewRef = it },
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Bottom actions / Reset button
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    GhostButton(
                        text = "Reset Puzzle",
                        onClick = {
                            webViewRef?.reload()
                            currentTurnIndex = 0
                        },
                        modifier = Modifier.weight(1f).padding(horizontal = 4.dp)
                    )
                }
            }

            // Hint Dialog
            if (showHintDialog) {
                AlertDialog(
                    onDismissRequest = { showHintDialog = false },
                    title = {
                        Text(
                            text = "Drona's Guidance",
                            fontFamily = CormorantGaramond,
                            fontWeight = FontWeight.Bold,
                            color = Gold
                        )
                    },
                    text = {
                        Text(
                            text = puzzle?.hintText ?: "Observe the position and think strategically.",
                            color = TextColor
                        )
                    },
                    confirmButton = {
                        TextButton(onClick = { showHintDialog = false }) {
                            Text("Acknowledge", color = Gold)
                        }
                    },
                    containerColor = Dark2
                )
            }
        }
    }
}
