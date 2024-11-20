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
// https://sonarsource.github.io/rspec/#/rspec/S128/javascript
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
const helpers_1 = require("../helpers");
const meta_1 = require("./meta");
exports.rule = {
    meta: (0, helpers_1.generateMeta)(meta_1.meta, {
        messages: {
            switchEnd: 'End this switch case with an unconditional break, continue, return or throw statement.',
        },
    }),
    create(context) {
        let currentCodePath = null;
        let currentCodeSegment = null;
        let enteringSwitchCase = false;
        let currentSegments = new Set();
        const allCurrentSegments = [];
        const segmentsWithExit = new Set();
        const initialSegmentBySwitchCase = new Map();
        const switchCaseStack = [];
        function noComment(node) {
            return context.sourceCode.getCommentsAfter(node).length === 0;
        }
        function isAfterProcessExitCall(segment, initialSegment) {
            const stack = [];
            const visitedSegments = new Set();
            stack.push(segment);
            while (stack.length !== 0) {
                const current = stack.pop();
                visitedSegments.add(current.id);
                if (!segmentsWithExit.has(current.id)) {
                    if (current === initialSegment) {
                        return false;
                    }
                    current.prevSegments.filter(p => !visitedSegments.has(p.id)).forEach(p => stack.push(p));
                }
            }
            return true;
        }
        return {
            onCodePathStart(codePath) {
                currentCodePath = codePath;
                allCurrentSegments.push(currentSegments);
                currentSegments = new Set();
            },
            onCodePathEnd() {
                currentCodePath = currentCodePath.upper;
                currentSegments = allCurrentSegments.pop();
            },
            onCodePathSegmentStart(segment) {
                currentSegments.add(segment);
                currentCodeSegment = segment;
                if (enteringSwitchCase) {
                    initialSegmentBySwitchCase.set(switchCaseStack.pop(), currentCodeSegment);
                    enteringSwitchCase = false;
                }
            },
            onCodePathSegmentEnd(segment) {
                currentSegments.delete(segment);
            },
            onUnreachableCodePathSegmentStart(segment) {
                currentSegments.add(segment);
            },
            onUnreachableCodePathSegmentEnd(segment) {
                currentSegments.delete(segment);
            },
            CallExpression(node) {
                const callExpr = node;
                if (isProcessExitCall(callExpr)) {
                    segmentsWithExit.add(currentCodeSegment.id);
                }
            },
            SwitchCase(node) {
                enteringSwitchCase = true;
                switchCaseStack.push(node);
            },
            'SwitchCase:exit'(node) {
                const switchCase = node;
                const initialSegment = initialSegmentBySwitchCase.get(switchCase);
                const isReachable = Array.from(currentSegments).some(s => s.reachable && !isAfterProcessExitCall(s, initialSegment));
                const { cases } = (0, helpers_1.getParent)(context, node);
                if (isReachable &&
                    switchCase.consequent.length > 0 &&
                    cases[cases.length - 1] !== node &&
                    noComment(switchCase)) {
                    context.report({
                        messageId: 'switchEnd',
                        loc: context.sourceCode.getFirstToken(node).loc,
                    });
                }
            },
        };
    },
};
function isProcessExitCall(callExpr) {
    return (callExpr.callee.type === 'MemberExpression' &&
        callExpr.callee.object.type === 'Identifier' &&
        callExpr.callee.object.name === 'process' &&
        callExpr.callee.property.type === 'Identifier' &&
        callExpr.callee.property.name === 'exit');
}
//# sourceMappingURL=rule.js.map