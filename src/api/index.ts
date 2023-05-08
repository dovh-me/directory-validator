import * as path from 'path';
import * as fs from 'fs';

import * as validator from '../validator';
import * as program from '../program';
import * as _errors from '../errors';
import { initConfigFilename } from '../index';

export const validate = validator.run;
export const getProgramData = program.run;
export const errors = _errors;

export const initialize = (destinationDir: string, configFileName?: string) => {
    fs.copyFileSync(
        path.join(__dirname, '../resources/defaultConfig.json'),
        path.join(destinationDir, configFileName || initConfigFilename)
    );
}
