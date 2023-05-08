#!/usr/bin/env node

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { validate, initConfigFilename } from '../index';
import { program as commanderProgram } from 'commander';

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
    fs.copyFileSync(path.join(__dirname, '../resources/defaultConfig.json'), parentPath);
}

(() => {
    commanderProgram.version(
        JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'))
            .version
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
            path.join(__dirname, '../resources/defaultConfig.json'),
            path.join(process.cwd(), initConfigFilename)
        );
        console.log('\n\t', initConfigFilename.red, 'created', '\n');
    } else if (!commanderProgram.args.length) {
        commanderProgram.help();
    } else {
        const dirPath = path.resolve(commanderProgram.args[0]);
        const configPath =
            (selectedOptions.configFile as string) || getDefaultConfigFilePath(dirPath);

        validate(dirPath, configPath, selectedOptions);
    }
})();