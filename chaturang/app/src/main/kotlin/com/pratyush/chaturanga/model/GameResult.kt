package com.pratyush.chaturanga.model

import kotlinx.serialization.Serializable

@Serializable
data class GameResult(
    val winnerId: Int,
    val winnerName: String,
    val turnCount: Int,
    val dharmaScore: Int,
    val captures: Int,
    val mode: String
)
