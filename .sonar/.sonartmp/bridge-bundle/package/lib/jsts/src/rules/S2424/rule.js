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
// https://sonarsource.github.io/rspec/#/rspec/S2424/javascript
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
const helpers_1 = require("../helpers");
const meta_1 = require("./meta");
exports.rule = {
    meta: (0, helpers_1.generateMeta)(meta_1.meta, {
        messages: {
            removeOverride: 'Remove this override of "{{overridden}}".',
        },
    }),
    create(context) {
        const overriden = new Set();
        function isBuiltIn(variable) {
            return helpers_1.globalsByLibraries.builtin.includes(variable.name);
        }
        function checkVariable(variable) {
            if (isBuiltIn(variable)) {
                variable.defs.forEach(def => overriden.add(def.name));
                variable.references
                    .filter(ref => ref.isWrite())
                    .forEach(ref => overriden.add(ref.identifier));
            }
        }
        function checkScope(scope) {
            scope.variables.forEach(checkVariable);
            scope.childScopes.forEach(checkScope);
        }
        function isTSEnumMemberId(node) {
            const id = node;
            return id.parent?.type === 'TSEnumMember';
        }
        return {
            Program: (node) => {
                checkScope(context.sourceCode.getScope(node));
            },
            'Program:exit': () => {
                overriden.forEach(node => {
                    if (!isTSEnumMemberId(node)) {
                        context.report({
                            messageId: 'removeOverride',
                            data: {
                                overridden: node.name,
                            },
                            node,
                        });
                    }
                });
                overriden.clear();
            },
        };
    },
};
//# sourceMappingURL=rule.js.map