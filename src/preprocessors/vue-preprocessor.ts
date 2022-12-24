import type { PrettierOptions } from '../types';

import { preprocessor } from './preprocessor';

export function vuePreprocessor(code: string, options: PrettierOptions) {
    try {
        const { parse } = require('@vue/compiler-sfc');
        const { descriptor } = parse(code);
        const content = (descriptor.script ?? descriptor.scriptSetup)?.content ?? code;

        return code.replace(content, `\n${preprocessor(content, options)}\n`);
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND') {
            console.warn(
                '[@serverless-guru/prettier-plugin-import-order]: Could not process .vue file.  Please be sure that "@vue/compiler-sfc" is installed in your project.',
            );
            throw err;
        }
    }
}
