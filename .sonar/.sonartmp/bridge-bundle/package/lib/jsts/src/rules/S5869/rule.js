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
// https://sonarsource.github.io/rspec/#/rspec/S5869/javascript
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
const helpers_1 = require("../helpers");
const regex_1 = require("../helpers/regex");
const meta_1 = require("./meta");
exports.rule = (0, regex_1.createRegExpRule)(context => {
    let flags;
    return {
        onRegExpLiteralEnter: (node) => {
            flags = node.flags;
        },
        onCharacterClassEnter: (node) => {
            const duplicates = new Set();
            const characterClass = new regex_1.SimplifiedRegexCharacterClass(flags);
            node.elements.forEach(element => {
                const intersections = new regex_1.SimplifiedRegexCharacterClass(flags, element).findIntersections(characterClass);
                if (intersections.length > 0) {
                    intersections.forEach(intersection => duplicates.add(intersection));
                    duplicates.add(element);
                }
                characterClass.add(element);
            });
            if (duplicates.size > 0) {
                const [primary, ...secondaries] = duplicates;
                const secondaryLocations = [];
                for (const secondary of secondaries) {
                    const loc = (0, regex_1.getRegexpLocation)(context.node, secondary, context);
                    if (loc) {
                        secondaryLocations.push((0, helpers_1.toSecondaryLocation)({ loc }, 'Additional duplicate'));
                    }
                }
                context.reportRegExpNode({
                    message: 'Remove duplicates in this character class.',
                    node: context.node,
                    regexpNode: primary,
                }, secondaryLocations);
            }
        },
    };
}, (0, helpers_1.generateMeta)(meta_1.meta, undefined, true));
//# sourceMappingURL=rule.js.map