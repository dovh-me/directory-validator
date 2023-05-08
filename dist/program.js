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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const ajv_1 = __importDefault(require("ajv"));
const fs = __importStar(require("fs"));
const glob = __importStar(require("glob"));
const file_1 = require("goerwin-helpers/node/file");
const _ = __importStar(require("lodash"));
const errors = __importStar(require("./errors"));
const schema_json_1 = __importDefault(require("./resources/schema.json"));
function getConfig(rulesPath) {
    let configJson;
    try {
        configJson = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
    }
    catch (err) {
        throw new errors.JsonParseError(err, rulesPath);
    }
    const validateWithSchema = (configJson) => {
        const ajv = new ajv_1.default();
        if (!ajv.validate(schema_json_1.default, configJson)) {
            let errorMessages = [];
            if (ajv.errors) {
                errorMessages = ajv.errors.map((el) => [`data${el.instancePath}`, `${el.message || ''}`]
                // TODO: Verify
                // [`data${el.dataPath}`, `${el.message || ''}`]
                );
            }
            throw new errors.ConfigJsonValidateError(errorMessages, rulesPath);
        }
    };
    const parseCommonRules = (rules) => {
        return rules.map((rule) => {
            if (rule.type === 'common') {
                let parsedRule = configJson.commonRules[rule.key];
                if (!parsedRule) {
                    throw new errors.ConfigJsonValidateError([['Common Rule Invalid', JSON.stringify(rule)]], rulesPath);
                }
                parsedRule = _.cloneDeep(parsedRule);
                parsedRule = parseCommonRules([parsedRule])[0];
                parsedRule.isOptional =
                    typeof parsedRule.isOptional === 'undefined'
                        ? !!rule.isOptional
                        : parsedRule.isOptional;
                return Object.assign({}, parsedRule);
            }
            else if (rule.type === 'directory') {
                rule.rules = parseCommonRules(rule.rules || []);
            }
            return rule;
        });
    };
    validateWithSchema(configJson);
    configJson.rules = parseCommonRules(configJson.rules);
    validateWithSchema(configJson);
    return {
        ignoreFiles: configJson.ignoreFiles,
        ignoreDirs: configJson.ignoreDirs,
        rules: configJson.rules,
    };
}
function run(dirPath, configPath, options = {}) {
    const { ignoreFiles, ignoreDirs, rules } = getConfig(configPath);
    let ignoreFilesGlob;
    if (ignoreFiles && ignoreFiles.length > 0) {
        ignoreFilesGlob = `{${[ignoreFiles[0], ...ignoreFiles].join(',')}}`;
    }
    ignoreFilesGlob = options.ignoreFilesGlob || ignoreFilesGlob;
    const newIgnoreFiles = ignoreFilesGlob
        ? glob.sync(ignoreFilesGlob, { cwd: dirPath })
        : [];
    // Ignore Dirs
    let ignoreDirsGlob;
    if (ignoreDirs && ignoreDirs.length > 0) {
        ignoreDirsGlob = `{${[ignoreDirs[0], ...ignoreDirs].join(',')}}`;
    }
    ignoreDirsGlob = options.ignoreDirsGlob || ignoreDirsGlob;
    const newIgnoreDirs = ignoreDirsGlob
        ? glob.sync(ignoreDirsGlob, { cwd: dirPath })
        : [];
    const files = (0, file_1.getChildFiles)(dirPath, {
        recursive: true,
        ignoreDirs: newIgnoreDirs,
        ignoreFiles: newIgnoreFiles,
    });
    const emptyDirs = (0, file_1.getChildDirs)(dirPath, {
        recursive: true,
        ignoreDirs: newIgnoreDirs,
        ignoreFiles: newIgnoreFiles,
    });
    return {
        validatorObj: {
            files: files.filter((el) => !el.isIgnored).map((el) => el.path),
            rules,
            emptyDirs: emptyDirs
                .filter((el) => !el.isIgnored && el.isEmpty)
                .map((el) => el.path),
        },
        asciiTree: (0, file_1.generateAsciiTree)(dirPath, [
            ...files,
            ...emptyDirs.filter((el) => el.isIgnored || el.isEmpty),
        ]),
    };
}
exports.run = run;
