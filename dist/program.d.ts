import * as types from './types';
export declare function run(dirPath: string, configPath: string, options?: {
    ignoreDirsGlob?: string;
    ignoreFilesGlob?: string;
}): {
    validatorObj: {
        files: string[];
        rules: types.Rules;
        emptyDirs: string[];
    };
    asciiTree: string | null;
};
