"use strict"

const packageJson = JSON.parse(require("fs").readFileSync(__dirname + "/../package.json"))

function reportResult(result) {
  if (result.status != 0) {
    console.log(result)
  }
}

exports.installDependencies = function (arch) {
  const env = Object.assign(process.env, {
    npm_config_disturl: "https://atom.io/download/atom-shell",
    npm_config_target: packageJson.devDependencies["electron-prebuilt"].substring(1),
    npm_config_runtime: "electron",
    HOME: require("os").homedir() + "/.electron-gyp",
  })

  if (arch != null) {
    env.npm_config_arch = arch
  }

  reportResult(require("child_process").spawnSync(process.platform === "win32" ? "C:\\Program Files\\nodejs\\npm.cmd" : "npm", ["install"], {
    cwd: __dirname + "/../app",
    stdio: "inherit",
    env: env
  }))
}

exports.reportResult = reportResult
exports.packageJson = packageJson