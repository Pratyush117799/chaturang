package com.pratyush.chaturanga.lan

import com.pratyush.chaturanga.model.*
import kotlinx.serialization.encodeToString
import org.java_websocket.WebSocket
import org.java_websocket.handshake.ClientHandshake
import org.java_websocket.server.WebSocketServer
import java.net.InetSocketAddress
import java.util.Timer
import java.util.TimerTask

class ChaturangaWsServer(
    private val roomManager: RoomManager,
    private val onRoomsChanged: (List<LanRoom>) -> Unit = {}
) : WebSocketServer(InetSocketAddress(8765)) {

    private var pingTimer: Timer? = null

    override fun onOpen(conn: WebSocket?, handshake: ClientHandshake?) {
        conn ?: return
        // Send welcome with temporary ID
        val tempId = java.util.UUID.randomUUID().toString().take(8)
        conn.send(lanJson.encodeToString(WelcomeMsg(playerId = tempId, reconnectToken = tempId)))
    }

    override fun onClose(conn: WebSocket?, code: Int, reason: String?, remote: Boolean) {
        conn ?: return
        val session = roomManager.removePlayer(conn)
        if (session != null) {
            broadcastRoomList()
        }
    }

    override fun onMessage(conn: WebSocket?, message: String?) {
        conn ?: return; message ?: return
        try {
            when (val msg = parseInboundMessage(message)) {
                is PlayerJoinMsg -> handlePlayerJoin(conn, msg)
                is RoomCreateMsg -> handleRoomCreate(conn, msg)
                is RoomJoinMsg   -> handleRoomJoin(conn, msg)
                is RoomLeaveMsg  -> handleRoomLeave(conn, msg)
                is MoveMadeMsg   -> handleMoveMade(conn, msg)
                is DiceRollMsg   -> handleDiceRoll(conn, msg)
                is GameReadyMsg  -> handleGameReady(conn, msg)
                is ForfeitMsg    -> handleForfeit(conn, msg)
                is PingMsg       -> conn.send(lanJson.encodeToString(PingMsg()))
                else             -> conn.send(lanJson.encodeToString(ErrorMsg("UNKNOWN", "Unknown message type")))
            }
        } catch (e: Exception) {
            conn.send(lanJson.encodeToString(ErrorMsg("PARSE_ERROR", e.message ?: "Parse error")))
        }
    }

    override fun onError(conn: WebSocket?, ex: Exception?) {
        ex?.printStackTrace()
    }

    override fun onStart() {
        // Start ping keep-alive every 30 seconds
        pingTimer = Timer(true).also {
            it.scheduleAtFixedRate(object : TimerTask() {
                override fun run() {
                    broadcast(lanJson.encodeToString(PingMsg()))
                }
            }, 30_000L, 30_000L)
        }
    }

    private fun handlePlayerJoin(conn: WebSocket, msg: PlayerJoinMsg) {
        val session = roomManager.registerPlayer(conn, msg.playerName)
        conn.send(lanJson.encodeToString(
            WelcomeMsg(playerId = session.playerId, reconnectToken = session.reconnectToken)
        ))
        broadcastRoomList()
    }

    private fun handleRoomCreate(conn: WebSocket, msg: RoomCreateMsg) {
        val session = roomManager.getPlayerBySocket(conn) ?: run {
            conn.send(lanJson.encodeToString(ErrorMsg("NOT_REGISTERED", "Join first"))); return
        }
        val room = roomManager.createRoom(msg.roomName, session)
        conn.send(lanJson.encodeToString(
            RoomJoinedMsg(roomId = room.roomId, roomName = room.name, players = room.players)
        ))
        broadcastRoomList()
    }

    private fun handleRoomJoin(conn: WebSocket, msg: RoomJoinMsg) {
        val session = roomManager.getPlayerBySocket(conn) ?: run {
            conn.send(lanJson.encodeToString(ErrorMsg("NOT_REGISTERED", "Join first"))); return
        }
        val room = roomManager.joinRoom(msg.roomId, session) ?: run {
            conn.send(lanJson.encodeToString(ErrorMsg("ROOM_FULL", "Room is full or in game"))); return
        }
        // Notify all players in room
        roomManager.getPlayersInRoom(room.roomId).forEach { p ->
            p.socket.send(lanJson.encodeToString(
                RoomJoinedMsg(roomId = room.roomId, roomName = room.name, players = room.players)
            ))
        }
        broadcastRoomList()
    }

    private fun handleRoomLeave(conn: WebSocket, msg: RoomLeaveMsg) {
        val session = roomManager.getPlayerBySocket(conn) ?: return
        roomManager.leaveRoom(msg.roomId, session)
        broadcastRoomList()
    }

    private fun handleMoveMade(conn: WebSocket, msg: MoveMadeMsg) {
        val session = roomManager.getPlayerBySocket(conn) ?: return
        roomManager.getPlayersInRoom(msg.roomId).forEach { p ->
            if (p.socket != conn) {
                p.socket.send(lanJson.encodeToString(
                    MoveBroadcastMsg(roomId = msg.roomId, from = msg.from, to = msg.to,
                        pieceType = msg.pieceType, playerId = session.playerId)
                ))
            }
        }
    }

    private fun handleDiceRoll(conn: WebSocket, msg: DiceRollMsg) {
        val session = roomManager.getPlayerBySocket(conn) ?: return
        roomManager.getPlayersInRoom(msg.roomId).forEach { p ->
            if (p.socket != conn) {
                p.socket.send(lanJson.encodeToString(
                    DiceBroadcastMsg(roomId = msg.roomId, face = msg.face, playerId = session.playerId)
                ))
            }
        }
    }

    private fun handleGameReady(conn: WebSocket, msg: GameReadyMsg) {
        val room = roomManager.startGame(msg.roomId) ?: return
        val players = roomManager.getPlayersInRoom(room.roomId)
        val playerOrder = players.map { it.playerId }
        players.forEach { p ->
            p.socket.send(lanJson.encodeToString(
                GameStartMsg(roomId = room.roomId, playerOrder = playerOrder, firstPlayer = playerOrder.firstOrNull() ?: "")
            ))
        }
        broadcastRoomList()
    }

    private fun handleForfeit(conn: WebSocket, msg: ForfeitMsg) {
        val session = roomManager.getPlayerBySocket(conn) ?: return
        roomManager.getPlayersInRoom(msg.roomId).forEach { p ->
            p.socket.send(lanJson.encodeToString(
                GameOverBroadcastMsg(roomId = msg.roomId, winnerId = "", winnerName = "Forfeit", turns = 0)
            ))
        }
    }

    private fun broadcastRoomList() {
        val rooms = roomManager.getAllRooms()
        onRoomsChanged(rooms)
        val msg = lanJson.encodeToString(RoomListMsg(rooms = rooms.map {
            RoomInfo(id = it.roomId, name = it.name, players = it.players, status = it.status.name)
        }))
        roomManager.getAllConnectedSockets().forEach { try { it.send(msg) } catch (e: Exception) {} }
    }

    fun shutdown() {
        pingTimer?.cancel()
        try { stop(1000) } catch (e: Exception) {}
    }
}
