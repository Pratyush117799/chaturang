package com.pratyush.chaturanga.ui.components

import androidx.activity.compose.BackHandler
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.window.DialogProperties
import com.pratyush.chaturanga.ui.theme.Dark2
import com.pratyush.chaturanga.ui.theme.Gold
import com.pratyush.chaturanga.ui.theme.MutedColor
import com.pratyush.chaturanga.ui.theme.OutfitFontFamily
import com.pratyush.chaturanga.ui.theme.TextColor
import com.pratyush.chaturanga.ui.theme.Typography

@Composable
fun BackPressHandler(
    title: String = "Forfeit Battle?",
    message: String = "Are you sure you want to abandon this battle? Your current progress will be lost.",
    confirmText: String = "Abandon",
    dismissText: String = "Stay",
    enabled: Boolean = true,
    onConfirm: () -> Unit
) {
    var showDialog by remember { mutableStateOf(false) }

    if (enabled) {
        BackHandler(enabled = true) {
            showDialog = true
        }
    }

    if (showDialog) {
        AlertDialog(
            onDismissRequest = { showDialog = false },
            confirmButton = {
                TextButton(onClick = {
                    showDialog = false
                    onConfirm()
                }) {
                    Text(
                        text = confirmText,
                        fontFamily = OutfitFontFamily,
                        color = Gold,
                        style = Typography.bodyMedium
                    )
                }
            },
            dismissButton = {
                TextButton(onClick = { showDialog = false }) {
                    Text(
                        text = dismissText,
                        fontFamily = OutfitFontFamily,
                        color = MutedColor,
                        style = Typography.bodyMedium
                    )
                }
            },
            title = {
                Text(
                    text = title,
                    style = Typography.titleLarge
                )
            },
            text = {
                Text(
                    text = message,
                    style = Typography.bodyMedium
                )
            },
            containerColor = Dark2,
            titleContentColor = Gold,
            textContentColor = TextColor,
            properties = DialogProperties(
                dismissOnBackPress = true,
                dismissOnClickOutside = true
            )
        )
    }
}
