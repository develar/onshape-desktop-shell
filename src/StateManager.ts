import ConfigStore = require("configstore")

function defaultWindows() {
  return [
    {url: "https://cad.onshape.com/"}
  ]
}

export default class StateManager {
  private store = new ConfigStore("onshape-unofficial", {windows: defaultWindows()})

  restoreWindows() {
    this.store.set("windows", defaultWindows())
  }

  getWindows(): Array<WindowItem> {
    return this.store.get("windows")
  }
}

interface WindowItem {
  url: string
  width?: number
  height?: number
}