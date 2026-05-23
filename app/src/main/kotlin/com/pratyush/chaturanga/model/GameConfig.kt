package com.pratyush.chaturanga.model

import kotlinx.serialization.Serializable

@Serializable
data class GameConfig(
    val mode: String,              // "hotseat" | "passplay" | "vsbot" | "puzzle" | "lesson" | "lan_client"
    val botDifficulty: Int = 600,  // ELO: 400 easy, 600 medium, 900 hard
    val puzzleId: String? = null,
    val lessonId: String? = null,
    val lanServerUrl: String? = null,
    val lanRoomId: String? = null,
    val lanPlayerId: String? = null,
    val playerNames: List<String> = listOf("Player 1", "Player 2", "Player 3", "Player 4"), // Up to 4 players supported!
    val showHints: Boolean = true,
    val hapticEnabled: Boolean = true
)
