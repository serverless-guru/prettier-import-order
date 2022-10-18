import type { PrettierOptions } from '../types';

import { ImportDeclaration } from '@babel/types';

import { naturalSort } from '../natural-sort';

export const sortImportsInSingleGroup = (
    importStmnts: ImportDeclaration[],
    options: Pick<PrettierOptions, 'importOrderNamespaceImportsToGroupTop'>,
) => {
    return importStmnts.sort((a, b) => {
        /**
         * If any one of the a or b is a `* as namespace` imports
         * then move it to to the top
         */
        if (options.importOrderNamespaceImportsToGroupTop) {
            const diff = namespaceSpecifierSort(a, b);
            if (diff !== 0) return diff;
        }
        // The thing with natural is that it considers . before alphabets or other chars
        // and relative imports that start with . should come last

        // a is relative, b is not, a should come after
        if (a.source.value.startsWith('.') && !b.source.value.startsWith('.')) {
            return 1;
        }

        // b is relative, a is not, b should come after
        if (!a.source.value.startsWith('.') && b.source.value.startsWith('.')) {
            return -1;
        }

        /**
         * otherwise use natural sorting for the import paths
         */
        return naturalSort(a.source.value, b.source.value);
    });
};

function namespaceSpecifierSort(a: ImportDeclaration, b: ImportDeclaration) {
    /**
     * specifiers are the named objects imported from a module
     * like import a, { b, c } from 'd';
     * a, c and b are specifiers
     * a is a ImportDefaultSpecifier
     */
    const aFirstSpecifier = a.specifiers.find((s) => s.type === 'ImportNamespaceSpecifier') ? 1 : 0;
    const bFirstSpecifier = b.specifiers.find((s) => s.type === 'ImportNamespaceSpecifier') ? 1 : 0;

    return bFirstSpecifier - aFirstSpecifier;
}
