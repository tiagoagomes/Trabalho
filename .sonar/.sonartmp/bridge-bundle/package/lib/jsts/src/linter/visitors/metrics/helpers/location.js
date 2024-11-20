"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertLocation = convertLocation;
/**
 * Converts an ESLint location into a metric location
 * @param loc the ESLint location to convert
 * @returns the converted location
 */
function convertLocation(loc) {
    return {
        startLine: loc.start.line,
        startCol: loc.start.column,
        endLine: loc.end.line,
        endCol: loc.end.column,
    };
}
//# sourceMappingURL=location.js.map