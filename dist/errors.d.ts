import * as types from './types';
export declare class JsonParseError extends Error {
    err: Error;
    filePath: string;
    constructor(err: unknown, filePath: string);
}
export declare class ConfigJsonValidateError extends Error {
    filePath: string;
    messages: string[][];
    constructor(messages: string[][], filePath: string);
}
export declare class FailedRuleError extends Error {
    paths: (string | RegExp)[];
    rule: types.FileRule | types.DirectoryRule;
    constructor(rule: types.FileRule | types.DirectoryRule, paths: (string | RegExp)[]);
}
export declare class InvalidPathError extends Error {
    path: string;
    constructor(path: string);
}
export declare class ValidationError extends Error {
    errors: Error[];
    constructor(errors: Error[]);
}
export declare function isError(err: any): err is Error;
