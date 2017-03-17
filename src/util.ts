const _isDev = require('electron-is-dev')

export function isDev() {
  return _isDev
}

let _log: (...args: any[]) => void

if (isDev()) {
  _log = function (...args: any[]): void {
    console.log(args)
  }
}
else {
  const log = require("electron-log")
  _log = log.info.bind(log)
}

export function log(...args: any[]): void {
  _log(args)
}