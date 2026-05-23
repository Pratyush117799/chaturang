package com.pratyush.chaturanga.model

enum class RoomStatus { WAITING, READY, IN_GAME, DONE }

data class LanRoom(
    val roomId: String,
    val name: String,
    val players: List<String> = emptyList(),
    val maxPlayers: Int = 4,
    val status: RoomStatus = RoomStatus.WAITING
)
