"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorate = decorate;
const helpers_1 = require("../helpers");
const meta_1 = require("./meta");
function decorate(rule) {
    return (0, helpers_1.interceptReport)({
        ...rule,
        meta: (0, helpers_1.generateMeta)(meta_1.meta, rule.meta),
    }, (context, reportDescriptor) => {
        if ('node' in reportDescriptor) {
            const { node, ...rest } = reportDescriptor;
            const { declarations: [firstDecl, ..._], } = node;
            const varToken = context.sourceCode.getTokenBefore(firstDecl.id);
            const identifierEnd = firstDecl.id.loc.end;
            if (varToken == null) {
                // impossible
                return;
            }
            context.report({
                loc: {
                    start: varToken.loc.start,
                    end: identifierEnd,
                },
                ...rest,
            });
        }
    });
}
//# sourceMappingURL=decorator.js.map