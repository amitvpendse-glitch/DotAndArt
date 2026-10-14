import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_TESTIMONIALS,
  INITIAL_FAQS,
  INITIAL_SETTINGS,
  INITIAL_PAGES,
} from './src/data/initialCatalog.ts';
import {
  Category,
  Product,
  Testimonial,
  FAQ,
  WebsiteSettings,
  WebsitePage,
  MediaAsset,
  AuditLog,
} from './src/types/index.ts';

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// Ensure data and uploads directories exist
const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const DB_FILE = path.join(DATA_DIR, 'db.json');

// Memory DB with atomic disk persistence
interface DBState {
  admin: {
    username: string;
    pin_hash: string;
    salt: string;
    updated_at: string;
    last_login_at?: string;
  };
  sessions: Array<{
    token_hash: string;
    admin_username: string;
    expires_at: number;
    created_at: string;
  }>;
  categories: Category[];
  products: Product[];
  media: MediaAsset[];
  pages: WebsitePage[];
  testimonials: Testimonial[];
  faqs: FAQ[];
  settings: WebsiteSettings;
  audit_logs: AuditLog[];
}

// Password hashing helper using scrypt
function hashPin(pin: string, salt: string): string {
  return crypto.scryptSync(pin, salt, 64).toString('hex');
}

// Generate secure salt
function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Load or initialize DB
function loadDB(): DBState {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (Array.isArray(data.pages)) {
        INITIAL_PAGES.forEach((initPage) => {
          if (!data.pages.some((p: WebsitePage) => p.slug === initPage.slug)) {
            data.pages.push(initPage);
          }
        });
      } else {
        data.pages = INITIAL_PAGES;
      }
      return data;
    } catch (e) {
      console.error('Error reading db.json, falling back to defaults', e);
    }
  }

  // Initial setup: Default PIN 2647
  const initialSalt = generateSalt();
  const initialHash = hashPin('2647', initialSalt);

  const initialDB: DBState = {
    admin: {
      username: 'admin',
      pin_hash: initialHash,
      salt: initialSalt,
      updated_at: new Date().toISOString(),
    },
    sessions: [],
    categories: INITIAL_CATEGORIES,
    products: INITIAL_PRODUCTS,
    media: [],
    pages: INITIAL_PAGES,
    testimonials: INITIAL_TESTIMONIALS,
    faqs: INITIAL_FAQS,
    settings: INITIAL_SETTINGS,
    audit_logs: [
      {
        id: 'log-init',
        action: 'system_initialized',
        entity_type: 'system',
        entity_id: 'db',
        safe_metadata_json: { message: 'Database initialized with catalog products and default settings' },
        created_at: new Date().toISOString(),
      },
    ],
  };

  saveDB(initialDB);
  return initialDB;
}

let db = loadDB();
let smartSyncWatcherInitialized = false;
let smartSyncDebounceTimer: NodeJS.Timeout | null = null;

interface SyncResult {
  mediaCount: number;
  updatedProductsCount: number;
  files: string[];
}

