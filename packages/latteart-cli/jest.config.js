module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ["./src/**/*.{js,ts}"],
  coverageProvider: "v8",
  coverageReporters: ["text-summary", "text"],
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
