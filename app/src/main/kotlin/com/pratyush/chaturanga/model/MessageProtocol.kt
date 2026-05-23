package com.pratyush.chaturanga.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

val lanJson = Json { ignoreUnknownKeys = true; encodeDefaults = true }

// ---- Inbound (Client → Server) ----

@Serializable data class PlayerJoinMsg(
    val type: String = "player-join",
    val playerName: String,
    val reconnectToken: String? = null
)

@Serializable data class RoomCreateMsg(
    val type: String = "room-create",
    val roomName: String
)

@Serializable data class RoomJoinMsg(
    val type: String = "room-join",
    val roomId: String
)

@Serializable data class RoomLeaveMsg(
    val type: String = "room-leave",
    val roomId: String
)

@Serializable data class MoveMadeMsg(
    val type: String = "move-made",
    val roomId: String,
    val from: String,
    val to: String,
    val pieceType: String
)

@Serializable data class DiceRollMsg(
    val type: String = "dice-roll",
    val roomId: String,
    val face: Int
)

@Serializable data class GameReadyMsg(
    val type: String = "game-ready",
    val roomId: String
)

@Serializable data class ForfeitMsg(
    val type: String = "forfeit",
    val roomId: String
)

// ---- Outbound (Server → Client) ----

@Serializable data class WelcomeMsg(
    val type: String = "welcome",
    val playerId: String,
    val reconnectToken: String
)

@Serializable data class RoomListMsg(
    val type: String = "room-list",
    val rooms: List<RoomInfo>
)

@Serializable data class RoomInfo(
    val id: String,
    val name: String,
    val players: List<String>,
    val status: String
)

@Serializable data class RoomJoinedMsg(
    val type: String = "room-joined",
    val roomId: String,
    val roomName: String,
    val players: List<String>
)

@Serializable data class GameStartMsg(
    val type: String = "game-start",
    val roomId: String,
    val playerOrder: List<String>,
    val firstPlayer: String
)

@Serializable data class MoveBroadcastMsg(
    val type: String = "move-broadcast",
    val roomId: String,
    val from: String,
    val to: String,
    val pieceType: String,
    val playerId: String
)

@Serializable data class DiceBroadcastMsg(
    val type: String = "dice-broadcast",
    val roomId: String,
    val face: Int,
    val playerId: String
)

@Serializable data class GameOverBroadcastMsg(
    val type: String = "game-over",
    val roomId: String,
    val winnerId: String,
    val winnerName: String,
    val turns: Int
)

@Serializable data class ErrorMsg(
    val type: String = "error",
    val code: String,
    val message: String
)

@Serializable data class PingMsg(val type: String = "ping")

fun parseInboundMessage(raw: String): Any? {
    return try {
        val element = Json.parseToJsonElement(raw)
        val type = element.jsonObject["type"]?.jsonPrimitive?.content ?: return null
        when (type) {
            "player-join" -> lanJson.decodeFromString<PlayerJoinMsg>(raw)
            "room-create" -> lanJson.decodeFromString<RoomCreateMsg>(raw)
            "room-join"   -> lanJson.decodeFromString<RoomJoinMsg>(raw)
            "room-leave"  -> lanJson.decodeFromString<RoomLeaveMsg>(raw)
            "move-made"   -> lanJson.decodeFromString<MoveMadeMsg>(raw)
            "dice-roll"   -> lanJson.decodeFromString<DiceRollMsg>(raw)
            "game-ready"  -> lanJson.decodeFromString<GameReadyMsg>(raw)
            "forfeit"     -> lanJson.decodeFromString<ForfeitMsg>(raw)
            "ping"        -> PingMsg()
            else          -> null
        }
    } catch (e: Exception) { null }
}
