// @ts-nocheck
/* eslint-disable no-undef */

let currentUser = null
let labyrinthes = []

// --- SOUND DESIGN (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
window.SoundFX = {
  play(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)

    const now = audioCtx.currentTime
    if (type === 'click') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, now)
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05)
      gain.gain.setValueAtTime(0.05, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
      osc.start(now); osc.stop(now + 0.05)
    } else if (type === 'scan') {
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(150, now)
      gain.gain.setValueAtTime(0.02, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
      osc.start(now); osc.stop(now + 0.05)
    } else if (type === 'success') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(400, now)
      osc.frequency.setValueAtTime(600, now + 0.1)
      osc.frequency.setValueAtTime(800, now + 0.2)
      gain.gain.setValueAtTime(0.1, now)
      gain.gain.linearRampToValueAtTime(0, now + 0.4)
      osc.start(now); osc.stop(now + 0.4)
    } else if (type === 'error') {
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(150, now)
      osc.frequency.setValueAtTime(100, now + 0.1)
      gain.gain.setValueAtTime(0.1, now)
      gain.gain.linearRampToValueAtTime(0, now + 0.2)
      osc.start(now); osc.stop(now + 0.2)
    }
  }
}

document.addEventListener('click', (e) => {
  if (e.target.closest('button')) window.SoundFX.play('click')
})

