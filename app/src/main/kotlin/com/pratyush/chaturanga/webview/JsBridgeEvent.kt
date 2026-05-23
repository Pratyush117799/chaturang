package com.pratyush.chaturanga.webview

sealed class JsBridgeEvent {
    data class GameOver(
        val winnerId: Int,
        val winnerName: String,
        val turnCount: Int,
        val dharmaScore: Int,
        val captures: Int
    ) : JsBridgeEvent()

    data class MoveExecuted(
        val from: String,
        val to: String,
        val pieceType: String,
        val capturedType: String
    ) : JsBridgeEvent()

    data class DiceRolled(val face: Int, val pieceName: String) : JsBridgeEvent()
    data class PawnPromoted(val square: String) : JsBridgeEvent()
    data class PuzzleSolved(val puzzleId: String, val turnsUsed: Int, val hintsUsed: Int) : JsBridgeEvent()
    data class LessonStepComplete(val lessonId: String, val stepIndex: Int, val totalSteps: Int) : JsBridgeEvent()
    data class RequestPassDevice(val nextPlayerName: String) : JsBridgeEvent()
    object GameReady : JsBridgeEvent()
}
