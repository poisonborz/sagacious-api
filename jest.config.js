'use strict'

module.exports = {
    testEnvironment: 'node',
    testMatch: [
        '**/tests/unit/**/*.test.js'
    ],
    globalSetup: './tests/config/globalSetup.js',
    globalTeardown: './tests/config/globalTeardown.js',
    setupFilesAfterEnv: ['./tests/config/jest.setup.js'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    }
}

