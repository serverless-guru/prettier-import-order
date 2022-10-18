import { ImportDeclaration } from '@babel/types';

import { THIRD_PARTY_MODULES_SPECIAL_WORD, TYPE_IMPORTS_SPECIAL_WORD } from '../constants';

function evaluate(group: string) {
    return function match(importNode: ImportDeclaration): { matched: boolean; group: string } {
        if (group === TYPE_IMPORTS_SPECIAL_WORD) {
            return { matched: importNode.importKind === 'type', group };
        } else if (importNode.source.value) {
            return { matched: new RegExp(group).test(importNode.source.value), group };
        }
        return { matched: false, group };
    };
}

/**
 * Get the regexp group to keep the import nodes.
 * @param node
 * @param importOrderWithoutEmptyLinesOrThirdPartyRegex
 */
export const getMatchedGroup = (node: ImportDeclaration, importOrderWithoutEmptyLinesOrThirdPartyRegex: string[]) => {
    /**
     * Creating an array of all the regex values
     */
    const allGroupsRegexes = importOrderWithoutEmptyLinesOrThirdPartyRegex.map((group) => evaluate(group));

    /**
     * Trying to match this node, against all the matched regex expressions
     */
    for (const evaluate of allGroupsRegexes) {
        const { matched, group } = evaluate(node);
        /**
         * If matched, return it
         */
        if (matched) return group;
    }

    /**
     * If not matched, assume that this is a third party module
     */
    return THIRD_PARTY_MODULES_SPECIAL_WORD;
};
