# Keep rules for Java-WebSocket library
-keep class org.java_websocket.** { *; }
-keep interface org.java_websocket.** { *; }
-dontwarn org.java_websocket.**

# Keep rules for NanoHTTPD
-keep class fi.iki.elonen.** { *; }
-dontwarn fi.iki.elonen.**

# Keep rules for Kotlin Serialization
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-keepclassmembers class * {
    @kotlinx.serialization.Serializable *;
}
-keep class kotlinx.serialization.json.** { *; }

# Keep rules for Dagger Hilt
-keep class **_HiltComponents { *; }
-keep class **_HiltComponents$* { *; }
-keep class * implements dagger.hilt.internal.GeneratedComponent { *; }
-keep class * implements dagger.hilt.internal.GeneratedComponentManager { *; }
-keep class * implements dagger.hilt.internal.UnsafeCasts { *; }
-keep class * extends dagger.hilt.internal.ComponentEntryPoint { *; }
