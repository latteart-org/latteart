module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/gui/$1",
    "chart.js": "<rootDir>/tests/mock/chart.ts",
    "chartjs-plugin-colorschemes/src/plugins/plugin.colorschemes":
      "<rootDir>/tests/mock/chart.ts",
    "chartjs-plugin-colorschemes/src/colorschemes/colorschemes.office":
      "<rootDir>/tests/mock/chart.ts",
    "\\.(css|scss)$": "<rootDir>/node_modules/splitpanes",
  },
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/src/**/*.{js,ts}"],
  coverageDirectory: "coverage",
  coverageReporters: ["html", "text-summary", "text"],
};
