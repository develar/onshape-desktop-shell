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
console.log("Removing " + outDir)
require("rimraf").sync(outDir)

const packager = require("electron-packager")
const metadata = JSON.parse(fs.readFileSync(__dirname + "/../app/package.json"));
const version = metadata.version

let arch = !isMacBuild && args.arch === "all" ? ["ia32", "x64"] : [args.arch]
let currentArchIndex = 0
pack()

function pack() {
  const currentArch = arch[currentArchIndex]
  console.log("Installing dependencies for arch " + currentArch)
  util.installDependencies(currentArch)

  packager({
    dir: "app",
    out: "dist" + (args.platform === "win32" ? "/win" : ""),
    name: metadata.name,
    platform: args.platform,
    arch: currentArch,
    version: util.packageJson.devDependencies["electron-prebuilt"].substring(1),
    icon: "build/icon",
    asar: true,
    "app-version": version,
    "build-version": version,
    "app-bundle-id": "org.develar.onshape",
    "app-category-type": "public.app-category.graphics-design",
    sign: args.sign,
    "version-string": {
      CompanyName: metadata.authors,
      FileDescription: metadata.description,
      FileVersion: version,
      ProductVersion: version,
      ProductName: metadata.name,
      InternalName: metadata.name,
    }
  }, function (error) {
    if (error != null) {
      //noinspection JSClosureCompilerSyntax
      throw new Error(error)
    }

    currentArchIndex++
    if (args.build) {
      build(currentArch, currentArchIndex < arch.length ? function () {
        pack()
      } : null)
    }
    else if (currentArchIndex < arch.length) {
      pack()
    }
  })
}

function build(arch, doneHandler) {
  const appName = "Onshape"
  const appPath = args.platform === "darwin" ? `${outDir}/${appName}.app` : `${outDir}/${appName}-win32-${arch}`

  let callback = function(error) {
    if (error != null) {
      //noinspection JSClosureCompilerSyntax
      throw new Error(error)
    }

    if (isMacBuild) {
      fs.renameSync(path.join(outDir, appName + ".dmg"), path.join(outDir, appName + "-" + version + ".dmg"))
      const spawnSync = require("child_process").spawnSync
      util.reportResult(spawnSync("zip", ["-ryX", `${outDir}/${appName}-${version}-mac.zip`, appName + ".app"], {
        cwd: outDir,
        stdio: "inherit",
      }))
    }
    else {
      fs.renameSync(path.join(outDir, arch, "OnshapeSetup.exe"), path.join(outDir, "OnshapeSetup-" + version + ((arch === "x64") ? "-x64" : "") + ".exe"))
    }

    if (doneHandler != null) {
      doneHandler()
    }
  }

  if (args.platform === "darwin") {
    require("electron-builder").init().build({
      "appPath": appPath,
      "platform": args.platform === "darwin" ? "osx" : "win",
      "out": outDir,
      "config": path.join(__dirname, "packager.json"),
    }, callback)
  }
  else {
    require('electron-installer-squirrel-windows')({
      name: metadata.name,
      path: appPath,
      product_name: metadata.name,
      out: path.join(outDir, arch),
      version: version,
      description: metadata.description,
      authors: metadata.authors,
      setup_icon: path.join(__dirname, "icon.ico"),
      //exe: "Onshape-Setup-" + version + ((arch === "x64") ? "-x64" : "") + ".exe"
    }, callback)
  }
}