import express from "express";
import cors from "cors";
import pg from "pg";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 5001;

// Shared JWT Secret - MUST match auth-service
const JWT_SECRET = process.env.JWT_SECRET || "molochain-production-jwt-secret-2024";
const LOCAL_JWT_SECRET = "mololink-secret-key-change-in-production"; // Fallback for old tokens

// Central Auth Service Configuration
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://172.22.0.1:7010";
const SSO_CONFIG = {
  issuer: "auth.molochain.com",
  audience: ["molochain.com", "mololink.molochain.com", "opt.molochain.com", "cms.molochain.com"],
  cookieDomain: ".molochain.com",
  loginUrl: "https://auth.molochain.com/login",
  logoutUrl: "https://auth.molochain.com/logout"
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://molodb:MololinkSecure2024@host.docker.internal:5432/mololinkdb"
});

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'public', 'uploads', 'profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// CORS for all molochain subdomains
app.use(cors({ 
  origin: [
    "https://mololink.molochain.com", 
    "https://molochain.com",
    "https://www.molochain.com",
    "https://auth.molochain.com",
    "https://opt.molochain.com",
    "https://cms.molochain.com"
  ], 
  credentials: true 
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(express.static(path.join(__dirname, "public")));

// ============================================
// HYBRID JWT VERIFICATION (Central + Local)
// ============================================

// Create SSO token (uses shared JWT_SECRET for cross-domain compatibility)
function createLocalToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString("base64url");
  // Use shared JWT_SECRET for SSO compatibility across all Molochain services
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payloadB64}`).digest("base64url");
  return `${header}.${payloadB64}.${signature}`;
}

// Verify SSO token (uses shared JWT_SECRET for cross-domain compatibility)
function verifyLocalToken(token) {
  try {
    const [header, payload, signature] = token.split(".");
    // Use shared JWT_SECRET for SSO compatibility
    const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
    if (signature !== expectedSig) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (data.exp < Date.now()) return null;
    return data;
  } catch { return null; }
}

// Verify central SSO token (from auth-service)
function verifyCentralToken(token) {
  try {
    const [header, payload, signature] = token.split(".");
    
    // Try with shared JWT secret
    const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
    if (signature !== expectedSig) return null;
    
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    
    // Check expiration (central tokens use exp in seconds since epoch)
    const now = Math.floor(Date.now() / 1000);
    if (data.exp && data.exp < now) return null;
    
    // Validate issuer if present
    if (data.iss && data.iss !== SSO_CONFIG.issuer) {
      console.log("Token issuer mismatch:", data.iss);
      return null;
    }
    
    return data;
  } catch (e) { 
    console.log("Central token verification error:", e.message);
    return null; 
  }
}

// Hybrid token verification - tries central first, then local
function verifyToken(token) {
  // First try central SSO token
  let user = verifyCentralToken(token);
  if (user) {
    user.authType = "central";
    return user;
  }
  
  // Fallback to local token
  user = verifyLocalToken(token);
  if (user) {
    user.authType = "local";
    return user;
  }
  
  return null;
}

// Parse cookies manually (no cookie-parser needed)
function parseCookies(req) {
  const cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.split('=');
      cookies[name.trim()] = decodeURIComponent(rest.join('='));
    });
  }
  return cookies;
}

// Auth middleware with hybrid support (Bearer token + SSO cookie)
function authMiddleware(req, res, next) {
  // First try Authorization header
  let token = req.headers.authorization?.split(" ")[1];
  
  // Fallback to SSO cookie
  if (!token) {
    const cookies = parseCookies(req);
    token = cookies['sso.sid'];
  }
  
  if (!token) return res.status(401).json({ error: "No token provided" });
  
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: "Invalid or expired token" });
  
  req.user = user;
  next();
}

// ============================================
// HEALTH & SSO CONFIG ENDPOINTS
// ============================================

app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "mololink-service", 
    version: "3.0.0",
    features: {
      ssoEnabled: true,
      centralAuth: AUTH_SERVICE_URL,
      hybridAuth: true
    },
    timestamp: new Date().toISOString() 
  });
});

// SSO configuration endpoint for frontend
app.get("/api/sso/config", (req, res) => {
  res.json({
    success: true,
    config: SSO_CONFIG,
    authServiceUrl: AUTH_SERVICE_URL.replace(/^http:\/\/[^:]+/, 'https://auth.molochain.com')
  });
});

// Verify token endpoint (for SSO validation)
app.get("/api/auth/verify", authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user,
    authType: req.user.authType
  });
});

// ============================================
// LOCAL AUTH (kept for backward compatibility)
// ============================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, industry, username } = req.body;
    // Support both firstName and username for compatibility with auth-frontend
    const userFirstName = firstName || username || email.split('@')[0];
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    const existing = await pool.query("SELECT id FROM mololink_profiles WHERE email = $1", [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: "Email already registered" });
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
    const result = await pool.query(
      "INSERT INTO mololink_profiles (email, password_hash, first_name, last_name, headline, industry, is_verified) VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING id, email, first_name, last_name, headline",
      [email, passwordHash, userFirstName, lastName || "", `${userFirstName} ${lastName || ""}`.trim() + " - Logistics Professional", industry || "Supply Chain"]
    );
    const user = result.rows[0];
    const token = createLocalToken({ id: user.id, email: user.email });
    
    // Set SSO session cookie for immediate authentication after registration
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('sso.sid', token, {
      domain: isProduction ? '.molochain.com' : undefined,
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({ success: true, token, user });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    const result = await pool.query("SELECT id, email, first_name, last_name, headline, password_hash FROM mololink_profiles WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });
    const user = result.rows[0];
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
    if (user.password_hash !== passwordHash) return res.status(401).json({ error: "Invalid credentials" });
    const { password_hash, ...safeUser } = user;
    const token = createLocalToken({ id: user.id, email: user.email });
    
    // Set SSO session cookie for cross-subdomain authentication
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('sso.sid', token, {
      domain: isProduction ? '.molochain.com' : undefined,
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({ success: true, token, user: safeUser });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, first_name, last_name, headline, industry, location, profile_image_url FROM mololink_profiles WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      // If central auth user, create a minimal profile
      if (req.user.authType === "central") {
        return res.json({ 
          success: true, 
          user: {
            id: req.user.id,
            email: req.user.email,
            first_name: req.user.username || req.user.email.split("@")[0],
            authType: "central",
            needsProfile: true
          }
        });
      }
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json({ success: true, user: { ...result.rows[0], authType: req.user.authType } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// PASSWORD RESET
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const result = await pool.query("SELECT id, email FROM mololink_profiles WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.json({ success: true, message: "If email exists, reset instructions sent" });
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000);
    await pool.query("UPDATE mololink_profiles SET reset_token = $1, reset_token_expires = $2 WHERE email = $3", [resetToken, expiresAt, email]);
    res.json({ success: true, message: "Reset instructions sent", resetToken });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: "Token and new password required" });
    const result = await pool.query("SELECT id, email, reset_token_expires FROM mololink_profiles WHERE reset_token = $1", [token]);
    if (result.rows.length === 0) return res.status(400).json({ error: "Invalid or expired token" });
    if (new Date(result.rows[0].reset_token_expires) < new Date()) return res.status(400).json({ error: "Token expired" });
    const passwordHash = crypto.createHash("sha256").update(newPassword).digest("hex");
    await pool.query("UPDATE mololink_profiles SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = $2", [passwordHash, token]);
    res.json({ success: true, message: "Password reset successful" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// SSO Logout - Clear session cookie with matching attributes
app.post("/api/auth/logout", (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('sso.sid', {
    domain: isProduction ? '.molochain.com' : undefined,
    path: '/',
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });
  res.json({ success: true, message: "Logged out successfully" });
});

// ============================================
// COMPANIES
// ============================================
app.get("/api/companies", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM mololink_companies ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/api/companies/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM mololink_companies WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Company not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/api/companies", authMiddleware, async (req, res) => {
  try {
    const { name, industry, size, headquarters, website, description, logo_url } = req.body;
    if (!name) return res.status(400).json({ error: "Company name is required" });
    const result = await pool.query(
      "INSERT INTO mololink_companies (name, industry, size, headquarters, website, description, logo_url, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [name, industry || "Logistics", size || "1-50", headquarters || "", website || "", description || "", logo_url || "", req.user.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ============================================
// JOBS
// ============================================
app.get("/api/jobs", async (req, res) => {
  try {
    const result = await pool.query(`SELECT j.*, c.name as company_name, c.logo_url as company_logo FROM mololink_jobs j LEFT JOIN mololink_companies c ON j.company_id = c.id ORDER BY j.created_at DESC`);
    res.json({ success: true, data: result.rows });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/api/jobs/:id", async (req, res) => {
  try {
    const result = await pool.query(`SELECT j.*, c.name as company_name, c.logo_url as company_logo FROM mololink_jobs j LEFT JOIN mololink_companies c ON j.company_id = c.id WHERE j.id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Job not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/api/jobs", authMiddleware, async (req, res) => {
  try {
    const { title, company_id, location, type, salary_range, description, requirements, experience_level } = req.body;
    if (!title || !company_id) return res.status(400).json({ error: "Title and company_id are required" });
    const result = await pool.query(
      "INSERT INTO mololink_jobs (title, company_id, location, type, salary_range, description, requirements, experience_level, posted_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [title, company_id, location || "Remote", type || "Full-time", salary_range || "Competitive", description || "", requirements || "", experience_level || "Mid", req.user.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ============================================
// MARKETPLACE
// ============================================
app.get("/api/marketplace/listings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM marketplace_listings ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/api/marketplace/listings", authMiddleware, async (req, res) => {
  try {
    const { title, category, price, condition, description, image_url } = req.body;
    if (!title || !price) return res.status(400).json({ error: "Title and price are required" });
    const result = await pool.query(
      "INSERT INTO marketplace_listings (title, category, price, condition, description, image_url, seller_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active') RETURNING *",
      [title, category || "Equipment", price, condition || "New", description || "", image_url || "", req.user.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/api/marketplace/auctions", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM marketplace_listings WHERE category = 'Auction' ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/api/marketplace/services", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM marketplace_listings WHERE category = 'Service' ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ============================================
// POSTS (Community)
// ============================================
app.get("/api/posts", async (req, res) => {
  try {
    const result = await pool.query(`SELECT p.*, mp.first_name, mp.last_name, mp.headline, mp.profile_image_url FROM mololink_posts p LEFT JOIN mololink_profiles mp ON p.user_id = mp.id ORDER BY p.created_at DESC`);
    res.json({ success: true, data: result.rows });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/api/posts", authMiddleware, async (req, res) => {
  try {
    const { content, type } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required" });
    const result = await pool.query(
      "INSERT INTO mololink_posts (user_id, content, type, like_count, comment_count) VALUES ($1, $2, $3, 0, 0) RETURNING *",
      [req.user.id, content, type || "post"]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ============================================
// CONNECTIONS
// ============================================
app.get("/api/connections", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, p.first_name, p.last_name, p.headline, p.profile_image_url FROM mololink_connections c JOIN mololink_profiles p ON (c.user_id = $1 AND c.connected_user_id = p.id) OR (c.connected_user_id = $1 AND c.user_id = p.id) WHERE c.status = 'accepted'`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/api/connections", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID required" });
    const existing = await pool.query("SELECT * FROM mololink_connections WHERE (user_id = $1 AND connected_user_id = $2) OR (user_id = $2 AND connected_user_id = $1)", [req.user.id, userId]);
    if (existing.rows.length > 0) return res.status(400).json({ error: "Connection already exists" });
    const result = await pool.query("INSERT INTO mololink_connections (user_id, connected_user_id, status) VALUES ($1, $2, 'pending') RETURNING *", [req.user.id, userId]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ============================================
// PROFILES
// ============================================
app.get("/api/profiles", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, email, first_name, last_name, headline, industry, location, profile_image_url FROM mololink_profiles ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/api/profiles/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, email, first_name, last_name, headline, summary, industry, location, profile_image_url FROM mololink_profiles WHERE id = $1", [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Profile not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/api/profiles/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, email, first_name, last_name, headline, summary, industry, location, profile_image_url FROM mololink_profiles WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Profile not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch("/api/profiles/:id", authMiddleware, async (req, res) => {
  try {
    const profileId = parseInt(req.params.id);
    const profile = await pool.query("SELECT * FROM mololink_profiles WHERE id = $1", [profileId]);
    if (profile.rows.length === 0) return res.status(404).json({ error: "Profile not found" });
    if (profile.rows[0].id !== req.user.id) return res.status(403).json({ error: "You can only update your own profile" });
    
    const { first_name, last_name, headline, summary, industry, location, profile_image_url } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 0;
    
    if (first_name !== undefined) { paramCount++; updates.push(`first_name = $${paramCount}`); values.push(first_name); }
    if (last_name !== undefined) { paramCount++; updates.push(`last_name = $${paramCount}`); values.push(last_name); }
    if (headline !== undefined) { paramCount++; updates.push(`headline = $${paramCount}`); values.push(headline); }
    if (summary !== undefined) { paramCount++; updates.push(`summary = $${paramCount}`); values.push(summary); }
    if (industry !== undefined) { paramCount++; updates.push(`industry = $${paramCount}`); values.push(industry); }
    if (location !== undefined) { paramCount++; updates.push(`location = $${paramCount}`); values.push(location); }
    if (profile_image_url !== undefined) { paramCount++; updates.push(`profile_image_url = $${paramCount}`); values.push(profile_image_url); }
    
    if (updates.length === 0) return res.status(400).json({ error: "No fields to update" });
    
    paramCount++;
    updates.push(`updated_at = $${paramCount}`);
    values.push(new Date());
    
    paramCount++;
    values.push(profileId);
    
    const query = `UPDATE mololink_profiles SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Profile image upload
app.post("/api/profiles/:id/image", authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const profileId = parseInt(req.params.id);
    if (profileId !== req.user.id) return res.status(403).json({ error: "You can only update your own profile" });
    if (!req.file) return res.status(400).json({ error: "No image file provided" });
    
    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    await pool.query("UPDATE mololink_profiles SET profile_image_url = $1, updated_at = $2 WHERE id = $3", [imageUrl, new Date(), profileId]);
    res.json({ success: true, imageUrl });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// SPA fallback
app.get("*", (req, res) => { res.sendFile(path.join(__dirname, "public", "index.html")); });

app.listen(PORT, "0.0.0.0", () => { 
  console.log(`Mololink service v3.0.0 (Hybrid Auth) running on port ${PORT}`);
  console.log(`SSO enabled: Central auth at ${AUTH_SERVICE_URL}`);
});
