package com.pratyush.chaturanga.model

import kotlinx.serialization.Serializable

@Serializable
data class Lesson(
    val id: String,
    val title: String,
    val titleSanskrit: String,
    val description: String,
    val totalSteps: Int,
    val piecesFeatured: List<String>,
    val estimatedMinutes: Int,
    val introQuote: String = ""
)
