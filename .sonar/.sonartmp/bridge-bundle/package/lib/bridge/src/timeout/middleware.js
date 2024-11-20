"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeoutMiddleware = timeoutMiddleware;
const timeout_1 = __importDefault(require("./timeout"));
/**
 * Express.js middleware that timeouts after a lapse of time and triggers a function.
 * @param f the timeout function
 * @param delay the timeout delay
 * @returns the timeout middleware with capability to stop the internal timeout
 */
function timeoutMiddleware(f, delay) {
    const timeout = new timeout_1.default(f, delay);
    timeout.start();
    let cancelled = false;
    return {
        middleware(_request, response, next) {
            if (!cancelled) {
                timeout.stop();
                response.on('finish', function () {
                    timeout.start();
                });
            }
            next();
        },
        cancel() {
            cancelled = true;
            timeout.stop();
        },
    };
}
//# sourceMappingURL=middleware.js.map