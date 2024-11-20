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
// https://sonarsource.github.io/rspec/#/rspec/S4158
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
const helpers_1 = require("../helpers");
const meta_1 = require("./meta");
// Methods that mutate the collection but can't add elements
const nonAdditiveMutatorMethods = [
    // array methods
    'copyWithin',
    'pop',
    'reverse',
    'shift',
    'sort',
    // map, set methods
    'clear',
    'delete',
];
const accessorMethods = [
    // array methods
    'concat',
    'flat',
    'flatMap',
    'includes',
    'indexOf',
    'join',
    'lastIndexOf',
    'slice',
    'toSource',
    'toString',
    'toLocaleString',
    // map, set methods
    'get',
    'has',
];
const iterationMethods = [
    'entries',
    'every',
    'filter',
    'find',
    'findIndex',
    'forEach',
    'keys',
    'map',
    'reduce',
    'reduceRight',
    'some',
    'values',
];
const strictlyReadingMethods = new Set([
    ...nonAdditiveMutatorMethods,
    ...accessorMethods,
    ...iterationMethods,
]);
exports.rule = {
    meta: (0, helpers_1.generateMeta)(meta_1.meta, {
        messages: {
            reviewUsageOfIdentifier: 'Review this usage of "{{identifierName}}" as it can only be empty here.',
        },
    }),
    create(context) {
        return {
            'Program:exit': (node) => {
                reportEmptyCollectionsUsage(context.sourceCode.getScope(node), context);
            },
        };
    },
};
function reportEmptyCollectionsUsage(scope, context) {
    if (scope.type !== 'global') {
        scope.variables.forEach(v => {
            reportEmptyCollectionUsage(v, context);
        });
    }
    scope.childScopes.forEach(childScope => {
        reportEmptyCollectionsUsage(childScope, context);
    });
}
function reportEmptyCollectionUsage(variable, context) {
    if (variable.references.length <= 1) {
        return;
    }
    if (variable.defs.some(d => d.type === 'Parameter' || d.type === 'ImportBinding')) {
        // Bound value initialized elsewhere, could be non-empty.
        return;
    }
    const readingUsages = [];
    let hasAssignmentOfEmptyCollection = false;
    for (const ref of variable.references) {
        if (ref.isWriteOnly()) {
            if (isReferenceAssigningEmptyCollection(ref)) {
                hasAssignmentOfEmptyCollection = true;
            }
            else {
                // There is at least one operation that might make the collection non-empty.
                // We ignore the order of usages, and consider all reads to be safe.
                return;
            }
        }
        else if (isReadingCollectionUsage(ref)) {
            readingUsages.push(ref);
        }
        else {
            // some unknown operation on the collection.
            // To avoid any FPs, we assume that it could make the collection non-empty.
            return;
        }
    }
    if (hasAssignmentOfEmptyCollection) {
        readingUsages.forEach(ref => {
            context.report({
                messageId: 'reviewUsageOfIdentifier',
                data: {
                    identifierName: ref.identifier.name,
                },
                node: ref.identifier,
            });
        });
    }
}
function isReferenceAssigningEmptyCollection(ref) {
    const declOrExprStmt = (0, helpers_1.findFirstMatchingAncestor)(ref.identifier, n => n.type === 'VariableDeclarator' || n.type === 'ExpressionStatement');
    if (declOrExprStmt) {
        if (declOrExprStmt.type === 'VariableDeclarator' && declOrExprStmt.init) {
            return isEmptyCollectionType(declOrExprStmt.init);
        }
        if (declOrExprStmt.type === 'ExpressionStatement') {
            const { expression } = declOrExprStmt;
            return (expression.type === 'AssignmentExpression' &&
                (0, helpers_1.isReferenceTo)(ref, expression.left) &&
                isEmptyCollectionType(expression.right));
        }
    }
    return false;
}
function isEmptyCollectionType(node) {
    if (node && node.type === 'ArrayExpression') {
        return node.elements.length === 0;
    }
    else if (node && (node.type === 'CallExpression' || node.type === 'NewExpression')) {
        return (0, helpers_1.isIdentifier)(node.callee, ...helpers_1.collectionConstructor) && node.arguments.length === 0;
    }
    return false;
}
function isReadingCollectionUsage(ref) {
    return isStrictlyReadingMethodCall(ref) || isForIterationPattern(ref) || isElementRead(ref);
}
function isStrictlyReadingMethodCall(usage) {
    const { parent } = usage.identifier;
    if (parent && parent.type === 'MemberExpression') {
        const memberExpressionParent = parent.parent;
        if (memberExpressionParent && memberExpressionParent.type === 'CallExpression') {
            return (0, helpers_1.isIdentifier)(parent.property, ...strictlyReadingMethods);
        }
    }
    return false;
}
function isForIterationPattern(ref) {
    const forInOrOfStatement = (0, helpers_1.findFirstMatchingAncestor)(ref.identifier, n => n.type === 'ForOfStatement' || n.type === 'ForInStatement');
    return forInOrOfStatement && forInOrOfStatement.right === ref.identifier;
}
function isElementRead(ref) {
    const { parent } = ref.identifier;
    return (parent &&
        parent.type === 'MemberExpression' &&
        parent.computed &&
        !isElementWrite(parent));
}
function isElementWrite(memberExpression) {
    const ancestors = (0, helpers_1.ancestorsChain)(memberExpression, new Set());
    const assignment = ancestors.find(n => n.type === 'AssignmentExpression');
    if (assignment && assignment.operator === '=') {
        return [memberExpression, ...ancestors].includes(assignment.left);
    }
    return false;
}
//# sourceMappingURL=rule.js.map