"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorate = decorate;
const helpers_1 = require("../helpers");
const meta_1 = require("./meta");
function decorate(rule) {
    return (0, helpers_1.interceptReportForReact)({
        ...rule,
        meta: (0, helpers_1.generateMeta)(meta_1.meta, rule.meta),
    }, reportExempting(hasSpreadOperator));
}
function reportExempting(exemptionCondition) {
    return (context, reportDescriptor) => {
        // check if node has attribute containing spread operator
        if ('node' in reportDescriptor) {
            const { node, ...rest } = reportDescriptor;
            if (exemptionCondition(node)) {
                return;
            }
            context.report({
                node,
                ...rest,
            });
        }
    };
}
function hasSpreadOperator(node) {
    return (node.type === 'JSXElement' &&
        node.openingElement.attributes.some(attribute => attribute.type === 'JSXSpreadAttribute'));
}
//# sourceMappingURL=decorator.js.map