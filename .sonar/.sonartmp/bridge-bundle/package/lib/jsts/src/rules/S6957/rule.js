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
// https://sonarsource.github.io/rspec/#/rspec/S6957/javascript
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
const eslint_plugin_react_1 = require("eslint-plugin-react");
const helpers_1 = require("../helpers");
const meta_1 = require("./meta");
const posix_1 = require("path/posix");
const reactNoDeprecated = eslint_plugin_react_1.rules['no-deprecated'];
const messages = {
    deprecated: '{{oldMethod}} is deprecated since React {{version}}{{newMethod}}',
};
exports.rule = {
    meta: (0, helpers_1.generateMeta)(meta_1.meta, { messages, schema: meta_1.schema }),
    create(context) {
        function getVersionFromOptions() {
            return context.options[0]?.['react-version'];
        }
        function getVersionFromPackageJson() {
            for (const packageJson of (0, helpers_1.getManifests)((0, posix_1.dirname)((0, helpers_1.toUnixPath)(context.filename)), context.cwd)) {
                if (packageJson.dependencies?.react) {
                    return packageJson.dependencies.react;
                }
                if (packageJson.devDependencies?.react) {
                    return packageJson.devDependencies.react;
                }
            }
            return null;
        }
        const reactVersion = getVersionFromOptions() || getVersionFromPackageJson();
        const patchedContext = reactVersion
            ? Object.create(context, {
                settings: {
                    value: { react: { version: reactVersion } },
                    writable: false,
                },
            })
            : context;
        return reactNoDeprecated.create(patchedContext);
    },
};
//# sourceMappingURL=rule.js.map