import { getImportFlavorOfNode } from '../get-import-flavor-of-node';
import { getImportNodes } from '../get-import-nodes';

it('should correctly classify a bunch of import expressions', () => {
    const importExpressionClassifiers = getImportNodes(
        `
import "./side-effects";
import { a } from "a";
import type { b } from "b";
import { type C } from "c";
import D from "d";

import e = require("e"); // Doesn't count as import
const f = require("f"); // Doesn't count as import

// prettier-ignore
import { g } from "g";
`,
        { plugins: ['typescript'] },
    ).map((node) => {
        return getImportFlavorOfNode(node);
    });

    expect(JSON.stringify(importExpressionClassifiers)).toMatch(
        JSON.stringify(['side-effect', 'value', 'type', 'value', 'value', 'prettier-ignore']),
    );
});
