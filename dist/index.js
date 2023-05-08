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
exports.runValidator = exports.validate = exports.initConfigFilename = void 0;
require("colors");
const path = __importStar(require("path"));
const errors = __importStar(require("./errors"));
const program = __importStar(require("./program"));
const validator = __importStar(require("./validator"));
exports.initConfigFilename = '.structurerc';
function validate(dirPath, configPath, cliOptions) {
    try {
        const results = program.run(dirPath, configPath, {
            ignoreDirsGlob: cliOptions === null || cliOptions === void 0 ? void 0 : cliOptions.ignoreDirs,
            ignoreFilesGlob: cliOptions === null || cliOptions === void 0 ? void 0 : cliOptions.ignoreFiles,
        });
        runValidator(results.validatorObj);
        if ((cliOptions === null || cliOptions === void 0 ? void 0 : cliOptions.print) && results.asciiTree) {
            console.log('\n', 'Printing asciiTree...'.yellow, results.asciiTree
                .replace(/\/fileIgnored/g, '[File Ignored]'.dim)
                .replace(/\/directoryIgnored/g, '[Directory Ignored]'.dim)
                .replace(/\/emptyDirectory/g, '[Empty Directory]'.dim));
        }
    }
    catch (err) {
        const dash = ' - '.bold;
        const errorTitle = '\n' + 'Error:'.red.underline;
        if (err instanceof errors.JsonParseError) {
            console.error((errorTitle + 'at config file:').red.bold, err.filePath);
            console.error(dash, 'Could not parse/read the file');
            console.error(dash, err.message);
        }
        else if (err instanceof errors.ConfigJsonValidateError) {
            console.error(errorTitle, 'at config file:'.red, err.filePath);
            err.messages.forEach((el) => console.error(dash, `${el[0].red.bold}:`, el[1]));
        }
        else if (errors.isError(err)) {
            console.error(errorTitle);
            console.error(dash, err.message.toString().red.bold);
        }
        else {
            console.error('Unknown error');
        }
        process.exit(1);
    }
}
exports.validate = validate;
function runValidator({ files, rules, emptyDirs, }) {
    try {
        validator.run(files, rules, emptyDirs);
        console.log('✓'.green.bold + ' Directory structure successfully validated!');
    }
    catch (err) {
        const dash = ' - '.bold;
        const errorTitle = '\n' + 'Error:'.red.underline;
        if (err instanceof errors.ValidationError) {
            err.errors.forEach((error) => {
                if (error instanceof errors.FailedRuleError) {
                    console.error(errorTitle);
                    const parentPath = error.paths.join(path.sep);
                    const rule = JSON.stringify(error.rule);
                    console.error(dash, 'Rule', rule.red.bold, 'did not passed at:', parentPath.red.bold);
                }
                else if (error instanceof errors.InvalidPathError) {
                    console.error(errorTitle);
                    console.error(dash, error.path.red.bold, 'path does not match any rules defined in the config');
                }
            });
        }
    }
}
exports.runValidator = runValidator;
