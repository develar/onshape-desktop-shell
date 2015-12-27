"use strict"

const fs = require("fs")
const path = require("path")
const util = require("./util")

const args = require("command-line-args")([
  {name: "build", type: Boolean, defaultValue: false},
  {name: "sign", type: String},
  {name: "platform", type: String, defaultValue: process.platform},
  {name: "arch", type: String, defaultValue: "all"},
]).parse()

let outDir = path.join(__dirname, "/../dist") + "/"
const isMacBuild = args.platform === "darwin"
if (isMacBuild) {
  outDir += "Onshape-darwin-x64"
}
else {
  outDir += "win"
}
outDir = path.normalize(outDir)
console.log("Remove " + outDir)
require("rimraf").sync(outDir)

const packager = require("electron-packager")
const version = JSON.parse(fs.readFileSync(__dirname + "/../app/package.json")).version

let arch = !isMacBuild && args.arch === "all" ? ["ia32", "x64"] : [args.arch]
let currentArchIndex = 0
pack()

function pack() {
  console.log("Install dependencies for arch " + arch[currentArchIndex])
  util.installDependencies(arch[currentArchIndex])

  packager({
    dir: "app",
    out: "dist" + (args.platform === "win32" ? "/win" : ""),
    name: "Onshape",
    platform: args.platform,
    arch: arch[currentArchIndex],
    version: util.packageJson.devDependencies["electron-prebuilt"].substring(1),
    icon: "build/icon",
    asar: true,
    "app-version": version,
    "build-version": version,
    "app-bundle-id": "org.develar.onshape",
    "app-category-type": "public.app-category.graphics-design",
    sign: args.sign
  }, function (error) {
    if (error != null) {
      //noinspection JSClosureCompilerSyntax
      throw new Error(error)
    }

    currentArchIndex++
    if (args.build) {
      build(currentArchIndex < arch.length ? function () {
        pack()
      } : null)
    }
    else if (currentArchIndex < arch.length) {
      pack()
    }
  })
}

function build(doneHandler) {
  const appName = "Onshape"
  const appPath = `${outDir}/${appName}.app`
  require("electron-builder").init().build({
    "appPath": appPath,
    "platform": args.platform === "darwin" ? "osx" : "win",
    "out": outDir,
    "config": `${__dirname}/packager.json`,
  }, function callback(error) {
    if (error != null) {
      //noinspection JSClosureCompilerSyntax
      throw new Error(error)
    }

    fs.renameSync(`${outDir}/${appName}.dmg`, `${outDir}/${appName}-${version}.dmg`)
    const spawnSync = require("child_process").spawnSync
    util.reportResult(spawnSync("zip", ["-ryX", `${outDir}/${appName}-${version}.zip`, appName + ".app"], {
      cwd: outDir,
      stdio: "inherit",
    }))

    if (doneHandler != null) {
      doneHandler()
    }
  })
}