function syncImagesWithDB(): SyncResult {
  const imagesDir = path.resolve(process.cwd(), 'public/static/assets/images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Filter valid image files on disk (excluding hidden/.gitkeep and 0-byte unfinished files)
  const allEntries = fs.readdirSync(imagesDir);
  const files = allEntries.filter((f) => {
    if (f.startsWith('.')) return false;
    if (!/\.(jpg|jpeg|png|webp|svg|gif)$/i.test(f)) return false;
    try {
      const stat = fs.statSync(path.join(imagesDir, f));
      return stat.size > 0;
    } catch {
      return false;
    }
  });

  if (files.length === 0) {
    db.media = [];
    db.products.forEach((prod) => {
      prod.images = [];
    });
    db.categories.forEach((cat) => {
      cat.image_path = '';
    });
    saveDB(db);
    return { mediaCount: 0, updatedProductsCount: 0, files: [] };
  }

  // 1. Sync db.media assets
  const existingMap = new Map<string, MediaAsset>();
  (db.media || []).forEach((m) => {
    if (m.filename) existingMap.set(m.filename.toLowerCase(), m);
    if (m.storage_path) {
      existingMap.set(path.basename(m.storage_path).toLowerCase(), m);
    }
  });

  const updatedMediaList: MediaAsset[] = files.map((file, idx) => {
    const existing = existingMap.get(file.toLowerCase());
    const skuCandidate = path.basename(file, path.extname(file)).toUpperCase();
    if (existing) {
      return {
        ...existing,
        storage_path: `/public/static/assets/images/${file}`,
        filename: file,
      };
    }
    return {
      id: `img-sync-${idx}-${skuCandidate.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      storage_path: `/public/static/assets/images/${file}`,
      media_type: 'image',
      filename: file,
      title: `Artwork ${skuCandidate}`,
      created_at: new Date().toISOString(),
    };
  });
  db.media = updatedMediaList;

  // 2. Synchronize db.products matching strictly by SKU
  let updatedCount = 0;
  db.products.forEach((prod) => {
    const sku = (prod.sku || '').trim().toUpperCase();
    if (!sku) return;

    // Look for files matching this SKU (exact match or multi-photo variations)
    const matchedFiles = files.filter((f) => {
      const base = path.basename(f, path.extname(f)).trim().toUpperCase();
      return base === sku || base.startsWith(`${sku}_`) || base.startsWith(`${sku}-`);
    });

    if (matchedFiles.length > 0) {
      // Prioritize exact match as the primary photo
      matchedFiles.sort((a, b) => {
        const baseA = path.basename(a, path.extname(a)).trim().toUpperCase();
        const baseB = path.basename(b, path.extname(b)).trim().toUpperCase();
        if (baseA === sku && baseB !== sku) return -1;
        if (baseB === sku && baseA !== sku) return 1;
        return a.localeCompare(b);
      });

      prod.images = matchedFiles.map((matchedFile, i) => ({
        id: `img-${prod.id}-${i + 1}`,
        product_id: prod.id,
        storage_path: `/public/static/assets/images/${matchedFile}`,
        alt_text: `${prod.name} (${sku})`,
        caption: prod.name,
        display_order: i + 1,
        is_primary: i === 0,
      }));
      updatedCount++;
    } else {
      // If no matching image on disk for this SKU, preserve any existing images that exist on disk
      if (Array.isArray(prod.images)) {
        prod.images = prod.images.filter((img) => {
          if (!img.storage_path) return false;
          const imgBase = path.basename(img.storage_path);
          return files.includes(imgBase);
        });
      }
    }
  });

  // 3. Synchronize categories
  db.categories.forEach((cat) => {
    const slug = (cat.slug || '').toLowerCase();
    const id = (cat.id || '').toLowerCase();
    const matched = files.find((f) => {
      const base = path.basename(f, path.extname(f)).toLowerCase();
      return base === slug || base === id || base === `cat-${slug}` || base.includes(slug);
    });
    if (matched) {
      cat.image_path = `/public/static/assets/images/${matched}`;
    }
  });

  saveDB(db);
  console.log(`[SmartImageSync] Synced ${files.length} images from folder with ${updatedCount} products in database.`);
  return {
    mediaCount: files.length,
    updatedProductsCount: updatedCount,
    files,
  };
}

function initSmartImageSync() {
  const imagesDir = path.resolve(process.cwd(), 'public/static/assets/images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // 1. Initial sync immediately
  try {
    syncImagesWithDB();
  } catch (err) {
    console.error('[SmartImageSync] Initial sync error:', err);
  }

  // 2. Automated Smart Watcher
  if (smartSyncWatcherInitialized) return;
  smartSyncWatcherInitialized = true;

  try {
    fs.watch(imagesDir, (eventType, filename) => {
      if (filename && (filename.startsWith('.') || filename.endsWith('.tmp'))) {
        return;
      }
      // Debounce so rapid file creations, uploads or edits trigger a single sync once settled
      if (smartSyncDebounceTimer) {
        clearTimeout(smartSyncDebounceTimer);
      }
      smartSyncDebounceTimer = setTimeout(() => {
        try {
          console.log(`[SmartImageSync] File change in public/static/assets/images (${eventType}: ${filename || 'file'}). Syncing database...`);
          const result = syncImagesWithDB();
          logAudit('smart_image_auto_sync', 'catalog', 'file_event', {
            event_type: eventType,
            filename: filename || 'unknown',
            media_count: result.mediaCount,
            updated_products: result.updatedProductsCount,
          });
        } catch (err) {
          console.error('[SmartImageSync] Auto-sync failed:', err);
        }
      }, 350);
    });
    console.log('[SmartImageSync] Smart image file-watcher active on public/static/assets/images');
  } catch (err) {
    console.error('[SmartImageSync] Failed to initialize watcher on images folder:', err);
  }
}

initSmartImageSync();

function saveDB(state: DBState) {
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// Audit logger helper (Never logs credentials)
function logAudit(action: string, entity_type: string, entity_id: string, metadata: Record<string, any> = {}) {
  const entry: AuditLog = {
    id: `log-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    admin_user_id: 'admin',
    action,
    entity_type,
    entity_id,
    safe_metadata_json: metadata,
    created_at: new Date().toISOString(),
  };
  db.audit_logs.unshift(entry);
  if (db.audit_logs.length > 500) db.audit_logs.pop(); // keep last 500 entries
  saveDB(db);
}

// Rate Limiter for PIN Authentication
interface RateLimitRecord {
  attempts: number;
  lastAttempt: number;
  lockedUntil: number;
}
const rateLimits = new Map<string, RateLimitRecord>();

function getClientIp(req: Request): string {
  const xForwarded = req.headers['x-forwarded-for'];
  if (typeof xForwarded === 'string') return xForwarded.split(',')[0].trim();
  return req.socket.remoteAddress || 'unknown-client';
}

function checkRateLimit(ip: string): { allowed: boolean; waitTimeMs: number; remainingAttempts: number } {
  const now = Date.now();
  const record = rateLimits.get(ip) || { attempts: 0, lastAttempt: now, lockedUntil: 0 };

  // If locked out
  if (record.lockedUntil > now) {
    return {
      allowed: false,
      waitTimeMs: record.lockedUntil - now,
      remainingAttempts: 0,
    };
  }

  // Reset counter after 15 minutes of inactivity
  if (now - record.lastAttempt > 15 * 60 * 1000) {
    record.attempts = 0;
  }

  return {
    allowed: true,
    waitTimeMs: 0,
    remainingAttempts: Math.max(0, 5 - record.attempts),
  };
}

function recordAuthFailure(ip: string): { delayMs: number; locked: boolean } {
  const now = Date.now();
  const record = rateLimits.get(ip) || { attempts: 0, lastAttempt: now, lockedUntil: 0 };
  record.attempts += 1;
  record.lastAttempt = now;

  let delayMs = Math.min(10000, Math.pow(2, record.attempts) * 300);

  // If 5 or more consecutive failures, lockout for 15 minutes
  let locked = false;
  if (record.attempts >= 5) {
    record.lockedUntil = now + 15 * 60 * 1000;
    locked = true;
  }

  rateLimits.set(ip, record);
  return { delayMs, locked };
}

function resetAuthFailures(ip: string) {
  rateLimits.delete(ip);
}

// CORS & Preflight handling
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads and public asset serving with browser cache headers
const staticCacheOptions = { maxAge: '7d', etag: true };
app.use('/uploads', express.static(UPLOADS_DIR, staticCacheOptions));
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR, staticCacheOptions));
  app.use('/public', express.static(PUBLIC_DIR, staticCacheOptions));
  app.use('/public/static', express.static(path.join(PUBLIC_DIR, 'static'), staticCacheOptions));
}

// Simple Cookie Parser helper
function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      list[parts[0].trim()] = decodeURIComponent(parts.slice(1).join('=').trim());
    }
  });
  return list;
}

