package com.pratyush.chaturanga.lan

import com.pratyush.chaturanga.model.LanRoom
import com.pratyush.chaturanga.model.RoomStatus
import org.java_websocket.WebSocket
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

data class PlayerSession(
    val playerId: String,
    val playerName: String,
    val socket: WebSocket,
    val reconnectToken: String = UUID.randomUUID().toString()
)

class RoomManager {
    private val rooms = ConcurrentHashMap<String, LanRoom>()
    private val playerConnections = ConcurrentHashMap<String, PlayerSession>()
    private val reconnectTokens = ConcurrentHashMap<String, String>()  // token -> playerId
    private val socketToPlayer = ConcurrentHashMap<WebSocket, String>()  // socket -> playerId

    fun registerPlayer(socket: WebSocket, playerName: String): PlayerSession {
        val id = UUID.randomUUID().toString().take(8)
        val token = UUID.randomUUID().toString()
        val session = PlayerSession(id, playerName, socket, token)
        playerConnections[id] = session
        reconnectTokens[token] = id
        socketToPlayer[socket] = id
        return session
    }

    fun removePlayer(socket: WebSocket): PlayerSession? {
        val id = socketToPlayer.remove(socket) ?: return null
        val session = playerConnections.remove(id)
        session?.let { reconnectTokens.remove(it.reconnectToken) }
        // Remove from any rooms
        rooms.forEach { (roomId, room) ->
            if (session?.playerName in room.players) {
                rooms[roomId] = room.copy(players = room.players - (session?.playerName ?: ""))
            }
        }
        return session
    }

    fun getPlayerBySocket(socket: WebSocket): PlayerSession? {
        val id = socketToPlayer[socket] ?: return null
        return playerConnections[id]
    }

    fun createRoom(name: String, hostSession: PlayerSession): LanRoom {
        val roomId = UUID.randomUUID().toString().take(6).uppercase()
        val room = LanRoom(
            roomId = roomId, name = name,
            players = listOf(hostSession.playerName),
            maxPlayers = 4, status = RoomStatus.WAITING
        )
        rooms[roomId] = room
        return room
    }

    fun joinRoom(roomId: String, session: PlayerSession): LanRoom? {
        val room = rooms[roomId] ?: return null
        if (room.players.size >= room.maxPlayers) return null
        if (room.status != RoomStatus.WAITING) return null
        val updated = room.copy(players = room.players + session.playerName)
        val newStatus = if (updated.players.size >= 2) RoomStatus.READY else RoomStatus.WAITING
        val final = updated.copy(status = newStatus)
        rooms[roomId] = final
        return final
    }

    fun leaveRoom(roomId: String, session: PlayerSession): LanRoom? {
        val room = rooms[roomId] ?: return null
        val updated = room.copy(players = room.players - session.playerName)
        return if (updated.players.isEmpty()) {
            rooms.remove(roomId)
            null
        } else {
            val newStatus = if (updated.players.size < 2) RoomStatus.WAITING else updated.status
            val final = updated.copy(status = newStatus)
            rooms[roomId] = final
            final
        }
    }

    fun startGame(roomId: String): LanRoom? {
        val room = rooms[roomId] ?: return null
        if (room.status != RoomStatus.READY) return null
        val updated = room.copy(status = RoomStatus.IN_GAME)
        rooms[roomId] = updated
        return updated
    }

    fun getRoom(roomId: String): LanRoom? = rooms[roomId]

    fun getAllRooms(): List<LanRoom> = rooms.values.toList()

    fun getPlayersInRoom(roomId: String): List<PlayerSession> {
        val room = rooms[roomId] ?: return emptyList()
        return playerConnections.values.filter { it.playerName in room.players }
    }

    fun getAllConnectedSockets(): Collection<WebSocket> = socketToPlayer.keys
}
