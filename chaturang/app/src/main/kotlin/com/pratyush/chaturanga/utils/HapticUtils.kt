package com.pratyush.chaturanga.utils

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager

object HapticUtils {
    fun vibrateMove(context: Context) = vibrate(context, 30L)
    fun vibrateCapture(context: Context) = vibrate(context, 80L)
    fun vibrateGameOver(context: Context) = vibratePattern(context, longArrayOf(0, 100, 60, 100))
    fun vibrateDice(context: Context) = vibrate(context, 45L)
    fun vibrateError(context: Context) = vibrate(context, 60L)

    private fun vibrate(context: Context, ms: Long) {
        val vib = getVibrator(context) ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vib.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            @Suppress("DEPRECATION")
            vib.vibrate(ms)
        }
    }

    private fun vibratePattern(context: Context, pattern: LongArray) {
        val vib = getVibrator(context) ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vib.vibrate(VibrationEffect.createWaveform(pattern, -1))
        } else {
            @Suppress("DEPRECATION")
            vib.vibrate(pattern, -1)
        }
    }

    private fun getVibrator(context: Context): Vibrator? {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager)?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }
    }
}
