import StateManager from "./StateManager"
import electron = require("electron")
import BrowserWindow = GitHubElectron.BrowserWindow;

let stateManager = new StateManager()

electron.crashReporter.start()

let windows: Array<BrowserWindow> = []

function windowOptions() {
  return {
    width: 1024,
    height: 768,
    webPreferences: {
      // fix jquery issue (https://github.com/atom/electron/issues/254), and in any case node integration is not required
      nodeIntegration: false
    }
  }
}

electron.app.on("ready", () => {
  for (var descriptor of stateManager.getWindows()) {
    let window = new electron.BrowserWindow(windowOptions())
    window.loadURL(descriptor.url)
    window.on("closed", () => {
      var index = windows.indexOf(window)
      console.assert(index >= 0)
      windows.splice(index, 1)
    })
    windows.push(window)
  }
})