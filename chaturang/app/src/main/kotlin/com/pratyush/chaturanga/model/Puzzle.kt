package com.pratyush.chaturanga.model

import kotlinx.serialization.Serializable

@Serializable
data class PuzzleMove(
    val from: String,
    val to: String
)

@Serializable
data class Puzzle(
    val id: String,
    val sourceId: String = "",
    val title: String,
    val titleSanskrit: String = "",
    val difficulty: String,  // "beginner" | "intermediate" | "advanced"
    val category: String,   // "win-in-2" | "save-the-raja" | "ratha-hunt" | "danti-fork" | etc.
    val description: String,
    val boardState: Map<String, String>,
    val currentPlayer: Int = 0,
    val goalDescription: String,
    val hintText: String,
    val maxMoves: Int = 5,
    val rating: Int = 400,
    val forcedDice: List<Int> = emptyList(),
    val solution: List<PuzzleMove> = emptyList()
)
