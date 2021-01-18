const { createMacro, MacroError } = require('babel-plugin-macros');
const { addDefault } = require('@babel/helper-module-imports');
const nodePath = require('path');

module.exports = createMacro(classedMacro);

function createAssignment(t, left, right, operator = "=") {
    return t.expressionStatement(t.assignmentExpression(operator, left, right));
}

function findDefaultPropsObject(nodePaths, componentName) {
    for (let nodePath of nodePaths) {
        if (nodePath.type !== "ExpressionStatement"
            || nodePath.node.expression.type !== "AssignmentExpression"){
            continue;
        }
        const leftExpression = nodePath.node.expression.left;
        if (leftExpression.type !== "MemberExpression") continue;
        if (leftExpression.object.name === componentName 
            && leftExpression.property.name === "defaultProps") {
            return nodePath.node.expression.right;
        }
    }
    return null;
}

function classedMacro({ references, babel, state }) {
    const program = state.file.path;

    if (!references.default) {
        throw new MacroError('classed.macro does not support named imports');
    }

    // replace default import (will use classed now)
    const id = addDefault(program, "classed-components", { nameHint: "classed" });
    // update references with the new identifiers (addDefault always renames default import)
    references.default.forEach(referencePath => {
        referencePath.node.name = id.name;
    });

    const t = babel.types;

    const styledReferences = references.default || [];

    styledReferences.forEach((referencePath) => {
        const variable = referencePath.findParent((path) => path.isVariableDeclaration());
        if (!variable || variable.node.declarations.length !== 1) {
            return;
        }
        const decl = variable.node.declarations[0];

        if (t.isIdentifier(decl.id)) {
            // Add displayName to components for easier debugging
            const displayNameAssignment = variable.insertAfter(
                createAssignment(
                    t,
                    t.MemberExpression(decl.id, t.identifier('displayName')),
                    t.stringLiteral(decl.id.name)
                )
            );

            const siblings = displayNameAssignment[0].getAllNextSiblings()
            let defaultPropsObject = findDefaultPropsObject(siblings, decl.id.name);
            if (!defaultPropsObject) {
                // Add default props if not found
                defaultPropsObject = t.objectExpression([]);
                defaultPropsAssignment = displayNameAssignment[0].insertAfter(
                    createAssignment(
                        t,
                        t.MemberExpression(
                            decl.id,
                            t.identifier('defaultProps')
                        ),
                        defaultPropsObject,
                    )
                )[0];
            }

            // Add human react data attribute. The format is:
            // [MODULENAME]__[COMPONENT]-[#]
            const fileName = state.file.opts.filename || 'UnknownModule';
            const parsedFile = nodePath.parse(fileName);
            const moduleName = parsedFile.name.toLowerCase() !== "index"
                ? parsedFile.name
                : nodePath.basename(parsedFile.dir);
            
            defaultPropsObject.properties.push(
                t.objectProperty(
                    t.stringLiteral('data-react-component'),
                    t.stringLiteral(
                        `${moduleName}__${decl.id.name}`
                    )
                )
            );
        }
    });
}