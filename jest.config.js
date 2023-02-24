module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/src/**/*.{js,ts}"],
  coverageProvider: "v8",
  coverageReporters: ["text-summary", "text"],
  projects: [
    "<rootDir>/packages/latteart-client",
    "<rootDir>/packages/latteart-gui",
    "<rootDir>/packages/latteart-repository",
    "<rootDir>/packages/latteart-capture-cl",
  ],
};
