import ConfigStore = require("configstore")

export default class StateManager {
  private conf = new ConfigStore("onshape-unofficial", {
    windows: [
      {url: "https://cad.onshape.com/"}
  ]})

  getWindows(): Array<WindowItem> {
    return this.conf.get("windows")
  }
}

interface WindowItem {
  url: string
}