package com.pratyush.chaturanga.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.pratyush.chaturanga.data.LessonRepository
import com.pratyush.chaturanga.data.PreferencesDataStore
import com.pratyush.chaturanga.model.Lesson
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LessonViewModel @Inject constructor(
    private val lessonRepository: LessonRepository,
    private val preferencesDataStore: PreferencesDataStore
) : ViewModel() {

    val lessons: StateFlow<List<Lesson>> = MutableStateFlow(lessonRepository.getAllLessons())

    val completedLessonIds: StateFlow<Set<String>> = preferencesDataStore.preferences
        .map { it.completedLessonIds }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptySet())

    val currentLessonProgress: StateFlow<Map<String, Int>> = preferencesDataStore.preferences
        .map { it.lessonProgress }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyMap())

    fun markLessonComplete(lessonId: String) {
        viewModelScope.launch {
            preferencesDataStore.markLessonCompleted(lessonId)
        }
    }

    fun saveLessonProgress(lessonId: String, stepIndex: Int) {
        viewModelScope.launch {
            preferencesDataStore.saveLessonProgress(lessonId, stepIndex)
        }
    }

    fun isUnlocked(lessonId: String, completedIds: Set<String>): Boolean =
        lessonRepository.isLessonUnlocked(lessonId, completedIds)
}
