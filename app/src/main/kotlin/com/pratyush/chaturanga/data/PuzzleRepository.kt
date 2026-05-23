package com.pratyush.chaturanga.data

import android.content.Context
import com.pratyush.chaturanga.model.Puzzle
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PuzzleRepository @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private var cachedPuzzles: List<Puzzle>? = null
    private val json = Json { ignoreUnknownKeys = true; coerceInputValues = true }

    suspend fun getAllPuzzles(): List<Puzzle> {
        cachedPuzzles?.let { return it }
        return try {
            val raw = context.assets.open("game/data/puzzles.json").bufferedReader().readText()
            val puzzles = json.decodeFromString<List<Puzzle>>(raw)
            cachedPuzzles = puzzles
            puzzles
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    suspend fun getPuzzleById(id: String): Puzzle? = getAllPuzzles().find { it.id == id }

    suspend fun getDifficultyGroups(): Map<String, List<Puzzle>> {
        val all = getAllPuzzles()
        return mapOf(
            "beginner"     to all.filter { it.difficulty == "beginner" },
            "intermediate" to all.filter { it.difficulty == "intermediate" },
            "advanced"     to all.filter { it.difficulty == "advanced" }
        )
    }
}
