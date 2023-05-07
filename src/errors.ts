import * as types from './types';

export class JsonParseError extends Error {
    err: Error;
    filePath: string;

    constructor(err: unknown, filePath: string) {
        const parsedError = isError(err) ? err : new Error('unknown error');
        super(parsedError.message);

        this.err = parsedError;
        this.filePath = filePath;
        this.name = 'JsonParseError';
    }
}

export class ConfigJsonValidateError extends Error {
    filePath: string;
    messages: string[][];

    constructor(messages: string[][], filePath: string) {
        super();
        this.name = 'ConfigJsonValidateError';
        this.messages = messages;
        this.filePath = filePath;
    }
}

export class FailedRuleError extends Error {
    paths: (string | RegExp)[];
    rule: types.FileRule | types.DirectoryRule;

    constructor(rule: types.FileRule | types.DirectoryRule, paths: (string | RegExp)[]) {
        super(`${JSON.stringify(rule)}, deep: ${paths.length}, rule did not passed`);
        this.name = 'FailedRuleError';
        this.rule = rule;
        this.paths = paths;
    }
}

export class InvalidPathError extends Error {
    path: string;

    constructor(path: string) {
        super(`${path}, was not validated due to path being invalid`);
        this.name = 'InvalidPathError';
        this.path = path;
    }
}

export class ValidationError extends Error {
    errors: Error[];

    constructor(errors: Error[]) {
        super('There were errors validating the project');
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

export function isError(err: any): err is Error {
    return Boolean(err && err.stack && err.message);
}
