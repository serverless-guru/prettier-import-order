import { ParserOptions, parse as babelParser } from '@babel/parser';
import traverse, { type NodePath } from '@babel/traverse';
import { ImportDeclaration, isTSModuleDeclaration } from '@babel/types';

export const getImportNodes = (code: string, options?: ParserOptions): ImportDeclaration[] => {
    const importNodes: ImportDeclaration[] = [];
    const ast = babelParser(code, {
        ...options,
        plugins: ['typescript'],
        sourceType: 'module',
    });

    traverse(ast as Parameters<typeof traverse>[0], {
        ImportDeclaration(path: NodePath<ImportDeclaration>) {
            const tsModuleParent = path.findParent((p) => isTSModuleDeclaration(p));
            if (!tsModuleParent) {
                importNodes.push(path.node);
            }
        },
    });

    return importNodes;
};
