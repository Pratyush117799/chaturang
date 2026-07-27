package com.pratyush.chaturanga.viewmodel

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.pratyush.chaturanga.lan.LanClient
import com.pratyush.chaturanga.lan.LanServerService
import com.pratyush.chaturanga.model.LanRoom
import com.pratyush.chaturanga.model.RoomStatus
import com.pratyush.chaturanga.utils.NetworkUtils
import com.pratyush.chaturanga.utils.QrUtils
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LanViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val lanClient: LanClient
) : ViewModel() {

    private val _isHosting = MutableStateFlow(false)
    val isHosting: StateFlow<Boolean> = _isHosting.asStateFlow()

    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()

    private val _localIpAddress = MutableStateFlow<String?>(null)
    val localIpAddress: StateFlow<String?> = _localIpAddress.asStateFlow()

    private val _qrCodeBitmap = MutableStateFlow<Bitmap?>(null)
    val qrCodeBitmap: StateFlow<Bitmap?> = _qrCodeBitmap.asStateFlow()

    private val _rooms = MutableStateFlow<List<LanRoom>>(emptyList())
    val rooms: StateFlow<List<LanRoom>> = _rooms.asStateFlow()

    private val _currentRoom = MutableStateFlow<LanRoom?>(null)
    val currentRoom: StateFlow<LanRoom?> = _currentRoom.asStateFlow()

    private val _playerName = MutableStateFlow("Warrior")
    val playerName: StateFlow<String> = _playerName.asStateFlow()

    private val _connectionError = MutableStateFlow<String?>(null)
    val connectionError: StateFlow<String?> = _connectionError.asStateFlow()

    private val _isConnecting = MutableStateFlow(false)
    val isConnecting: StateFlow<Boolean> = _isConnecting.asStateFlow()

    private val _gameStartUrl = MutableStateFlow<String?>(null)
    val gameStartUrl: StateFlow<String?> = _gameStartUrl.asStateFlow()

    private var connectedHostUrl: String = ""

    init {
        viewModelScope.launch {
            lanClient.events.collect { event ->
                // Handle WebSocket events from LAN server
                when (event) {
                    is com.pratyush.chaturanga.model.RoomListMsg -> {
                        _rooms.value = event.rooms.map { r ->
                            LanRoom(
                                roomId = r.id,
                                name = r.name,
                                players = r.players,
                                status = when (r.status) {
                                    "WAITING" -> RoomStatus.WAITING
                                    "READY" -> RoomStatus.READY
                                    "IN_GAME" -> RoomStatus.IN_GAME
                                    else -> RoomStatus.DONE
                                }
                            )
                        }
                    }
                    is com.pratyush.chaturanga.model.RoomJoinedMsg -> {
                        val currentList = _rooms.value
                        val roomInfo = currentList.find { it.roomId == event.roomId }
                        val updated = roomInfo?.copy(players = event.players) ?: LanRoom(
                            roomId = event.roomId,
                            name = event.roomName,
                            players = event.players
                        )
                        _currentRoom.value = updated
                    }
                    is com.pratyush.chaturanga.model.WelcomeMsg -> {
                        _isConnected.value = true
                    }
                    is com.pratyush.chaturanga.model.GameStartMsg -> {
                        _gameStartUrl.value = connectedHostUrl
                    }
                    is com.pratyush.chaturanga.model.ErrorMsg -> {
                        _connectionError.value = event.message
                    }
                }
            }
        }
    }

    fun startHosting() {
        viewModelScope.launch {
            val ip = NetworkUtils.getLocalWifiIpAddress(context)
            _localIpAddress.value = ip
            _isHosting.value = true

            // Start foreground server service
            val intent = Intent(context, LanServerService::class.java)
            context.startForegroundService(intent)

            if (ip != null) {
                // Generate deep link QR: chaturanga://join?host=IP
                val qrContent = "chaturanga://join?host=$ip&ws=8765&http=8080"
                val bitmap = QrUtils.generateQrBitmap(qrContent, 512)
                _qrCodeBitmap.value = bitmap
                
                // Host also connects to itself locally
                connectToHost("ws://$ip:8765")
            }
        }
    }

    fun stopHosting() {
        lanClient.disconnect()
        val intent = Intent(context, LanServerService::class.java)
        context.stopService(intent)
        _isHosting.value = false
        _isConnected.value = false
        _rooms.value = emptyList()
        _qrCodeBitmap.value = null
        _localIpAddress.value = null
        _currentRoom.value = null
    }

    fun connectToHost(wsUrl: String) {
        viewModelScope.launch {
            _isConnecting.value = true
            _connectionError.value = null
            connectedHostUrl = wsUrl
            try {
                lanClient.connect(wsUrl)
                // Register player name
                kotlinx.coroutines.delay(500)
                lanClient.send(com.pratyush.chaturanga.model.lanJson.encodeToString(
                    com.pratyush.chaturanga.model.PlayerJoinMsg(playerName = _playerName.value)
                ))
            } catch (e: Exception) {
                _connectionError.value = e.message ?: "Failed to connect to host"
                _isConnected.value = false
            } finally {
                _isConnecting.value = false
            }
        }
    }

    fun setPlayerName(name: String) {
        _playerName.value = name
    }

    fun createRoom(name: String) {
        viewModelScope.launch {
            lanClient.send(com.pratyush.chaturanga.model.lanJson.encodeToString(
                com.pratyush.chaturanga.model.RoomCreateMsg(roomName = name)
            ))
        }
    }

    fun joinRoom(roomId: String) {
        viewModelScope.launch {
            lanClient.send(com.pratyush.chaturanga.model.lanJson.encodeToString(
                com.pratyush.chaturanga.model.RoomJoinMsg(roomId = roomId)
            ))
        }
    }

    fun leaveRoom() {
        val room = _currentRoom.value ?: return
        viewModelScope.launch {
            lanClient.send(com.pratyush.chaturanga.model.lanJson.encodeToString(
                com.pratyush.chaturanga.model.RoomLeaveMsg(roomId = room.roomId)
            ))
            _currentRoom.value = null
        }
    }

    fun readyUp() {
        val room = _currentRoom.value ?: return
        viewModelScope.launch {
            lanClient.send(com.pratyush.chaturanga.model.lanJson.encodeToString(
                com.pratyush.chaturanga.model.GameReadyMsg(roomId = room.roomId)
            ))
        }
    }
}
