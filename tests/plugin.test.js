const pluginTester = require("babel-plugin-tester").default;
const plugin = require("babel-plugin-macros");

pluginTester({
  plugin,
  pluginName: "classed.macro",
  snapshot: true,
  filename: __filename,
  babelOptions: { filename: __filename },
  tests: [
    {
      title: "No plugin configuration",
      fixture: "__fixtures__/test-code.js",
    },
    {
      title: "Disable displayName configuration",
      fixture: "__fixtures__/test-code.js",
      pluginOptions: {
        classed: {
          displayName: false,
        },
      },
    },
    {
      title: "Disable dataAttribute configuraion",
      fixture: "__fixtures__/test-code.js",
      pluginOptions: {
        classed: {
          dataAttribute: false,
        },
      },
    },
    {
      // Will cause the macro to do nothing, included for completeness
      title: "Disable displayName and dataAttribute configuration",
      fixture: "__fixtures__/test-code.js",
      pluginOptions: {
        classed: {
          dataAttribute: false,
          displayName: false,
        },
      },
    },
  ],
});
