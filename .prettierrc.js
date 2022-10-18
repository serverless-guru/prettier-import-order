module.exports = {
    printWidth: 120,
    tabWidth: 4,
    trailingComma: 'all',
    singleQuote: true,
    jsxBracketSameLine: true,
    semi: true,
    plugins: [require('./lib/src/index.js')],
    importOrderTypeImportsToTop: true,
    importOrder: ['<THIRD_PARTY_MODULES_SPECIAL_WORD>', '^[./]'],
    importOrderSeparation: true,
    importOrderSortIndividualImports: true,
};