// Admin Authentication Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const cookies = parseCookies(req.headers.cookie);
  const token = (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null) || cookies['dot_admin_session'];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
    return;
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const now = Date.now();

  const sessionIndex = db.sessions.findIndex((s) => s.token_hash === tokenHash && s.expires_at > now);

  if (sessionIndex === -1) {
    res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
    return;
  }

  // Refresh session sliding window by 2 hours
  db.sessions[sessionIndex].expires_at = now + 2 * 60 * 60 * 1000;
  saveDB(db);

  (req as any).adminUser = db.sessions[sessionIndex].admin_username;
  next();
}

// File Upload with Multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const unique = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    cb(null, `${cleanBase}-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, GIF images and MP4 videos are permitted.'));
    }
  },
});

/* =========================================================
   AUTHENTICATION ENDPOINTS
========================================================= */

// Admin Login
app.post('/api/admin/login', async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const { pin } = req.body;

  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    res.status(429).json({
      error: `Too many failed login attempts. Please wait ${Math.ceil(rateCheck.waitTimeMs / 1000)} seconds before trying again.`,
      retry_after_seconds: Math.ceil(rateCheck.waitTimeMs / 1000),
    });
    return;
  }

  // Validate 4-digit PIN format
  if (!pin || typeof pin !== 'string' || !/^\d{4}$/.test(pin.trim())) {
    const { delayMs } = recordAuthFailure(ip);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    res.status(400).json({ error: 'Please enter a valid four-digit numeric PIN.' });
    return;
  }

  const cleanPin = pin.trim();
  const computedHash = hashPin(cleanPin, db.admin.salt);

  if (computedHash !== db.admin.pin_hash) {
    const { delayMs, locked } = recordAuthFailure(ip);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    logAudit('admin_login_failed', 'auth', 'admin', { ip });

    if (locked) {
      res.status(429).json({
        error: 'Too many incorrect attempts. Account locked for 15 minutes for security.',
        retry_after_seconds: 900,
      });
      return;
    }

    res.status(401).json({ error: 'Incorrect PIN. Access denied.' });
    return;
  }

  // Login successful
  resetAuthFailures(ip);

  // Generate 64-char cryptographically random session token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 hours idle timeout

  db.sessions.push({
    token_hash: tokenHash,
    admin_username: db.admin.username,
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  });

  db.admin.last_login_at = new Date().toISOString();
  saveDB(db);

  logAudit('admin_login_success', 'auth', 'admin', { ip });

  // Set secure same-site cookie
  res.setHeader(
    'Set-Cookie',
    `dot_admin_session=${rawToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${2 * 3600}`
  );

  res.json({
    success: true,
    token: rawToken,
    username: db.admin.username,
    expires_at: new Date(expiresAt).toISOString(),
  });
});

// Admin Session Check
app.get('/api/admin/check', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const cookies = parseCookies(req.headers.cookie);
  const token = (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null) || cookies['dot_admin_session'];

  if (!token) {
    res.json({ authenticated: false });
    return;
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const now = Date.now();
  const session = db.sessions.find((s) => s.token_hash === tokenHash && s.expires_at > now);

  if (!session) {
    res.json({ authenticated: false });
    return;
  }

  res.json({
    authenticated: true,
    username: session.admin_username,
  });
});

// Admin Logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const cookies = parseCookies(req.headers.cookie);
  const token = (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null) || cookies['dot_admin_session'];

  if (token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    db.sessions = db.sessions.filter((s) => s.token_hash !== tokenHash);
    saveDB(db);
    logAudit('admin_logout', 'auth', 'admin');
  }

  res.setHeader('Set-Cookie', 'dot_admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
  res.json({ success: true, message: 'Signed out successfully' });
});

// Admin Change PIN
app.post('/api/admin/change-pin', requireAdmin, (req: Request, res: Response) => {
  const { current_pin, new_pin, confirm_pin } = req.body;

  if (!current_pin || !new_pin || !confirm_pin) {
    res.status(400).json({ error: 'Please supply current PIN, new PIN, and confirmation.' });
    return;
  }

  if (!/^\d{4}$/.test(new_pin.trim())) {
    res.status(400).json({ error: 'New PIN must be exactly four numeric digits.' });
    return;
  }

  if (new_pin !== confirm_pin) {
    res.status(400).json({ error: 'New PIN and confirmation do not match.' });
    return;
  }

  // Validate current PIN
  const currentHash = hashPin(current_pin.trim(), db.admin.salt);
  if (currentHash !== db.admin.pin_hash) {
    res.status(401).json({ error: 'Current PIN is incorrect.' });
    return;
  }

  // Update PIN with fresh salt
  const newSalt = generateSalt();
  const newHash = hashPin(new_pin.trim(), newSalt);

  db.admin.salt = newSalt;
  db.admin.pin_hash = newHash;
  db.admin.updated_at = new Date().toISOString();

  // Invalidate all active sessions for security
  db.sessions = [];
  saveDB(db);

  logAudit('admin_pin_changed', 'auth', 'admin', { message: 'Admin four-digit PIN was securely updated.' });

  res.setHeader('Set-Cookie', 'dot_admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
  res.json({
    success: true,
    message: 'PIN successfully changed. All sessions have been logged out. Please sign in with your new PIN.',
  });
});

/* =========================================================
   PUBLIC WEBSITE ENDPOINTS
========================================================= */

// Categories (Public)
app.get('/api/categories', (_req: Request, res: Response) => {
  const activeCategories = db.categories
    .filter((c) => c.is_active)
    .sort((a, b) => a.display_order - b.display_order);
  res.json(activeCategories);
});

// Products (Public Catalog with search, filter, sort, pagination)
app.get('/api/products', (req: Request, res: Response) => {
  let list = db.products.filter((p) => p.is_published);

  const { category, search, minPrice, maxPrice, size, sort, featured } = req.query;

  if (category && typeof category === 'string' && category !== 'all') {
    list = list.filter((p) => p.category_slug === category || p.category_id === category);
  }

  if (featured === 'true') {
    list = list.filter((p) => p.featured);
  }

  if (minPrice) {
    const min = parseFloat(minPrice as string);
    if (!isNaN(min)) list = list.filter((p) => p.base_price >= min);
  }

  if (maxPrice) {
    const max = parseFloat(maxPrice as string);
    if (!isNaN(max)) list = list.filter((p) => p.base_price <= max);
  }

  if (size && typeof size === 'string' && size !== 'all') {
    const s = size.toLowerCase();
    list = list.filter((p) => {
      const matchBase = p.base_size?.toLowerCase().includes(s);
      const matchVar = p.variants?.some((v) => v.size.toLowerCase().includes(s));
      return matchBase || matchVar;
    });
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sort === 'price_asc') {
    list.sort((a, b) => a.base_price - b.base_price);
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.base_price - a.base_price);
  } else if (sort === 'name_asc') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'newest') {
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else {
    // Featured first, then newest
    list.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  res.json({
    total: list.length,
    products: list,
  });
});

// Single Product by ID or SKU (Public)
app.get('/api/products/:idOrSku', (req: Request, res: Response) => {
  const { idOrSku } = req.params;
  const product = db.products.find(
    (p) => (p.id === idOrSku || p.sku.toLowerCase() === idOrSku.toLowerCase()) && p.is_published
  );

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  // Related products from the same category
  const related = db.products
    .filter((p) => p.is_published && p.id !== product.id && p.category_id === product.category_id)
    .slice(0, 4);

  res.json({
    product,
    related,
  });
});

// Testimonials (Public)
app.get('/api/testimonials', (_req: Request, res: Response) => {
  const list = db.testimonials
    .filter((t) => t.is_published)
    .sort((a, b) => a.display_order - b.display_order);
  res.json(list);
});

// FAQs (Public)
app.get('/api/faqs', (_req: Request, res: Response) => {
  const list = db.faqs
    .filter((f) => f.is_published)
    .sort((a, b) => a.display_order - b.display_order);
  res.json(list);
});

// Website Settings (Public)
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(db.settings);
});

