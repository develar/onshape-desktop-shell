"use strict"

let outDir = "dist/Onshape-darwin-x64";
require("rimraf")(outDir, function (error) {
  if (error != null) {
    throw new Error(error)
  }

  console.log(outDir)
})

let packageJson = JSON.parse(require("fs").readFileSync("./package.json"))

let packager = require("electron-packager")
var version = packageJson.version
packager({
           dir: "out",
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
           sign: "Vladimir Krivosheev"
         }, function (error, appPath) {
  if (error != null) throw new Error(error)
})