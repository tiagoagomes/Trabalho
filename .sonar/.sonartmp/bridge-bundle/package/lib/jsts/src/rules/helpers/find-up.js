"use strict";
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
exports.createFindUp = void 0;
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
const Path = __importStar(require("node:path/posix"));
const minimatch_1 = require("minimatch");
const files_1 = require("./files");
const fs_1 = __importDefault(require("fs"));
/**
 * Create an instance of FindUp.
 */
const createFindUp = (pattern) => {
    const cache = new Map();
    const matcher = new minimatch_1.Minimatch(pattern);
    const findUp = (from, to, filesystem = fs_1.default) => {
        return _findUp((0, files_1.toUnixPath)(from), to ? (0, files_1.toUnixPath)(to) : undefined, filesystem);
    };
    const _findUp = (from, to, filesystem = fs_1.default) => {
        const results = [];
        if (from === '.') {
            // handle path.dirname returning "." in windows
            return results;
        }
        let cacheContent = cache.get(from);
        if (cacheContent === undefined) {
            cacheContent = [];
            cache.set(from, cacheContent);
            let entries = [];
            try {
                entries = filesystem.readdirSync(from);
            }
            catch { }
            for (const entry of entries) {
                const fullEntryPath = Path.join(from, entry.toString());
                const basename = Path.basename(fullEntryPath);
                if (matcher.match(basename)) {
                    let stats;
                    // the resource may not be available
                    try {
                        stats = filesystem.statSync(fullEntryPath);
                    }
                    catch (error) {
                        // todo: this is testable and should be tested
                        stats = {
                            isFile: () => false,
                        };
                    }
                    if (stats.isFile()) {
                        cacheContent.push({
                            path: fullEntryPath,
                            content: filesystem.readFileSync(fullEntryPath),
                        });
                    }
                }
            }
        }
        results.push(...cacheContent);
        if (!(0, files_1.isRoot)(from) && from !== to) {
            const parent = Path.dirname(from);
            results.push(..._findUp(parent, to, filesystem));
        }
        return results;
    };
    return findUp;
};
exports.createFindUp = createFindUp;
//# sourceMappingURL=find-up.js.map