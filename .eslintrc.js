
const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
    root: true,
    parser: 'babel-eslint',
    extends: [
        'standard',
        'plugin:import/errors',
        'plugin:import/warnings'
    ],
    plugins: ["jest"],
    rules: {
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'no-var': ['error'],
        'semi': [2, 'never'],
        'no-multiple-empty-lines': 0,
        'no-unused-expressions': 0,
        'padded-blocks': 0,
        'prefer-promise-reject-errors': 0,
        'max-len': [2, 120, 4, {
            ignoreComments: true,
            ignoreStrings: true,
            ignoreRegExpLiterals: true,
            ignoreTemplateLiterals: true
        }],
        'quotes': ['warn', 'single'],
        'quote-props': [1, 'consistent-as-needed'],
        'no-cond-assign': [2, 'except-parens'],
        'no-unused-vars': [1, { vars: 'local', args: 'none' }],
        'radix': 1,
        'eqeqeq': ["error", "always"],
        'space-infix-ops': 1,
        'space-before-function-paren': 1,
        'default-case': 1,
        'no-param-reassign': 0,
        'no-console': 2, // use the logger
        'no-debugger': isProduction ? 2 : 0,
        'curly': 2,
        'import/no-unresolved': [2, { ignore: ['^@/'] }],
    },
    env: {
        browser: true,
        node: true,
        "jest/globals": true
    }
}
