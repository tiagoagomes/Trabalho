"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getManifests = exports.PACKAGE_JSON = void 0;
exports.getDependencies = getDependencies;
exports.getDependenciesFromPackageJson = getDependenciesFromPackageJson;
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
const posix_1 = __importDefault(require("path/posix"));
const files_1 = require("./files");
const minimatch_1 = require("minimatch");
const find_up_1 = require("./find-up");
const fs_1 = __importDefault(require("fs"));
exports.PACKAGE_JSON = 'package.json';
/**
 * The {@link FindUp} instance dedicated to retrieving `package.json` files
 */
const findPackageJsons = (0, find_up_1.createFindUp)(exports.PACKAGE_JSON);
const DefinitelyTyped = '@types/';
/**
 * Cache for the available dependencies by dirname.
 */
const cache = new Map();
/**
 * Retrieve the dependencies of all the package.json files available for the given file.
 *
 * @param filename context.filename
 * @param cwd working dir, will search up to that root
 * @returns
 */
function getDependencies(filename, cwd) {
    const dirname = posix_1.default.dirname((0, files_1.toUnixPath)(filename));
    const cached = cache.get(dirname);
    if (cached) {
        return cached;
    }
    const result = new Set();
    cache.set(dirname, result);
    (0, exports.getManifests)(dirname, cwd, fs_1.default).forEach(manifest => {
        const manifestDependencies = getDependenciesFromPackageJson(manifest);
        manifestDependencies.forEach(dependency => {
            result.add(dependency);
        });
    });
    return result;
}
function getDependenciesFromPackageJson(content) {
    const result = new Set();
    if (content.name) {
        addDependencies(result, { [content.name]: '*' });
    }
    if (content.dependencies !== undefined) {
        addDependencies(result, content.dependencies);
    }
    if (content.devDependencies !== undefined) {
        addDependencies(result, content.devDependencies);
    }
    if (content.peerDependencies !== undefined) {
        addDependencies(result, content.peerDependencies);
    }
    if (content.optionalDependencies !== undefined) {
        addDependencies(result, content.optionalDependencies);
    }
    if (content._moduleAliases !== undefined) {
        addDependencies(result, content._moduleAliases);
    }
    if (Array.isArray(content.workspaces)) {
        addDependenciesArray(result, content.workspaces);
    }
    else if (content.workspaces?.packages) {
        addDependenciesArray(result, content.workspaces?.packages);
    }
    return result;
}
function addDependencies(result, dependencies, isGlob = false) {
    Object.keys(dependencies).forEach(name => addDependency(result, name, isGlob));
}
function addDependenciesArray(result, dependencies, isGlob = true) {
    dependencies.forEach(name => addDependency(result, name, isGlob));
}
function addDependency(result, dependency, isGlob) {
    if (isGlob) {
        result.add(new minimatch_1.Minimatch(dependency, { nocase: true, matchBase: true }));
    }
    else {
        result.add(dependency.startsWith(DefinitelyTyped)
            ? dependency.substring(DefinitelyTyped.length)
            : dependency);
    }
}
/**
 * Returns the project manifests that are used to resolve the dependencies imported by
 * the module named `filename`, up to the passed working directory.
 */
const getManifests = (dir, workingDirectory, fileSystem) => {
    const files = findPackageJsons(dir, workingDirectory, fileSystem);
    return files.map(file => {
        const content = file.content;
        try {
            return JSON.parse((0, files_1.stripBOM)(content.toString()));
        }
        catch (error) {
            console.debug(`Error parsing file ${file.path}: ${error}`);
            return {};
        }
    });
};
exports.getManifests = getManifests;
//# sourceMappingURL=package-json.js.map