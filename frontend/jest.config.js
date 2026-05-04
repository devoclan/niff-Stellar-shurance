const nextJest = require("next/jest.js");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^next-intl(.*)$": "<rootDir>/src/__mocks__/next-intl.ts",
    "^use-intl(.*)$": "<rootDir>/src/__mocks__/next-intl.ts",
  },
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.test.json",
    },
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@creit\\.tech|@stellar)/)",
  ],
};

module.exports = createJestConfig(config);
