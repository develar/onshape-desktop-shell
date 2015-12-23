import { app, autoUpdater, BrowserWindow as BrowserWindowElectron } from "electron"
import * as os from "os"
import BrowserWindow = GitHubElectron.BrowserWindow
import WebContents = GitHubElectron.WebContents
import { isDev, log } from "./util"

const UPDATE_SERVER_HOST = "onshape-download.develar.org"

export default class ApplicationUpdater {
  constructor(window: BrowserWindow) {
    if (isDev()) {
      return
    }

    if (os.platform() != "darwin") {
      return
    }

    let version = app.getVersion()
    autoUpdater.addListener("update-available", (event: any, releaseNotes: string, releaseName: string, releaseDate: string, updateURL: string) => {
      log("A new update is available", `Version ${releaseName} is available and will be automatically downloaded`)
    })
    autoUpdater.addListener("update-downloaded", (event: any, releaseNotes: string, releaseName: string, releaseDate: string, updateURL: string) => {
      notify("A new update is ready to install", `Version ${releaseName} is downloaded and will be automatically installed on Quit`)
    })
    autoUpdater.addListener("error", (error: any) => {
      log(error)
    })
    autoUpdater.addListener("checking-for-update", () => {
      log("checking-for-update")
    })
    autoUpdater.addListener("update-not-available", () => {
      log("update-not-available")
    })
    autoUpdater.setFeedURL(`http://${UPDATE_SERVER_HOST}/update/${os.platform()}_${os.arch()}/${version}`)

    window.webContents.once("did-frame-finish-load", (event: any) => {
      autoUpdater.checkForUpdates()
    })
  }
}

function notify(title: string, message: string) {
  let windows = BrowserWindowElectron.getAllWindows()
  if (windows.length == 0) {
    return
  }

  windows[0].webContents.send("notify", title, message)
}