package com.pratyush.chaturanga.model

data class Player(
    val id: String,
    val name: String,
    val colorIndex: Int = 0,
    val isReady: Boolean = false,
    val isHost: Boolean = false
)
