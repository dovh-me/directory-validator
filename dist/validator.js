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
exports.run = void 0;
const _ = __importStar(require("lodash"));
const path = __importStar(require("path"));
const errors = __importStar(require("./errors"));
// TODO: remove the global variable
let outErrors = [];
function getCorrectStringRegexp(name) {
    if (typeof name === 'string') {
        if (name[0] === '/' && name[name.length - 1] === '/' && name.length > 0) {
            return RegExp(name.substring(1, name.length - 1));
        }
    }
    return name;
}
function getMultimatchName(nameRule) {
    const specialNames = [
        '[camelCase]',
        '[UPPERCASE]',
        '[dash-case]',
        '[snake_case]',
        '*',
    ];
    return specialNames.reduce((result, el) => {
        if (result) {
            return result;
        }
        const ruleSegments = nameRule.split(el);
        if (ruleSegments.length === 2) {
            return {
                type: el,
                leftSide: ruleSegments[0],
                rightSide: ruleSegments[1],
            };
        }
        return result;
    }, undefined);
}
function getDirFiles(files, paths, isRecursive = false) {
    return files.filter((el) => {
        let pathSegments = el.path.split(path.sep);
        pathSegments = pathSegments.slice(0, pathSegments.length - 1);
        const parentPaths = paths.slice(1, paths.length);
        if (isRecursive) {
            if (parentPaths.length > pathSegments.length) {
                return false;
            }
        }
        else {
            if (parentPaths.length !== pathSegments.length) {
                return false;
            }
        }
        return parentPaths.every((el, i) => isNameValid(el, pathSegments[i]));
    });
}
function isNameValid(nameRule, name) {
    if (nameRule instanceof RegExp) {
        return nameRule.test(name);
    }
    const multimatchname = getMultimatchName(nameRule);
    if (multimatchname) {
        const { type, leftSide, rightSide } = multimatchname;
        const rightSideIndexOf = name.lastIndexOf(rightSide);
        if (name.indexOf(leftSide) !== 0) {
            return false;
        }
        if (rightSideIndexOf + rightSide.length !== name.length) {
            return false;
        }
        const filenameToValidate = name.substring(leftSide.length, rightSideIndexOf);
        if (filenameToValidate.length === 0 && type !== '*') {
            return false;
        }
        switch (type) {
            case '[camelCase]':
                return _.camelCase(filenameToValidate) === filenameToValidate;
            case '[UPPERCASE]':
                return _.upperCase(filenameToValidate) === filenameToValidate;
            case '[dash-case]':
                return _.kebabCase(filenameToValidate) === filenameToValidate;
            case '[snake_case]':
                return _.snakeCase(filenameToValidate) === filenameToValidate;
            case '*':
                return true;
            default:
                return false;
        }
    }
    return nameRule === name;
}
function isFileExtValid(fileExtRule, ext) {
    if (fileExtRule instanceof RegExp) {
        return fileExtRule.test(ext);
    }
    return fileExtRule === ext;
}
function getFilesByParentDir(files) {
    return _.groupBy(files, (el) => {
        const pathFragments = el.path.split(path.sep);
        return pathFragments.slice(0, pathFragments.length - 1).join(path.sep);
    });
}
function getValidatableFiles(files) {
    return files.map((el) => ({
        path: path.normalize(el),
        isGood: false,
        isValidated: false,
    }));
}
function getRuleError(rule, paths) {
    return new errors.FailedRuleError(rule, paths);
}
function validatePath(element) {
    if (!element.isGood) {
        outErrors.push(new errors.InvalidPathError(element.path));
        // throw new errors.ValidatorInvalidPathError(element.path);
    }
}
function run(files, mainRules, emptyDirs = []) {
    if (mainRules.length === 0) {
        return;
    }
    const newFiles = getValidatableFiles(files);
    const newEmptyDirs = emptyDirs.map((el) => ({
        path: path.normalize(el),
        isGood: false,
    }));
    function validateRules(rules = [], paths = ['.']) {
        if (rules.length === 0) {
            return;
        }
        rules.forEach((rule, idx) => {
            if (rule.type === 'common') {
                return;
            }
            rule.name = getCorrectStringRegexp(rule.name);
            if (rule.type === 'file') {
                const dirFiles = getDirFiles(newFiles, paths);
                // If more than one file matches the rule then it passes
                const fileRulePassed = dirFiles.reduce((result, file) => {
                    const { base, name, ext } = path.parse(file.path);
                    let isFileValid;
                    if (!rule.extension) {
                        isFileValid = isNameValid(rule.name, base);
                    }
                    else {
                        isFileValid =
                            isNameValid(rule.name, name) &&
                                isFileExtValid(getCorrectStringRegexp(rule.extension), ext.substring(1));
                    }
                    file.isValidated = file.isValidated || isFileValid;
                    return result || isFileValid;
                }, newFiles.length === 0);
                if (!fileRulePassed && !rule.isOptional) {
                    // throw getRuleError(rule, paths);
                    outErrors.push(getRuleError(rule, paths));
                }
                // Mark as good all files that were validated
                dirFiles
                    .filter((el) => el.isValidated)
                    .forEach((el) => {
                    el.isGood = true;
                });
                newFiles.forEach((el) => {
                    el.isValidated = false;
                });
                return;
            }
            // Directory Rule
            const dirFiles = getDirFiles(newFiles, [...paths, rule.name], true);
            const emptyDir = newEmptyDirs.find((el) => {
                console.log({
                    pathToCompare: el.path,
                    normalizedPath: path.normalize([...paths, rule.name].join(path.sep)),
                });
                return el.path === path.normalize([...paths, rule.name].join(path.sep));
            });
            // If no rules for this dir, it should validate all of its files
            if ((rule.rules || []).length === 0) {
                dirFiles.forEach((el) => {
                    el.isGood = true;
                });
                if (emptyDir) {
                    emptyDir.isGood = true;
                    return;
                }
            }
            // Dir does not exist
            if (dirFiles.length === 0) {
                // TODO: mmm This was making a test fail
                // rule.isRecursive = false;
                if (rule.isOptional) {
                    return;
                }
                // throw getRuleError(rule, paths);
                outErrors.push(getRuleError(rule, paths));
            }
            if (rule.name instanceof RegExp || getMultimatchName(rule.name)) {
                const parentPaths = getFilesByParentDir(dirFiles);
                const parentPathsArray = _.keys(parentPaths);
                const nextDirNamesChecked = [];
                for (let i = 0; i < parentPathsArray.length; i += 1) {
                    // Only look for the nextDirName (no recursively) to form the new path.
                    // So it case we have a file 'a/b/c/d.js', we only iterate on [...paths, 'a']
                    const nextDirName = parentPathsArray[i].split(path.sep)[paths.length - 1];
                    if (!nextDirNamesChecked.includes(nextDirName)) {
                        nextDirNamesChecked.push(nextDirName);
                        validateRules(rule.rules, [...paths, nextDirName]);
                    }
                }
                return;
            }
            if (rule.isRecursive) {
                // We force rule to optional so we avoid recursively looking for
                // this rule. (It's only needed the first time)
                rule.isOptional = true;
                validateRules([rule], [...paths, rule.name]);
                validateRules(rule.rules, [...paths, rule.name]);
                return;
            }
            validateRules(rule.rules, [...paths, rule.name]);
        });
    }
    outErrors = [];
    validateRules(mainRules);
    newFiles.forEach(validatePath);
    newEmptyDirs.forEach(validatePath);
    const hasErrors = outErrors.length > 0;
    if (hasErrors) {
        throw new errors.ValidationError(outErrors);
    }
}
exports.run = run;
