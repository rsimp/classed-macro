[![Babel Macro](https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg?style=flat-square)](https://github.com/kentcdodds/babel-plugin-macros)


# classed.macro
A `babel-plugin-macros` for `classed-components`

This macro adds a display name to your `classed-components` and a `data-react-component` attribute to the rendered HTML to enable a better debugging experience

## Installation
1. First make sure `classed-components` is installed:
```
npm i classed-components
```
2. Then install `classed.macro` as a dev dependency:
```
npm i -D classed.macro
```
3. If you're using `create react app` then you're done. Otherwise install `babel-plugin-macros` and add it to your babel config

## Usage
Simply replace `classed-components` with `classed.macro` in each of your import statements
``` diff
- import classed from "classed-components";
+ import classed from "classed.macro";
```

## Display Name

The macro uses the variable name as your component's display name. This creates a better experience with react dev tools and with jest snapshots. 

For example the following component:
``` js
const IconContainer = classed.div`flex flex-row ml-auto`;
```
Will now have a display name of `IconContainer` and will show as `<IconContainer>` in react dev tools and in your jest snapshots

## HTML Data Attribute
The macro will also add a `data-react-component` attribute to your dom node. If the previous `IconContainer` component is defined inside a module called `screen.(jsx|tsx)` or `screen/index.(jsx|tsx)` it will render the following HTML:
``` html
<div data-react-component="screen__IconContainer" class="flex flex-row ml-auto">
...
</div>
```