// Page Content (Public CMS)
app.get('/api/pages', (_req: Request, res: Response) => {
  res.json(db.pages.filter((p) => p.status === 'published'));
});

app.get('/api/pages/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const page = db.pages.find((p) => p.slug === slug && p.status === 'published');
  if (!page) {
    res.status(404).json({ error: 'Page not found' });
    return;
  }

  // Filter only visible sections sorted by display order
  const filtered = {
    ...page,
    sections: (page.sections || [])
      .filter((s) => s.is_visible)
      .sort((a, b) => a.display_order - b.display_order),
  };
  res.json(filtered);
});

// Custom Enquiry Logger (Public)
app.post('/api/custom-enquiry', (req: Request, res: Response) => {
  const { customer_name, whatsapp_number, desired_size, preferred_color_scheme } = req.body;

  if (!customer_name || !whatsapp_number) {
    res.status(400).json({ error: 'Customer name and WhatsApp number are required.' });
    return;
  }

  logAudit('custom_order_enquiry', 'customer', whatsapp_number, {
    name: customer_name,
    size: desired_size,
    color_scheme: preferred_color_scheme,
  });

  res.json({ success: true, message: 'Enquiry recorded. Ready to connect on WhatsApp.' });
});

/* =========================================================
   ADMIN CMS PROTECTED ENDPOINTS
========================================================= */

// Dashboard Stats Overview
app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  const totalProducts = db.products.length;
  const publishedProducts = db.products.filter((p) => p.is_published).length;
  const unpublishedProducts = totalProducts - publishedProducts;
  const totalCategories = db.categories.length;
  const missingImages = db.products.filter((p) => !p.images || p.images.length === 0).length;
  const recentLogs = db.audit_logs.slice(0, 10);

  res.json({
    totalProducts,
    publishedProducts,
    unpublishedProducts,
    totalCategories,
    missingImages,
    recentLogs,
  });
});

// Admin Categories CRUD
app.get('/api/admin/categories', requireAdmin, (_req: Request, res: Response) => {
  const list = db.categories.map((cat) => {
    const productCount = db.products.filter((p) => p.category_id === cat.id).length;
    return { ...cat, product_count: productCount };
  });
  res.json(list);
});

app.post('/api/admin/categories', requireAdmin, (req: Request, res: Response) => {
  const { name, slug, description, image_path, display_order, is_active } = req.body;

  if (!name || !slug) {
    res.status(400).json({ error: 'Category name and slug are required' });
    return;
  }

  const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');
  if (db.categories.some((c) => c.slug === cleanSlug)) {
    res.status(400).json({ error: 'A category with this slug already exists' });
    return;
  }

  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name: name.trim(),
    slug: cleanSlug,
    description: description || '',
    image_path: image_path || '',
    display_order: Number(display_order) || db.categories.length + 1,
    is_active: is_active ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.categories.push(newCat);
  saveDB(db);
  logAudit('category_created', 'category', newCat.id, { name: newCat.name });
  res.json(newCat);
});

app.put('/api/admin/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.categories.findIndex((c) => c.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  const { name, slug, description, image_path, display_order, is_active } = req.body;

  if (slug) {
    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');
    if (db.categories.some((c) => c.id !== id && c.slug === cleanSlug)) {
      res.status(400).json({ error: 'Slug is already used by another category' });
      return;
    }
    db.categories[index].slug = cleanSlug;
  }

  if (name) db.categories[index].name = name.trim();
  if (description !== undefined) db.categories[index].description = description;
  if (image_path !== undefined) db.categories[index].image_path = image_path;
  if (display_order !== undefined) db.categories[index].display_order = Number(display_order);
  if (is_active !== undefined) db.categories[index].is_active = Boolean(is_active);
  db.categories[index].updated_at = new Date().toISOString();

  saveDB(db);
  logAudit('category_updated', 'category', id, { name: db.categories[index].name });
  res.json(db.categories[index]);
});

