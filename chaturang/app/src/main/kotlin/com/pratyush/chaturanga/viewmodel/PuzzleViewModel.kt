package com.pratyush.chaturanga.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.pratyush.chaturanga.data.PreferencesDataStore
import com.pratyush.chaturanga.data.PuzzleRepository
import com.pratyush.chaturanga.model.Puzzle
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class PuzzleViewModel @Inject constructor(
    private val puzzleRepository: PuzzleRepository,
    private val preferencesDataStore: PreferencesDataStore
) : ViewModel() {

    private val _puzzles = MutableStateFlow<List<Puzzle>>(emptyList())
    val puzzles: StateFlow<List<Puzzle>> = _puzzles.asStateFlow()

    private val _selectedDifficulty = MutableStateFlow<String?>(null)
    val selectedDifficulty: StateFlow<String?> = _selectedDifficulty.asStateFlow()

    val completedPuzzleIds: StateFlow<Set<String>> = preferencesDataStore.preferences
        .combine(MutableStateFlow(emptySet<String>())) { prefs, _ -> prefs.completedPuzzleIds }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptySet())

    val filteredPuzzles: StateFlow<List<Puzzle>> = combine(_puzzles, _selectedDifficulty) { all, diff ->
        if (diff == null) all else all.filter { it.difficulty == diff }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        viewModelScope.launch {
            _puzzles.value = puzzleRepository.getAllPuzzles()
        }
    }

    fun selectDifficulty(difficulty: String?) {
        _selectedDifficulty.value = if (_selectedDifficulty.value == difficulty) null else difficulty
    }

    fun markPuzzleSolved(puzzleId: String) {
        viewModelScope.launch {
            preferencesDataStore.markPuzzleCompleted(puzzleId)
        }
    }
}
