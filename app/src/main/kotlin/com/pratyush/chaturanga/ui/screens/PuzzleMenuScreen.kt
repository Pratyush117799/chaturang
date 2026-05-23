package com.pratyush.chaturanga.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.pratyush.chaturanga.model.Puzzle
import com.pratyush.chaturanga.ui.components.*
import com.pratyush.chaturanga.ui.theme.*
import com.pratyush.chaturanga.viewmodel.PuzzleViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PuzzleMenuScreen(
    onPuzzleSelected: (Puzzle) -> Unit,
    onBack: () -> Unit,
    viewModel: PuzzleViewModel = hiltViewModel()
) {
    val filteredPuzzles by viewModel.filteredPuzzles.collectAsState()
    val completedPuzzleIds by viewModel.completedPuzzleIds.collectAsState()
    val selectedDifficulty by viewModel.selectedDifficulty.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Ashtāpada Puzzles",
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
            // Difficulty selectors
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                listOf("beginner", "intermediate", "advanced").forEach { diff ->
                    val isSelected = selectedDifficulty == diff
                    Surface(
                        modifier = Modifier
                            .weight(1f)
                            .padding(horizontal = 4.dp)
                            .clickable { viewModel.selectDifficulty(diff) },
                        shape = RoundedCornerShape(8.dp),
                        color = if (isSelected) Gold else Dark2,
                        border = BorderStroke(1.dp, if (isSelected) Gold else Border),
                    ) {
                        Box(
                            modifier = Modifier.padding(vertical = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = diff.replaceFirstChar { it.uppercase() },
                                color = if (isSelected) Dark else TextColor,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }
                    }
                }
            }

            // Puzzles list
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredPuzzles) { puzzle ->
                    val isSolved = puzzle.id in completedPuzzleIds
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onPuzzleSelected(puzzle) },
                        shape = RoundedCornerShape(8.dp),
                        color = Dark2,
                        border = BorderStroke(1.dp, if (isSolved) Gold.copy(alpha = 0.5f) else Border)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = puzzle.title,
                                    fontFamily = CormorantGaramond,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 18.sp,
                                    color = if (isSolved) Gold else TextColor
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Row(
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "ELO ${puzzle.rating}",
                                        fontSize = 12.sp,
                                        color = Muted
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "•",
                                        fontSize = 12.sp,
                                        color = Muted
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = puzzle.goalDescription,
                                        fontSize = 12.sp,
                                        color = Muted
                                    )
                                }
                            }

                            if (isSolved) {
                                Text(
                                    text = "✓ Solved",
                                    fontSize = 12.sp,
                                    color = Gold,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(start = 8.dp)
                                )
                            } else {
                                Text(
                                    text = "→",
                                    fontSize = 18.sp,
                                    color = Gold,
                                    modifier = Modifier.padding(start = 8.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
