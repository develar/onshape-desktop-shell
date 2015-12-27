"use strict"

const args = require("command-line-args")({name: "arch", type: String}).parse()
require("./util").installDependencies(args.arch)