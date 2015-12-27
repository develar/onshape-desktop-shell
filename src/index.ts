import { app, ipcMain } from "electron"
import setMenu from "./menu"
import { log } from "./util"
import WindowManager from "./WindowManager"
import handleStartupEvent from "./squirrelWinStartup"

if (!handleStartupEvent()) {
  require("electron-debug")()

  // to keep reference to windows
  let windowManager: WindowManager
  app.on("ready", () => {
    ipcMain.on("log.error", (event: any, arg: any) => {
      log(arg)
    })

    setMenu()
    windowManager = new WindowManager()
    windowManager.openWindows()
  })
}