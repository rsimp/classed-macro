const { createMacro, MacroError } = require('babel-plugin-macros');
const { addDefault } = require('@babel/helper-module-imports');
const nodePath = require('path');

module.exports = createMacro(classedMacro);

function createAssignment(t, left, right) {
    return t.expressionStatement(t.assignmentExpression('=', left, right));
}

function classedMacro({ references, babel, state }) {
    const program = state.file.path;

    if (!references.default) {
        throw new MacroError('classed.macro does not support named imports');
    }

    // replace default import (will use classed now)
    const id = addDefault(program, "classed-components", { nameHint: "classed" });
    // update references with the new identifiers
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
            const displayName = variable.insertAfter(
                createAssignment(
                    t,
                    t.MemberExpression(decl.id, t.identifier('displayName')),
                    t.stringLiteral(decl.id.name)
                )
            );

            // Add human react data attribute. The format is:
            // [MODULENAME]__[COMPONENT]-[#]
            const fileName = state.file.opts.filename || 'UnknownFile';
            const parsedFile = nodePath.parse(fileName);
            const moduleName = parsedFile.name.toLowerCase() !== "index"
                ? parsedFile.name
                : nodePath.basename(parsedFile.dir);

            const propTypes = displayName[0].insertAfter(
                createAssignment(
                    t,
                    t.MemberExpression(
                        decl.id,
                        t.identifier('defaultProps')
                    ),
                    t.objectExpression([])
                )
            );
            
            propTypes[0].insertAfter(
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