# Dot & Art — Firebase Database & Storage Setup

This application uses Google Firebase (Firestore and Storage) for persistent cloud data and security.

---

## 1. Firebase Configuration

Firebase is provisioned and configured via `firebase-applet-config.json`:
* **Project ID**: `gen-lang-client-0550716143`
* **Firestore Database ID**: `ai-studio-878af9fc-6392-403d-8397-bdcc0967dab5`
* **Storage Bucket**: `gen-lang-client-0550716143.firebasestorage.app`
* **Client SDK**: `src/lib/firebase.ts` connects to Firestore and Cloud Storage with automatic offline resilience.

---

## 2. Security Rules (`firestore.rules`)

The deployed Firestore security rules enforce:
* **Public Read Access**: Published products, active categories, visible website pages, published testimonials, FAQs, and public settings.
* **Write Access**: Restricted to authorized administrative operations.

---

## 3. Data Schema & Intermediate Blueprint

The intermediate database schema is defined in `firebase-blueprint.json` covering:
* `categories`: Artwork categories (Mandala & Lippan).
* `products`: All 59 catalog items with sizes, materials, variants, and pricing.
* `media_assets`: Uploaded media items.
* `pages`: CMS page records and sections.
* `testimonials`: Collector reviews.
* `faqs`: Frequently asked questions.
* `settings`: Global website parameters.

---

## 4. Local Development

Run the full-stack dev server:
```bash
npm run dev
```
Open `http://localhost:3000` to browse the store or `http://localhost:3000/admin` to access the Admin CMS (Default PIN: `2647`).
