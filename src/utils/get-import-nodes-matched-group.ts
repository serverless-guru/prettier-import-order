import { ImportDeclaration } from '@babel/types';

import { THIRD_PARTY_MODULES_SPECIAL_WORD, TYPE_IMPORTS_SPECIAL_WORD } from '../constants';

/**
 *
 * @returns a function for a single group which when passed a node can tell if it matched that group
 */
function evaluate(group: string) {
    return function match(importNode: ImportDeclaration): { matched: boolean; group: string } {
        /**
         * Matching type is important otherwise regex might match a type import first and
         * put it in its group
         */
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
export const getMatchedGroup = (
    node: ImportDeclaration,
    importOrderWithoutEmptyLinesOrThirdPartyRegex: string[],
    handleTypes: boolean,
) => {
    let reorderesList = importOrderWithoutEmptyLinesOrThirdPartyRegex;
    if (handleTypes) {
        // if we need to handle types into a separate group then we must try to match
        // them **first** since if we don't then they might match another user provioded regex group
        // that comes before it in the order, so here we are changing the order to move types to first
        // changing the order here doesn't make a difference since we return an object and not an array
        const indexOfTypeGroup = importOrderWithoutEmptyLinesOrThirdPartyRegex.findIndex(
            (group) => group === TYPE_IMPORTS_SPECIAL_WORD,
        );

        if (indexOfTypeGroup === 0) {
            // do nothing, it's already at the top
        } else if (indexOfTypeGroup === importOrderWithoutEmptyLinesOrThirdPartyRegex.length - 1) {
            reorderesList = [TYPE_IMPORTS_SPECIAL_WORD].concat(
                importOrderWithoutEmptyLinesOrThirdPartyRegex.slice(
                    0,
                    importOrderWithoutEmptyLinesOrThirdPartyRegex.length - 1,
                ),
            );
        } else {
            reorderesList = [TYPE_IMPORTS_SPECIAL_WORD]
                .concat(importOrderWithoutEmptyLinesOrThirdPartyRegex.slice(0, indexOfTypeGroup))
                .concat(
                    importOrderWithoutEmptyLinesOrThirdPartyRegex.slice(
                        indexOfTypeGroup + 1,
                        importOrderWithoutEmptyLinesOrThirdPartyRegex.length,
                    ),
                );
        }
    }

    /**
     * Creating an array of evaluate function for each group
     * These functions can then be passed the above node to tell if it matched a group
     */
    let allGroupsRegexesFuncs = reorderesList.map((group) => evaluate(group));

    /**
     * Trying to match this node, against all the matched regex expressions
     */
    for (const evaluateFunc of allGroupsRegexesFuncs) {
        const { matched, group } = evaluateFunc(node);
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
