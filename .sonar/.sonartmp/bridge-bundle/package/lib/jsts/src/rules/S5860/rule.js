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
// https://sonarsource.github.io/rspec/#/rspec/S5860/javascript
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
exports.rule = void 0;
const regexpp = __importStar(require("@eslint-community/regexpp"));
const helpers_1 = require("../helpers");
const regex_1 = require("../helpers/regex");
const meta_1 = require("./meta");
exports.rule = {
    meta: (0, helpers_1.generateMeta)(meta_1.meta, undefined, true),
    create(context) {
        const services = context.sourceCode.parserServices;
        if (!(0, helpers_1.isRequiredParserServices)(services)) {
            return {};
        }
        const intellisense = new RegexIntelliSense(services, context);
        return {
            'Literal[regex]:exit': (literal) => {
                /* /regex/ */
                intellisense.collectKnowledge(literal);
            },
            'NewExpression:exit': (newExpr) => {
                /* new RegExp(regex) */
                intellisense.collectKnowledge(newExpr);
            },
            'CallExpression:exit': (callExpr) => {
                /* RegExp(regex), implicit regex e.g. str.match('regex') */
                intellisense.collectKnowledge(callExpr);
                /* str.match(pattern) / pattern.exec(str) */
                intellisense.collectPatternMatcher(callExpr);
                /* str.replace(pattern, substr) */
                checkStringReplaceGroupReferences(callExpr, intellisense);
            },
            'MemberExpression:exit': (memberExpr) => {
                if (memberExpr.computed) {
                    /* matcher[index] */
                    checkIndexBasedGroupReference(memberExpr, intellisense);
                }
                else {
                    /* matcher.groups.<name> / matcher.indices.groups.<name> */
                    checkNonExistingGroupReference(memberExpr, intellisense);
                }
            },
            'Program:exit': () => {
                checkUnusedGroups(intellisense);
                checkIndexedGroups(intellisense);
            },
        };
    },
};
function checkStringReplaceGroupReferences(callExpr, intellisense) {
    if ((0, regex_1.isStringReplaceCall)(callExpr, intellisense.services)) {
        const [pattern, substr] = callExpr.arguments;
        const regex = intellisense.findRegex(pattern);
        if (regex) {
            const references = (0, regex_1.extractReferences)(substr);
            const indexes = new Set();
            const names = new Set();
            references.forEach(ref => isNaN(Number(ref.value)) ? names.add(ref.value) : indexes.add(Number(ref.value)));
            regex.groups.forEach(group => {
                group.used ||= names.has(group.name);
                group.used ||= indexes.has(group.index);
            });
            const indexedGroups = regex.groups.filter(group => indexes.has(group.index));
            if (indexedGroups.length > 0) {
                const locations = prepareSecondaries(regex, indexedGroups, intellisense, 'Group');
                (0, helpers_1.report)(intellisense.context, {
                    message: `Directly use the group names instead of their numbers.`,
                    node: substr,
                }, locations);
            }
        }
    }
}
function checkIndexBasedGroupReference(memberExpr, intellisense) {
    const { object: matcher, property } = memberExpr;
    const regex = intellisense.resolve(matcher);
    if (regex) {
        const maybeIndex = (0, helpers_1.getValueOfExpression)(intellisense.context, property, 'Literal');
        if (maybeIndex && typeof maybeIndex.value === 'number') {
            const index = maybeIndex.value;
            const group = regex.groups.find(grp => grp.index === index);
            if (group) {
                group.used = true;
                const locations = prepareSecondaries(regex, [group], intellisense, 'Group');
                (0, helpers_1.report)(intellisense.context, {
                    message: `Directly use '${group.name}' instead of its group number.`,
                    node: property,
                }, locations);
            }
        }
    }
}
function checkNonExistingGroupReference(memberExpr, intellisense) {
    const { object: matcher } = memberExpr;
    const regex = intellisense.resolve(matcher);
    if (regex) {
        /* matcher.groups.<name> / matcher.indices.groups.<name>  */
        const groupNodes = extractGroupNodes(memberExpr, intellisense);
        for (const groupNode of groupNodes) {
            const groupName = groupNode.type === 'Identifier' ? groupNode.name : groupNode.value;
            const group = regex.groups.find(grp => grp.name === groupName);
            if (group) {
                group.used = true;
            }
            else {
                const locations = prepareSecondaries(regex, regex.groups, intellisense, 'Named group');
                (0, helpers_1.report)(intellisense.context, {
                    message: `There is no group named '${groupName}' in the regular expression.`,
                    node: groupNode,
                }, locations);
            }
        }
    }
}
function extractGroupNodes(memberExpr, intellisense) {
    if ((0, helpers_1.isDotNotation)(memberExpr)) {
        const { property } = memberExpr;
        const ancestors = intellisense.context.sourceCode.getAncestors(memberExpr);
        let parent = ancestors.pop();
        while (parent.type === 'TSNonNullExpression') {
            parent = ancestors.pop();
        }
        if (parent) {
            switch (property.name) {
                case 'groups':
                    /* matcher.groups.<name> or matcher.groups['name'] */
                    return extractNamedOrDestructuredGroupNodes(parent);
                case 'indices':
                    /* matcher.indices.groups.<name> or matcher.indices.groups['name'] */
                    if ((0, helpers_1.isDotNotation)(parent) && parent.property.name === 'groups') {
                        parent = ancestors.pop();
                        if (parent) {
                            return extractNamedOrDestructuredGroupNodes(parent);
                        }
                    }
            }
        }
    }
    return [];
}
function extractNamedOrDestructuredGroupNodes(node) {
    if ((0, helpers_1.isDotNotation)(node) || (0, helpers_1.isIndexNotation)(node)) {
        /* matcher.groups.<name> or matcher.groups['name'] */
        return [node.property];
    }
    else if ((0, helpers_1.isObjectDestructuring)(node)) {
        /* { <name1>,..<nameN> } = matcher.groups */
        const destructuredGroups = [];
        const pattern = node.type === 'VariableDeclarator' ? node.id : node.left;
        for (const property of pattern.properties) {
            if (property.type === 'Property' && property.key.type === 'Identifier') {
                destructuredGroups.push(property.key);
            }
        }
        return destructuredGroups;
    }
    else {
        return [];
    }
}
function checkUnusedGroups(intellisense) {
    intellisense.getKnowledge().forEach(regex => {
        if (regex.matched) {
            const unusedGroups = regex.groups.filter(group => !group.used);
            if (unusedGroups.length) {
                const locations = prepareSecondaries(regex, unusedGroups, intellisense, 'Named group');
                (0, helpers_1.report)(intellisense.context, {
                    message: 'Use the named groups of this regex or remove the names.',
                    node: regex.node,
                }, locations);
            }
        }
    });
}
function prepareSecondaries(regex, groups, intellisense, label) {
    const locations = [];
    for (const grp of groups) {
        const loc = (0, regex_1.getRegexpLocation)(regex.node, grp.node, intellisense.context);
        if (loc) {
            locations.push((0, helpers_1.toSecondaryLocation)({ loc }, `${label} '${grp.name}'`));
        }
    }
    return locations;
}
function checkIndexedGroups(intellisense) {
    intellisense.getKnowledge().forEach(regex => {
        regex.groups.forEach(group => {
            const locations = prepareSecondaries(regex, [group], intellisense, 'Group');
            group.node.references.forEach(reference => {
                const loc = (0, regex_1.getRegexpLocation)(regex.node, reference, intellisense.context);
                if (loc && typeof reference.ref === 'number') {
                    (0, helpers_1.report)(intellisense.context, {
                        message: `Directly use '${group.name}' instead of its group number.`,
                        loc,
                    }, locations);
                }
            });
        });
    });
}
function isAmbiguousGroup(reference) {
    return reference.ambiguous;
}
function makeRegexKnowledge(node, regexp) {
    const capturingGroups = [];
    const backreferences = [];
    regexpp.visitRegExpAST(regexp, {
        onBackreferenceEnter: reference => {
            const shouldSaveReference = isAmbiguousGroup(reference)
                ? reference.resolved.filter(capturingGroup => capturingGroup.name).length > 0
                : reference.resolved.name !== null;
            if (shouldSaveReference) {
                backreferences.push(reference);
            }
        },
        onCapturingGroupEnter: group => capturingGroups.push(group),
    });
    const groups = [];
    capturingGroups.forEach((group, index) => group.name && groups.push(makeGroupKnowledge(group, backreferences, index + 1)));
    return { node, regexp, groups, matched: false };
}
function makeGroupKnowledge(node, backreferences, index) {
    const name = node.name;
    const used = backreferences.some(backreference => backreference.ambiguous
        ? backreference.resolved.includes(node)
        : backreference.resolved === node);
    return { node, name, used, index };
}
class RegexIntelliSense {
    constructor(services, context) {
        this.services = services;
        this.context = context;
        this.knowledge = [];
        this.bindings = new Map();
    }
    getKnowledge() {
        return this.knowledge;
    }
    collectKnowledge(node) {
        let regexNode = node;
        if (node.type === 'CallExpression' && (0, regex_1.isStringRegexMethodCall)(node, this.services)) {
            /* implicit regex */
            regexNode = node.arguments[0];
        }
        const regex = (0, regex_1.getParsedRegex)(regexNode, this.context);
        if (regex !== null) {
            this.knowledge.push(makeRegexKnowledge(regexNode, regex));
        }
    }
    collectPatternMatcher(callExpr) {
        const { callee, arguments: args } = callExpr;
        if ((0, helpers_1.isMethodCall)(callExpr) && args.length > 0) {
            const target = callee.object;
            const matcher = (0, helpers_1.getLhsVariable)(this.context, callExpr);
            if (matcher) {
                const method = callee.property;
                if ((0, helpers_1.isString)(target, this.services) && ['match', 'matchAll'].includes(method.name)) {
                    /* str.match(pattern) */
                    const [pattern] = args;
                    this.bind(pattern, matcher);
                }
                else if (method.name === 'exec' && (0, helpers_1.isString)(args[0], this.services)) {
                    /* pattern.exec(str) */
                    const pattern = target;
                    this.bind(pattern, matcher);
                }
            }
        }
    }
    resolve(matcher) {
        const variable = this.findVariable(matcher);
        if (variable) {
            return this.bindings.get(variable) ?? null;
        }
        else {
            return null;
        }
    }
    findRegex(node) {
        return this.findRegexRec(node, new Set());
    }
    findRegexRec(node, visited) {
        if (!visited.has(node)) {
            visited.add(node);
            const variable = this.findVariable(node);
            if (variable) {
                const value = (0, helpers_1.getUniqueWriteUsage)(this.context, variable.name, node);
                if (value) {
                    const regex = this.findRegexRec(value, visited);
                    if (regex) {
                        return regex;
                    }
                }
            }
        }
        return this.knowledge.find(regex => regex.node === node);
    }
    bind(pattern, matcher) {
        const regex = this.findRegex(pattern);
        if (regex) {
            regex.matched = true;
            this.bindings.set(matcher, regex);
        }
    }
    findVariable(node) {
        if (node.type === 'Identifier') {
            return (0, helpers_1.getVariableFromName)(this.context, node.name, node);
        }
        return null;
    }
}
//# sourceMappingURL=rule.js.map