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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupported = isSupported;
const semver = __importStar(require("semver"));
const package_json_1 = require("./package-json");
/**
 * Checks if context where the filename is located supports the provided
 * minimum versions.
 */
function isSupported(dirname, minVersions) {
    validateVersions(minVersions);
    return isSupportedNodeVersion(dirname, minVersions.node);
}
/**
 * Check if the versions are valid semver
 */
function validateVersions(versions) {
    for (const [ref, version] of Object.entries(versions)) {
        if (semver.valid(version) === null) {
            throw new Error(`Invalid semver version: "${version}" for "${ref}"`);
        }
    }
}
/**
 * Check if the feature is supported by the minimum Node.js version of the project.
 *
 * @param filename
 * @param requiredVersion
 * @returns
 */
function isSupportedNodeVersion(dirname, requiredVersion) {
    if (!requiredVersion) {
        return true;
    }
    const packageJsons = (0, package_json_1.getManifests)(dirname);
    const versionRange = packageJsons.find(pj => pj.engines?.node)?.engines?.node;
    if (!versionRange) {
        return true;
    }
    const projectMinVersion = semver.minVersion(versionRange);
    if (!projectMinVersion) {
        return true;
    }
    return semver.gte(projectMinVersion, requiredVersion);
}
//# sourceMappingURL=validate-version.js.map