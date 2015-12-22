"use strict"

let fs = require("fs")
let spawnSync = require('child_process').spawnSync
let packageJson = JSON.parse(fs.readFileSync(__dirname + "/../package.json"))

let env = require('merge')(process.env, {
        npm_config_disturl: "https://atom.io/download/atom-shell",
        npm_config_target: packageJson.devDependencies["electron-prebuilt"].substring(1),
        npm_config_arch: "x64",
        npm_config_runtime: "electron",
        HOME: require("os").homedir() + "/.electron-gyp",
    })

let result = spawnSync("npm", ["install"], {
        cwd: __dirname + "/../app",
        stdio: "inherit",
        env: env
    },
    function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    })

if (result.status != 0) {
  console.log(result)
}
