# Dot & Art — Handcrafted Mandala & Lippan Artwork Website & Admin CMS

A full-stack, production-ready website and Content Management System for **Dot & Art** (`dotandart.in`), showcasing authentic handcrafted sacred mandala paintings and traditional Kutch Lippan mud-mirror art.

---

## 1. Features Overview

* **59 Authentic Initial Catalog Artworks**:
  * 35 Mandala Wall Hangings (`DNA-MAN-001` through `DNA-MAN-035`)
  * 24 Lippan Wall Hangings (`DNA-LIP-001` through `DNA-LIP-024`)
  * Accurate sizes from compact 6-inch meditation plaques to 36-inch and 48-inch grand architectural pieces.
  * Preserved pricing ranging from ₹650 to ₹25,000 INR.
  * Real materials (engineered moisture-resistant MDF, professional heavy body acrylics, organic clay recipe, craft mirrors/abhla, protective varnish).
* **Graceful Artwork Placeholders**:
  * Authentic handcrafted SVG placeholders showing sacred geometry and mirrors when photos are awaiting upload.
* **WhatsApp Ordering & Multi-Product Enquiry Flow**:
  * Multi-item enquiry bag supporting multiple artworks, chosen size variants, quantities, and item-specific customization notes.
  * Customer details validation (Name, WhatsApp number, Delivery location).
  * Review step before opening WhatsApp.
  * Pre-formatted URL-encoded message directing to business number **+91 8652162647**.
  * 50% advance / 50% pre-dispatch payment policy clearly stated.
* **Bespoke Custom Mandala Commissions (`/custom-order`)**:
  * Specialized bespoke form with diameter selection, color palette choice, central photo/deity requirement, and instant WhatsApp generation.
* **Comprehensive Website CMS**:
  * Home, About, Gallery, Testimonials, FAQ, Contact, and Legal Policies (Privacy, Terms, Shipping, Refund).
* **Protected Admin CMS (`/admin`)**:
  * Server-validated 4-digit PIN authentication (Initial PIN: `2647`).
  * Salted hashing (`scrypt`) with server-side brute force rate limiting and progressive delays.
  * Category management with safe delete protection (requires reassigning products).
  * Product CRUD with image uploads, size variant pricing, duplicate, and publish toggles.
  * Idempotent catalog importer reporting inserted, updated, skipped, and failed records.
  * Media library with reference tracking and safe deletion checks.
  * Change PIN function requiring current PIN and confirmation (invalidates active sessions).
  * Administrative audit log history.

---

## 2. Technology Stack

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons.
* **Backend**: Express running in `server.ts` with Vite middlewares in development mode.
* **Database & Persistence**:
  * Google Firebase Firestore database (`ai-studio-878af9fc-6392-403d-8397-bdcc0967dab5`) with deployed security rules (`firestore.rules`).
  * Full JSON persistence layer (`data/db.json` with atomic writes) ensuring immediate offline/fallback reliability.
* **Storage**: Server object storage (`uploads/`) with type and size validation; ready for Firebase Cloud Storage.

---

## 3. Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start full-stack server (runs on `http://localhost:3000`):
   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser.
   * Customer website: `http://localhost:3000`
   * Admin CMS: `http://localhost:3000/admin` (Initial PIN: `2647`)

---

## 4. Firebase Setup & Production Deployment

See `FIREBASE_SETUP.md` for detailed instructions.
* Configuration is auto-loaded from `firebase-applet-config.json`.
* Security rules are deployed via `firestore.rules`.
* Intermediate schema is defined in `firebase-blueprint.json`.

### Production Build:
```bash
npm run build
npm start
```

---

## 5. Acceptance Test Verification Report

| # | Test Requirement | Status | Verification Notes |
|---|------------------|:------:|-------------------|
| 1 | Admin can log in using initial 4-digit PIN | PASS | Initial PIN `2647` logs in and issues session token |
| 2 | PIN not exposed in frontend code or public responses | PASS | Plaintext PIN never exists in client; verified server-side only |
| 3 | Admin can change PIN to new 4-digit numeric value | PASS | Tested `/api/admin/change-pin` with validation |
| 4 | Old PIN stops working after change | PASS | New salted hash replaces old record; old PIN fails |
| 5 | Repeated incorrect PIN attempts rate-limited | PASS | Exponential backoff delay + 15 min lockout on 5 failures |
| 6 | Unauthenticated visitor blocked from admin API | PASS | `requireAdmin` middleware enforces 401 Unauthorized |
| 7 | Category CRUD operations working | PASS | Create, edit, reorder, active toggle, and safe delete |
| 8 | Product CRUD operations working | PASS | Search, filter, full editor, variant pricing, duplicate |
| 9 | Upload, preview, reorder, remove product photos | PASS | Multiple uploads via `/api/uploads` with primary selector |
| 10 | Uploaded images persist after refresh and logout | PASS | Storage paths stored in database and served via `/uploads/*` |
| 11 | Product data persists across server restarts | PASS | Persisted to disk via atomic writes |
| 12 | All 59 catalog records imported without duplicates | PASS | Idempotent importer checks unique SKU key |
| 13 | Original names, codes, prices, sizes preserved | PASS | All 59 authentic items mapped from workbook specs |
| 14 | Admin can edit every supported website page | PASS | Home, About, Shop, Custom, Policies editable in CMS |
| 15 | Draft changes remain unpublished | PASS | Only `is_published: true` / `status: 'published'` sent publicly |
| 16 | Published page changes appear on live site | PASS | Live query updates immediately upon save |
| 17 | Gallery, testimonials, FAQs, settings manageable | PASS | Dedicated CMS tabs for each entity |
| 18 | Product filters and search work against database | PASS | Search by SKU/name, category, price, size filter, sorting |
| 19 | Multi-product WhatsApp enquiry formatted | PASS | Formats Section 7 template with URL encoding |
| 20 | Custom-order form validation works | PASS | Validates name, phone, address; generates bespoke WhatsApp message |
| 21 | Direct API calls cannot bypass admin auth | PASS | All admin mutating endpoints protected by session check |
| 22 | Database and storage prevent unauthorized edits | PASS | RLS policies provided; public gets read-only |
| 23 | Destructive actions require confirmation | PASS | Category and media deletion check reference counts |
| 24 | No production operation relies on mock storage | PASS | Fully persistent backend server data layer |
| 25 | Project compiles and builds successfully | PASS | Verified with `compile_applet` and `lint_applet` |

---

## 6. Backup and Recovery Procedure

1. **Backup Data**:
   * Copy `data/db.json` and the `uploads/` directory to your secure backup archive:
     ```bash
     tar -czvf dot_art_backup_$(date +%Y%m%d).tar.gz data/db.json uploads/
     ```
2. **Restore Data**:
   * Extract archive into repository root:
     ```bash
     tar -xzvf dot_art_backup_YYYYMMDD.tar.gz
     ```
   * Restart server with `npm start` or `npm run dev`.
