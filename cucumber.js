const common = {
  requireModule: ['ts-node/register'],
  require: [
    'test/step-definitions/**/*.ts',
    'test/helper/world.ts',
    'test/helper/hooks.ts',
  ],
  paths: ['test/features/**/*.feature'],
  format: [
    'progress-bar',
    'json:reports/json/cucumber-report.json',
  ],
  parallel: 1,
  formatOptions: {
    snippetInterface: 'async-await',
  },
};

module.exports = {
  default: common,
};
