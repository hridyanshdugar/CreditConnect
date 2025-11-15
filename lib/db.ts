import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Get database path from environment variable or use default
const defaultDbPath = path.join(process.cwd(), 'data', 'creditconnect.db');
const dbPath = process.env.DATABASE_PATH 
  ? path.isAbsolute(process.env.DATABASE_PATH)
    ? process.env.DATABASE_PATH
    : path.join(process.cwd(), process.env.DATABASE_PATH)
  : defaultDbPath;
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('client', 'bank', 'admin')),
      first_name TEXT,
      last_name TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bank profiles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bank_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      license_number TEXT,
      contact_email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Client profiles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS client_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date_of_birth DATE,
      address TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      employment_status TEXT,
      employment_duration INTEGER,
      monthly_income REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Risk profiles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS risk_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      helix_score REAL NOT NULL,
      risk_category TEXT NOT NULL,
      stability_index REAL,
      affordability_ratio REAL,
      reliability_score REAL,
      cash_flow_score REAL,
      asset_score REAL,
      behavior_score REAL,
      fraud_score REAL,
      financial_stability_score REAL,
      behavioral_risk_score REAL,
      alternative_data_score REAL,
      environmental_risk_score REAL,
      fraud_risk_score REAL,
      confidence_interval REAL,
      flags TEXT, -- JSON string
      explanation TEXT, -- JSON string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Risk profile history table
  db.exec(`
    CREATE TABLE IF NOT EXISTS risk_profile_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      helix_score REAL NOT NULL,
      risk_category TEXT NOT NULL,
      dimension_scores TEXT, -- JSON string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      bank_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      product_type TEXT NOT NULL CHECK(product_type IN ('personal_loan', 'auto_loan', 'mortgage', 'credit_line')),
      min_helix_score INTEGER,
      max_helix_score INTEGER,
      base_interest_rate REAL NOT NULL,
      min_loan_amount REAL NOT NULL,
      max_loan_amount REAL NOT NULL,
      min_term_months INTEGER NOT NULL,
      max_term_months INTEGER NOT NULL,
      base_origination_fee REAL,
      requirements TEXT, -- JSON string
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bank_id) REFERENCES bank_profiles(id)
    )
  `);

  // Applications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      bank_id TEXT NOT NULL,
      requested_amount REAL NOT NULL,
      requested_term_months INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'pre_approved', 'approved', 'rejected', 'withdrawn', 'disbursed')),
      offered_interest_rate REAL,
      offered_amount REAL,
      offered_term_months INTEGER,
      helix_score_at_application REAL,
      stp_eligible BOOLEAN DEFAULT 0,
      review_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (bank_id) REFERENCES bank_profiles(id)
    )
  `);

  // Risk monitoring alerts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS risk_alerts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      alert_type TEXT NOT NULL,
      severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high', 'critical')),
      message TEXT NOT NULL,
      previous_score REAL,
      current_score REAL,
      delta REAL,
      is_resolved BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Financial data table (for Open Banking integration)
  db.exec(`
    CREATE TABLE IF NOT EXISTS financial_data (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      data_type TEXT NOT NULL CHECK(data_type IN ('bank_statement', 'pay_stub', 'tax_return', 'transaction', 'balance')),
      source TEXT,
      raw_data TEXT, -- JSON string
      processed_data TEXT, -- JSON string
      month_year TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Product matches table (pre-approvals)
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_matches (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      match_score REAL NOT NULL,
      pre_approved BOOLEAN DEFAULT 0,
      personalized_pricing TEXT, -- JSON string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Risk improvement goals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS risk_improvement_goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      target_score REAL NOT NULL,
      current_score REAL NOT NULL,
      deadline DATE,
      milestones TEXT, -- JSON string
      status TEXT NOT NULL CHECK(status IN ('active', 'completed', 'abandoned')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_risk_profiles_user_id ON risk_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_risk_profiles_created_at ON risk_profiles(created_at);
    CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
    CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
    CREATE INDEX IF NOT EXISTS idx_applications_bank_id ON applications(bank_id);
    CREATE INDEX IF NOT EXISTS idx_products_bank_id ON products(bank_id);
    CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
    CREATE INDEX IF NOT EXISTS idx_risk_alerts_user_id ON risk_alerts(user_id);
    CREATE INDEX IF NOT EXISTS idx_risk_alerts_resolved ON risk_alerts(is_resolved);
  `);
}

// Initialize on import
initDatabase();

// Conditionally seed demo data if enabled
if (process.env.SEED_DEMO_DATA === 'true') {
  // Use dynamic import to avoid circular dependencies and ensure async execution
  import('./demo-data')
    .then(({ seedDemoData }) => {
      seedDemoData().catch((error) => {
        console.error('Error seeding demo data:', error);
      });
    })
    .catch((error) => {
      // Only log if it's not a missing module error (expected if demo-data.ts doesn't exist)
      if (!error.message?.includes('Cannot find module')) {
        console.error('Error loading demo data script:', error);
      }
    });
}

export default db;

