package com.pratyush.chaturanga.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.pratyush.chaturanga.data.PreferencesDataStore
import com.pratyush.chaturanga.model.ChaturangaPreferences
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val dataStore: PreferencesDataStore
) : ViewModel() {

    val preferences: StateFlow<ChaturangaPreferences> = dataStore.preferences
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), ChaturangaPreferences())

    fun updatePlayerName(index: Int, name: String) {
        viewModelScope.launch {
            dataStore.updatePlayerName(index, name)
        }
    }

    fun updateBotDifficulty(elo: Int) {
        viewModelScope.launch {
            dataStore.updateBotDifficulty(elo)
        }
    }

    fun updateHapticEnabled(enabled: Boolean) {
        viewModelScope.launch {
            dataStore.updateHapticEnabled(enabled)
        }
    }

    fun updateShowHints(enabled: Boolean) {
        viewModelScope.launch {
            dataStore.updateShowHints(enabled)
        }
    }

    fun resetAllProgress() {
        viewModelScope.launch {
            dataStore.resetAllProgress()
        }
    }
}
