import { ParserOptions, parse as babelParser } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import { ImportDeclaration, isTSModuleDeclaration } from '@babel/types';

import { PrettierOptions } from '../types';
import { getCodeFromAst } from '../utils/get-code-from-ast';
import { getExperimentalParserPlugins } from '../utils/get-experimental-parser-plugins';
import { getSortedNodes } from '../utils/get-sorted-nodes';

/**
 * This function takes in the raw code text, creates a ast
 * and calls various functions to re-order the import statements
 * in that ast
 * @param code The code (to be formatted) as text
 * @param options This plugin's options
 * @returns
 */
export function preprocessor(code: string, options: PrettierOptions): string {
    const {
        importOrderParserPlugins,
        importOrder,
        importOrderBuiltinModulesToTop,
        importOrderTypeImportsToTop,
        importOrderCaseInsensitive,
        importOrderNamespaceImportsToGroupTop,
        importOrderMergeDuplicateImports,
        importOrderSeparation,
        importOrderSortIndividualImports,
    } = options;

    const allOriginalImportNodes: ImportDeclaration[] = [];

    const parserOptions: ParserOptions = {
        sourceType: 'module',
        plugins: getExperimentalParserPlugins(importOrderParserPlugins),
    };

    const ast = babelParser(code, parserOptions);

    /**
     * A directive is basically a language construct like
     * if else, variable declarations, imports, etc
     */
    const directives = ast.program.directives;

    const interpreter = ast.program.interpreter;

    traverse(ast, {
        ImportDeclaration(path: NodePath<ImportDeclaration>) {
            const tsModuleParent = path.findParent((p) => isTSModuleDeclaration(p));
            if (!tsModuleParent) {
                allOriginalImportNodes.push(path.node);
            }
        },
    });

    // short-circuit if there are no import declarations
    if (allOriginalImportNodes.length === 0) {
        return code;
    }

    const nodesToOutput = getSortedNodes(allOriginalImportNodes, {
        importOrder,
        importOrderBuiltinModulesToTop,
        importOrderTypeImportsToTop,
        importOrderCaseInsensitive,
        importOrderNamespaceImportsToGroupTop,
        importOrderMergeDuplicateImports,
        importOrderSeparation,
        importOrderSortIndividualImports,
    });

    return getCodeFromAst({
        nodesToOutput,
        allOriginalImportNodes,
        originalCode: code,
        directives,
        interpreter,
    });
}
