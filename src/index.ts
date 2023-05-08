import 'colors';
import * as path from 'path';
import * as errors from './errors';
import * as program from './program';
import * as validator from './validator';
import { Rules } from './types';
import commander from 'commander';

export const initConfigFilename = '.structurerc';

export function validate(
    dirPath: string,
    configPath: string,
    cliOptions?: commander.OptionValues
) {
    try {
        const results = program.run(dirPath, configPath, {
            ignoreDirsGlob: cliOptions?.ignoreDirs,
            ignoreFilesGlob: cliOptions?.ignoreFiles,
        });

        runValidator(results.validatorObj);

        if (cliOptions?.print && results.asciiTree) {
            console.log(
                '\n',
                'Printing asciiTree...'.yellow,
                results.asciiTree
                    .replace(/\/fileIgnored/g, '[File Ignored]'.dim)
                    .replace(/\/directoryIgnored/g, '[Directory Ignored]'.dim)
                    .replace(/\/emptyDirectory/g, '[Empty Directory]'.dim)
            );
        }
    } catch (err) {
        const dash = ' - '.bold;
        const errorTitle = '\n' + 'Error:'.red.underline;

        if (err instanceof errors.JsonParseError) {
            console.error((errorTitle + 'at config file:').red.bold, err.filePath);
            console.error(dash, 'Could not parse/read the file');
            console.error(dash, err.message);
        } else if (err instanceof errors.ConfigJsonValidateError) {
            console.error(errorTitle, 'at config file:'.red, err.filePath);
            err.messages.forEach((el) =>
                console.error(dash, `${el[0].red.bold}:`, el[1])
            );
        } else if (errors.isError(err)) {
            console.error(errorTitle);
            console.error(dash, err.message.toString().red.bold);
        } else {
            console.error('Unknown error');
        }

        process.exit(1);
    }
}

export function runValidator({
    files,
    rules,
    emptyDirs,
}: {
    files: any[];
    rules: Rules;
    emptyDirs: any[];
}) {
    try {
        validator.run(files, rules, emptyDirs);
        console.log('✓'.green.bold + ' Directory structure successfully validated!');
    } catch (err) {
        const dash = ' - '.bold;
        const errorTitle = '\n' + 'Error:'.red.underline;
        if (err instanceof errors.ValidationError) {
            err.errors.forEach((error) => {
                if (error instanceof errors.FailedRuleError) {
                    console.error(errorTitle);
                    const parentPath = error.paths.join(path.sep);
                    const rule = JSON.stringify(error.rule);
                    console.error(
                        dash,
                        'Rule',
                        rule.red.bold,
                        'did not passed at:',
                        parentPath.red.bold
                    );
                } else if (error instanceof errors.InvalidPathError) {
                    console.error(errorTitle);
                    console.error(
                        dash,
                        error.path.red.bold,
                        'path does not match any rules defined in the config'
                    );
                }
            });
        }
    }
}
