# E2E (Maestro)

Flows live in `e2e/maestro/`. CI runs them on an iOS simulator in `.github/workflows/ios.yml`.

## Run locally on a Mac

Requires Xcode (with an iOS simulator runtime), CocoaPods and Java 17+.

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
npm ci
npx expo run:ios --configuration Release   # builds, installs and launches on the booted simulator
xcrun simctl addmedia booted e2e/assets/recipe-screenshot.png   # theo.yaml picks it in the photo picker
maestro test e2e/maestro/jess.yaml --test-output-dir build/screens/jess
```

`smoke.yaml` needs an English simulator. The persona flows set their own language with launch arguments
(`AppleLanguages`, `AppleLocale`): `jess` and `marcus` in English, `nadia` and `theo` in French. Each flow records a
video (`startRecording`) and takes ordered screenshots. CI runs every flow; only `smoke` failing fails the job, and the
summary plus `build/maestro.xml` list persona failures. Screenshots and videos are in `build/screens/<flow>/`.

`jess` imports three live pages (BBC Good Food, Delish, Taste of Home): it needs network access and fails if a
publisher changes or blocks the page.