// --- UI COMPONENTS (Toasts & Modals) ---
window.showToast = function (message, type = 'info') {
  const container = document.getElementById('toast-container')
  if (!container) return

  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  const icons = { success: '✅', error: '❌', info: 'ℹ️' }
  toast.innerHTML = `<span style="font-size:1.2rem">${icons[type] || icons.info}</span> <span>${message}</span>`

  container.appendChild(toast)
  setTimeout(() => {
    toast.classList.add('hiding')
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

window.showConfirm = function (message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirm-modal')
    const msgEl = document.getElementById('confirm-message')
    const btnOk = document.getElementById('btn-confirm-ok')
    const btnCancel = document.getElementById('btn-confirm-cancel')

    msgEl.textContent = message
    modal.style.display = 'flex'

    const cleanup = () => {
      modal.style.display = 'none'
      btnOk.removeEventListener('click', onOk)
      btnCancel.removeEventListener('click', onCancel)
    }
    const onOk = () => { cleanup(); resolve(true) }
    const onCancel = () => { cleanup(); resolve(false) }

    btnOk.addEventListener('click', onOk)
    btnCancel.addEventListener('click', onCancel)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  // --- Thème ---
  const themeToggle = document.getElementById('theme-toggle')
  const currentTheme = localStorage.getItem('theme') || 'dark'
  if (currentTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light')
    themeToggle.textContent = '🌙'
  } else {
    themeToggle.textContent = '☀️'
  }
  themeToggle.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light'
    if (isLight) {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'dark')
      themeToggle.textContent = '☀️'
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
      themeToggle.textContent = '🌙'
    }
    const viewEditor = document.getElementById('view-editor')
    if (viewEditor && viewEditor.classList.contains('active') && typeof dessiner === 'function') {
      dessiner()
      if (typeof drawPlayer === 'function' && typeof playerPos !== 'undefined') drawPlayer()
    }
  })

  // --- Éléments du DOM ---
  const viewLogin = document.getElementById('view-login')
  const viewDashboard = document.getElementById('view-dashboard')
  const viewEditor = document.getElementById('view-editor')
  const viewAdmin = document.getElementById('view-admin')

  const btnLogin = document.getElementById('btn-login')
  const btnLogout = document.getElementById('btn-logout')
  const btnNewMaze = document.getElementById('btn-new-maze')
  const btnBack = document.getElementById('btn-back')
  const btnAdmin = document.getElementById('btn-admin')
  const btnBackFromAdmin = document.getElementById('btn-back-from-admin')

  const tableBody = document.getElementById('maze-table-body')
  const mazeForm = document.getElementById('maze-form')
  const inputId = document.getElementById('maze-id')
  const inputName = document.getElementById('maze-name')
  const inputDifficulty = document.getElementById('maze-difficulty')
  const difficultyDisplay = document.getElementById('difficulty-val')

  const canvas = document.getElementById('maze-canvas')
  const ctx = canvas.getContext('2d')
  const btnGenerate = document.getElementById('btn-generate')
  const btnSolve = document.getElementById('btn-solve')
  const btnPlayMode = document.getElementById('btn-play-mode')
  const gameOverlay = document.getElementById('game-overlay')
  const overlaySteps = document.getElementById('overlay-steps')
  const btnQuitGame = document.getElementById('btn-quit-game')

  const usersTableBody = document.getElementById('users-table-body')
  const statTotalMazes = document.getElementById('stat-total-mazes')
  const statActiveUsers = document.getElementById('stat-active-users')

  // --- Navigation ---
  function switchView(targetView) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'))
    targetView.classList.add('active')
  }

  // --- Connexion réelle ---
  btnLogin.addEventListener('click', async () => {
    const username = document.getElementById('username').value.trim()
    const password = document.getElementById('password').value

    if (!username || !password) {
      window.showToast('Veuillez remplir tous les champs.', 'error')
      window.SoundFX.play('error')
      return
    }

    const result = await window.api.login(username, password)
    if (!result.success) {
      window.showToast(result.message, 'error')
      window.SoundFX.play('error')
      return
    }

    currentUser = result.user
    btnAdmin.style.display = currentUser.role === 'admin' ? 'inline-block' : 'none'
    window.SoundFX.play('success')
    switchView(viewDashboard)
    await renderDashboard()
  })

  // Permettre la connexion avec Entrée
  document.getElementById('password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnLogin.click()
  })

  // --- Mode Invité / Accès direct ---
  const btnGuest = document.getElementById('btn-guest')
  if (btnGuest) {
    btnGuest.addEventListener('click', async () => {
      const result = await window.api.guestLogin()
      if (result && result.success) {
        currentUser = result.user
        btnAdmin.style.display = currentUser.role === 'admin' ? 'inline-block' : 'none'
        window.SoundFX.play('success')
        switchView(viewDashboard)
        await renderDashboard()
      }
    })
  }

  // --- Basculer entre connexion et inscription ---
  const formLogin = document.getElementById('form-login')
  const formRegister = document.getElementById('form-register')

  document.getElementById('link-to-register').addEventListener('click', (e) => {
    e.preventDefault()
    formLogin.style.display = 'none'
    formRegister.style.display = 'block'
  })

  document.getElementById('link-to-login').addEventListener('click', (e) => {
    e.preventDefault()
    formRegister.style.display = 'none'
    formLogin.style.display = 'block'
  })

  // --- Inscription ---
  document.getElementById('btn-register').addEventListener('click', async () => {
    const username = document.getElementById('reg-username').value.trim()
    const password = document.getElementById('reg-password').value
    const confirm = document.getElementById('reg-password-confirm').value

    if (!username || !password || !confirm) {
      window.showToast('Veuillez remplir tous les champs.', 'error')
      window.SoundFX.play('error')
      return
    }
    if (password !== confirm) {
      window.showToast('Les mots de passe ne correspondent pas.', 'error')
      window.SoundFX.play('error')
      return
    }

    const result = await window.api.register(username, password)
    if (!result.success) {
      window.showToast(result.message, 'error')
      window.SoundFX.play('error')
      return
    }

    window.showToast('Compte créé ! Vous pouvez maintenant vous connecter.', 'success')
    window.SoundFX.play('success')
    document.getElementById('reg-username').value = ''
    document.getElementById('reg-password').value = ''
    document.getElementById('reg-password-confirm').value = ''
    formRegister.style.display = 'none'
    formLogin.style.display = 'block'
  })

  btnLogout.addEventListener('click', () => {
    currentUser = null
    labyrinthes = []
    document.getElementById('username').value = ''
    document.getElementById('password').value = ''
    switchView(viewLogin)
  })

  btnBack.addEventListener('click', () => switchView(viewDashboard))
  btnBackFromAdmin.addEventListener('click', () => switchView(viewDashboard))

  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar')
  const editorSidebar = document.querySelector('.editor-sidebar')
  if (btnToggleSidebar && editorSidebar) {
    btnToggleSidebar.addEventListener('click', () => {
      editorSidebar.classList.toggle('open')
    })
    document.querySelector('.editor-canvas-container').addEventListener('click', () => {
      if (window.innerWidth <= 768 && editorSidebar.classList.contains('open')) {
        editorSidebar.classList.remove('open')
      }
    })
  }

  btnAdmin.addEventListener('click', () => {
    switchView(viewAdmin)
    renderAdminStats()
    renderAdminUsers()
  })

  btnNewMaze.addEventListener('click', () => {
    mazeForm.reset()
    inputId.value = ''
    difficultyDisplay.textContent = inputDifficulty.value
    if (typeof grid !== 'undefined') grid = []
    switchView(viewEditor)
    setTimeout(drawPlaceholder, 50)
  })

  inputDifficulty.addEventListener('input', (e) => {
    difficultyDisplay.textContent = e.target.value
  })

  // --- Dashboard ---
  async function renderDashboard() {
    labyrinthes = await window.api.getMazes(currentUser.id, currentUser.role === 'admin')
    tableBody.innerHTML = ''

    labyrinthes.forEach(maze => {
      const tr = document.createElement('tr')
      const ownerCell = currentUser.role === 'admin' && maze.owner
        ? `<td>${maze.owner}</td>`
        : ''

      tr.innerHTML = `
        ${ownerCell}
        <td>${maze.name}</td>
        <td>${maze.difficulty} / 10</td>
        <td>
          <button class="btn-primary btn-edit" data-id="${maze.id}">Éditer</button>
          <button class="btn-danger btn-delete" data-id="${maze.id}">Supprimer</button>
        </td>
      `
      tableBody.appendChild(tr)
    })

    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => loadMazeForEdit(parseInt(e.target.dataset.id)))
    })
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => requestDeleteMaze(parseInt(e.target.dataset.id)))
    })
  }

  // --- CRUD Labyrinthes ---
  function loadMazeForEdit(id) {
    const maze = labyrinthes.find(m => m.id === id)
    if (!maze) return

    inputId.value = maze.id
    inputName.value = maze.name
    inputDifficulty.value = maze.difficulty
    difficultyDisplay.textContent = maze.difficulty
    switchView(viewEditor)

    setTimeout(() => {
      const container = canvas.parentElement
      canvas.width = Math.max(0, container.clientWidth - 40)
      canvas.height = Math.max(0, container.clientHeight - 40)

      if (maze.grid_data && typeof dessiner === 'function') {
        grid = JSON.parse(maze.grid_data)
        if (typeof size !== 'undefined') size = grid.length
        dessiner()
      } else {
        if (typeof grid !== 'undefined') grid = []
        drawPlaceholder()
      }
    }, 50)
  }

  mazeForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const mazeData = {
      id: inputId.value ? parseInt(inputId.value) : null,
      name: inputName.value,
      difficulty: parseInt(inputDifficulty.value),
      gridData: (typeof grid !== 'undefined' && grid.length > 0) ? JSON.stringify(grid) : null,
      userId: currentUser.id
    }

    const result = await window.api.saveMaze(mazeData)
    if (result.success) {
      if (!mazeData.id) inputId.value = result.id
      window.showToast('Labyrinthe sauvegardé !', 'success')
    }

    switchView(viewDashboard)
    await renderDashboard()
  })

  async function requestDeleteMaze(id) {
    let shouldDelete = false

    if (window.api && window.api.showMessageBox) {
      const result = await window.api.showMessageBox({
        type: 'warning',
        title: 'Confirmation de suppression',
        message: 'Êtes-vous sûr de vouloir supprimer ce labyrinthe définitivement ?',
        buttons: ['Annuler', 'Supprimer'],
        defaultId: 1,
        cancelId: 0
      })
      shouldDelete = (result.response === 1)
    } else {
      shouldDelete = confirm('Êtes-vous sûr de vouloir supprimer ce labyrinthe définitivement ?')
    }

    if (shouldDelete) {
      await window.api.deleteMaze(id, currentUser.id, currentUser.role === 'admin')
      await renderDashboard()
    }
  }

  // --- Canvas ---
  function drawPlaceholder() {
    const container = canvas.parentElement
    canvas.width = Math.max(0, container.clientWidth - 40)
    canvas.height = Math.max(0, container.clientHeight - 40)

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ecf0f1'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#7f8c8d'
    ctx.font = '24px "Segoe UI"'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Cliquez sur Générer', canvas.width / 2, canvas.height / 2)
  }

  window.addEventListener('resize', () => {
    if (viewEditor.classList.contains('active')) {
      const container = canvas.parentElement
      canvas.width = Math.max(0, container.clientWidth - 40)
      canvas.height = Math.max(0, container.clientHeight - 40)
      if (typeof grid !== 'undefined' && grid.length > 0 && typeof dessiner === 'function') {
        dessiner()
      } else {
        drawPlaceholder()
      }
    }
  })

  // --- Mode Jeu ---
  let isGameMode = false
  window.stepsCount = 0

  function toggleGameMode(forceQuit = false) {
    isGameMode = forceQuit ? false : !isGameMode

    if (isGameMode) {
      window.stepsCount = 0
      overlaySteps.textContent = `Nombre de pas : ${window.stepsCount}`
      gameOverlay.style.display = 'flex'
      btnPlayMode.textContent = 'Quitter le Mode Jeu'
      btnPlayMode.classList.remove('btn-success')
      btnPlayMode.classList.add('btn-danger')
      if (typeof playerPos !== 'undefined') { playerPos.x = 1; playerPos.y = 1 }
      if (typeof dessiner === 'function') {
        dessiner()
        if (typeof drawPlayer === 'function') drawPlayer()
      }
    } else {
      gameOverlay.style.display = 'none'
      btnPlayMode.textContent = "Démarrer l'aventure"
      btnPlayMode.classList.remove('btn-danger')
      btnPlayMode.classList.add('btn-success')
      if (typeof playerPos !== 'undefined') { playerPos.x = 1; playerPos.y = 1 }
      const victoryModal = document.getElementById('victory-modal')
      if (victoryModal) victoryModal.style.display = 'none'
      if (typeof dessiner === 'function') dessiner()
    }
  }

  btnPlayMode.addEventListener('click', () => toggleGameMode(false))
  btnQuitGame.addEventListener('click', () => toggleGameMode(true))

  const btnVictoryContinue = document.getElementById('btn-victory-continue')
  if (btnVictoryContinue) {
    btnVictoryContinue.addEventListener('click', () => {
      const victoryModal = document.getElementById('victory-modal')
      if (victoryModal) {
        victoryModal.style.display = 'none'
        if (typeof dessiner === 'function') {
          dessiner()
          if (typeof drawPlayer === 'function') drawPlayer()
        }
      }
    })
  }

  btnGenerate.addEventListener('click', () => {
    const container = canvas.parentElement
    canvas.width = Math.max(0, container.clientWidth - 40)
    canvas.height = Math.max(0, container.clientHeight - 40)
    generer()
  })

  btnSolve.addEventListener('click', () => {
    const container = canvas.parentElement
    canvas.width = Math.max(0, container.clientWidth - 40)
    canvas.height = Math.max(0, container.clientHeight - 40)
    resoudre()
  })

  document.addEventListener('keydown', (e) => {
    if (!isGameMode || !viewEditor.classList.contains('active')) return
    const key = e.key.toLowerCase()
    const validKeys = ['z', 'q', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']
    if (validKeys.includes(key)) {
      e.preventDefault()
      if (typeof movePlayer === 'function') {
        if (movePlayer(key)) {
          window.stepsCount++
          overlaySteps.textContent = `Nombre de pas : ${window.stepsCount}`
        }
      }
    }
  })

  // --- Administration ---
  async function renderAdminStats() {
    const mazes = await window.api.getMazes(currentUser.id, true)
    const users = await window.api.getAllUsers()
    statTotalMazes.textContent = mazes.length
    statActiveUsers.textContent = users.length
  }

  async function renderAdminUsers() {
    usersTableBody.innerHTML = ''
    const usersData = await window.api.getAllUsers()

    usersData.forEach(user => {
      const tr = document.createElement('tr')
      const isSelf = user.id === currentUser.id
      tr.innerHTML = `
        <td>${user.username}</td>
        <td><span style="font-weight:${user.role === 'admin' ? 'bold' : 'normal'}">${user.role}</span></td>
        <td>${user.mazesCount}</td>
        <td>
          ${!isSelf ? `<button class="btn-danger btn-delete-user" data-id="${user.id}">Bannir</button>` : '-'}
        </td>
      `
      usersTableBody.appendChild(tr)
    })

    document.querySelectorAll('.btn-delete-user').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const userId = parseInt(e.target.dataset.id)
        if (await window.showConfirm('Voulez-vous vraiment bannir cet utilisateur ?')) {
          await window.api.deleteUser(userId)
          renderAdminUsers()
          renderAdminStats()
        }
      })
    })
  }
})
