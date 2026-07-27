package com.pratyush.chaturanga.data

import com.pratyush.chaturanga.model.Lesson
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LessonRepository @Inject constructor() {
    private val lessons = listOf(
        Lesson(
            id = "l01", title = "The Pieces", titleSanskrit = "योद्धा",
            description = "Drona presents the five warriors of the Ashtāpada.",
            totalSteps = 5, piecesFeatured = listOf("pawn", "horse", "elephant", "rook", "king"),
            estimatedMinutes = 3,
            introQuote = "Know your warriors before you command them. — Dronacharya"
        ),
        Lesson(
            id = "l02", title = "The Dice", titleSanskrit = "पाशा",
            description = "Learn how the Pāśaka dice determines which piece may move.",
            totalSteps = 4, piecesFeatured = listOf("pawn"),
            estimatedMinutes = 3,
            introQuote = "Fate guides the hand; wisdom guides the choice. — Mahabharata"
        ),
        Lesson(
            id = "l03", title = "The Nara", titleSanskrit = "नर",
            description = "The humble foot soldier — pawn movement, capture, and promotion.",
            totalSteps = 5, piecesFeatured = listOf("pawn"),
            estimatedMinutes = 4,
            introQuote = "Every great army began with one foot soldier's courage. — Arthashastra"
        ),
        Lesson(
            id = "l04", title = "The Ashwa", titleSanskrit = "अश्व",
            description = "The horse leaps in the sacred L-shape, crossing over any obstacle.",
            totalSteps = 4, piecesFeatured = listOf("horse"),
            estimatedMinutes = 3,
            introQuote = "Swift as Hayagriva, the Ashwa leaps where none can follow. — Vishnu Purana"
        ),
        Lesson(
            id = "l05", title = "The Danti", titleSanskrit = "दन्ती",
            description = "The war elephant jumps two diagonal squares, unstoppable and precise.",
            totalSteps = 4, piecesFeatured = listOf("elephant"),
            estimatedMinutes = 3,
            introQuote = "The elephant does not change course; it tramples all in its path. — Arthashastra"
        ),
        Lesson(
            id = "l06", title = "The Ratha", titleSanskrit = "रथ",
            description = "The chariot slides any number of squares in a straight line.",
            totalSteps = 4, piecesFeatured = listOf("rook"),
            estimatedMinutes = 3,
            introQuote = "He who commands the chariot commands the rank and file. — Drona Parva"
        ),
        Lesson(
            id = "l07", title = "The Raja", titleSanskrit = "राज",
            description = "The king steps one square in any direction. Capture the enemy Raja to win.",
            totalSteps = 5, piecesFeatured = listOf("king"),
            estimatedMinutes = 4,
            introQuote = "The fall of the Raja ends the war — protect him above all else. — Chanakya Niti"
        ),
        Lesson(
            id = "l08", title = "Full Game", titleSanskrit = "युद्ध",
            description = "Play a supervised four-turn demonstration of a complete Chaturanga game.",
            totalSteps = 6, piecesFeatured = listOf("pawn", "horse", "elephant", "rook", "king"),
            estimatedMinutes = 5,
            introQuote = "The Ashtāpada has no shortcuts. Begin with the first piece and work forward. — Dronacharya"
        )
    )

    fun getAllLessons(): List<Lesson> = lessons

    fun getLessonById(id: String): Lesson? = lessons.find { it.id == id }

    fun isLessonUnlocked(lessonId: String, completedIds: Set<String>): Boolean {
        val index = lessons.indexOfFirst { it.id == lessonId }
        if (index <= 0) return true
        return lessons[index - 1].id in completedIds
    }
}
