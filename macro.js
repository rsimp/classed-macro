const { createMacro, MacroError } = require('babel-plugin-macros');
const { addDefault } = require('@babel/helper-module-imports');
const nodePath = require('path');

module.exports = createMacro(classedMacro);

function createAssignment(t, left, right, operator = "=") {
    return t.expressionStatement(t.assignmentExpression(operator, left, right));
}

function findDefaultPropsAssignment(nodePaths, componentName) {
    for (let nodePath of nodePaths) {
        if (nodePath.type !== "ExpressionStatement"
            || nodePath.node.expression.type !== "AssignmentExpression"){
            continue;
        }
        const leftExpression = nodePath.node.expression.left;
        if (leftExpression.type !== "MemberExpression") continue;
        if (leftExpression.object.name === componentName 
            && leftExpression.property.name === "defaultProps") {
            return nodePath;
        }
    }
    return null;
}

function classedMacro({ references, babel, state, config }) {
    const program = state.file.path;

    if (!references.default) {
        throw new MacroError('classed.macro does not support named imports');
    }

    const t = babel.types;

    // replace default import with classed-components
    const id = addDefault(program, "classed-components", { nameHint: "classed" });

    references.default.forEach((referencePath) => {
        // update reference with the new identifier (addDefault renames default _classed)
        referencePath.node.name = id.name;

        const variable = referencePath.findParent((path) => path.isVariableDeclaration());
        if (!variable || variable.node.declarations.length !== 1) {
            return;
        }
        const decl = variable.node.declarations[0];

        if (variable.parentPath.type !== "Program") {
            throw new MacroError('classed.macro only supports top level module declarations');
        }

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
            let defaultPropsAssignment = findDefaultPropsAssignment(siblings, decl.id.name);
            if (!defaultPropsAssignment) {
                // Add default props if not found
                defaultPropsAssignment = displayNameAssignment[0].insertAfter(
                    createAssignment(
                        t,
                        t.MemberExpression(
                            decl.id,
                            t.identifier('defaultProps')
                        ),
                        t.objectExpression([]),
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
            
            program.node.body.push(
                createAssignment(
                    t,
                    t.MemberExpression(
                        t.MemberExpression(decl.id, t.identifier('defaultProps')),
                        t.stringLiteral('data-react-component'),
                        true
                    ),
                    t.stringLiteral(
                        `${moduleName}__${decl.id.name}`
                    )
                )
            );
        }
    });
}