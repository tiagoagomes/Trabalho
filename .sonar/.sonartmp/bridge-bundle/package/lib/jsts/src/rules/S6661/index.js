"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
const core_1 = require("../core");
const decorator_1 = require("./decorator");
const posix_1 = require("path/posix");
const helpers_1 = require("../helpers");
const decorated = (0, decorator_1.decorate)(core_1.eslintRules['prefer-object-spread']);
exports.rule = {
    meta: decorated.meta,
    create(context) {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#browser_compatibility
        if (!(0, helpers_1.isSupported)((0, posix_1.dirname)((0, helpers_1.toUnixPath)(context.filename)), { node: '8.3.0' })) {
            return {};
        }
        return decorated.create(context);
    },
};
//# sourceMappingURL=index.js.map