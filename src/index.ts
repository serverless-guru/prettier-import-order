import type { RequiredOptions as PrettierRequiredOptions } from 'prettier';
import type { PrettierOptions } from './types';

import { parsers as babelParsers } from 'prettier/parser-babel';
import { parsers as flowParsers } from 'prettier/parser-flow';
import { parsers as typescriptParsers } from 'prettier/parser-typescript';

import { preprocessor } from './preprocessor';

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
        description: 'Move all the imports that start with the `type` to top',
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
            preprocess: preprocessor,
        },
        flow: {
            ...flowParsers.flow,
            preprocess: preprocessor,
        },
        typescript: {
            ...typescriptParsers.typescript,
            preprocess: preprocessor,
        },
    },
    options,
};
