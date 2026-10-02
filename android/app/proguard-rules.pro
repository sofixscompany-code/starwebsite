# ProGuard rules for Star Coaching Institute Android App

# Capacitor
-keep class com.getcapacitor.** { *; }
-keep class com.starcoaching.institute.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Keep JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Preserve annotations
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable

# General Android
-keep class * extends android.app.Activity
-keep class * extends android.app.Application
-keep class * extends android.app.Service
-keep class * extends android.content.BroadcastReceiver
-keep class * extends android.content.ContentProvider
