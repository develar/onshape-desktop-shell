import {app, ipcMain} from "electron";
import setMenu from "./AppMenuManager";
import {log} from "./util";
import WindowManager from "./WindowManager";

let windowManager: WindowManager = null
if (app.makeSingleInstance((commandLine: any[], workingDirectory: string) => {
    // someone tried to run a second instance, we should focus our window
    if (windowManager != null) {
      windowManager.focusFirstWindow()
    }
    return true
  })) {
  app.quit()
}
else {
  require("electron-debug")()

  app.on("ready", () => {
    ipcMain.on("log.error", (event: any, arg: any) => {
      log(arg)
    })

    setMenu("https://cad.onshape.com/documents")
    windowManager = new WindowManager()
    windowManager.openWindows()
  })
}