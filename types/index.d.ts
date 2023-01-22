import { ParserPlugin } from '@babel/parser';
import { Config } from 'prettier';

export type ImportOrderParserPlugin = Extract<ParserPlugin, string> | `[${string},${string}]`;

export interface PluginConfig {
    /**
     * A collection of Regular expressions in string format.
     *
     * ```
     * "importOrder": ["^@core/(.*)$", "^@server/(.*)$", "^@ui/(.*)$", "^[./]"],
     * ```
     *
     * _Default behavior:_ The plugin moves the third party imports to the top which are not part of the `importOrder` list.
     * To move the third party imports at desired place, you can use `<THIRD_PARTY_MODULES>` to assign third party imports to the appropriate position:
     *
     * ```
     * "importOrder": ["^@core/(.*)$", "<THIRD_PARTY_MODULES>", "^@server/(.*)$", "^@ui/(.*)$", "^[./]"],
     * ```
     */
    importOrder: string[];

    /**
     * A boolean value to enable case-insensitivity in the sorting algorithm
     * used to order imports within each match group.
     *
     * For example, when false (or not specified):
     *
     * ```js
     * import ExampleView from './ExampleView';
     * import ExamplesList from './ExamplesList';
     * ```
     *
     * compared with `"importOrderCaseInsensitive": true`:
     *
     * ```js
     * import ExamplesList from './ExamplesList';
     * import ExampleView from './ExampleView';
     * ```
     *
     * @default false
     */
    importOrderCaseInsensitive?: boolean;

    /**
     * Move all the imports that start with the `type` keyword to the top.
     *
     * @default false
     */
    importOrderTypeImportsToTop?: boolean;

    /**
     * Move all the imports that start with the `type` keyword to the bottom.
     */
    importOrderTypeImportsToBottom?: boolean;

    /**
     * Move all the node-builtins imports to the top of all import groups.
     * @default false
     */
    importOrderBuiltinModulesToTop?: boolean;

    /**
     * When `true`, multiple import statements from the same module will be combined into a single import.
     * @default false
     */
    importOrderMergeDuplicateImports?: boolean;

    /**
     * A boolean value to enable or disable the new line separation
     * between sorted import declarations group. The separation takes place according to the `importOrder`.
     *
     * @default false
     */
    importOrderSeparation?: boolean;

    /**
     * A boolean value to enable or disable sorting of the values in an import declarations.
     *
     * @default false
     */
    importOrderSortIndividualImports?: boolean;

    /**
     * A boolean value to enable or disable sorting the namespace imports (import * as namespace)
     * to the top of the import group.
     *
     * @default false
     */
    importOrderNamespaceImportsToGroupTop?: boolean;

    /**
     * Previously known as `experimentalBabelParserPluginsList`.
     *
     * A collection of plugins for babel parser. The plugin passes this list to babel parser, so it can understand the syntaxes
     * used in the file being formatted. The plugin uses prettier itself to figure out the parser it needs to use but if that fails,
     * you can use this field to enforce the usage of the plugins' babel parser needs.
     *
     * **To pass the plugins to babel parser**:
     *
     * ```
     * "importOrderParserPlugins" : ["classProperties", "decorators-legacy"]
     * ```
     *
     * **To pass the options to the babel parser plugins**: Since prettier options are limited to string, you can pass plugins
     * with options as a JSON string of the plugin array:
     * `"[\"plugin-name\", { \"pluginOption\": true }]"`.
     *
     * ```
     * "importOrderParserPlugins" : ["classProperties", "[\"decorators\", { \"decoratorsBeforeExport\": true }]"]
     * ```
     *
     * **To disable default plugins for babel parser, pass an empty array**:
     *
     * @default ["typescript", "jsx"]
     */
    importOrderParserPlugins?: ImportOrderParserPlugin[];
}

export type PrettierConfig = PluginConfig & Config;
