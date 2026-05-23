package com.pratyush.chaturanga.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.pratyush.chaturanga.model.GameConfig
import com.pratyush.chaturanga.model.GameResult
import com.pratyush.chaturanga.webview.JsBridgeEvent
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class GameViewModel @Inject constructor() : ViewModel() {

    private val _gameConfig = MutableStateFlow<GameConfig?>(null)
    val gameConfig: StateFlow<GameConfig?> = _gameConfig.asStateFlow()

    private val _gameEvent = MutableSharedFlow<JsBridgeEvent>(extraBufferCapacity = 16)
    val gameEvent: SharedFlow<JsBridgeEvent> = _gameEvent.asSharedFlow()

    private val _passDevicePrompt = MutableStateFlow<String?>(null)
    val passDevicePrompt: StateFlow<String?> = _passDevicePrompt.asStateFlow()

    private val _diceValue = MutableStateFlow(0)
    val diceValue: StateFlow<Int> = _diceValue.asStateFlow()

    private val _isDiceSpinning = MutableStateFlow(false)
    val isDiceSpinning: StateFlow<Boolean> = _isDiceSpinning.asStateFlow()

    private val _lastMoveInfo = MutableStateFlow<String?>(null)
    val lastMoveInfo: StateFlow<String?> = _lastMoveInfo.asStateFlow()

    private val _gameResult = MutableStateFlow<GameResult?>(null)
    val gameResult: StateFlow<GameResult?> = _gameResult.asStateFlow()

    fun setConfig(config: GameConfig) { _gameConfig.value = config }

    fun onBridgeEvent(event: JsBridgeEvent) {
        viewModelScope.launch {
            when (event) {
                is JsBridgeEvent.RequestPassDevice -> _passDevicePrompt.value = event.nextPlayerName
                is JsBridgeEvent.DiceRolled -> {
                    _isDiceSpinning.value = true
                    _diceValue.value = event.face
                    delay(800)
                    _isDiceSpinning.value = false
                }
                is JsBridgeEvent.MoveExecuted -> {
                    _lastMoveInfo.value = "${event.pieceType}: ${event.from} → ${event.to}"
                }
                is JsBridgeEvent.GameOver -> {
                    _gameResult.value = GameResult(
                        winnerId    = event.winnerId,
                        winnerName  = event.winnerName,
                        turnCount   = event.turnCount,
                        dharmaScore = event.dharmaScore,
                        captures    = event.captures,
                        mode        = _gameConfig.value?.mode ?: "hotseat"
                    )
                }
                else -> {}
            }
            _gameEvent.emit(event)
        }
    }

    fun dismissPassDevicePrompt() { _passDevicePrompt.value = null }
    fun clearResult() { _gameResult.value = null }
}
