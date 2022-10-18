import type { ImportDeclaration } from '@babel/types';

import { naturalSort } from '../natural-sort';

/**
 * This function returns import nodes with alphabetically sorted module
 * specifiers
 * @param node Import declaration node
 */
export const sortImportsInASingleImportStmnt = (node: ImportDeclaration) => {
    // specifiers are the named objects imported from a module
    // like import a, { b, c } from 'd';
    // a, c and b are specifiers
    // a is a ImportDefaultSpecifier
    node.specifiers.sort((a, b) => {
        // Type could be ImportSpecifier or ImportDefaultSpecifier
        if (a.type !== b.type) {
            // defaults will come first
            return a.type === 'ImportDefaultSpecifier' ? -1 : 1;
        }

        return naturalSort(a.local.name, b.local.name);
    });
    return node;
};
