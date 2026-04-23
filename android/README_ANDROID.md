# Android App Wrapper

This folder contains a simple Android app wrapper for the live site:

- URL: `https://skill.quantproc.com`
- Package: `com.quantproc.skill`
- Purpose: real-time mobile testing with OTP, maps, location, and dashboard flows

## What it does

- opens the live app inside a secure Android WebView
- asks for location permission so worker/client tracking works
- keeps the same backend and same OTP flow already running on the server

## To build

1. Open the `android` folder in Android Studio.
2. Let Gradle sync.
3. Build a debug APK or release AAB.
4. Install the APK on your mobile for testing.

## For Google Play

To publish on Google Play, you still need:

1. a Google Play Console developer account
2. a signed release build
3. app icons, screenshots, privacy policy, and listing text
4. your Play Console login to upload the AAB

This project is ready as the starting Android app source, but Play Store publishing itself must happen through your Google developer account.
