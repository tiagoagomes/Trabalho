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
// https://sonarsource.github.io/rspec/#/rspec/S4328/javascript
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
const builtin_modules_1 = __importDefault(require("builtin-modules"));
const ts = __importStar(require("typescript"));
const helpers_1 = require("../helpers");
const meta_1 = require("./meta");
const messages = {
    removeOrAddDependency: 'Either remove this import or add it as a dependency.',
};
exports.rule = {
    meta: (0, helpers_1.generateMeta)(meta_1.meta, { messages, schema: meta_1.schema }),
    create(context) {
        // we need to find all the npm manifests from the directory of the analyzed file to the context working directory
        const dependencies = (0, helpers_1.getDependencies)(context.filename, context.cwd);
        const whitelist = context.options[0]?.whitelist || [];
        const program = context.sourceCode.parserServices?.program;
        let options, host;
        if (program) {
            options = program?.getCompilerOptions();
            host = ts.createCompilerHost(options);
        }
        return {
            CallExpression: (node) => {
                const call = node;
                if (call.callee.type === 'Identifier' &&
                    call.callee.name === 'require' &&
                    call.arguments.length === 1) {
                    const [argument] = call.arguments;
                    if (argument.type === 'Literal') {
                        const requireToken = call.callee;
                        raiseOnImplicitImport(argument, requireToken.loc, dependencies, context.filename, host, options, whitelist, context);
                    }
                }
            },
            ImportDeclaration: (node) => {
                const module = node.source;
                const importToken = context.sourceCode.getFirstToken(node);
                raiseOnImplicitImport(module, importToken.loc, dependencies, context.filename, host, options, whitelist, context);
            },
        };
    },
};
function raiseOnImplicitImport(module, loc, dependencies, filename, host, options, whitelist, context) {
    const moduleName = module.value;
    if (typeof moduleName !== 'string') {
        return;
    }
    if (ts.isExternalModuleNameRelative(moduleName)) {
        return;
    }
    if (['node:', 'data:', 'file:'].some(prefix => moduleName.startsWith(prefix))) {
        return;
    }
    const packageName = getPackageName(moduleName);
    if (whitelist.includes(packageName)) {
        return;
    }
    if (builtin_modules_1.default.includes(packageName)) {
        return;
    }
    for (const dependency of dependencies) {
        if (typeof dependency === 'string') {
            if (dependency === packageName) {
                return;
            }
        }
        else if (dependency.match(moduleName)) {
            //dependencies are globs for workspaces
            return;
        }
    }
    if (host && options) {
        // check if Typescript can resolve path aliases and 'baseDir'-based import
        const resolved = ts.resolveModuleName(moduleName, filename, options, host);
        if (resolved?.resolvedModule && !resolved.resolvedModule.isExternalLibraryImport) {
            return;
        }
    }
    context.report({
        messageId: 'removeOrAddDependency',
        loc,
    });
}
function getPackageName(name) {
    /*
      - scoped `@namespace/foo/bar` -> package `@namespace/foo`
      - scope `foo/bar` -> package `foo`
    */
    const parts = name.split('/');
    if (!name.startsWith('@')) {
        return parts[0];
    }
    else {
        return `${parts[0]}/${parts[1]}`;
    }
}
//# sourceMappingURL=rule.js.map