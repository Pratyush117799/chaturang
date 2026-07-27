package com.pratyush.chaturanga.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import com.pratyush.chaturanga.model.ChaturangaPreferences
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import kotlinx.serialization.json.Json
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "chaturanga_prefs")

@Singleton
class PreferencesDataStore @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        val PLAYER_1_NAME = stringPreferencesKey("player_1_name")
        val PLAYER_2_NAME = stringPreferencesKey("player_2_name")
        val PLAYER_3_NAME = stringPreferencesKey("player_3_name")
        val PLAYER_4_NAME = stringPreferencesKey("player_4_name")
        val BOT_DIFFICULTY = intPreferencesKey("bot_difficulty")
        val HAPTIC_ENABLED = booleanPreferencesKey("haptic_enabled")
        val SHOW_HINTS = booleanPreferencesKey("show_hints")
        val COMPLETED_PUZZLES = stringPreferencesKey("completed_puzzles")
        val COMPLETED_LESSONS = stringPreferencesKey("completed_lessons")
        val LESSON_PROGRESS = stringPreferencesKey("lesson_progress")
    }

    val preferences: Flow<ChaturangaPreferences> = context.dataStore.data
        .catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
        }
        .map { prefs ->
            ChaturangaPreferences(
                player1Name = prefs[PLAYER_1_NAME] ?: "Player 1",
                player2Name = prefs[PLAYER_2_NAME] ?: "Player 2",
                player3Name = prefs[PLAYER_3_NAME] ?: "Player 3",
                player4Name = prefs[PLAYER_4_NAME] ?: "Player 4",
                botDifficulty = prefs[BOT_DIFFICULTY] ?: 600,
                hapticEnabled = prefs[HAPTIC_ENABLED] ?: true,
                showHints = prefs[SHOW_HINTS] ?: true,
                completedPuzzleIds = (prefs[COMPLETED_PUZZLES] ?: "").split(",").filter { it.isNotBlank() }.toSet(),
                completedLessonIds = (prefs[COMPLETED_LESSONS] ?: "").split(",").filter { it.isNotBlank() }.toSet(),
                lessonProgress = parseLessonProgress(prefs[LESSON_PROGRESS] ?: "{}")
            )
        }

    suspend fun updatePlayerName(playerIndex: Int, name: String) {
        context.dataStore.edit { prefs ->
            val key = when (playerIndex) {
                0 -> PLAYER_1_NAME
                1 -> PLAYER_2_NAME
                2 -> PLAYER_3_NAME
                else -> PLAYER_4_NAME
            }
            prefs[key] = name
        }
    }

    suspend fun updateBotDifficulty(elo: Int) {
        context.dataStore.edit { it[BOT_DIFFICULTY] = elo }
    }

    suspend fun updateHapticEnabled(enabled: Boolean) {
        context.dataStore.edit { it[HAPTIC_ENABLED] = enabled }
    }

    suspend fun updateShowHints(enabled: Boolean) {
        context.dataStore.edit { it[SHOW_HINTS] = enabled }
    }

    suspend fun markPuzzleCompleted(puzzleId: String) {
        context.dataStore.edit { prefs ->
            val current = (prefs[COMPLETED_PUZZLES] ?: "").split(",").filter { it.isNotBlank() }.toMutableSet()
            current.add(puzzleId)
            prefs[COMPLETED_PUZZLES] = current.joinToString(",")
        }
    }

    suspend fun markLessonCompleted(lessonId: String) {
        context.dataStore.edit { prefs ->
            val current = (prefs[COMPLETED_LESSONS] ?: "").split(",").filter { it.isNotBlank() }.toMutableSet()
            current.add(lessonId)
            prefs[COMPLETED_LESSONS] = current.joinToString(",")
        }
    }

    suspend fun saveLessonProgress(lessonId: String, stepIndex: Int) {
        context.dataStore.edit { prefs ->
            val current = parseLessonProgress(prefs[LESSON_PROGRESS] ?: "{}").toMutableMap()
            current[lessonId] = stepIndex
            prefs[LESSON_PROGRESS] = Json.encodeToString(kotlinx.serialization.serializer(), current)
        }
    }

    suspend fun resetAllProgress() {
        context.dataStore.edit { prefs ->
            prefs[COMPLETED_PUZZLES] = ""
            prefs[COMPLETED_LESSONS] = ""
            prefs[LESSON_PROGRESS] = "{}"
        }
    }

    private fun parseLessonProgress(json: String): Map<String, Int> {
        return try {
            Json.decodeFromString<Map<String, Int>>(json)
        } catch (e: Exception) {
            emptyMap()
        }
    }
}
