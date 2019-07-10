import * as ConfigStore from "electron-store"

export const DEFAULT_URL = "https://cad.onshape.com/"

function defaultWindows() {
  return [
    {url: DEFAULT_URL}
  ]
}

export class StateManager {
  private store = new ConfigStore()

  private windows: Array<WindowItem> = defaultWindows()

  restoreWindows(): void {
    this.store.delete("windows")
    this.windows = defaultWindows()
  }

  getWindows(): Array<WindowItem> {
    const result = this.store.get("windows")
    if (result == null || !Array.isArray(result)) {
      this.windows = defaultWindows()
    }
    else {
      this.windows = result
    }
    return this.windows
  }

  save(): void {
    this.store.set("windows", this.windows)
  }
}

export interface WindowItem {
  url: string
  width?: number
  height?: number
  x?: number
  y?: number
  maximized?: boolean
}