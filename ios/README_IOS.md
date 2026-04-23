# iOS App Wrapper

This folder contains a simple iOS app wrapper for the live site:

- URL: `https://skill.quantproc.com`
- Bundle suggestion: `com.quantproc.skill`
- Purpose: real-time iPhone testing with OTP, maps, location, and dashboard flows

## What it does

- opens the live app inside a secure WKWebView
- asks for location permission so worker/client tracking works
- keeps the same backend and same OTP flow already running on the server

## To build

1. Open the `ios/SkillQuantprocApp.xcodeproj` project in Xcode on a Mac.
2. Choose your Apple Developer team and bundle identifier.
3. Build and run on an iPhone or simulator.

## For App Store

To publish on the App Store, you still need:

1. an Apple Developer account
2. signing and provisioning setup
3. app icons, screenshots, privacy policy, and listing text
4. App Store Connect access to upload the archive
