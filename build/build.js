"use strict"

const outDir = "dist/Onshape-darwin-x64"
require("rimraf").sync(outDir)

const fs = require("fs")
const packageJson = JSON.parse(fs.readFileSync(__dirname + "/../package.json"))

const args = require("command-line-args")([{name: "pack", type: Boolean}, {name: "sign", type: String}]).parse()

const packager = require("electron-packager")
const version = JSON.parse(fs.readFileSync(__dirname + "/../app/package.json")).version

packager({
  dir: "app",
  out: "dist",
  name: "Onshape",
  platform: "darwin",
  arch: "x64",
  version: packageJson.devDependencies["electron-prebuilt"].substring(1),
  icon: "build/icon.icns",
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

  if (args.pack) {
    pack()
  }
})

function pack() {
  let outDir = `${__dirname}/../dist/Onshape-darwin-x64`
  let appName = "Onshape"
  require("electron-builder").init().build({
    "appPath": `${outDir}/${appName}.app`,
    "platform": "osx",
    "out": outDir,
    "config": `${__dirname}/packager.json`,
  }, function callback(error) {
    if (error != null) {
      //noinspection JSClosureCompilerSyntax
      throw new Error(error)
    }

    fs.renameSync(`${outDir}/${appName}.dmg`, `${outDir}/${appName}-${version}.dmg`)
  })
}