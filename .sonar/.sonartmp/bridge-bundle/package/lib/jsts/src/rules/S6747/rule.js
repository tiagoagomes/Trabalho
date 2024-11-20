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
// https://sonarsource.github.io/rspec/#/rspec/S6747/javascript
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
const eslint_plugin_react_1 = require("eslint-plugin-react");
const eslint_plugin_jsx_a11y_1 = require("eslint-plugin-jsx-a11y");
const helpers_1 = require("../helpers");
const decorator_1 = require("./decorator");
const meta_1 = require("./meta");
const noUnknownProp = eslint_plugin_react_1.rules['no-unknown-property'];
const decoratedNoUnknownProp = (0, decorator_1.decorate)(noUnknownProp);
/**
 * We keep a single occurrence of issues raised by both rules, keeping the ones raised by 'aria-props'
 * in case of duplicate.
 * The current logic relies on the fact that the listener of 'aria-props' runs first because
 * it is alphabetically "smaller", which is how we set them up in mergeRules.
 */
/**
 * start offsets of nodes that raised issues in eslint-plugin-jsx-a11y's aria-props
 */
const flaggedNodeStarts = new Map();
const ariaPropsRule = eslint_plugin_jsx_a11y_1.rules['aria-props'];
const decoratedAriaPropsRule = (0, helpers_1.interceptReport)(ariaPropsRule, (context, descriptor) => {
    if ('node' in descriptor) {
        const start = descriptor.node.range[0];
        if (!flaggedNodeStarts.get(start)) {
            flaggedNodeStarts.set(start, true);
            context.report(descriptor);
        }
    }
});
const twiceDecoratedNoUnknownProp = (0, helpers_1.interceptReport)(decoratedNoUnknownProp, (context, descriptor) => {
    if ('node' in descriptor) {
        const start = descriptor.node.range[0];
        if (!flaggedNodeStarts.get(start)) {
            context.report(descriptor);
        }
    }
});
exports.rule = {
    meta: (0, helpers_1.generateMeta)(meta_1.meta, {
        hasSuggestions: true,
        messages: {
            ...decoratedAriaPropsRule.meta.messages,
            ...twiceDecoratedNoUnknownProp.meta.messages,
        },
        schema: [
            {
                type: 'object',
                properties: {
                    ignore: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                },
            },
        ],
    }),
    create(context) {
        const dependencies = (0, helpers_1.getDependencies)(context.filename, context.cwd);
        if (!dependencies.has('react')) {
            return {};
        }
        const ariaPropsListener = decoratedAriaPropsRule.create(context);
        const noUnknownPropListener = twiceDecoratedNoUnknownProp.create(context);
        return (0, helpers_1.mergeRules)(ariaPropsListener, noUnknownPropListener);
    },
};
//# sourceMappingURL=rule.js.map