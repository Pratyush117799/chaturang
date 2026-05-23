package com.pratyush.chaturanga.utils

import androidx.compose.ui.graphics.Color

fun Color.withAlpha(alpha: Float): Color = this.copy(alpha = alpha)

fun Int.toEloLabel(): String = when {
    this <= 400 -> "Shishya"
    this <= 600 -> "Kshatriya"
    else        -> "Drona"
}

fun String.toPieceName(): String = when (this.lowercase()) {
    "pawn", "nara"      -> "Nara ♟"
    "horse", "ashwa"    -> "Ashwa ♞"
    "elephant", "danti" -> "Danti ♝"
    "rook", "ratha"     -> "Ratha ♜"
    "king", "raja"      -> "Raja ♚"
    else                -> this.replaceFirstChar { it.uppercase() }
}

fun Int.playerColorIndex(): Int = this % 4
