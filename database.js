const Database = require('better-sqlite3')
const path = require('path')
const bcrypt = require('bcryptjs')

const db = new Database(path.join(__dirname, 'labyrinthe.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS mazes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    difficulty INTEGER NOT NULL DEFAULT 5,
    grid_data TEXT,
    user_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`)

// Ajouter la colonne role si elle n'existe pas (migration)
try {
  db.exec(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'`)
} catch (_) {}

// Créer l'admin par défaut s'il n'existe pas
const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin')
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10)
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', hash, 'admin')
}

// Créer le compte invité par défaut s'il n'existe pas
const guestExists = db.prepare('SELECT id FROM users WHERE username = ?').get('guest')
if (!guestExists) {
  const hash = bcrypt.hashSync('guest123', 10)
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('guest', hash, 'user')
}

module.exports = db
