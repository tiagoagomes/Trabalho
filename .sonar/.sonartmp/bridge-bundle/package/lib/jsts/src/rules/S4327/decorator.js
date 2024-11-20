"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorate = decorate;
const helpers_1 = require("../helpers");
const meta_1 = require("./meta");
// core implementation of this rule raises false positives for generators
function decorate(rule) {
    return (0, helpers_1.interceptReport)({
        ...rule,
        meta: (0, helpers_1.generateMeta)(meta_1.meta, rule.meta),
    }, reportExempting(isReferencedInsideGenerators));
}
function reportExempting(exemptionCondition) {
    return (context, reportDescriptor) => {
        if ('node' in reportDescriptor) {
            const node = reportDescriptor['node'];
            if (!exemptionCondition(context, node)) {
                context.report(reportDescriptor);
            }
        }
    };
}
function isReferencedInsideGenerators(context, node) {
    const variable = (0, helpers_1.getVariableFromName)(context, node.name, node);
    if (variable) {
        for (const reference of variable.references) {
            let scope = reference.from;
            while (scope !== null && !scope.variables.includes(variable)) {
                if (isGenerator(scope.block)) {
                    return true;
                }
                scope = scope.upper;
            }
        }
    }
    return false;
    function isGenerator(node) {
        return ((node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') &&
            node.generator === true);
    }
}
//# sourceMappingURL=decorator.js.map