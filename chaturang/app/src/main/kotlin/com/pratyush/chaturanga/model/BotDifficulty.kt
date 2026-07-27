package com.pratyush.chaturanga.model

enum class BotDifficulty(val displayName: String, val sanskrit: String, val elo: Int, val description: String) {
    EASY("Student", "Shishya", 400, "Learning the ancient moves"),
    MEDIUM("Warrior", "Kshatriya", 600, "Battle-hardened and strategic"),
    HARD("Master", "Drona", 900, "Drona plays at near-perfect strength")
}
