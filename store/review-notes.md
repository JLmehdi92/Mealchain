# Notes for App Review

Paste the "How to review" and "Guidelines" sections into App Store Connect › App Review Information › Notes
(4,000 characters max). Settings is the gear icon at the top right of the Week tab.

## How to review (guideline 2.1)

No account is needed. Demidemi is local-first: recipes, household settings, plans and the shopping list live
on the device, and every core feature works signed out.

1. Launch and go through the welcome screens: household (people and dinners), allergies, diets.
2. Open Settings (gear icon on the Week tab) › Load sample recipes. Eight recipes written for Demidemi are
   added to the recipe box. They share packs on purpose (cream, coconut milk, spinach, eggs, feta, leeks).
3. Open the Week tab and create the plan. The green line links the meal that opens a pack to the meal that
   finishes it, with the amount carried over.
4. Open the List tab: quantities are rounded to real packs, grouped by aisle.
5. To test import, paste a link to any public recipe page on the Recipes tab (for example a recipe page
   from a major cooking site). The recipe is read from the page's structured recipe data, without AI.

Sign in with Apple is only needed to share the list with a household or to use the AI reader for captions.
If you want to test it, any Apple Account works; no demo credentials are required.

## Guideline 4.3: what is original

The first screenshot shows the mechanism no other planner has: one opened pack split across several meals
of the week ("The other 10 cl of cream goes into Wednesday's gratin"). The planner is our own deterministic
algorithm that runs on the device. It chooses dinners from the user's own recipes so that what one recipe
opens, another one finishes, then rounds the shopping list to the pack sizes sold in US or French shops.
Demidemi ships no recipe catalogue of its own beyond the optional samples, and no AI-generated recipes or
images.

## Guideline 3.1.2: subscriptions

- Free: up to 15 recipes and the first full week (plan and shopping list).
- Demidemi Pro, auto-renewable, one subscription group, entitlement "pro":
  - Yearly: 34.99 USD / 29,99 €, 7-day free trial (introductory offer, new subscribers only).
  - Monthly: 6.99 USD / 5,99 €, no trial.
- No weekly plan. Family Sharing is enabled.
- The paywall shows the billed amount and period first, trial length, auto-renewal terms, and links to
  Terms of use and Privacy policy. Prices come from StoreKit through RevenueCat. Trial wording is shown
  only when the account is eligible.
- A local notification reminds the user 2 days before the trial ends.
- Restore: "Restore" at the top of the paywall, and Settings › Subscription › Restore purchases.
- Manage or cancel: Settings › Apple Account, as stated on the paywall.

## Guideline 5.1.1(v): account deletion

Settings › Delete account (bottom of the screen) › confirm. This deletes the account and household data on
our servers, revokes the Sign in with Apple token, deletes the purchase record at RevenueCat and erases
everything stored on the device. The subscription itself stays managed by Apple, which the screen says.

## Guideline 5.1.2: data sent to a third-party AI

- Links are parsed without AI: the page's schema.org recipe data is read on the device, or by our server
  when the page blocks direct access.
- Screenshot text is recognized on the device (Apple Vision). Caption and screenshot text is sorted into
  ingredients and steps on the device first.
- Only when that fails, and only for a signed-in user, the app shows an alert naming the recipient:
  "Send this text to Anthropic?" with "Send" and "Not now". Nothing is sent before the user taps Send.
  The text goes to our Supabase Edge Function, which calls Anthropic's API; the API key never leaves the
  server. Anthropic does not use API data to train models. Demidemi does not store the text.
- Settings › Privacy › "Ask before using the AI reader" turns the question back on.
- The privacy policy (Settings › Privacy policy) names Anthropic, Supabase, RevenueCat, Sentry and PostHog.

## Allergies and diets

Allergies, diets and equipment are coded rules tested in the app, never decided by a language model. A
recipe containing a selected allergen never enters the plan, and an ingredient the app cannot identify is
flagged and never assumed safe. Wording used everywhere: "Filter based on the ingredients you enter. It does
not replace medical advice." Full text: Settings › Allergy notice. The app never says "allergen-free".

## Content sources

Demidemi does not scrape Instagram, TikTok or any other platform. It only reads what the user gives it:
text they paste, a screenshot they pick, or a public web page they link to. Imported recipes are kept word
for word, unclear fields are marked for the user to check, and the source link is kept on the recipe.

## Contact

hello@demidemi.app
