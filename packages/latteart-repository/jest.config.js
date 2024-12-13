module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/src/**/*.{js,ts}"],
  coverageProvider: "v8",
  coverageReporters: ["text-summary", "text"],
  coveragePathIgnorePatterns: [
    "<rootDir>/.*/?src/migrations",
    "<rootDir>/.*/?src/routes",
    "<rootDir>/.*/?src/interfaces",
  ],
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
