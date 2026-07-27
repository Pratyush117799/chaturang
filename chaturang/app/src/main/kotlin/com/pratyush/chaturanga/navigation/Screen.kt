package com.pratyush.chaturanga.navigation

import kotlinx.serialization.Serializable

sealed interface Screen {

    @Serializable
    object Splash : Screen

    @Serializable
    object MainMenu : Screen

    @Serializable
    object ModeSelect : Screen

    @Serializable
    object PuzzleMenu : Screen

    @Serializable
    object LessonMenu : Screen

    @Serializable
    object LanLobby : Screen

    @Serializable
    object HostLobby : Screen

    @Serializable
    object JoinLobby : Screen

    @Serializable
    object Settings : Screen

    @Serializable
    data class Game(
        val mode: String,              // "hotseat" | "passplay" | "vsbot" | "lan_client"
        val botDifficulty: Int = 600,
        val lanServerUrl: String = "",
        val lanRoomId: String = ""
    ) : Screen

    @Serializable
    data class PuzzleGame(val puzzleId: String) : Screen

    @Serializable
    data class Lesson(val lessonId: String) : Screen

    @Serializable
    data class Result(
        val winnerId: Int,
        val winnerName: String,
        val turnCount: Int,
        val dharmaScore: Int,
        val captures: Int,
        val mode: String
    ) : Screen

    @Serializable
    data class Room(
        val roomId: String,
        val isHost: Boolean
    ) : Screen
}
