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
// https://sonarsource.github.io/rspec/#/rspec/S7059/javascript
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
const helpers_1 = require("../helpers");
const meta_1 = require("./meta");
const utils_1 = require("@typescript-eslint/utils");
const flaggedStatements = new Set();
exports.rule = {
    meta: (0, helpers_1.generateMeta)(meta_1.meta, {
        messages: {
            noAsyncConstructor: 'Refactor this asynchronous operation outside of the constructor.',
        },
    }),
    create(context) {
        const services = context.sourceCode.parserServices;
        if (!(0, helpers_1.isRequiredParserServices)(services)) {
            return {};
        }
        /**
         * Given a Promise call, get the parent statement of the async call.
         * We want to ensure that it is inside a constructor, but not part of a function declaration:
         * constructor() {
         *  foo();
         * }
         * and not
         * constructor() {
         *  myFunction = () => { foo() }
         * }
         * @param node : promise call
         */
        function asyncStatementInsideConstructor(node) {
            let classConstructor;
            let statement;
            context.sourceCode.getAncestors(node).forEach(node => {
                if (node.type === utils_1.AST_NODE_TYPES.MethodDefinition && node.kind === 'constructor') {
                    classConstructor = node;
                }
                if (classConstructor && node.type.endsWith('Statement')) {
                    statement = node;
                }
                // If we find a function declaration it should not be considered as part of the constructor
                if (classConstructor && statement && (0, helpers_1.isFunctionNode)(node)) {
                    statement = undefined;
                    classConstructor = undefined;
                }
            });
            return statement;
        }
        return {
            CallExpression(node) {
                if (!(0, helpers_1.isThenable)(node, services)) {
                    return;
                }
                // we want to raise on the parent statement
                const statement = asyncStatementInsideConstructor(node);
                if (statement && !flaggedStatements.has(statement)) {
                    flaggedStatements.add(statement);
                    context.report({
                        node: statement,
                        messageId: 'noAsyncConstructor',
                    });
                }
            },
            'Program:exit'() {
                flaggedStatements.clear();
            },
        };
    },
};
//# sourceMappingURL=rule.js.map