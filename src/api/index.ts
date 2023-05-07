import * as validator from '../validator';
import * as program from '../program';
import * as _errors from '../errors';

export const validate = validator.run;
export const getProgramData = program.run;
export const errors = _errors;
