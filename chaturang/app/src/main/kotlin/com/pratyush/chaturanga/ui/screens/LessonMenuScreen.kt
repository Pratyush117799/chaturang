package com.pratyush.chaturanga.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.pratyush.chaturanga.model.Lesson
import com.pratyush.chaturanga.ui.components.*
import com.pratyush.chaturanga.ui.theme.*
import com.pratyush.chaturanga.viewmodel.LessonViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LessonMenuScreen(
    onLessonSelected: (Lesson) -> Unit,
    onBack: () -> Unit,
    viewModel: LessonViewModel = hiltViewModel()
) {
    val lessons by viewModel.lessons.collectAsState()
    val completedLessonIds by viewModel.completedLessonIds.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Dronāchārya's Academy",
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
        ) {
            Text(
                text = "\"A warrior who knows the nature of his weapons is twice as lethal in battle.\" — Ashtāpada Lore",
                fontFamily = CormorantGaramond,
                color = Muted,
                fontSize = 14.sp,
                lineHeight = 18.sp,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(lessons) { lesson ->
                    val isCompleted = lesson.id in completedLessonIds
                    val isUnlocked = viewModel.isUnlocked(lesson.id, completedLessonIds)

                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(enabled = isUnlocked) { onLessonSelected(lesson) },
                        shape = RoundedCornerShape(8.dp),
                        color = if (isUnlocked) Dark2 else Dark2.copy(alpha = 0.5f),
                        border = BorderStroke(1.dp, if (isCompleted) Gold.copy(alpha = 0.5f) else Border.copy(alpha = if (isUnlocked) 1f else 0.3f))
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = lesson.title,
                                        fontFamily = CormorantGaramond,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 18.sp,
                                        color = if (isUnlocked) (if (isCompleted) Gold else TextColor) else TextColor.copy(alpha = 0.4f)
                                    )
                                    if (lesson.titleSanskrit.isNotEmpty()) {
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = "(${lesson.titleSanskrit})",
                                            fontFamily = Cinzel,
                                            fontSize = 11.sp,
                                            color = Muted.copy(alpha = if (isUnlocked) 1f else 0.4f)
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = lesson.description,
                                    fontSize = 12.sp,
                                    color = if (isUnlocked) TextColor.copy(alpha = 0.7f) else TextColor.copy(alpha = 0.3f)
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Row {
                                    Text(
                                        text = "${lesson.estimatedMinutes} mins",
                                        fontSize = 11.sp,
                                        color = Muted
                                    )
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Text(
                                        text = "Featured: ${lesson.piecesFeatured.joinToString { it.replaceFirstChar { c -> c.uppercase() } }}",
                                        fontSize = 11.sp,
                                        color = Muted
                                    )
                                }
                            }

                            Box(
                                modifier = Modifier.padding(start = 12.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                when {
                                    isCompleted -> {
                                        Text("✓", color = Gold, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                                    }
                                    !isUnlocked -> {
                                        Text("🔒", fontSize = 16.sp)
                                    }
                                    else -> {
                                        Text("→", color = Gold, fontSize = 18.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
