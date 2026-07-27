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
import com.pratyush.chaturanga.data.LessonRepository
import com.pratyush.chaturanga.model.Lesson
import com.pratyush.chaturanga.ui.components.*
import com.pratyush.chaturanga.ui.theme.*
import com.pratyush.chaturanga.utils.HapticUtils
import com.pratyush.chaturanga.viewmodel.LessonViewModel
import com.pratyush.chaturanga.webview.GameWebView
import com.pratyush.chaturanga.webview.JsBridgeEvent

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LessonScreen(
    lessonId: String,
    onComplete: () -> Unit,
    onBack: () -> Unit,
    viewModel: LessonViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    var lesson by remember { mutableStateOf<Lesson?>(null) }
    var webViewRef by remember { mutableStateOf<android.webkit.WebView?>(null) }
    var currentStepIndex by remember { mutableIntStateOf(0) }
    var instructionText by remember { mutableStateOf("Welcome to the lesson. Study the board configuration.") }

    LaunchedEffect(lessonId) {
        val repo = LessonRepository()
        lesson = repo.getLessonById(lessonId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = lesson?.title ?: "Chaturanga Lesson",
                            fontFamily = CormorantGaramond,
                            fontWeight = FontWeight.Bold,
                            color = Gold,
                            fontSize = 20.sp
                        )
                        lesson?.let {
                            Text(
                                text = "Step ${currentStepIndex + 1} of ${it.totalSteps}",
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
                // Lesson instructions banner
                ParchmentCard(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Instruction:",
                            fontWeight = FontWeight.Bold,
                            color = Gold,
                            fontSize = 13.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = instructionText,
                            color = TextColor,
                            fontSize = 14.sp,
                            lineHeight = 18.sp
                        )
                    }
                }

                // WebView container
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .aspectRatio(1f)
                        .background(Dark2),
                    contentAlignment = Alignment.Center
                ) {
                    lesson?.let { l ->
                        GameWebView(
                            gameMode = "lesson",
                            botDifficulty = 600,
                            lanRoomId = l.id,
                            lanServerUrl = "",
                            onBridgeEvent = { event ->
                                when (event) {
                                    is JsBridgeEvent.LessonStepProgress -> {
                                        currentStepIndex = event.stepIndex
                                        instructionText = event.instruction
                                        viewModel.saveLessonProgress(l.id, event.stepIndex)
                                        HapticUtils.vibrateMove(context)
                                    }
                                    is JsBridgeEvent.GameOver -> {
                                        // Lesson completed!
                                        HapticUtils.vibrateGameOver(context)
                                        viewModel.markLessonComplete(l.id)
                                        onComplete()
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

                // Reset step button
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp),
                    horizontalArrangement = Arrangement.Center
                ) {
                    GhostButton(
                        text = "Reset Step",
                        onClick = {
                            webViewRef?.evaluateJavascript("window.resetLessonStep();", null)
                        },
                        modifier = Modifier.fillMaxWidth(0.5f)
                    )
                }
            }
        }
    }
}
