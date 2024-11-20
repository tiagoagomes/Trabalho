"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorate = decorate;
const helpers_1 = require("../helpers");
const jsx_ast_utils_1 = require("jsx-ast-utils");
const meta_1 = require("./meta");
/**
 * This fix was introduced in eslint-plugin-jsx-a11y e6bfd5cb7c,
 * but the last release is almost a year old, so it doesn't include this.
 * When we update the dependency, we can remove this decorator.
 *
 * This will include the removal of:
 * - the `jsx-ast-utils` dependency
 * - its type definition `typings/jsx-ast-utils/index.d.ts`
 * - all files in the `rules/S6827/` directory
 */
function decorate(rule) {
    return (0, helpers_1.interceptReport)({
        ...rule,
        meta: (0, helpers_1.generateMeta)(meta_1.meta, {
            ...rule.meta,
            hasSuggestions: true,
        }),
    }, (context, reportDescriptor) => {
        const node = reportDescriptor.node;
        if ((0, jsx_ast_utils_1.hasAnyProp)(node.attributes, ['title', 'aria-label'])) {
            return;
        }
        context.report({ ...reportDescriptor });
    });
}
//# sourceMappingURL=decorator.js.map