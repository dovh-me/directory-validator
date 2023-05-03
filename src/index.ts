#! /usr/bin/env node

import 'colors';
import { program as commanderProgram } from 'commander';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as errors from './errors';
import * as program from './program';
import * as validator from './validator';
import { Rules } from './types';

const initConfigFilename = '.structurerc';

function getDefaultConfigFilePath(dirPath: string) {
    let absDirPath = path.resolve(dirPath);
    const homeDirPath = os.homedir();

    while (true) {
        const configPath = path.join(absDirPath, initConfigFilename);
        if (fs.existsSync(configPath)) {
            return configPath;
        }
        if (absDirPath === homeDirPath) {
            break;
        }
        absDirPath = path.resolve(absDirPath, '..');
    }

    throw new Error('configuration file was not provided/found');
}

export function writeDefaultConfigFile(parentPath: string) {
    fs.copyFileSync(path.join(__dirname, './resources/defaultConfig.json'), parentPath);
}

commanderProgram.version(
    JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')).version
);

commanderProgram
    .arguments('<dirPath>')
    .option('-i, --init', 'Create a configuration file')
    .option('-p, --print', 'Print the directory structure validated')
    .option('-f, --ignore-files <files>', 'Ignore files (glob string) eg: -f "*.js"')
    .option(
        '-d, --ignore-dirs <dirs>',
        'Ignore directories (glob string) eg: -d "**/tests"'
    )
    .option('-c, --config-file <path>', 'Path to the configuration file')
    .parse(process.argv);

const selectedOptions = commanderProgram.opts();

if (selectedOptions.init) {
    fs.copyFileSync(
        path.join(__dirname, './resources/defaultConfig.json'),
        path.join(process.cwd(), initConfigFilename)
    );
    console.log('\n\t', initConfigFilename.red, 'created', '\n');
} else if (!commanderProgram.args.length) {
    commanderProgram.help();
} else {
    const dirPath = path.resolve(commanderProgram.args[0]);

    validate(dirPath);
}

function validate(dirPath: string) {
    try {
        const configPath =
            (selectedOptions.configFile as string) || getDefaultConfigFilePath(dirPath);

        const results = program.run(dirPath, configPath, {
            ignoreDirsGlob: selectedOptions.ignoreDirs,
            ignoreFilesGlob: selectedOptions.ignoreFiles,
        });

        runValidator(results.validatorObj);

        if (selectedOptions.print && results.asciiTree) {
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

function runValidator({
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
                if (error instanceof errors.ValidatorRuleError) {
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
                } else if (error instanceof errors.ValidatorInvalidPathError) {
                    console.error(errorTitle);
                    console.error(
                        dash,
                        error.path.red.bold,
                        'is not defined in the config file'
                    );
                }
            });
        }
    }
}
