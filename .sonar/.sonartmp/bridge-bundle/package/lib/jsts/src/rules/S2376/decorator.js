"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorate = decorate;
const helpers_1 = require("../helpers");
const meta_1 = require("./meta");
function decorate(rule) {
    return (0, helpers_1.interceptReport)({
        ...rule,
        meta: (0, helpers_1.generateMeta)(meta_1.meta, rule.meta),
    }, reportExempting(isDecoratedSetterWithAngularInput));
}
function reportExempting(exemptionCondition) {
    return (context, reportDescriptor) => {
        if ('node' in reportDescriptor) {
            const def = reportDescriptor['node'];
            if (!exemptionCondition(def)) {
                context.report(reportDescriptor);
            }
        }
    };
}
function isDecoratedSetterWithAngularInput(def) {
    const { kind, decorators } = def;
    return (kind === 'set' &&
        decorators !== undefined &&
        decorators.some(decorator => decorator.expression.type === 'CallExpression' &&
            decorator.expression.callee.type === 'Identifier' &&
            decorator.expression.callee.name === 'Input'));
}
//# sourceMappingURL=decorator.js.map