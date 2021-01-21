import classed from '../../macro.js'

const InterleavedProps = classed.div`foo bar`;

export const NoDefaultProps = classed.div("foo bar");

export default classed.div`not supported`;

const ObjectProps = classed.div(["foo", "bar"]);
ObjectProps.defaultProps = new Object();

const UtilityProps = classed.div(({ hasError }) => ({ 'text-danger': hasError }));
UtilityProps.defaultProps = someFunc();

InterleavedProps.defaultProps = {
  someProp: true
};