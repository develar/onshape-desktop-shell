import StateManager from "./StateManager"
import electron = require("electron")
import BrowserWindow = GitHubElectron.BrowserWindow
import BrowserWindowOptions = GitHubElectron.BrowserWindowOptions

let stateManager = new StateManager()

electron.crashReporter.start()

let windows: Array<BrowserWindow> = []
let app = electron.app

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
      webPreferences: {
        // fix jquery issue (https://github.com/atom/electron/issues/254), and in any case node integration is not required
        nodeIntegration: false
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

    let window = new electron.BrowserWindow(options)
    if (isMaximized) {
      window.maximize()
    }
    window.loadURL(descriptor.url)
    window.show()
    window.on("closed", () => {
      var index = windows.indexOf(window)
      console.assert(index >= 0)
      windows.splice(index, 1)
    })
    windows.push(window)
  }
}

app.on("ready", () => {
  openWindows()
})