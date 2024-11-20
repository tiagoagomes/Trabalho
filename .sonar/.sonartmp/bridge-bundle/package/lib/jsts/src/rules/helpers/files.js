"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFileSync = readFileSync;
exports.stripBOM = stripBOM;
exports.toUnixPath = toUnixPath;
exports.findParent = findParent;
exports.isRoot = isRoot;
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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Byte Order Marker
 */
const BOM_BYTE = 0xfeff;
/**
 * Synchronous read of file contents from a file path
 *
 * The function gets rid of any Byte Order Marker (BOM)
 * present in the file's header.
 *
 * @param filePath the path of a file
 * @returns Promise which resolves with the content of the file
 */
function readFileSync(filePath) {
    const fileContent = fs_1.default.readFileSync(filePath, { encoding: 'utf8' });
    return stripBOM(fileContent);
}
/**
 * Removes any Byte Order Marker (BOM) from a string's head
 *
 * A string's head is nothing else but its first character.
 *
 * @param str the input string
 * @returns the stripped string
 */
function stripBOM(str) {
    if (str.charCodeAt(0) === BOM_BYTE) {
        return str.slice(1);
    }
    return str;
}
/**
 * Converts a path to Unix format
 * @param path the path to convert
 * @returns the converted path
 */
function toUnixPath(path) {
    return path.replace(/[\\/]+/g, '/');
}
/**
 * Find nearest file with a given name in current or parent dirs
 * @param dir
 * @param name filename to search for
 */
function findParent(dir, name) {
    const filename = path_1.default.join(dir, name);
    if (fs_1.default.existsSync(filename)) {
        return filename;
    }
    const parentDir = path_1.default.resolve(dir, '..');
    if (dir === parentDir) {
        return null;
    }
    return findParent(parentDir, name);
}
function isRoot(file) {
    const result = path_1.default.parse(file);
    return toUnixPath(file) === toUnixPath(result.root);
}
//# sourceMappingURL=files.js.map