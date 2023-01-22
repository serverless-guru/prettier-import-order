import type { RequiredOptions as PrettierRequiredOptions } from 'prettier';
import type { PrettierOptions } from './types';

import { parsers as babelParsers } from 'prettier/parser-babel';
import { parsers as flowParsers } from 'prettier/parser-flow';
import { parsers as htmlParsers } from 'prettier/parser-html';
import { parsers as typescriptParsers } from 'prettier/parser-typescript';

import { defaultPreprocessor } from './preprocessors/default-processor';
import { vuePreprocessor } from './preprocessors/vue-preprocessor';

interface PrettierOptionSchema {
    type: string;
    category: 'Global';
    array?: boolean;
    default: unknown;
    description: string;
}

/**
 * Plugin Options
 */
const options: Record<Exclude<keyof PrettierOptions, keyof PrettierRequiredOptions>, PrettierOptionSchema> = {
    importOrder: {
        type: 'path',
        category: 'Global',
        array: true,
        default: [{ value: [] }],
        description: 'Provide an order to sort imports.',
    },
    importOrderCaseInsensitive: {
        type: 'boolean',
        category: 'Global',
        default: false,
        description: 'Provide a case sensitivity boolean flag',
    },
    importOrderTypeImportsToTop: {
        type: 'boolean',
        category: 'Global',
        default: false,
        description: 'Move all the imports that start with the `type` keyword to top',
    },
    importOrderTypeImportsToBottom: {
        type: 'boolean',
        category: 'Global',
        default: false,
        description: 'Move all the imports that start with the `type` to bottom',
    },
    importOrderParserPlugins: {
        type: 'path',
        category: 'Global',
        array: true,
        // By default, we add ts and jsx as parsers but if users define something
        // we take that option
        default: [{ value: ['typescript', 'jsx'] }],
        description: 'Provide a list of plugins for special syntax',
    },
    importOrderSeparation: {
        type: 'boolean',
        category: 'Global',
        default: false,
        description: 'Should imports be separated by new line?',
    },
    importOrderNamespaceImportsToGroupTop: {
        type: 'boolean',
        category: 'Global',
        default: false,
        description: 'Should namespace specifiers be grouped at the top of their group?',
    },
    importOrderSortIndividualImports: {
        type: 'boolean',
        category: 'Global',
        default: false,
        description: 'Should objects imported from a module be sorted?',
    },
    importOrderBuiltinModulesToTop: {
        type: 'boolean',
        category: 'Global',
        default: false,
        description: 'Should node-builtins be hoisted to the top?',
    },
    importOrderMergeDuplicateImports: {
        type: 'boolean',
        category: 'Global',
        default: false,
        description: 'Should duplicate imports be merged?',
    },
};

/**
 * A preprocessor basically modifies the code
 * This is where we can write code to re-order import statements
 */
module.exports = {
    parsers: {
        babel: {
            ...babelParsers.babel,
            preprocess: defaultPreprocessor,
        },
        flow: {
            ...flowParsers.flow,
            preprocess: defaultPreprocessor,
        },
        typescript: {
            ...typescriptParsers.typescript,
            preprocess: defaultPreprocessor,
        },
        vue: {
            ...htmlParsers.vue,
            preprocess: vuePreprocessor,
        },
    },
    options,
};
