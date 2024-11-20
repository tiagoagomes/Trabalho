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
// https://sonarsource.github.io/rspec/#/rspec/S1066
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
const helpers_1 = require("../helpers");
const utils_1 = require("@typescript-eslint/utils");
const meta_1 = require("./meta");
const message = 'Merge this if statement with the nested one.';
exports.rule = {
    meta: (0, helpers_1.generateMeta)(meta_1.meta, {
        messages: {
            mergeNestedIfStatement: message,
        },
    }, true),
    create(context) {
        return {
            IfStatement(node) {
                let { consequent } = node;
                if (consequent.type === utils_1.AST_NODE_TYPES.BlockStatement && consequent.body.length === 1) {
                    consequent = consequent.body[0];
                }
                if (isIfStatementWithoutElse(node) && isIfStatementWithoutElse(consequent)) {
                    const ifKeyword = context.sourceCode.getFirstToken(consequent);
                    const enclosingIfKeyword = context.sourceCode.getFirstToken(node);
                    if (ifKeyword && enclosingIfKeyword) {
                        (0, helpers_1.report)(context, {
                            messageId: 'mergeNestedIfStatement',
                            message,
                            loc: enclosingIfKeyword.loc,
                        }, [(0, helpers_1.toSecondaryLocation)(ifKeyword, 'Nested "if" statement.')]);
                    }
                }
            },
        };
        function isIfStatementWithoutElse(node) {
            return node.type === utils_1.AST_NODE_TYPES.IfStatement && !node.alternate;
        }
    },
};
//# sourceMappingURL=rule.js.map