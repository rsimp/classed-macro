const pluginTester = require('babel-plugin-tester').default;
const plugin = require('babel-plugin-macros');

pluginTester({
  plugin,
  pluginName: "classed.macro",
  snapshot: true,
  babelOptions: {filename: __filename},
  tests: [
    `
    import classed from '../macro.js'

    const InterleavedProps = classed.div\`foo bar\`;

    const NoDefaultProps = classed.div("foo bar");

    const ObjectProps = classed.div(["foo", "bar"]);
    ObjectProps.defaultProps = new Object();

    const UtilityProps = classed.div(({ hasError }) => ({ 'text-danger': hasError }));
    UtilityProps.defaultProps = someFunc();

    InterleavedProps.defaultProps = {
      someProp: true
    };
    `,
  ],
});