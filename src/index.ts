import { app, ipcMain, BrowserWindow as BrowserWindowElectron } from "electron"
import BrowserWindow = GitHubElectron.BrowserWindow
import BrowserWindowOptions = GitHubElectron.BrowserWindowOptions
import { StateManager, WindowItem } from "./StateManager"
import ApplicationUpdater from "./ApplicationUpdater"
import setMenu from "./menu"
import { log } from "./util"

require('electron-debug')()

const stateManager = new StateManager()

const windows: Array<BrowserWindow> = []

app.on("window-all-closed", () => {
  // restore default set of windows
  stateManager.restoreWindows()
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform == 'darwin') {
    // reopen initial window
    openWindows()
  }
  else {
    app.quit()
  }
})

interface WindowEvent {
  sender: BrowserWindow
}

function saveWindowState(window: BrowserWindow, descriptor: WindowItem) {
  if (window.isMaximized()) {
    delete descriptor.width
    delete descriptor.height
    delete descriptor.x
    delete descriptor.y
  }
  else {
    const bounds = window.getBounds()
    descriptor.width = bounds.width
    descriptor.height = bounds.height
    descriptor.x = bounds.x
    descriptor.y = bounds.y
  }
}

function registerWindowEventHandlers(window: BrowserWindow, descriptor: WindowItem) {
  window.on("close", (event: WindowEvent) => {
    let window = event.sender
    saveWindowState(window, descriptor)
    descriptor.url = window.webContents.getURL()
    stateManager.save()
  })
  window.on("closed", (event: WindowEvent) => {
    const index = windows.indexOf(event.sender)
    console.assert(index >= 0)
    windows.splice(index, 1)
  })

  let webContents = window.webContents
  // cannot find way to listen url change in pure JS
  let frameFinishLoadedId: NodeJS.Timer = null
  webContents.on("did-frame-finish-load", (event: any, isMainFrame: boolean) => {
    if (frameFinishLoadedId != null) {
      clearTimeout(frameFinishLoadedId)
      frameFinishLoadedId = null
    }
    frameFinishLoadedId = setTimeout(() => {
      webContents.send("maybeUrlChanged")
    }, 300)
  })
}

function openWindows() {
  let descriptors = stateManager.getWindows()
  if (descriptors == null || descriptors.length === 0) {
    stateManager.restoreWindows()
    descriptors = stateManager.getWindows()
  }

  for (const descriptor of descriptors) {
    let options: BrowserWindowOptions = {
      // to avoid visible maximizing
      show: false,
      preload: __dirname + "/autoSignIn.js",
      webPreferences: {
        // fix jquery issue (https://github.com/atom/electron/issues/254), and in any case node integration is not required
        nodeIntegration: false,
      }
    }

    let isMaximized = true
    if (descriptor.width != null && descriptor.height != null) {
      options.width = descriptor.width
      options.height = descriptor.height
      isMaximized = false
    }
    if (descriptor.x != null && descriptor.y != null) {
      options.x = descriptor.x
      options.y = descriptor.y
      isMaximized = false
    }

    const window = new BrowserWindowElectron(options)
    if (isMaximized) {
      window.maximize()
    }
    window.loadURL(descriptor.url)
    window.show()
    registerWindowEventHandlers(window, descriptor)
    windows.push(window)
  }

  new ApplicationUpdater(windows[0])
}

app.on("ready", () => {
  ipcMain.on("log.error", (event: any, arg: any) => {
    log(arg)
  })

  setMenu()
  openWindows()
})