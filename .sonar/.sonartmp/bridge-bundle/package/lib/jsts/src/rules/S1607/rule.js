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
// https://sonarsource.github.io/rspec/#/rspec/S1607
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
const helpers_1 = require("../helpers");
const meta_1 = require("./meta");
const posix_1 = require("path/posix");
exports.rule = {
    meta: (0, helpers_1.generateMeta)(meta_1.meta, {
        messages: {
            removeOrExplainTest: 'Remove this unit test or explain why it is ignored.',
        },
    }),
    create(context) {
        const dependencies = (0, helpers_1.getDependencies)(context.filename, context.cwd);
        switch (true) {
            case dependencies.has('jasmine'):
                return jasmineListener();
            case dependencies.has('jest'):
                return jestListener();
            case dependencies.has('mocha'):
                return mochaListener();
            case (0, helpers_1.getManifests)((0, posix_1.dirname)((0, helpers_1.toUnixPath)(context.filename)), context.cwd).length > 0:
                return nodejsListener();
            default:
                return {};
        }
        /**
         * Returns a rule listener specific to Jasmine.
         *
         * Ignoring tests with Jasmine is done by using `xit`, `xdescribe`, or `xcontext`.
         */
        function jasmineListener() {
            return {
                CallExpression(node) {
                    if (isIgnoredTest(node) && !hasExplanationComment(node)) {
                        context.report({
                            node: node.callee,
                            messageId: 'removeOrExplainTest',
                        });
                    }
                },
            };
            function isIgnoredTest(node) {
                return (0, helpers_1.isIdentifier)(node.callee, 'xit', 'xdescribe', 'xcontext');
            }
        }
        /**
         * Returns a rule listener specific to Jest.
         *
         * Ignoring tests with Jest is done by using `test.skip`, `it.skip`, or `describe.skip`.
         */
        function jestListener() {
            return {
                CallExpression(node) {
                    if (isIgnoredTest(node) && !hasExplanationComment(node)) {
                        context.report({
                            node: node.callee,
                            messageId: 'removeOrExplainTest',
                        });
                    }
                },
            };
            function isIgnoredTest(node) {
                return ((0, helpers_1.isMethodInvocation)(node, 'test', 'skip', 0) ||
                    (0, helpers_1.isMethodInvocation)(node, 'it', 'skip', 0) ||
                    (0, helpers_1.isMethodInvocation)(node, 'describe', 'skip', 0) ||
                    (0, helpers_1.isFunctionInvocation)(node, 'xtest', 0) ||
                    (0, helpers_1.isFunctionInvocation)(node, 'xit', 0) ||
                    (0, helpers_1.isFunctionInvocation)(node, 'xdescribe', 0));
            }
        }
        /**
         * Returns a rule listener specific to Mocha.
         *
         * Ignoring tests with Mocha is done by using `it.skip`, `describe.skip`, or `context.skip`.
         */
        function mochaListener() {
            return {
                CallExpression(node) {
                    if (isIgnoredTest(node) && !hasExplanationComment(node)) {
                        context.report({
                            node: node.callee,
                            messageId: 'removeOrExplainTest',
                        });
                    }
                },
            };
            function isIgnoredTest(node) {
                return ((0, helpers_1.isMethodInvocation)(node, 'it', 'skip', 0) ||
                    (0, helpers_1.isMethodInvocation)(node, 'describe', 'skip', 0) ||
                    (0, helpers_1.isMethodInvocation)(node, 'context', 'skip', 0));
            }
        }
        /**
         * Returns a rule listener specific to Node.js test runner API.
         *
         * Ignoring tests with Node.js test runner API is done by using either:
         *  - by passing the skip option to the test, i.e. `test('name', { skip: true }, () => {})`, or
         *  - by calling the test context's `skip()` method, i.e. `test.skip('name', t => { t.skip(); })`.
         */
        function nodejsListener() {
            return {
                CallExpression: (node) => {
                    const fqn = (0, helpers_1.getFullyQualifiedName)(context, node.callee);
                    if (fqn !== 'test') {
                        return;
                    }
                    switch (node.arguments.length) {
                        case 2:
                            handleSkipMethod(node);
                            break;
                        case 3:
                            handleSkipOption(node);
                            break;
                        default:
                            return;
                    }
                },
            };
            /**
             * Handle the pattern `test('name', t => { t.skip(); })`.
             */
            function handleSkipMethod(node) {
                const fn = (0, helpers_1.resolveFunction)(context, node.arguments[1]);
                if (!fn) {
                    return;
                }
                const testCtxParam = fn.params[0];
                if (!testCtxParam || !(0, helpers_1.isIdentifier)(testCtxParam)) {
                    return;
                }
                const scopeVariables = context.sourceCode.scopeManager.getDeclaredVariables(fn);
                const testCtxVar = scopeVariables.find(v => v.name === testCtxParam.name);
                if (!testCtxVar) {
                    return;
                }
                for (const testCtxRef of testCtxVar.references) {
                    const testCtxIden = testCtxRef.identifier;
                    const maybeSkipCall = testCtxIden?.parent?.parent;
                    if (maybeSkipCall?.type !== 'CallExpression') {
                        continue;
                    }
                    const skipCall = maybeSkipCall;
                    if (!(0, helpers_1.isMethodInvocation)(skipCall, testCtxIden.name, 'skip', 0)) {
                        continue;
                    }
                    const skipArg = skipCall.arguments[0];
                    if (!skipArg || ((0, helpers_1.isLiteral)(skipArg) && skipArg.value === '')) {
                        context.report({
                            node: skipCall.callee,
                            messageId: 'removeOrExplainTest',
                        });
                        break;
                    }
                }
            }
            /**
             * Handle the pattern `test('name', { skip: true }, () => {})`.
             */
            function handleSkipOption(node) {
                const options = (0, helpers_1.getValueOfExpression)(context, node.arguments[1], 'ObjectExpression');
                if (!options) {
                    return;
                }
                const skipProperty = (0, helpers_1.getProperty)(options, 'skip', context);
                if (!skipProperty) {
                    return;
                }
                const skipValue = (0, helpers_1.getValueOfExpression)(context, skipProperty.value, 'Literal');
                if (!skipValue || (skipValue.value !== true && skipValue.value !== '')) {
                    return;
                }
                context.report({
                    node: skipProperty,
                    messageId: 'removeOrExplainTest',
                });
            }
        }
        /**
         * Checks if the node denoting a test has an adjacent explanation comment.
         */
        function hasExplanationComment(node) {
            function isAdjacent(comment, node) {
                const commentLine = comment.loc.end.line;
                const nodeLine = node.loc.start.line;
                return Math.abs(commentLine - nodeLine) <= 1;
            }
            function hasContent(comment) {
                return /\p{L}/u.test(comment.value.trim());
            }
            const comments = context.sourceCode.getAllComments();
            return comments.some(comment => isAdjacent(comment, node) && hasContent(comment));
        }
    },
};
//# sourceMappingURL=rule.js.map