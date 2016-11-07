import {app, BrowserWindow as BrowserWindowElectron} from "electron";
import * as os from "os";
import {isDev, log} from "./util";
import {autoUpdater} from "electron-auto-updater";
import BrowserWindow = GitHubElectron.BrowserWindow
import WebContents = GitHubElectron.WebContents

const UPDATE_SERVER_HOST = "onshape-download.develar.org"

export default class AppUpdater {
  constructor(window: BrowserWindow) {
    if (isDev()) {
      return
    }

    const platform = os.platform()
    if (platform === "linux") {
      return
    }

    const version = app.getVersion()
    autoUpdater.addListener("update-available", (event: any) => {
      log("A new update is available")
    })
    autoUpdater.addListener("update-downloaded", (event: any, releaseNotes: string, releaseName: string, releaseDate: string, updateURL: string) => {
      notify("A new update is ready to install", `Version ${releaseName} is downloaded and will be automatically installed on Quit`)
      log("quitAndInstall")
      autoUpdater.quitAndInstall()
      return true

    })
    autoUpdater.addListener("error", (error: any) => {
      log(error)
    })
    autoUpdater.addListener("checking-for-update", (event: any) => {
      log("checking-for-update")
    })
    autoUpdater.addListener("update-not-available", () => {
      log("update-not-available")
    })

    if (platform === "darwin") {
      autoUpdater.setFeedURL(`https://${UPDATE_SERVER_HOST}/update/${platform}_${os.arch()}/${version}`)
    }

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