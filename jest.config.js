module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleDirectories: ["node_modules", "src"],
    roots: ["<rootDir>/src", "<rootDir>/tests"],
    collectCoverageFrom: [
      "src/**/*.{ts,tsx}",
      "!src/**/*.d.ts",
      "!src/types/**"
    ],
    coverageThreshold: {
      global: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  };