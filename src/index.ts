import { app, BrowserWindow as BrowserWindowElectron } from "electron"
import BrowserWindow = GitHubElectron.BrowserWindow
import BrowserWindowOptions = GitHubElectron.BrowserWindowOptions
import StateManager from "./StateManager"
import ApplicationUpdater from "./ApplicationUpdater"
import setMenu from "./menu"

require('electron-debug')()

let stateManager = new StateManager()

let windows: Array<BrowserWindow> = []

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

function registerWindowEventHandlers(window: BrowserWindow, initialUrl: string) {
  window.on("closed", () => {
    var index = windows.indexOf(window)
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

  for (var descriptor of descriptors) {
    let options: BrowserWindowOptions = {
      // to avoid visible maximizing
      show: false,
      preload: __dirname + "/autoSignIn.js",
      webPreferences: {
        // fix jquery issue (https://github.com/atom/electron/issues/254), and in any case node integration is not required
        nodeIntegration: false,
      }
    }

    let isMaximized = false
    if (descriptor.width != null && descriptor.height != null) {
      options.width = descriptor.width
      options.height = descriptor.height
    }
    else {
      isMaximized = true
    }

    let window = new BrowserWindowElectron(options)
    if (isMaximized) {
      window.maximize()
    }
    window.loadURL(descriptor.url)
    window.show()
    registerWindowEventHandlers(window, descriptor.url)
    windows.push(window)
  }

  new ApplicationUpdater(windows[0])
}

app.on("ready", () => {
  setMenu()
  openWindows()
})