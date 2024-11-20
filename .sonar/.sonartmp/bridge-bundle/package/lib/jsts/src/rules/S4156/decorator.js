"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorate = decorate;
const helpers_1 = require("../helpers");
const meta_1 = require("./meta");
function decorate(rule) {
    return (0, helpers_1.interceptReport)({
        ...rule,
        meta: (0, helpers_1.generateMeta)(meta_1.meta, rule.meta),
    }, (context, descriptor) => {
        const { node } = descriptor;
        const moduleKeyword = context.sourceCode.getFirstToken(node, token => token.value === 'module');
        if (moduleKeyword?.loc) {
            context.report({ ...descriptor, loc: moduleKeyword.loc });
        }
        else {
            context.report(descriptor);
        }
    });
}
//# sourceMappingURL=decorator.js.map