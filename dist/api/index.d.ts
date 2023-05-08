import * as validator from '../validator';
import * as program from '../program';
import * as _errors from '../errors';
export declare const validate: typeof validator.run;
export declare const getProgramData: typeof program.run;
export declare const errors: typeof _errors;
export declare const initialize: (destinationDir: string, configFileName?: string | undefined) => void;
