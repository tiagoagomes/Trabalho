"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeProject = analyzeProject;
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
const projectAnalysis_1 = require("./projectAnalysis");
const analyzeWithProgram_1 = require("./analyzeWithProgram");
const analyzeWithWatchProgram_1 = require("./analyzeWithWatchProgram");
const analyzeWithoutProgram_1 = require("./analyzeWithoutProgram");
const linter_1 = require("../../linter");
const program_1 = require("../../program");
const helpers_1 = require("../../rules/helpers");
const shared_1 = require("@sonar/shared");
/**
 * Analyzes a JavaScript / TypeScript project in a single run
 *
 * @param input the JavaScript / TypeScript project to analyze
 * @returns the JavaScript / TypeScript project analysis output
 */
async function analyzeProject(input) {
    const { rules, baseDir, environments = projectAnalysis_1.DEFAULT_ENVIRONMENTS, globals = projectAnalysis_1.DEFAULT_GLOBALS, exclusions = [], isSonarlint = false, maxFilesForTypeChecking, } = input;
    const inputFilenames = Object.keys(input.files);
    const results = {
        files: {},
        meta: {
            withProgram: false,
            withWatchProgram: false,
            filesWithoutTypeChecking: [],
            programsCreated: [],
        },
    };
    if (!inputFilenames.length) {
        return results;
    }
    const pendingFiles = new Set(inputFilenames);
    const watchProgram = input.isSonarlint;
    (0, linter_1.initializeLinter)(rules, environments, globals, baseDir);
    loadTSConfigAndPackageJsonFiles(baseDir, exclusions);
    const tsConfigs = (0, program_1.getTSConfigsIterator)(inputFilenames, (0, shared_1.toUnixPath)(baseDir), isSonarlint, maxFilesForTypeChecking);
    if (watchProgram) {
        results.meta.withWatchProgram = true;
        await (0, analyzeWithWatchProgram_1.analyzeWithWatchProgram)(input.files, tsConfigs, results, pendingFiles);
    }
    else {
        results.meta.withProgram = true;
        await (0, analyzeWithProgram_1.analyzeWithProgram)(input.files, tsConfigs, results, pendingFiles);
    }
    await (0, analyzeWithoutProgram_1.analyzeWithoutProgram)(pendingFiles, input.files, results);
    return results;
}
/**
 * Gather all the tsconfig.json and package.json files in the project
 * and save them in their respective caches.
 */
function loadTSConfigAndPackageJsonFiles(baseDir, exclusions) {
    const { tsConfigs } = (0, helpers_1.searchFiles)(baseDir, {
        tsConfigs: { pattern: program_1.TSCONFIG_JSON },
    }, exclusions);
    (0, program_1.setTSConfigs)(tsConfigs);
}
//# sourceMappingURL=projectAnalyzer.js.map