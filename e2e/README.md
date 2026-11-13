# E2E (Maestro)

Flows live in `e2e/maestro/`. CI runs them on an iOS simulator in `.github/workflows/ios.yml`.

## Run locally on a Mac

Requires Xcode (with an iOS simulator runtime), CocoaPods and Java 17+.

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
npm ci
npx expo run:ios --configuration Release   # builds, installs and launches on the booted simulator
maestro test e2e/maestro --test-output-dir build/screens
```

The simulator must be in English (en-US) for the text assertions. Screenshots land in `build/screens`.