app.delete('/api/admin/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { reassign_to_id, confirm_empty } = req.body;

  const catIndex = db.categories.findIndex((c) => c.id === id);
  if (catIndex === -1) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  const assignedProducts = db.products.filter((p) => p.category_id === id);
  if (assignedProducts.length > 0) {
    if (!reassign_to_id) {
      res.status(400).json({
        error: `Cannot delete category: ${assignedProducts.length} product(s) are assigned to it. Please reassign products to another category before deleting.`,
        product_count: assignedProducts.length,
      });
      return;
    }

    const targetCat = db.categories.find((c) => c.id === reassign_to_id);
    if (!targetCat) {
      res.status(400).json({ error: 'Target reassignment category does not exist' });
      return;
    }

    // Reassign products safely
    db.products.forEach((p) => {
      if (p.category_id === id) {
        p.category_id = targetCat.id;
        p.category_name = targetCat.name;
        p.category_slug = targetCat.slug;
      }
    });
  }

  const deleted = db.categories.splice(catIndex, 1)[0];
  saveDB(db);
  logAudit('category_deleted', 'category', id, { name: deleted.name });
  res.json({ success: true, message: `Category "${deleted.name}" deleted successfully` });
});

// Admin Products CRUD
app.get('/api/admin/products', requireAdmin, (req: Request, res: Response) => {
  let list = [...db.products];
  const { search, category, published, missing_images } = req.query;

  if (category && typeof category === 'string' && category !== 'all') {
    list = list.filter((p) => p.category_id === category || p.category_slug === category);
  }

  if (published !== undefined && published !== 'all') {
    list = list.filter((p) => p.is_published === (published === 'true'));
  }

  if (missing_images === 'true') {
    list = list.filter((p) => !p.images || p.images.length === 0);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  res.json({ total: list.length, products: list });
});

app.post('/api/admin/products', requireAdmin, (req: Request, res: Response) => {
  const {
    sku,
    name,
    short_description,
    description,
    category_id,
    material,
    framing,
    customizable,
    creation_time,
    shipping_info,
    special_information,
    featured,
    is_published,
    is_available,
    is_high_demand,
    extra_delivery_days,
    high_demand_message,
    base_price,
    base_size,
    images,
    variants,
  } = req.body;

  if (!name || !sku || !category_id || base_price === undefined) {
    res.status(400).json({ error: 'Name, unique SKU, category, and base price are required' });
    return;
  }

  const cleanSku = sku.trim().toUpperCase();
  if (db.products.some((p) => p.sku === cleanSku)) {
    res.status(400).json({ error: `Product SKU "${cleanSku}" is already in use.` });
    return;
  }

  const cat = db.categories.find((c) => c.id === category_id);
  const isLippanCategory = cat?.slug === 'lippan-wall-hangings' || name.toLowerCase().includes('lippan');

  const newProd: Product = {
    id: `prod-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    sku: cleanSku,
    name: name.trim(),
    short_description: short_description || '',
    description: description || '',
    category_id,
    category_name: cat?.name || '',
    category_slug: cat?.slug || '',
    material: material || 'MDF Wood, Acrylics',
    framing: framing || 'Framing not included (Ready to hang)',
    customizable: customizable ?? true,
    creation_time: creation_time || '5–7 working days',
    shipping_info: shipping_info || 'Worldwide shipping available',
    special_information: special_information || 'Wipe with dry microfiber cloth.',
    featured: Boolean(featured),
    is_published: is_published ?? true,
    is_available: is_available !== undefined ? Boolean(is_available) : true,
    is_high_demand: is_high_demand !== undefined ? Boolean(is_high_demand) : isLippanCategory,
    extra_delivery_days: extra_delivery_days !== undefined ? Number(extra_delivery_days) : (isLippanCategory ? 5 : 0),
    high_demand_message: high_demand_message || (isLippanCategory ? '✨ Loved by collectors! Due to high artisan demand and intricate mirror curing, please allow 5 additional days for our master artist to craft and perfect your sacred piece.' : ''),
    base_price: Number(base_price),
    base_size: base_size || '12 inches diameter',
    images: Array.isArray(images) ? images : [],
    variants: Array.isArray(variants) ? variants : [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.products.unshift(newProd);
  saveDB(db);
  logAudit('product_created', 'product', newProd.id, { sku: newProd.sku, name: newProd.name });
  res.json(newProd);
});

app.put('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.products.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const p = req.body;

  if (p.sku) {
    const cleanSku = p.sku.trim().toUpperCase();
    if (db.products.some((other) => other.id !== id && other.sku === cleanSku)) {
      res.status(400).json({ error: `SKU "${cleanSku}" is already taken by another product.` });
      return;
    }
    db.products[index].sku = cleanSku;
  }

  if (p.category_id) {
    const cat = db.categories.find((c) => c.id === p.category_id);
    db.products[index].category_id = p.category_id;
    if (cat) {
      db.products[index].category_name = cat.name;
      db.products[index].category_slug = cat.slug;
    }
  }

  if (p.name !== undefined) db.products[index].name = p.name;
  if (p.short_description !== undefined) db.products[index].short_description = p.short_description;
  if (p.description !== undefined) db.products[index].description = p.description;
  if (p.material !== undefined) db.products[index].material = p.material;
  if (p.framing !== undefined) db.products[index].framing = p.framing;
  if (p.customizable !== undefined) db.products[index].customizable = Boolean(p.customizable);
  if (p.creation_time !== undefined) db.products[index].creation_time = p.creation_time;
  if (p.shipping_info !== undefined) db.products[index].shipping_info = p.shipping_info;
  if (p.special_information !== undefined) db.products[index].special_information = p.special_information;
  if (p.featured !== undefined) db.products[index].featured = Boolean(p.featured);
  if (p.is_published !== undefined) db.products[index].is_published = Boolean(p.is_published);
  if (p.is_available !== undefined) db.products[index].is_available = Boolean(p.is_available);
  if (p.is_high_demand !== undefined) db.products[index].is_high_demand = Boolean(p.is_high_demand);
  if (p.extra_delivery_days !== undefined) db.products[index].extra_delivery_days = Number(p.extra_delivery_days);
  if (p.high_demand_message !== undefined) db.products[index].high_demand_message = p.high_demand_message;
  if (p.base_price !== undefined) db.products[index].base_price = Number(p.base_price);
  if (p.base_size !== undefined) db.products[index].base_size = p.base_size;
  if (p.images !== undefined) db.products[index].images = p.images;
  if (p.variants !== undefined) db.products[index].variants = p.variants;

  db.products[index].updated_at = new Date().toISOString();
  saveDB(db);
  logAudit('product_updated', 'product', id, { sku: db.products[index].sku, name: db.products[index].name });
  res.json(db.products[index]);
});

app.delete('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.products.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const deleted = db.products.splice(index, 1)[0];
  saveDB(db);
  logAudit('product_deleted', 'product', id, { sku: deleted.sku, name: deleted.name });
  res.json({ success: true, message: `Product "${deleted.name}" deleted successfully` });
});

app.post('/api/admin/products/:id/duplicate', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const original = db.products.find((p) => p.id === id);

  if (!original) {
    res.status(404).json({ error: 'Original product not found' });
    return;
  }

  const newSku = `${original.sku}-COPY-${Math.floor(100 + Math.random() * 900)}`;
  const copy: Product = {
    ...JSON.parse(JSON.stringify(original)),
    id: `prod-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    sku: newSku,
    name: `${original.name} (Copy)`,
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.products.unshift(copy);
  saveDB(db);
  logAudit('product_duplicated', 'product', copy.id, { from_sku: original.sku, new_sku: copy.sku });
  res.json(copy);
});

// Idempotent Catalog Importer (JSON / CSV Rows)
app.post('/api/admin/import-catalog', requireAdmin, (req: Request, res: Response) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    res.status(400).json({ error: 'Import items must be an array of product rows.' });
    return;
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  const details: Array<{ sku: string; name: string; status: 'inserted' | 'updated' | 'skipped' | 'failed'; reason?: string }> = [];

  for (const item of items) {
    const rawSku = item.sku || item['Product Code'] || item.code;
    const rawName = item.name || item['Product Name'];

    if (!rawSku || !rawName) {
      failed += 1;
      details.push({ sku: rawSku || 'N/A', name: rawName || 'N/A', status: 'failed', reason: 'Missing SKU or Product Name' });
      continue;
    }

    const sku = String(rawSku).trim().toUpperCase();
    const name = String(rawName).trim();
    const existingIndex = db.products.findIndex((p) => p.sku === sku);

    const price = Number(item.price || item.base_price || item['Price']) || 1500;
    const material = item.material || item['Material'] || 'MDF Wood, Acrylics';
    const framing = item.framing || item['Framing'] || 'Framing not included';
    const size = item.size || item.base_size || item['Sizes'] || '12 inches';
    const creationTime = item.creation_time || item['Creation Time'] || '5–7 working days';
    const shipping = item.shipping_info || item['Shipping'] || 'Worldwide shipping';
    const specialInfo = item.special_information || item['Special Information'] || '';
    const description = item.description || item['Description'] || `${name} — authentic handcrafted artwork.`;

    // Map Category
    let categoryId = item.category_id;
    if (!categoryId) {
      const typeStr = (item.type || item['Product Type'] || name).toLowerCase();
      if (typeStr.includes('lippan')) {
        categoryId = 'cat-lippan';
      } else {
        categoryId = 'cat-mandala';
      }
    }
    const cat = db.categories.find((c) => c.id === categoryId);

    if (existingIndex >= 0) {
      // Update existing record preserving image assets if not specified
      db.products[existingIndex] = {
        ...db.products[existingIndex],
        name,
        description,
        material,
        framing,
        base_size: size,
        base_price: price,
        creation_time: creationTime,
        shipping_info: shipping,
        special_information: specialInfo,
        category_id: categoryId,
        category_name: cat?.name || db.products[existingIndex].category_name,
        category_slug: cat?.slug || db.products[existingIndex].category_slug,
        updated_at: new Date().toISOString(),
      };
      updated += 1;
      details.push({ sku, name, status: 'updated' });
    } else {
      // Insert new product
      const newProd: Product = {
        id: `prod-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        sku,
        name,
        description,
        material,
        framing,
        customizable: true,
        creation_time: creationTime,
        shipping_info: shipping,
        special_information: specialInfo,
        featured: false,
        is_published: true,
        base_price: price,
        base_size: size,
        category_id: categoryId,
        category_name: cat?.name || 'Mandala Wall Hangings',
        category_slug: cat?.slug || 'mandala-wall-hangings',
        images: [],
        variants: [
          {
            id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            product_id: '',
            size,
            price,
            is_available: true,
            display_order: 1,
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.products.push(newProd);
      inserted += 1;
      details.push({ sku, name, status: 'inserted' });
    }
  }

  saveDB(db);
  logAudit('catalog_imported', 'catalog', 'batch', {
    total: items.length,
    inserted,
    updated,
    failed,
    skipped,
  });

  res.json({
    total_processed: items.length,
    inserted,
    updated,
    skipped,
    failed,
    details,
  });
});

// Admin Sync Images Folder with Database & Products
app.post('/api/admin/sync-images-db', requireAdmin, (req: Request, res: Response) => {
  try {
    const result = syncImagesWithDB();
    logAudit('sync_images_db', 'catalog', 'manual_trigger', {
      media_count: result.mediaCount,
      updated_products: result.updatedProductsCount,
    });

    res.json({
      success: true,
      message: `Successfully synchronized ${result.mediaCount} local images with ${result.updatedProductsCount} products in database.`,
      media_count: result.mediaCount,
      updated_products: result.updatedProductsCount,
      files: result.files,
    });
  } catch (err: any) {
    res.status(500).json({ error: `Image synchronization failed: ${err.message}` });
  }
});

// Admin Smart Sync Status
app.get('/api/admin/smart-sync-status', requireAdmin, (_req: Request, res: Response) => {
  const imagesDir = path.resolve(process.cwd(), 'public/static/assets/images');
  let filesCount = 0;
  if (fs.existsSync(imagesDir)) {
    filesCount = fs.readdirSync(imagesDir).filter((f) => !f.startsWith('.') && /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(f)).length;
  }
  res.json({
    active: true,
    folder: 'public/static/assets/images',
    total_images_on_disk: filesCount,
    total_media_in_db: db.media.length,
    total_products_in_db: db.products.length,
  });
});

// Admin File Uploads
app.post('/api/uploads', requireAdmin, upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const relativePath = `/uploads/${req.file.filename}`;
  const isVideo = req.file.mimetype.startsWith('video/');

  const asset: MediaAsset = {
    id: `media-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    storage_path: relativePath,
    media_type: isVideo ? 'video' : 'image',
    filename: req.file.filename,
    title: req.file.originalname,
    alt_text: req.body.alt_text || '',
    caption: req.body.caption || '',
    file_size: req.file.size,
    created_at: new Date().toISOString(),
  };

  db.media.unshift(asset);
  saveDB(db);
  logAudit('media_uploaded', 'media', asset.id, { filename: asset.filename, path: asset.storage_path });

  res.json({
    success: true,
    file_path: relativePath,
    asset,
  });
});

// Admin Media Library CRUD
app.get('/api/admin/media', requireAdmin, (_req: Request, res: Response) => {
  // Compute references for each asset
  const mediaWithRefs = db.media.map((asset) => {
    let count = 0;
    // check products
    db.products.forEach((p) => {
      if (p.images?.some((img) => img.storage_path === asset.storage_path)) count++;
    });
    // check categories
    db.categories.forEach((c) => {
      if (c.image_path === asset.storage_path) count++;
    });
    return { ...asset, referenced_count: count };
  });
  res.json(mediaWithRefs);
});

app.delete('/api/admin/media/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const assetIndex = db.media.findIndex((m) => m.id === id);

  if (assetIndex === -1) {
    res.status(404).json({ error: 'Media asset not found' });
    return;
  }

  const asset = db.media[assetIndex];

  // Check references
  const usedInProducts = db.products.filter((p) =>
    p.images?.some((img) => img.storage_path === asset.storage_path)
  );

  if (usedInProducts.length > 0 && !req.query.force) {
    res.status(400).json({
      error: `This media file is currently in use by ${usedInProducts.length} product(s). To delete anyway, confirm force deletion.`,
      referenced_products: usedInProducts.map((p) => ({ id: p.id, name: p.name })),
    });
    return;
  }

  // Remove physical file safely
  const localFile = path.join(UPLOADS_DIR, asset.filename);
  if (fs.existsSync(localFile)) {
    try {
      fs.unlinkSync(localFile);
    } catch (e) {
      console.warn('Could not remove file from disk:', localFile, e);
    }
  }

  db.media.splice(assetIndex, 1);
  saveDB(db);
  logAudit('media_deleted', 'media', id, { filename: asset.filename });
  res.json({ success: true, message: 'Media asset deleted successfully' });
});

// Admin CMS Pages CRUD
app.get('/api/admin/pages', requireAdmin, (_req: Request, res: Response) => {
  let updated = false;
  INITIAL_PAGES.forEach((initPage) => {
    if (!db.pages.some((p) => p.slug === initPage.slug)) {
      db.pages.push(initPage);
      updated = true;
    }
  });
  if (updated) saveDB(db);
  res.json(db.pages);
});

app.post('/api/admin/pages', requireAdmin, (req: Request, res: Response) => {
  const { title, slug, seo_title, meta_description, status, sections } = req.body;
  if (!title || !slug) {
    res.status(400).json({ error: 'Title and URL slug are required.' });
    return;
  }
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
  if (db.pages.some((p) => p.slug === cleanSlug)) {
    res.status(400).json({ error: 'A page with this slug already exists.' });
    return;
  }
  const newPage = {
    id: `page-${Date.now()}`,
    slug: cleanSlug,
    title,
    seo_title: seo_title || title,
    meta_description: meta_description || '',
    status: status || 'published',
    sections: Array.isArray(sections) ? sections : [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.pages.push(newPage);
  saveDB(db);
  logAudit('page_created', 'page', cleanSlug, { title });
  res.json(newPage);
});

app.put('/api/admin/pages/:slug', requireAdmin, (req: Request, res: Response) => {
  const { slug } = req.params;
  const index = db.pages.findIndex((p) => p.slug === slug);

  if (index === -1) {
    res.status(404).json({ error: 'Page not found' });
    return;
  }

  const { title, seo_title, meta_description, og_image_path, status, sections } = req.body;

  if (title) db.pages[index].title = title;
  if (seo_title !== undefined) db.pages[index].seo_title = seo_title;
  if (meta_description !== undefined) db.pages[index].meta_description = meta_description;
  if (og_image_path !== undefined) db.pages[index].og_image_path = og_image_path;
  if (status && ['published', 'draft'].includes(status)) db.pages[index].status = status;
  if (Array.isArray(sections)) {
    db.pages[index].sections = sections;
    if (slug === 'home') {
      const bannerSec = sections.find((s: any) => s.section_type === 'banner' || s.section_key === 'banner');
      if (bannerSec?.content_json) {
        db.settings.showcase_banner = {
          ...(db.settings.showcase_banner || {}),
          ...bannerSec.content_json,
        };
      }
    }
    if (slug === 'contact') {
      if (req.body.settings && typeof req.body.settings === 'object') {
        db.settings = {
          ...db.settings,
          ...req.body.settings,
        };
      }
      const contactSettingsSec = sections.find(
        (s: any) => s.section_key === 'contact_settings' || s.section_key === 'brand_identity'
      );
      if (contactSettingsSec?.content_json) {
        db.settings = {
          ...db.settings,
          ...contactSettingsSec.content_json,
        };
      }
    }
  }

  db.pages[index].updated_at = new Date().toISOString();
  saveDB(db);
  logAudit('page_updated', 'page', slug, { title: db.pages[index].title, status: db.pages[index].status });
  res.json(db.pages[index]);
});

// Admin Testimonials CRUD
app.get('/api/admin/testimonials', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.testimonials);
});

app.post('/api/admin/testimonials', requireAdmin, (req: Request, res: Response) => {
  const { customer_name, content, rating, location, artwork_purchased, image_path, display_order, is_published } =
    req.body;

  if (!customer_name || !content) {
    res.status(400).json({ error: 'Customer name and content are required' });
    return;
  }

  const item: Testimonial = {
    id: `test-${Date.now()}`,
    customer_name: customer_name.trim(),
    content: content.trim(),
    rating: Number(rating) || 5,
    location: location || '',
    artwork_purchased: artwork_purchased || '',
    image_path: image_path || '',
    display_order: Number(display_order) || db.testimonials.length + 1,
    is_published: is_published ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.testimonials.push(item);
  saveDB(db);
  logAudit('testimonial_created', 'testimonial', item.id, { customer_name: item.customer_name });
  res.json(item);
});

app.put('/api/admin/testimonials/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.testimonials.findIndex((t) => t.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Testimonial not found' });
    return;
  }

  const body = req.body;
  if (body.customer_name) db.testimonials[index].customer_name = body.customer_name;
  if (body.content) db.testimonials[index].content = body.content;
  if (body.rating !== undefined) db.testimonials[index].rating = Number(body.rating);
  if (body.location !== undefined) db.testimonials[index].location = body.location;
  if (body.artwork_purchased !== undefined) db.testimonials[index].artwork_purchased = body.artwork_purchased;
  if (body.image_path !== undefined) db.testimonials[index].image_path = body.image_path;
  if (body.display_order !== undefined) db.testimonials[index].display_order = Number(body.display_order);
  if (body.is_published !== undefined) db.testimonials[index].is_published = Boolean(body.is_published);

  db.testimonials[index].updated_at = new Date().toISOString();
  saveDB(db);
  logAudit('testimonial_updated', 'testimonial', id);
  res.json(db.testimonials[index]);
});

