// ./main.js
const { app, BrowserWindow } = require('electron')
const url = require('url')
const path = require('path')
const isDev = require('electron-is-dev')

let win = null
let closeClient = null
const kiosk = process.env.KIOSK === 'true'
const fullscreen = process.env.FULLSCREEN === 'true'

function createWindow() {
  // Initialize the window to our specified dimensions
  win = new BrowserWindow({
    width: 1920,
    height: 1080,
    maxWidth: 1920,
    maxHeight: 1080,
    kiosk,
    frame: !fullscreen,
    fullscreen,
    autoHideMenuBar: true,
    webPreferences: {
      webSecurity: false
    }
  })

  console.log('isDev', isDev, 'PORT', process.env.PORT, 'KIOSK', kiosk, 'DEV', process.env.DEV)

  // Specify entry point
  // 1. via local file
  if (!isDev || process.env.DEV === 'true')
    win.loadURL(url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      protocol: 'file:',
      slashes: true
    }))
  // 2. via react server
  else
    win.loadURL(`http://localhost:${process.env.PORT}`)

  // Show dev tools
  if (process.env.DEV === 'true' || isDev)
    win.webContents.openDevTools()

  // Remove window once app is closed
  win.on('closed', function () {
    win = null
  })

  win.webContents.on('did-finish-load', () => {
    win.webContents.setZoomFactor(1)
    win.webContents.setVisualZoomLevelLimits(1, 1)
    win.webContents.setLayoutZoomLevelLimits(0, 0)
  })

}

app.on('ready', function () {
  createWindow()
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    closeClient()
    app.quit()
  }
})

app.commandLine.appendSwitch('touch-events', 'enabled')

