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
// https://sonarsource.github.io/rspec/#/rspec/S1940
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
const utils_1 = require("@typescript-eslint/utils");
const helpers_1 = require("../helpers");
const meta_1 = require("./meta");
const invertedOperators = {
    '==': '!=',
    '!=': '==',
    '===': '!==',
    '!==': '===',
    '>': '<=',
    '<': '>=',
    '>=': '<',
    '<=': '>',
};
exports.rule = {
    meta: (0, helpers_1.generateMeta)(meta_1.meta, {
        messages: {
            useOppositeOperator: 'Use the opposite operator ({{invertedOperator}}) instead.',
            suggestOperationInversion: 'Invert inner operation (apply if NaN is not expected)',
        },
        hasSuggestions: true,
        fixable: 'code',
    }),
    create(context) {
        return {
            UnaryExpression: (node) => visitUnaryExpression(node, context),
        };
    },
};
function visitUnaryExpression(unaryExpression, context) {
    if (unaryExpression.operator === '!' &&
        unaryExpression.argument.type === utils_1.AST_NODE_TYPES.BinaryExpression) {
        const condition = unaryExpression.argument;
        const invertedOperator = invertedOperators[condition.operator];
        if (invertedOperator) {
            const left = context.sourceCode.getText(condition.left);
            const right = context.sourceCode.getText(condition.right);
            const [start, end] = unaryExpression.parent?.type === 'UnaryExpression'
                ? ['(', ')']
                : ['', ''];
            context.report({
                messageId: 'useOppositeOperator',
                suggest: [
                    {
                        messageId: 'suggestOperationInversion',
                        fix: fixer => fixer.replaceText(unaryExpression, `${start}${left} ${invertedOperator} ${right}${end}`),
                    },
                ],
                data: { invertedOperator },
                node: unaryExpression,
            });
        }
    }
}
//# sourceMappingURL=rule.js.map