# Thrifted — a Vinted-style marketplace (Expo / React Native)

A native iOS + Android secondhand-fashion marketplace. Runs entirely on built-in
mock data, so it works in **Expo Go with zero backend setup**.

## Run it on your phone (2 minutes)

1. Install **Expo Go** from the App Store / Google Play.
2. In this folder run:
   ```bash
   npm install      # first time only
   npm start
   ```
3. Scan the QR code in the terminal with:
   - **iPhone:** the Camera app
   - **Android:** the Expo Go app
4. The app loads on your phone. Tap **Sign up** (any email/password works — it's mocked).

> Prefer a simulator? `npm run ios` (Mac + Xcode) or `npm run android` (Android Studio).

## What's built (all 4 phases)

- **Auth** — welcome / login / sign up (mocked)
- **Home feed** — item grid + category filter
- **Search** — text search + filters (category, brand, size, condition) + sorting
- **Item detail** — photo carousel, buyer protection, details, seller card
- **Sell** — photo picker + full listing form, publishes to the feed
- **Profile** — your listings / favorites / reviews, stats, wallet card
- **Seller profiles** — public profile, follow/unfollow
- **Inbox + Chat** — conversations, realtime-style messaging, **make an offer** (accept/decline)
- **Checkout** — buyer-protection fee breakdown, mock payment
- **Order tracking** — paid → shipped → delivered → completed, leave a review
- **Wallet** — balance + transaction history (mock)
- **Favorites / likes, follows, reviews & ratings**

## Project structure

```
app/                 # screens (Expo Router, file-based)
  (auth)/            # welcome, login, signup
  (tabs)/            # home, search, sell, inbox, profile
  item/[id]          # item detail
  seller/[id]        # public seller profile
  chat/[id]          # conversation thread
  checkout/[id]      # checkout modal
  order/[id]         # order tracking
  settings, wallet
components/           # Avatar, Button, ItemCard, Chip, StarRating, …
lib/
  store.ts           # Zustand app state (all data + actions) — the mock "backend"
  mockData.ts        # seeded users, items, conversations, reviews
  supabase.ts        # Supabase client, ready for real backend
  types.ts, constants.ts, format.ts
```

## Connecting a real backend (next step)

The app is structured so the mock store in `lib/store.ts` can be swapped for
Supabase calls. `lib/supabase.ts` already wires the client — add a Supabase
project URL + anon key to a `.env` file (see `.env.example`) and we migrate the
store actions one by one. Real payments (Stripe) and shipping come after that.

## Notes

- Demo images load from pravatar (avatars) and loremflickr (clothing) — they need
  an internet connection. Real listings use your uploaded photos.
- This is an original app inspired by Vinted's UX. It uses no Vinted branding,
  logos, or assets.
```
