# Vinted-Style Marketplace App — Build Plan

> A native iOS + Android secondhand-fashion marketplace, functionally equivalent to
> Vinted, built under your own brand. Mock payments for v1.

---

## 1. Product summary

A peer-to-peer marketplace where users list secondhand clothing/accessories for sale,
browse and search listings, message each other, negotiate prices, and "buy" with a
buyer-protection-style checkout. Same UX patterns as Vinted, original branding.

**Working app name (placeholder):** `Thrifted` — easy to change later.

---

## 2. Tech stack

| Layer            | Choice                                  | Why |
|------------------|-----------------------------------------|-----|
| App framework    | **Expo (React Native) + Expo Router**   | One codebase → iOS + Android, fast dev, OTA updates |
| Language         | **TypeScript**                          | Safety across a large app |
| UI / styling     | **NativeWind (Tailwind for RN)** + custom components | Vinted-like clean UI, fast to build |
| Navigation       | **Expo Router** (file-based)            | Tabs + stacks like a real mobile app |
| State            | **Zustand** (client) + **TanStack Query** (server cache) | Simple, scalable |
| Backend          | **Supabase** (Postgres + Auth + Storage + Realtime) | Auth, DB, image storage, realtime chat — all in one, generous free tier |
| Payments (v1)    | **Mocked** checkout + wallet flow       | Real UX, simulated money. Stripe Connect later |
| Images           | Supabase Storage + Expo Image Picker    | Upload/crop listing photos |
| Push (later)     | Expo Notifications                      | Messages / sale alerts |

> Backend alternative if you'd rather not use Supabase: a custom Next.js API + Postgres
> on Vercel. Supabase is recommended because it gives us auth, realtime chat, and image
> storage out of the box, which saves weeks.

---

## 3. Core feature map (vs. Vinted)

| Vinted feature                         | Our build | Phase |
|----------------------------------------|-----------|-------|
| Sign up / log in                       | Email + password (Supabase Auth), social later | 1 |
| Home feed (catalog of items)           | Infinite-scroll grid of listings | 1 |
| Search + filters (size, brand, price, category, condition) | Full search + filter sheet | 2 |
| Item detail page                       | Photos carousel, price, desc, seller, buyer protection | 1 |
| Sell / list an item (photos, category, brand, size, condition, price) | Multi-step sell flow | 1 |
| User profile (items, reviews, followers)| Profile w/ listings grid + ratings | 2 |
| Favorites / likes                      | Like button + favorites tab | 1 |
| Follow sellers                         | Follow/unfollow | 2 |
| In-app messaging                       | Realtime chat per item | 3 |
| Make an offer / negotiate price        | Offer in chat | 3 |
| Buyer protection checkout              | Mock checkout w/ fee breakdown | 3 |
| Shipping label / tracking              | Mock shipping flow + statuses | 3 |
| Wallet / balance                       | Mock wallet (earnings, payouts) | 4 |
| Reviews & ratings                      | Post-purchase reviews | 4 |
| Bundles (buy multiple from one seller) | Bundle builder | 4 |
| Notifications                          | In-app + push | 4 |

---

## 4. Data model (Postgres / Supabase)

```
users (id, email, username, avatar_url, bio, location, rating_avg, created_at)
items (id, seller_id, title, description, brand, category, subcategory,
       size, condition, color, price, status[active|reserved|sold],
       created_at)
item_photos (id, item_id, url, position)
favorites (user_id, item_id, created_at)
follows (follower_id, followed_id, created_at)
conversations (id, item_id, buyer_id, seller_id, created_at)
messages (id, conversation_id, sender_id, body, type[text|offer|system], created_at)
offers (id, conversation_id, item_id, amount, status[pending|accepted|declined])
orders (id, item_id, buyer_id, seller_id, amount, protection_fee, shipping_fee,
        total, status[pending|paid|shipped|delivered|completed], created_at)
reviews (id, order_id, reviewer_id, reviewee_id, rating, comment, created_at)
wallet_transactions (id, user_id, amount, type[sale|payout|fee], order_id, created_at)
```

Row-Level Security on all tables (users only edit their own data).

---

## 5. App screens / navigation

**Bottom tab bar (like Vinted):**
1. 🏠 **Home** — feed/catalog
2. 🔍 **Search** — search + filters
3. ➕ **Sell** — list an item (center action button)
4. 💬 **Inbox** — conversations
5. 👤 **Profile** — your profile, settings, wallet

**Stack screens:** Item detail, Seller profile, Chat thread, Sell flow (multi-step),
Checkout, Order status, Settings, Auth (login/signup/onboarding).

---

## 6. Phased roadmap

### Phase 1 — Foundation + browse + sell (the runnable MVP)
- Expo project scaffold, navigation, design system (colors/typography/components)
- Supabase project, schema, auth (sign up / log in / onboarding)
- Home feed (item grid, seeded with demo data)
- Item detail screen
- Sell flow (photo upload, fields, publish)
- Favorites
- **Deliverable:** an app you can run on your phone, sign in, browse seeded items, list a real item, like items.

### Phase 2 — Search, profiles, social
- Search + filter sheet (category, brand, size, price, condition)
- User profiles (own + others), follow/unfollow
- Edit/delete your listings

### Phase 3 — Messaging, offers, checkout
- Realtime chat per item
- Make/accept/decline offers
- Mock buyer-protection checkout (fee breakdown, "pay")
- Mock shipping flow + order statuses

### Phase 4 — Wallet, reviews, bundles, polish
- Mock wallet & payouts
- Reviews & ratings
- Bundles
- Notifications, empty states, loading skeletons, final UI polish

### (Future) Phase 5 — Real money
- Stripe Connect for real payments + escrow
- Real shipping carrier integration (DHL/Hermes/etc.)

---

## 7. What I need from you along the way
- **Phase 1:** A free Supabase account (I'll guide you; ~5 min). You give me the project URL + anon key (safe to share with the app).
- To run on your phone: install **Expo Go** from the App Store / Play Store.
- App name + a color you like (or I'll pick a tasteful default).

---

## 8. Legal note
This is an original app inspired by Vinted's UX. We will **not** use Vinted's name,
logo, trademarks, or copyrighted assets. Functionally equivalent, your own brand.
