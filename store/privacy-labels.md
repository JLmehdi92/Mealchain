# App Store privacy labels

Answers for App Store Connect › App Privacy, derived from the code on 2026-11-13. Re-check this file
whenever `src/lib/analytics.ts`, `src/lib/monitoring.ts`, `src/lib/supabase.ts`, `src/lib/sync.ts`,
`src/features/household/account.ts`, `src/features/subscription/purchase.ts` or `supabase/` changes.

## Tracking

**No.** No data is used to track users across apps or websites owned by other companies. No ads SDK, no
IDFA, no App Tracking Transparency prompt, no data broker. PostHog runs with `personProfiles: 'never'` and
`disableGeoip: true`; RevenueCat is not asked to collect device identifiers.

## Data collected

| Apple category › type | Source in code | Linked to the user | Tracking | Purposes |
|---|---|---|---|---|
| Identifiers › User ID | Supabase Auth user id after the optional Sign in with Apple (`account.ts`); the same id is sent to RevenueCat with `Purchases.logIn` (`purchase.ts`) | Yes | No | App Functionality |
| Purchases › Purchase History | RevenueCat: subscription status, product, trial and renewal dates | Yes | No | App Functionality |
| User Content › Other User Content | Signed in only: household profile (people, meals, equipment, diets, allergies) in `households.profile`, shopping-list ticks in `shopping_items`; recipes in `recipes` as the privacy policy states | Yes | No | App Functionality |
| Health & Fitness › Health | The allergies in the household profile above, stored on Supabase when signed in | Yes | No | App Functionality |
| Sensitive Info | Diets "halal" and "no pork" in the household profile can suggest religious belief | Yes | No | App Functionality |
| Usage Data › Product Interaction | PostHog: five events (`app_installed`, `first_import`, `first_plan`, `paywall_viewed`, `trial_started`) under a random install id, no `identify` call, no person profile, no IP geolocation | No | No | Analytics |
| Diagnostics › Crash Data | Sentry crash reports, `sendDefaultPii: false`, URLs, query strings and UUIDs scrubbed before sending (`monitoring.ts`) | No | No | App Functionality |
| Diagnostics › Other Diagnostic Data | Device model and OS version attached by Sentry to crash reports | No | No | App Functionality |

Why Health and Sensitive Info are declared: Apple counts health and religious data even when the user types
it. We store allergies and diets on our servers only for signed-in households, but the label covers the
app as a whole, so we declare them. This is the conservative answer.

## Not collected

- **Contact info**: Sign in with Apple is called with `requestedScopes: []`; no name, no email is asked
  for. Contact via hello@demidemi.app is outside the app.
- **Location**: no location API; PostHog GeoIP is disabled.
- **Photos or videos**: a chosen screenshot is read on the device by Apple Vision (`modules/vision-ocr`)
  and never uploaded.
- **Browsing history, search history, contacts, financial info, audio, payment details**: none. Apple
  processes payments; RevenueCat never sees card details.
- **Caption and screenshot text sent to Anthropic**: sent only after an explicit "Send", processed in
  real time by our Edge Function and Anthropic, not stored by Demidemi, not used for training. Apple's
  definition of "collect" excludes data processed only to serve the request in real time; it is listed
  in the privacy policy and the consent alert regardless.
- **Performance Data**: Sentry tracing is off (`tracesSampleRate: 0`).

## Builds without keys

Each service starts only when its `EXPO_PUBLIC_*` key is present at build time. The production build has
all of them, so answer the label as above.
