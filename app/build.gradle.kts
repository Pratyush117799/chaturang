plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.hilt)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.pratyush.chaturanga"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.pratyush.chaturanga"
        minSdk = 28
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = "1.8"
        freeCompilerArgs += listOf(
            "-opt-in=kotlinx.serialization.ExperimentalSerializationApi"
        )
    }

    buildFeatures {
        compose = true
    }

    packaging {
        resources {
            excludes += listOf(
                "META-INF/DEPENDENCIES",
                "META-INF/LICENSE",
                "META-INF/LICENSE.txt",
                "META-INF/license.txt",
                "META-INF/NOTICE",
                "META-INF/NOTICE.txt",
                "META-INF/notice.txt",
                "META-INF/ASL2.0",
                "META-INF/*.kotlin_module"
            )
        }
    }
}

dependencies {
    # Core KTX & Splashscreen
    implementation(libs.core-ktx)
    implementation(libs.splashscreen)
    implementation(libs.activity-compose)

    # Compose BOM & UI
    implementation(platform(libs.compose-bom))
    implementation(libs.compose-ui)
    implementation(libs.compose-material3)
    implementation(libs.compose-animation)
    implementation(libs.compose-foundation)
    implementation(libs.compose-ui-tooling-preview)
    debugImplementation(libs.compose-ui-tooling)

    # Navigation Compose
    implementation(libs.navigation-compose)

    # Lifecycle & ViewModels
    implementation(libs.lifecycle-viewmodel-compose)
    implementation(libs.lifecycle-runtime-compose)

    # Preferences DataStore
    implementation(libs.datastore-preferences)

    # Hilt DI
    implementation(libs.hilt-android)
    ksp(libs.hilt-compiler)
    implementation(libs.hilt-navigation-compose)

    # Network client (OkHttp WebSocket)
    implementation(libs.okhttp)
    implementation(libs.okhttp-logging)

    # Local Server libraries (WebSockets & NanoHTTPD)
    implementation(libs.java-websocket)
    implementation(libs.nanohttpd)

    # Barcode Scanning (CameraX + ML Kit)
    implementation(libs.camerax-core)
    implementation(libs.camerax-camera2)
    implementation(libs.camerax-lifecycle)
    implementation(libs.camerax-view)
    implementation(libs.mlkit-barcode)

    # QR Generation (ZXing Core)
    implementation(libs.zxing-core)

    # Serialization
    implementation(libs.kotlinx-serialization-json)

    # Coroutines
    implementation(libs.coroutines-android)

    # Image loading (Coil)
    implementation(libs.coil)

    # Testing dependencies
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
    androidTestImplementation(platform(libs.compose-bom))
    androidTestImplementation(libs.compose-ui)
}
