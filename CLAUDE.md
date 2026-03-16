# CLAUDE.md — KupiAuto.ba Project Guide

## What Is This?
KupiAuto.ba is a car marketplace for Bosnia & Herzegovina. Think AutoTrader/Carvana but for BiH. Domain owned by Z for 6 years, refused $250K offer.

## Owner
- **Name:** Zeid (Z)
- **Contact:** Via OpenClaw (Sofia is his AI assistant)
- **Domain:** www.kupiauto.ba

## Tech Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **Backend:** Firebase (Firestore, Auth, Storage) — all free tier
- **Hosting:** Vercel (free) + Firebase (free)
- **Repo:** https://github.com/Free-Palestine-4EVER/kupiautoba

## Firebase Project
- **Project ID:** kupiautoba-e7eb5
- **Auth Domain:** kupiautoba-e7eb5.firebaseapp.com
- **Storage Bucket:** kupiautoba-e7eb5.firebasestorage.app
- **Service Account:** ./service-account.json (DO NOT COMMIT)

## Architecture

### Pages (27 total)
- `/` — Homepage (hero, dealer spotlight, featured listings, just posted, brands, VIN check, how it works)
- `/oglasi` — Search & filter listings
- `/oglas/[id]` — Single listing detail (real Firestore data)
- `/objavi` — Post listing (6-step wizard + AI import)
- `/dashboard` — User dashboard
- `/dashboard/poruke` — Real-time messaging (Firestore onSnapshot)
- `/dashboard/krediti` — Credits system
- `/dashboard/sacuvano` — Saved/favorites
- `/dashboard/profil` — Profile settings
- `/saloni` — Dealer directory
- `/salon/[id]` — Individual dealer page
- `/postani-salon` — Become a dealer
- `/prijava` — Login (email + Google)
- `/registracija` — Register (2 paths: User or Auto Salon)
- `/uporedi` — Compare vehicles
- `/vin-provjera` — VIN check
- `/faq`, `/kontakt`, `/o-nama` — Info pages
- `/politika-privatnosti`, `/uslovi-koristenja` — Legal
- 404 custom page

### Key Libraries
- `src/lib/firebase.ts` — Firebase init
- `src/lib/auth-context.tsx` — Auth provider (useAuth hook)
- `src/lib/firestore.ts` — ALL Firestore CRUD (25 functions: listings, users, messages, favorites, saved searches, dealers)
- `src/lib/storage.ts` — Image upload to Firebase Storage
- `src/lib/car-data.ts` — 32 brands, 500+ models, BiH cities, fuel/transmission/body types, equipment
- `src/lib/search-parser.ts` — NLP search query parser (Bosnian)
- `src/lib/mock-data.ts` — 16 realistic mock listings for fallback

### API Routes
- `/api/import-listing` — **KILLER FEATURE** — Paste URL from any competitor, get full listing data:
  - **OLX.ba** → Uses their open mobile API (`api.olx.ba/listings/{id}`) — bypasses Cloudflare
  - **AutoPlac.ba** → Parses `__NEXT_DATA__` JSON from page HTML
  - **AutoBum.ba** → Parses `og:description` structured format + CDN images from HTML
  - All return: make, model, year, mileage, fuel, transmission, body, color, power, photos (CDN URLs), equipment, description, city
- `/api/search` — Smart search with NLP parsing
- `/api/listings` — Listings CRUD
- `/api/parse-listing-text` — Fallback text parser

### Firestore Collections
- `users` — uid, email, displayName, phone, city, isDealer, createdAt
- `listings` — Full car listing data (30+ fields)
- `dealers` — businessName, address, city, phone, package, verified, rating
- `conversations` — participants[], listingId, lastMessage, unreadCount
- `conversations/{id}/messages` — senderId, text, createdAt, read
- `users/{id}/favorites` — listingId references
- `users/{id}/savedSearches` — filter objects

### Account System
- **ONE account type** — every user can buy AND sell
- **Dealer upgrade** — user sets isDealer=true, gets entry in dealers collection
- Registration has 2 paths: "Korisnik" (regular) or "Auto Salon" (dealer with extra fields)
- Auth: email/password + Google sign-in

### Monetization Plan (not yet implemented)
- Credits system for promoting listings (featured, urgent, homepage)
- Dealer packages: Start (49 KM), Standard (99 KM), Premium (199 KM), VIP (399 KM)
- CarVertical/VIN check integration (commission)
- Display advertising

### Test Accounts in Firebase
- `test@kupiauto.ba` / `TestKupiAuto2026!` (seller)
- `buyer@kupiauto.ba` / `BuyerTest2026!` (buyer)
- `salon@kupiauto.ba` / `DealerTest2026!` (dealer — AutoHaus Premium Sarajevo)

### Design
- Color: Navy (#0A1628) + Electric Blue (#2563EB) + White
- Font: Inter
- Animations: Framer Motion throughout
- Mobile-first responsive
- Dark mode support (next-themes)

### Firestore Indexes Needed
- `conversations`: participants (array-contains) + lastMessageAt (descending)
- Create via Firebase Console or the error link in browser console

## Development
```bash
cd ~/kupiauto
npm run dev        # localhost:3000
npm run build      # production build
```

## Competitors
- autobum.ba (51K listings, 200+ shops)
- olx.ba (general marketplace, biggest in BiH)
- autoplac.ba (667 listings, small but growing)
- polovniautomobili.com (Serbian market leader)
- autoto.hr (Croatian dealer group)

## What Makes Us Different
1. AI smart search (type "Golf 7 dizel do 20000" → instant results)
2. One-click import from ALL competitors (OLX, AutoPlac, AutoBum)
3. Modern design (competitors look like 2015)
4. Free listings for everyone
5. Killer domain name (kupiauto = "buy a car" in Bosnian)
