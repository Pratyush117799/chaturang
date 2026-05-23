package com.pratyush.chaturanga.model

data class ChaturangaPreferences(
    val player1Name: String = "Player 1",
    val player2Name: String = "Player 2",
    val player3Name: String = "Player 3",
    val player4Name: String = "Player 4",
    val botDifficulty: Int = 600,
    val hapticEnabled: Boolean = true,
    val showHints: Boolean = true,
    val completedPuzzleIds: Set<String> = emptySet(),
    val completedLessonIds: Set<String> = emptySet(),
    val lessonProgress: Map<String, Int> = emptyMap()
)
