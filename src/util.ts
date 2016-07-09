import {app} from "electron";

export function isDev() {
  return app.getPath("exe").includes("/node_modules/electron-prebuilt/")
}

let _log: (...args: any[]) => void

if (isDev()) {
  _log = function (...args: any[]): void {
    console.log(args)
  }
}
else {
  const nsLog = require("nslog")
  _log = function (...args: any[]): void {
    nsLog(args)
  }
}

export function log(...args: any[]): void {
  _log(args)
}