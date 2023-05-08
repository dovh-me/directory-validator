import 'colors';
import { Rules } from './types';
import commander from 'commander';
export declare const initConfigFilename = ".structurerc";
export declare function validate(dirPath: string, configPath: string, cliOptions?: commander.OptionValues): void;
export declare function runValidator({ files, rules, emptyDirs, }: {
    files: any[];
    rules: Rules;
    emptyDirs: any[];
}): void;
