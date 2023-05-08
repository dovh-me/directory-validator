#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeDefaultConfigFile = void 0;
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const index_1 = require("../index");
const commander_1 = require("commander");
const initConfigFilename = '.structurerc';
function getDefaultConfigFilePath(dirPath) {
    let absDirPath = path.resolve(dirPath);
    const homeDirPath = os.homedir();
    while (true) {
        const configPath = path.join(absDirPath, initConfigFilename);
        if (fs.existsSync(configPath)) {
            return configPath;
        }
        if (absDirPath === homeDirPath) {
            break;
        }
        absDirPath = path.resolve(absDirPath, '..');
    }
    throw new Error('configuration file was not provided/found');
}
function writeDefaultConfigFile(parentPath) {
    fs.copyFileSync(path.join(__dirname, '../resources/defaultConfig.json'), parentPath);
}
exports.writeDefaultConfigFile = writeDefaultConfigFile;
(() => {
    commander_1.program.version(JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'))
        .version);
    commander_1.program
        .arguments('<dirPath>')
        .option('-i, --init', 'Create a configuration file')
        .option('-p, --print', 'Print the directory structure validated')
        .option('-f, --ignore-files <files>', 'Ignore files (glob string) eg: -f "*.js"')
        .option('-d, --ignore-dirs <dirs>', 'Ignore directories (glob string) eg: -d "**/tests"')
        .option('-c, --config-file <path>', 'Path to the configuration file')
        .parse(process.argv);
    const selectedOptions = commander_1.program.opts();
    if (selectedOptions.init) {
        fs.copyFileSync(path.join(__dirname, '../resources/defaultConfig.json'), path.join(process.cwd(), initConfigFilename));
        console.log('\n\t', initConfigFilename.red, 'created', '\n');
    }
    else if (!commander_1.program.args.length) {
        commander_1.program.help();
    }
    else {
        const dirPath = path.resolve(commander_1.program.args[0]);
        const configPath = selectedOptions.configFile || getDefaultConfigFilePath(dirPath);
        (0, index_1.validate)(dirPath, configPath, selectedOptions);
    }
})();
