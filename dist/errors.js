"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isError = exports.ValidationError = exports.InvalidPathError = exports.FailedRuleError = exports.ConfigJsonValidateError = exports.JsonParseError = void 0;
class JsonParseError extends Error {
    constructor(err, filePath) {
        const parsedError = isError(err) ? err : new Error('unknown error');
        super(parsedError.message);
        this.err = parsedError;
        this.filePath = filePath;
        this.name = 'JsonParseError';
    }
}
exports.JsonParseError = JsonParseError;
class ConfigJsonValidateError extends Error {
    constructor(messages, filePath) {
        super();
        this.name = 'ConfigJsonValidateError';
        this.messages = messages;
        this.filePath = filePath;
    }
}
exports.ConfigJsonValidateError = ConfigJsonValidateError;
class FailedRuleError extends Error {
    constructor(rule, paths) {
        super(`${JSON.stringify(rule)}, deep: ${paths.length}, rule did not passed`);
        this.name = 'FailedRuleError';
        this.rule = rule;
        this.paths = paths;
    }
}
exports.FailedRuleError = FailedRuleError;
class InvalidPathError extends Error {
    constructor(path) {
        super(`${path}, was not validated due to path being invalid`);
        this.name = 'InvalidPathError';
        this.path = path;
    }
}
exports.InvalidPathError = InvalidPathError;
class ValidationError extends Error {
    constructor(errors) {
        super('There were errors validating the project');
        this.name = 'ValidationError';
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
function isError(err) {
    return Boolean(err && err.stack && err.message);
}
exports.isError = isError;