app.delete('/api/admin/testimonials/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.testimonials.findIndex((t) => t.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Testimonial not found' });
    return;
  }
  const deleted = db.testimonials.splice(index, 1)[0];
  saveDB(db);
  logAudit('testimonial_deleted', 'testimonial', id, { customer_name: deleted.customer_name });
  res.json({ success: true, message: 'Testimonial deleted' });
});

// Admin FAQs CRUD
app.get('/api/admin/faqs', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.faqs);
});

app.post('/api/admin/faqs', requireAdmin, (req: Request, res: Response) => {
  const { question, answer, category, display_order, is_published } = req.body;
  if (!question || !answer) {
    res.status(400).json({ error: 'Question and answer are required' });
    return;
  }

  const faq: FAQ = {
    id: `faq-${Date.now()}`,
    question: question.trim(),
    answer: answer.trim(),
    category: category || 'General',
    display_order: Number(display_order) || db.faqs.length + 1,
    is_published: is_published ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.faqs.push(faq);
  saveDB(db);
  logAudit('faq_created', 'faq', faq.id, { question: faq.question });
  res.json(faq);
});

app.put('/api/admin/faqs/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.faqs.findIndex((f) => f.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'FAQ not found' });
    return;
  }

  const body = req.body;
  if (body.question) db.faqs[index].question = body.question;
  if (body.answer) db.faqs[index].answer = body.answer;
  if (body.category) db.faqs[index].category = body.category;
  if (body.display_order !== undefined) db.faqs[index].display_order = Number(body.display_order);
  if (body.is_published !== undefined) db.faqs[index].is_published = Boolean(body.is_published);

  db.faqs[index].updated_at = new Date().toISOString();
  saveDB(db);
  logAudit('faq_updated', 'faq', id);
  res.json(db.faqs[index]);
});

