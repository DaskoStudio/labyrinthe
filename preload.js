const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  // Auth
  login: (username, password) => ipcRenderer.invoke('auth:login', { username, password }),
  register: (username, password, role) => ipcRenderer.invoke('auth:register', { username, password, role }),
  guestLogin: () => ipcRenderer.invoke('auth:guestLogin'),

  // Utilisateurs
  getAllUsers: () => ipcRenderer.invoke('users:getAll'),
  deleteUser: (id) => ipcRenderer.invoke('users:delete', { id }),
  changeRole: (id, role) => ipcRenderer.invoke('users:changeRole', { id, role }),

  // Labyrinthes
  getMazes: (userId, isAdmin) => ipcRenderer.invoke('mazes:getAll', { userId, isAdmin }),
  saveMaze: (data) => ipcRenderer.invoke('mazes:save', data),
  deleteMaze: (id, userId, isAdmin) => ipcRenderer.invoke('mazes:delete', { id, userId, isAdmin }),
  saveGrid: (id, gridData, userId) => ipcRenderer.invoke('mazes:saveGrid', { id, gridData, userId }),

  // Dialog natif
  showMessageBox: (options) => ipcRenderer.invoke('dialog:showMessageBox', options)
})
