import { app } from "electron"
import { log } from "./util"
import { spawn } from "child_process"
import * as path from "path"

function run(args: string[], done: Function): void {
  const updateExe = path.resolve(path.dirname(process.execPath), "..", "Update.exe")
  log("Spawning `%s` with args `%s`", updateExe, args)
  spawn(updateExe, args, {
    detached: true
  })
    .on("close", done)
}

export default function handleStartupEvent(): boolean {
  if (process.platform !== "win32") {
    return false
  }

  const cmd = process.argv[1]
  log("Processing squirrel command `%s`", cmd)
  const target = path.basename(process.execPath)
  if (cmd === "--squirrel-install" || cmd === "--squirrel-updated") {
    run(['--createShortcut=' + target + ''], app.quit)
    return true
  }
  else if (cmd === "--squirrel-uninstall") {
    run(['--removeShortcut=' + target + ''], app.quit)
    return true
  }
  else if (cmd === "--squirrel-obsolete") {
    app.quit()
    return true
  }
  else {
    return false
  }
}