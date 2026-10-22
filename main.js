const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const { login, register, guestLogin, getAllUsers, deleteUser, changeRole } = require('./auth')
const db = require('./database')

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'))
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// --- Auth ---
ipcMain.handle('auth:login', (_event, { username, password }) => {
  return login(username, password)
})

ipcMain.handle('auth:register', (_event, { username, password, role }) => {
  return register(username, password, role)
})

ipcMain.handle('auth:guestLogin', () => {
  return guestLogin()
})

// --- Users ---
ipcMain.handle('users:getAll', () => {
  return getAllUsers()
})

ipcMain.handle('users:delete', (_event, { id }) => {
  return deleteUser(id)
})

ipcMain.handle('users:changeRole', (_event, { id, role }) => {
  return changeRole(id, role)
})

// --- Mazes ---
ipcMain.handle('mazes:getAll', (_event, { userId, isAdmin }) => {
  if (isAdmin) {
    return db.prepare('SELECT m.*, u.username AS owner FROM mazes m JOIN users u ON m.user_id = u.id ORDER BY m.id DESC').all()
  }
  return db.prepare('SELECT * FROM mazes WHERE user_id = ? ORDER BY id DESC').all(userId)
})

ipcMain.handle('mazes:save', (_event, { id, name, difficulty, gridData, userId }) => {
  if (id) {
    db.prepare('UPDATE mazes SET name = ?, difficulty = ?, grid_data = ? WHERE id = ? AND user_id = ?')
      .run(name, difficulty, gridData || null, id, userId)
    return { success: true, id }
  } else {
    const result = db.prepare('INSERT INTO mazes (name, difficulty, grid_data, user_id) VALUES (?, ?, ?, ?)')
      .run(name, difficulty, gridData || null, userId)
    return { success: true, id: result.lastInsertRowid }
  }
})

ipcMain.handle('mazes:delete', (_event, { id, userId, isAdmin }) => {
  if (isAdmin) {
    db.prepare('DELETE FROM mazes WHERE id = ?').run(id)
  } else {
    db.prepare('DELETE FROM mazes WHERE id = ? AND user_id = ?').run(id, userId)
  }
  return { success: true }
})

ipcMain.handle('mazes:saveGrid', (_event, { id, gridData, userId }) => {
  db.prepare('UPDATE mazes SET grid_data = ? WHERE id = ? AND user_id = ?').run(gridData, id, userId)
  return { success: true }
})

// --- Dialog natif ---
ipcMain.handle('dialog:showMessageBox', (_event, options) => {
  return dialog.showMessageBox(options)
})
