#!/usr/bin/env bash
# Run from the repo root: bash mobile/setup.sh
# Creates a fresh Expo project and installs this app's source into it, so versions always match your Expo SDK.
set -e
cd "$(dirname "$0")/.."
mkdir -p .tmp-src && cp -r mobile/App.js mobile/src mobile/.env.example mobile/eas.json .tmp-src/
rm -rf mobile
npx create-expo-app@latest mobile --template blank --no-install
cd mobile
npm install
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context expo-secure-store
cp ../.tmp-src/App.js ./App.js && rm -rf src && cp -r ../.tmp-src/src ./src && cp ../.tmp-src/.env.example ./.env.example && cp ../.tmp-src/eas.json ./eas.json
cp .env.example .env
rm -rf ../.tmp-src
echo "Done. Edit mobile/.env then run: cd mobile && npx expo start"
