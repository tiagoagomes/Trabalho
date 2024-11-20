"use strict";
/*
 * SonarQube JavaScript Plugin
 * Copyright (C) 2011-2024 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
// https://sonarsource.github.io/rspec/#/rspec/S2301/javascript
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = exports.S2301 = void 0;
const helpers_1 = require("../helpers");
const meta_1 = require("./meta");
const message = 'Provide multiple methods instead of using "{{parameterName}}" to determine which action to take.';
/**
 * A suspect test node is a test node that is the only child of a function body
 */
exports.S2301 = {
    meta: (0, helpers_1.generateMeta)(meta_1.meta, {
        messages: {
            message,
        },
    }, true),
    create: context => {
        if (!(0, helpers_1.isRequiredParserServices)(context.sourceCode.parserServices)) {
            return {};
        }
        const suspectTestNodes = [];
        const suspectBodies = [];
        const suspectReturnStatements = [];
        const handleFunctionBody = (node) => {
            const statements = node.body;
            if (statements.length === 1) {
                suspectBodies.push(statements[0]);
            }
        };
        const isAChildOf = (identifier, node) => {
            if (identifier.parent === node) {
                return true;
            }
            if (identifier.parent === null) {
                return false;
            }
            return isAChildOf(identifier.parent, node);
        };
        return {
            FunctionDeclaration: node => {
                handleFunctionBody(node.body);
            },
            FunctionExpression: node => {
                handleFunctionBody(node.body);
            },
            ArrowFunctionExpression: node => {
                if (node.body.type === 'BlockStatement') {
                    handleFunctionBody(node.body);
                }
            },
            Identifier: node => {
                // An identifier is suspect if it is a direct or indirect child of a suspect node,
                // or if it is a suspect node itself
                const isSuspect = suspectTestNodes.find(testNode => {
                    return testNode === node || isAChildOf(node, testNode);
                }) !== undefined;
                if (!isSuspect) {
                    return;
                }
                const variable = (0, helpers_1.getVariableFromIdentifier)(node, context.sourceCode.getScope(node));
                if (variable) {
                    const definition = variable.defs[variable.defs.length - 1];
                    if (definition?.type === 'Parameter') {
                        const type = (0, helpers_1.getTypeFromTreeNode)(definition.name, context.sourceCode.parserServices);
                        if ((0, helpers_1.isBooleanType)(type)) {
                            (0, helpers_1.report)(context, {
                                message,
                                loc: node.loc,
                                data: {
                                    parameterName: variable.name,
                                },
                            }, [
                                (0, helpers_1.toSecondaryLocation)(definition.name, `Parameter "${variable.name}" was declared here`),
                            ]);
                        }
                    }
                }
            },
            ConditionalExpression: node => {
                /**
                 * A conditional expression is suspect if it is the direct child of a suspect body or the direct child of a suspect return statement
                 */
                const parent = node.parent;
                if (suspectBodies.includes(parent) || suspectReturnStatements.includes(parent)) {
                    suspectTestNodes.push(node.test);
                }
            },
            IfStatement: node => {
                if (suspectBodies.includes(node) && node.alternate) {
                    suspectTestNodes.push(node.test);
                }
            },
            'IfStatement:exit': node => {
                if (suspectBodies.includes(node) && node.alternate) {
                    suspectTestNodes.pop();
                }
            },
            ReturnStatement: node => {
                if (suspectBodies.includes(node)) {
                    suspectReturnStatements.push(node);
                }
            },
            'ReturnStatement:exit': node => {
                if (suspectBodies.includes(node)) {
                    suspectReturnStatements.pop();
                }
            },
        };
    },
};
exports.rule = exports.S2301;
//# sourceMappingURL=rule.js.map