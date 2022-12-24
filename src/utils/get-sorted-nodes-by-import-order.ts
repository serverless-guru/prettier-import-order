import type { ImportDeclaration } from '@babel/types';
import type { GetSortedNodes, ImportGroups, ImportOrLine } from '../types';

import clone from 'lodash.clone';

import {
    BUILTIN_MODULES,
    THIRD_PARTY_MODULES_SPECIAL_WORD,
    TYPE_IMPORTS_SPECIAL_WORD,
    newLineNode,
} from '../constants';
import { naturalSort } from '../natural-sort';
import { getMatchedGroup } from './get-import-nodes-matched-group';
import { sortImportsInASingleImportStmnt } from './get-sorted-import-specifiers';
import { sortImportsInSingleGroup } from './get-sorted-nodes-group';

/**
 * This function returns the given nodes, sorted in the order as indicated by
 * the importOrder array from the given options.
 * The plugin considers these import nodes as local import declarations.
 * @param nodes A subset of all import nodes that should be sorted.
 * @param options Options to influence the behavior of the sorting algorithm.
 */
export const getSortedNodesByImportOrder: GetSortedNodes = (nodes, options) => {
    naturalSort.insensitive = options.importOrderCaseInsensitive;

    let { importOrder } = options;
    const {
        importOrderSeparation,
        importOrderSortIndividualImports,
        importOrderTypeImportsToTop,
        importOrderTypeImportsToBottom,
        importOrderNamespaceImportsToGroupTop,
        importOrderBuiltinModulesToTop,
    } = options;

    const manyImportStatements = nodes.map<ImportDeclaration>(clone);
    const finalImportStmntGroups: ImportOrLine[] = [];

    /**
     * Anatomy of a import node
     *
     * import * BY from 'BY' or './By'
     * By is a ImportNamespaceSpecifier, where its local identifier is BY
     *
     * import BY from 'BY' or './By'
     * By is a ImportDefaultSpecifier, where its local identifier is BY
     *
     * import Z, { BY, XX }  from 'BY'
     * This node has three specifiers, BY and XX are ImportSpecifier(s) and Z is a ImportDefaultSpecifier
     *
     * import { P as T }  from 'BY'
     * P is a ImportSpecifier(s), where its local identifier is T
     *
     * node: { kind:'type or value', specifiers: [list of imported values/types] }
     *
     */

    /**
     * If the user has not specified third party module indentifier
     * We add it to the top of the order
     */
    if (!importOrder.includes(THIRD_PARTY_MODULES_SPECIAL_WORD)) {
        importOrder = [THIRD_PARTY_MODULES_SPECIAL_WORD, ...importOrder];
    }

    /**
     * If the user has enabled built-in modules to top
     * We add it to the top, even higher than third party modules
     */
    if (importOrderBuiltinModulesToTop) {
        importOrder = [BUILTIN_MODULES, ...importOrder];
    }

    let handleTypes = false;

    /**
     * If the user has enabled import types to top
     * We add it to the top, even higher than built in modules
     */
    if (importOrderTypeImportsToTop) {
        handleTypes = true;
        importOrder = [TYPE_IMPORTS_SPECIAL_WORD, ...importOrder];
    }

    /**
     * If the user has enabled import types to bottom
     * We add it to the bottom, even higher than built in modules
     */
    if (importOrderTypeImportsToBottom) {
        handleTypes = true;
        importOrder = [...importOrder, TYPE_IMPORTS_SPECIAL_WORD];
    }

    /**
     * Here we are creating a map of { [regex]: [...import statements] }
     */
    const importStatementsByRegexGroup = importOrder.reduce<ImportGroups>(
        (groups, regexp) => {
            // Don't create a key for new
            return isNewLineSeparator(regexp)
                ? groups
                : {
                      ...groups,
                      [regexp]: [],
                  };
        },

        {},
    );

    /**
     * Give all import order except new lines or third party special word
     * This means these are all user provided regex and types
     */
    const importOrderWithoutEmptyLinesOrThirdPartyRegex = importOrder.filter(
        (group) => !isNewLineSeparator(group) && group !== THIRD_PARTY_MODULES_SPECIAL_WORD,
    );

    // Assign import nodes into import order groups
    for (const importStatement of manyImportStatements) {
        const matchedGroup = getMatchedGroup(
            importStatement,
            importOrderWithoutEmptyLinesOrThirdPartyRegex,
            handleTypes,
        );
        /**
         * Append this import statment to our key, values map
         */
        importStatementsByRegexGroup[matchedGroup].push(importStatement);
    }

    for (const group of importOrder) {
        // If it's a custom separator, all we need to do is add a newline
        if (isNewLineSeparator(group)) {
            const previousStatement = finalImportStmntGroups[finalImportStmntGroups.length - 1];
            // Avoid empty new line if first group is empty
            if (!previousStatement) {
                continue;
            }

            // Checking the the original file already had a new line
            // if yes, then we don't want to add a new one
            if (isNodeANewline(previousStatement)) {
                continue;
            }

            finalImportStmntGroups.push(newLineNode);
            continue;
        }

        const importStatements = importStatementsByRegexGroup[group];

        if (importStatements.length === 0) {
            continue;
        }

        const sortedInsideGroup = sortImportsInSingleGroup(importStatements, {
            importOrderNamespaceImportsToGroupTop,
        });

        if (importOrderSortIndividualImports) {
            sortedInsideGroup.forEach((node) => sortImportsInASingleImportStmnt(node));
        }

        finalImportStmntGroups.push(...sortedInsideGroup);

        // addinga new line after an import statemens group
        if (importOrderSeparation) {
            finalImportStmntGroups.push(newLineNode);
        }
    }

    return finalImportStmntGroups;
};

/**
 * User can add an empty string to create a new line between two groups of
 * import statements
 * isCustomGroupSeparator checks if the provided pattern is intended to be used
 * as an import separator, rather than an actual group of imports.
 */
function isNewLineSeparator(pattern: string) {
    return pattern.trim() === '';
}

function isNodeANewline(node: ImportOrLine) {
    return node.type === 'ExpressionStatement';
}
