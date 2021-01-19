const pluginTester = require('babel-plugin-tester').default;
const plugin = require('babel-plugin-macros');

pluginTester({
  plugin,
  pluginName: "classed.macro",
  snapshot: true,
  babelOptions: {filename: __filename},
  tests: [
    `
    import tag from '../macro.js'

    const topFoo = tag.div\`foo foo\`;

    const topBar = tag.div\`bar bar\`;

    topFoo.defaultProps = {
      someProp: true
    };

    function makeFoo() {
      const foo = tag.div\`foo foo\`;
      return foo;
    }

    function makeBar() {
      const bar = tag.div\`bar bar\`;
      const otherStatement = 42;
      const defaultProps = {
        someProp: true
      };
      bar.defaultProps = defaultProps;
      return bar;
    }
    `,
  ],
});