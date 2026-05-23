package com.pratyush.chaturanga.model

enum class GameMode(val displayName: String, val jsMode: String) {
    HOT_SEAT("Hot Seat", "hotseat"),
    PASS_PLAY("Pass & Play", "passplay"),
    VS_BOT("vs Drona", "vsbot"),
    LAN("Tournament", "lan_client"),
    PUZZLE("Puzzle", "puzzle"),
    LESSON("Lesson", "lesson")
}
