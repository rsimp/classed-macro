const { createMacro, MacroError } = require("babel-plugin-macros");
const { addDefault } = require("@babel/helper-module-imports");
const nodePath = require("path");

module.exports = createMacro(classedMacro, { configName: "classed" });

function createAssignment(t, left, right, operator = "=") {
  return t.expressionStatement(t.assignmentExpression(operator, left, right));
}

function findDefaultPropsAssignment(nodePaths, componentName) {
  for (let nodePath of nodePaths) {
    if (
      nodePath.type !== "ExpressionStatement" ||
      nodePath.node.expression.type !== "AssignmentExpression"
    ) {
      continue;
    }
    const leftExpression = nodePath.node.expression.left;
    if (leftExpression.type !== "MemberExpression") continue;
    if (
      leftExpression.object.name === componentName &&
      leftExpression.property.name === "defaultProps"
    ) {
      return nodePath;
    }
  }
  return null;
}

function classedMacro({ references, babel, state, config }) {
  if (!references.default) {
    throw new MacroError("classed.macro does not support named imports");
  }

  const program = state.file.path;
  const t = babel.types;

  // replace macro import with classed-components
  const id = addDefault(program, "classed-components", { nameHint: "classed" });

  references.default.forEach((referencePath) => {
    // update reference with the new default import name (_classed)
    referencePath.node.name = id.name;

    const variable = referencePath.findParent((path) =>
      path.isVariableDeclaration()
    );
    if (!variable || variable.node.declarations.length !== 1) {
      return;
    }
    const decl = variable.node.declarations[0];

    let currentLine = variable;
    if (currentLine.parentPath.type === "ExportNamedDeclaration") {
      currentLine = currentLine.parentPath;
    }

    if (t.isIdentifier(decl.id)) {
      if (
        !config ||
        config.displayName === undefined ||
        config.displayName === true
      ) {
        // Add displayName to components for easier debugging
        currentLine = currentLine.insertAfter(
          createAssignment(
            t,
            t.MemberExpression(decl.id, t.identifier("displayName")),
            t.stringLiteral(decl.id.name)
          )
        )[0];
      }

      if (
        (!config ||
          config.dataAttribute === undefined ||
          config.dataAttribute === true) &&
        currentLine.parentPath.type === "Program"
      ) {
        const siblings = currentLine.getAllNextSiblings();
        let defaultPropsAssignment = findDefaultPropsAssignment(
          siblings,
          decl.id.name
        );
        if (!defaultPropsAssignment) {
          // Add empty default props object if assignmet not found
          currentLine.insertAfter(
            createAssignment(
              t,
              t.MemberExpression(decl.id, t.identifier("defaultProps")),
              t.objectExpression([])
            )
          );
        }

        // Add html react data attribute. The format is:
        // [module-name]__[ComponentName]
        const fileName = state.file.opts.filename || "UnknownModule";
        const parsedFile = nodePath.parse(fileName);
        const moduleName =
          parsedFile.name.toLowerCase() !== "index"
            ? parsedFile.name
            : nodePath.basename(parsedFile.dir);

        program.node.body.push(
          createAssignment(
            t,
            t.MemberExpression(
              t.MemberExpression(decl.id, t.identifier("defaultProps")),
              t.stringLiteral("data-react-component"),
              true
            ),
            t.stringLiteral(`${moduleName}__${decl.id.name}`)
          )
        );
      }
    }
  });
}
