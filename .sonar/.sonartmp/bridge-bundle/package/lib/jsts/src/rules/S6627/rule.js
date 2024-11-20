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
// https://sonarsource.github.io/rspec/#/rspec/S6627/javascript
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
const helpers_1 = require("../helpers");
const meta_1 = require("./meta");
const messages = {
    default: 'Do not use internal APIs of your dependencies',
};
exports.rule = {
    meta: (0, helpers_1.generateMeta)(meta_1.meta, { messages }),
    create(context) {
        return {
            CallExpression(node) {
                if ((0, helpers_1.isRequire)(node)) {
                    const [arg] = node.arguments;
                    if ((0, helpers_1.isStringLiteral)(arg) && arg.value.includes('node_modules')) {
                        context.report({
                            node,
                            messageId: 'default',
                        });
                    }
                }
            },
            ImportDeclaration(node) {
                const moduleName = node.source.value;
                if (moduleName.includes('node_modules')) {
                    context.report({
                        node,
                        messageId: 'default',
                    });
                }
            },
        };
    },
};
//# sourceMappingURL=rule.js.map