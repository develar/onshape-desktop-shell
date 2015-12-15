'use strict';
const electron = require("electron")
const app = electron.app
const BrowserWindow = electron.BrowserWindow

electron.crashReporter.start()

let mainWindow

app.on("window-all-closed", function() {
  if (process.platform != "darwin") {
    app.quit()
  }
})

app.on("ready", function() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // fix jquery issue (https://github.com/atom/electron/issues/254), and in any case node integration is not required
      nodeIntegration: false
    }
  })
  mainWindow.loadURL("https://cad.onshape.com/")
  //mainWindow.$ = mainWindow.jQuery = require('./node_modules/jquery/dist/jquery.min.js');

  //mainWindow.webContents.openDevTools()
  mainWindow.on("closed", function() {
    mainWindow = null
  })
})