app.delete('/api/admin/faqs/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.faqs.findIndex((f) => f.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'FAQ not found' });
    return;
  }
  const deleted = db.faqs.splice(index, 1)[0];
  saveDB(db);
  logAudit('faq_deleted', 'faq', id, { question: deleted.question });
  res.json({ success: true, message: 'FAQ deleted' });
});

// Admin Settings CRUD
app.get('/api/admin/settings', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.settings);
});

app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const newSettings = req.body;
  db.settings = {
    ...db.settings,
    ...newSettings,
  };
  saveDB(db);
  logAudit('settings_updated', 'settings', 'global');
  res.json(db.settings);
});

// Admin Audit Logs
app.get('/api/admin/audit-logs', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.audit_logs);
});

/* =========================================================
   SEO & SITEMAP ENDPOINTS
========================================================= */

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const baseUrl = `https://${db.settings.domain || 'dotandart.in'}`;
  const now = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${baseUrl}/shop`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/custom-order`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}/about`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${baseUrl}/gallery`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}/testimonials`, priority: '0.7', changefreq: 'weekly' },
    { loc: `${baseUrl}/faq`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${baseUrl}/contact`, priority: '0.7', changefreq: 'monthly' },
  ];

  const productUrls = db.products
    .filter((p) => p.is_published)
    .map((p) => ({
      loc: `${baseUrl}/product/${p.sku}`,
      priority: p.featured ? '0.8' : '0.6',
      changefreq: 'weekly',
    }));

  const urls = [...staticUrls, ...productUrls];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.send(sitemapXml);
});

app.get('/robots.txt', (_req: Request, res: Response) => {
  const baseUrl = `https://${db.settings.domain || 'dotandart.in'}`;
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin/

Sitemap: ${baseUrl}/sitemap.xml
`);
});

// Explicit JSON 404 for unmatched /api/* requests so client fetch doesn't receive HTML
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

/* =========================================================
   SERVER START & VITE SPA INTEGRATION
========================================================= */

async function startServer() {
  if (!IS_PROD) {
    // Development Mode: Mount Vite in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode: Serve static build
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Dot & Art Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
