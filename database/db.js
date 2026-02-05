const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'nebula.db');
let db;
let SQL;

async function init() {
  SQL = await initSqlJs();

  // Load existing database or create new one
  try {
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
      console.log('✅ Database loaded from file');
    } else {
      db = new SQL.Database();
      console.log('✅ New database created');
    }
  } catch (error) {
    console.log('Creating new database...');
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      password TEXT,
      wallet_address TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  try {
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`);
  } catch (e) {
    // Indexes may already exist
  }

  // Add wallet_address column if it doesn't exist (migration)
  try {
    db.run(`ALTER TABLE users ADD COLUMN wallet_address TEXT UNIQUE`);
  } catch (e) {
    // Column may already exist
  }

  console.log('✅ Database tables created/verified');
  saveDatabase();
}

function saveDatabase() {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// User operations
const users = {
  create: (name, email, password) => {
    const stmt = db.prepare(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`);
    stmt.run([name, email, password]);
    stmt.free();
    saveDatabase();

    // Get the inserted user
    const result = db.exec(`SELECT last_insert_rowid() as id`);
    return { id: result[0].values[0][0], name, email };
  },

  createWithWallet: (data) => {
    const stmt = db.prepare(`INSERT INTO users (name, wallet_address) VALUES (?, ?)`);
    stmt.run([data.name, data.wallet_address]);
    stmt.free();
    saveDatabase();

    const result = db.exec(`SELECT last_insert_rowid() as id`);
    return result[0].values[0][0];
  },

  findByEmail: (email) => {
    const stmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
    stmt.bind([email]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  },

  findById: (id) => {
    const stmt = db.prepare(`SELECT id, name, email, wallet_address, created_at FROM users WHERE id = ?`);
    stmt.bind([id]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  },

  findByWallet: (walletAddress) => {
    const stmt = db.prepare(`SELECT id, name, email, wallet_address, created_at FROM users WHERE wallet_address = ?`);
    stmt.bind([walletAddress.toLowerCase()]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  },

  linkWallet: (userId, walletAddress) => {
    db.run(`UPDATE users SET wallet_address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [walletAddress.toLowerCase(), userId]);
    saveDatabase();
  },

  updatePassword: (id, password) => {
    db.run(`UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [password, id]);
    saveDatabase();
  }
};

// Session operations
const sessions = {
  create: (userId, token, expiresAt) => {
    db.run(`INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)`, [userId, token, expiresAt]);
    saveDatabase();
  },

  findByToken: (token) => {
    const stmt = db.prepare(`
      SELECT s.*, u.id as user_id, u.name, u.email
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > datetime('now')
    `);
    stmt.bind([token]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  },

  deleteByToken: (token) => {
    db.run(`DELETE FROM sessions WHERE token = ?`, [token]);
    saveDatabase();
  },

  deleteExpired: () => {
    db.run(`DELETE FROM sessions WHERE expires_at < datetime('now')`);
    saveDatabase();
  },

  deleteByUserId: (userId) => {
    db.run(`DELETE FROM sessions WHERE user_id = ?`, [userId]);
    saveDatabase();
  }
};

module.exports = {
  init,
  users,
  sessions,
  getDb: () => db
};
