export interface FileRule {
    type: 'file';
    name: string | RegExp;
    extension?: string | RegExp;
    isOptional?: boolean;
}
export interface DirectoryRule {
    type: 'directory';
    name: string | RegExp;
    isOptional?: boolean;
    isRecursive?: boolean;
    allowEmpty?: boolean;
    rules?: Rules;
}
export interface CommonRule {
    type: 'common';
    key: string;
    isOptional?: boolean;
}
export interface ValidatableFile {
    path: string;
    isGood: boolean;
    isValidated: boolean;
}
export declare type Rule = FileRule | DirectoryRule | CommonRule;
export declare type Rules = Rule[];
export declare type SpecialName = '[camelCase]' | '[UPPERCASE]' | '[dash-case]' | '[snake_case]' | '*';
export interface Config {
    ignoreFiles?: string[];
    ignoreDirs?: string[];
    rules: Rules;
}
