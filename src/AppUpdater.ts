import { Notification } from "electron"
import { autoUpdater } from "electron-updater"
import * as os from "os"
import { isDev } from "./util"

export default class AppUpdater {
  constructor() {
    if (isDev()) {
      return
    }

    const platform = os.platform()
    if (platform === "linux") {
      return
    }

    const log = require("electron-log")
    log.transports.file.level = "info"
    autoUpdater.logger = log

    autoUpdater.signals.updateDownloaded(it => {
      new Notification({
        title: "A new update is ready to install",
        body: `Version ${it.version} is downloaded and will be automatically installed on Quit`
      }).show()
    })
    autoUpdater.checkForUpdates()
  }
}