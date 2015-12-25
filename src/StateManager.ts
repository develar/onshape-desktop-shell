"use strict"

import * as os from "os"
import * as path from "path"
import ConfigStore = require("configstore")
import { isDev } from "./util"

export const DEFAULT_URL = "https://cad.onshape.com/"

function defaultWindows() {
  return [
    {url: DEFAULT_URL}
  ]
}

export class StateManager {
  private store = new ConfigStore("onshape-unofficial", {windows: defaultWindows()})

  private data: Config

  constructor() {
    if (os.platform() == "darwin") {
      this.store.path = path.join(os.homedir(), "Library", "Preferences", "org.develar.onshape" + (isDev() ? "-dev" : "") + ".json")
    }
  }

  restoreWindows(): void {
    let data = this.getOrLoadData()
    data.windows = defaultWindows()
    this.store.all = data
  }

  private getOrLoadData(): Config {
    let data = this.data
    if (data == null) {
      data = this.store.all
      this.data = data
    }
    return data
  }

  getWindows(): Array<WindowItem> {
    return this.getOrLoadData().windows
  }

  save(): void {
    const data = this.data
    if (data != null) {
      this.store.all = data
    }
  }
}

interface Config {
  windows: Array<WindowItem>
}

export interface WindowItem {
  url: string
  width?: number
  height?: number
  x?: number
  y?: number
  maximized?: boolean
}