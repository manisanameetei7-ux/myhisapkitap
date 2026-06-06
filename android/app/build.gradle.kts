import java.io.FileInputStream
import java.util.Properties
import com.android.build.gradle.internal.api.ApkVariantOutputImpl
import org.gradle.api.GradleException

plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("key.properties")
val hasReleaseKeystore = keystorePropertiesFile.exists()
if (hasReleaseKeystore) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}
val abiCodes = mapOf("armeabi-v7a" to 1, "arm64-v8a" to 2, "x86_64" to 3)

android {
    namespace = "hisapkitap.com"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_17.toString()
    }

    defaultConfig {
        applicationId = "hisapkitap.com"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    signingConfigs {
        if (hasReleaseKeystore) {
            create("release") {
                keyAlias = keystoreProperties["keyAlias"] as String
                keyPassword = keystoreProperties["keyPassword"] as String
                storeFile = file(keystoreProperties["storeFile"] as String)
                storePassword = keystoreProperties["storePassword"] as String
            }
        }
    }

    buildTypes {
        release {
            if (hasReleaseKeystore) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }

    applicationVariants.configureEach {
        val variant = this
        variant.outputs.forEach { output ->
            val abiVersionCode = abiCodes[
                output.filters.find { it.filterType == "ABI" }?.identifier
            ]
            if (abiVersionCode != null) {
                (output as ApkVariantOutputImpl).versionCodeOverride =
                    variant.versionCode * 10 + abiVersionCode
            }
        }
    }
}

flutter {
    source = "../.."
}

tasks.matching { it.name in listOf("bundleRelease", "packageReleaseBundle", "signReleaseBundle") }
    .configureEach {
        doFirst {
            if (!hasReleaseKeystore) {
                throw GradleException(
                    "Missing android/key.properties. Copy android/key.properties.example to " +
                        "android/key.properties, generate android/upload-keystore.jks, and add " +
                        "your private keystore passwords before building a Play Store release."
                )
            }
        }
    }
