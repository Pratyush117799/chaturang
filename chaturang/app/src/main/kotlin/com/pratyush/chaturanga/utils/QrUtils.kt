package com.pratyush.chaturanga.utils

import android.graphics.Bitmap
import android.graphics.Color
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.qrcode.QRCodeWriter

object QrUtils {
    /**
     * Generates a gold-on-dark QR code bitmap.
     * Dark modules = 0xFF1A0E00 (app dark bg), Light modules = 0xFFC9A84C (gold).
     */
    fun generateQrBitmap(content: String, sizePx: Int = 512): Bitmap {
        val hints = mapOf(EncodeHintType.MARGIN to 1)
        val writer = QRCodeWriter()
        val matrix = writer.encode(content, BarcodeFormat.QR_CODE, sizePx, sizePx, hints)
        val bitmap = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.ARGB_8888)
        for (x in 0 until sizePx) {
            for (y in 0 until sizePx) {
                // Dark modules = very dark brown; light modules = gold
                bitmap.setPixel(x, y, if (matrix[x, y]) 0xFF1A0E00.toInt() else 0xFFC9A84C.toInt())
            }
        }
        return bitmap
    }
}
