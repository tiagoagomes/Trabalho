"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorate = decorate;
const helpers_1 = require("../helpers");
const meta_1 = require("./meta");
// core implementation of this rule raises issues on type exports
function decorate(rule) {
    return (0, helpers_1.interceptReport)({
        ...rule,
        meta: (0, helpers_1.generateMeta)(meta_1.meta, rule.meta),
    }, reportExempting(isTypeDeclaration));
}
function reportExempting(exemptionCondition) {
    return (context, reportDescriptor) => {
        if ('node' in reportDescriptor) {
            const node = reportDescriptor['node'];
            if (node.type === 'Identifier' && !exemptionCondition(node)) {
                context.report(reportDescriptor);
            }
        }
    };
}
function isTypeDeclaration(node) {
    return node.parent?.type === 'TSTypeAliasDeclaration';
}
//# sourceMappingURL=decorator.js.map