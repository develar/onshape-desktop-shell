"use strict"

let packager = require("electron-packager")
var version = "0.0.2"
packager({
           dir: "out",
           out: "dist",
           name: "Onshape",
           platform: "darwin",
           arch: "x64",
           version: "0.36.0",
           icon: "build/icon.icns",
           asar: true,
           "app-version": version,
           "build-version": version,
           "app-bundle-id": "org.develar.onshape",
           "app-category-type": "public.app-category.graphics-design",
         }, function done (error, appPath) { if (error != null) throw new Error(error) })