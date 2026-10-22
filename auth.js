const bcrypt = require('bcryptjs')
const db = require('./database')

function login(username, password) {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (!user) return { success: false, message: 'Identifiant ou mot de passe incorrect.' }

  const valid = bcrypt.compareSync(password, user.password)
  if (!valid) return { success: false, message: 'Identifiant ou mot de passe incorrect.' }

  return {
    success: true,
    user: { id: user.id, username: user.username, role: user.role }
  }
}

function register(username, password, role = 'user') {
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (existing) return { success: false, message: 'Ce nom d\'utilisateur est déjà pris.' }

  if (!username || username.length < 3)
    return { success: false, message: 'L\'identifiant doit contenir au moins 3 caractères.' }
  if (!password || password.length < 6)
    return { success: false, message: 'Le mot de passe doit contenir au moins 6 caractères.' }

  const hash = bcrypt.hashSync(password, 10)
  const result = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(username, hash, role)
  return { success: true, userId: result.lastInsertRowid }
}

function getAllUsers() {
  return db.prepare(`
    SELECT u.id, u.username, u.role,
           COUNT(m.id) AS mazesCount
    FROM users u
    LEFT JOIN mazes m ON m.user_id = u.id
    GROUP BY u.id
    ORDER BY u.id
  `).all()
}

function deleteUser(id) {
  db.prepare('DELETE FROM users WHERE id = ?').run(id)
  return { success: true }
}

function changeRole(id, role) {
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id)
  return { success: true }
}

function guestLogin() {
  let user = db.prepare('SELECT * FROM users WHERE username = ?').get('guest')
  if (!user) {
    const hash = bcrypt.hashSync('guest123', 10)
    const res = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('guest', hash, 'user')
    user = { id: res.lastInsertRowid, username: 'guest', role: 'user' }
  }
  return {
    success: true,
    user: { id: user.id, username: user.username, role: user.role }
  }
}

module.exports = { login, register, guestLogin, getAllUsers, deleteUser, changeRole }
