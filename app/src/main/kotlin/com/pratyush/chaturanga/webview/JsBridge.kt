package com.pratyush.chaturanga.webview

import android.os.Handler
import android.os.Looper
import android.webkit.JavascriptInterface

class JsBridge(
    private val onEvent: (JsBridgeEvent) -> Unit
) {
    private val mainHandler = Handler(Looper.getMainLooper())

    private fun postEvent(event: JsBridgeEvent) {
        mainHandler.post {
            onEvent(event)
        }
    }

    @JavascriptInterface
    fun onGameOver(winnerId: Int, winnerName: String, turnCount: Int, dharmaScore: Int, captures: Int) {
        postEvent(JsBridgeEvent.GameOver(winnerId, winnerName, turnCount, dharmaScore, captures))
    }

    @JavascriptInterface
    fun onMoveExecuted(from: String, to: String, pieceType: String, capturedType: String?) {
        postEvent(JsBridgeEvent.MoveExecuted(from, to, pieceType, capturedType ?: ""))
    }

    @JavascriptInterface
    fun onDiceRolled(face: Int, pieceName: String) {
        postEvent(JsBridgeEvent.DiceRolled(face, pieceName))
    }

    @JavascriptInterface
    fun onPawnPromoted(square: String) {
        postEvent(JsBridgeEvent.PawnPromoted(square))
    }

    @JavascriptInterface
    fun onPuzzleSolved(puzzleId: String, turnsUsed: Int, hintsUsed: Int) {
        postEvent(JsBridgeEvent.PuzzleSolved(puzzleId, turnsUsed, hintsUsed))
    }

    @JavascriptInterface
    fun onLessonStepComplete(lessonId: String, stepIndex: Int, totalSteps: Int) {
        postEvent(JsBridgeEvent.LessonStepComplete(lessonId, stepIndex, totalSteps))
    }

    @JavascriptInterface
    fun onRequestPassDevice(nextPlayerName: String) {
        postEvent(JsBridgeEvent.RequestPassDevice(nextPlayerName))
    }

    @JavascriptInterface
    fun onGameReady() {
        postEvent(JsBridgeEvent.GameReady)
    }
}
