"use strict";
/*
 * SonarQube JavaScript Plugin
 * Copyright (C) 2011-2024 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
// https://sonarsource.github.io/rspec/#/rspec/S2598/javascript
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
exports.getVariablePropertyFromAssignment = getVariablePropertyFromAssignment;
const helpers_1 = require("../helpers");
const meta_1 = require("./meta");
const FORMIDABLE_MODULE = 'formidable';
const KEEP_EXTENSIONS = 'keepExtensions';
const UPLOAD_DIR = 'uploadDir';
const MULTER_MODULE = 'multer';
const STORAGE_OPTION = 'storage';
const DESTINATION_OPTION = 'destination';
const formidableObjects = new Map();
exports.rule = {
    meta: (0, helpers_1.generateMeta)(meta_1.meta, undefined, true),
    create(context) {
        return {
            NewExpression(node) {
                checkCallExpression(context, node);
            },
            CallExpression(node) {
                checkCallExpression(context, node);
            },
            AssignmentExpression(node) {
                visitAssignment(context, node);
            },
            Program() {
                formidableObjects.clear();
            },
            'Program:exit'() {
                formidableObjects.forEach(value => report(context, value.uploadDirSet, value.keepExtensions, value.callExpression));
            },
        };
    },
};
function checkCallExpression(context, callExpression) {
    const { callee } = callExpression;
    if (callee.type !== 'Identifier') {
        return;
    }
    const fqn = (0, helpers_1.getFullyQualifiedName)(context, callee);
    if (!fqn) {
        return;
    }
    const [moduleName] = fqn.split('.');
    if (moduleName === FORMIDABLE_MODULE) {
        checkFormidable(context, callExpression);
    }
    if (moduleName === MULTER_MODULE) {
        checkMulter(context, callExpression);
    }
}
function checkFormidable(context, callExpression) {
    if (callExpression.arguments.length === 0) {
        const formVariable = (0, helpers_1.getLhsVariable)(context, callExpression);
        if (formVariable) {
            formidableObjects.set(formVariable, {
                uploadDirSet: false,
                keepExtensions: false,
                callExpression,
            });
        }
        return;
    }
    const options = (0, helpers_1.getValueOfExpression)(context, callExpression.arguments[0], 'ObjectExpression');
    if (options) {
        report(context, !!(0, helpers_1.getProperty)(options, UPLOAD_DIR, context), keepExtensionsValue((0, helpers_1.getProperty)(options, KEEP_EXTENSIONS, context)?.value), callExpression);
    }
}
function checkMulter(context, callExpression) {
    if (callExpression.arguments.length === 0) {
        return;
    }
    const multerOptions = (0, helpers_1.getValueOfExpression)(context, callExpression.arguments[0], 'ObjectExpression');
    if (!multerOptions) {
        return;
    }
    const storagePropertyValue = (0, helpers_1.getProperty)(multerOptions, STORAGE_OPTION, context)?.value;
    if (storagePropertyValue) {
        const storageValue = (0, helpers_1.getValueOfExpression)(context, storagePropertyValue, 'CallExpression');
        if (storageValue) {
            const diskStorageCallee = getDiskStorageCalleeIfUnsafeStorage(context, storageValue);
            if (diskStorageCallee) {
                report(context, false, false, callExpression, (0, helpers_1.toSecondaryLocation)(diskStorageCallee, 'no destination specified'));
            }
        }
    }
}
function getDiskStorageCalleeIfUnsafeStorage(context, storageCreation) {
    const { arguments: args, callee } = storageCreation;
    if (args.length > 0 && isMemberWithProperty(callee, 'diskStorage')) {
        const storageOptions = (0, helpers_1.getValueOfExpression)(context, args[0], 'ObjectExpression');
        if (storageOptions && !(0, helpers_1.getProperty)(storageOptions, DESTINATION_OPTION, context)) {
            return callee;
        }
    }
    return false;
}
function isMemberWithProperty(expr, property) {
    return (expr.type === 'MemberExpression' &&
        expr.property.type === 'Identifier' &&
        expr.property.name === property);
}
function keepExtensionsValue(extensionValue) {
    if (extensionValue &&
        extensionValue.type === 'Literal' &&
        typeof extensionValue.value === 'boolean') {
        return extensionValue.value;
    }
    return false;
}
function visitAssignment(context, assignment) {
    const variableProperty = getVariablePropertyFromAssignment(context, assignment);
    if (!variableProperty) {
        return;
    }
    const { objectVariable, property } = variableProperty;
    const formOptions = formidableObjects.get(objectVariable);
    if (formOptions !== undefined) {
        if (property === UPLOAD_DIR) {
            formOptions.uploadDirSet = true;
        }
        if (property === KEEP_EXTENSIONS) {
            formOptions.keepExtensions = keepExtensionsValue(assignment.right);
        }
    }
}
/**
 * for `x.foo = 42` returns 'x' variable and 'foo' property string
 */
function getVariablePropertyFromAssignment(context, assignment) {
    if (assignment.left.type !== 'MemberExpression') {
        return undefined;
    }
    const memberExpr = assignment.left;
    if (memberExpr.object.type === 'Identifier' && memberExpr.property.type === 'Identifier') {
        const objectVariable = (0, helpers_1.getVariableFromName)(context, memberExpr.object.name, memberExpr);
        if (objectVariable) {
            return { objectVariable, property: memberExpr.property.name };
        }
    }
    return undefined;
}
function report(context, uploadDirSet, keepExtensions, callExpression, secondaryLocation) {
    let message;
    if (keepExtensions && uploadDirSet) {
        message = 'Restrict the extension of uploaded files.';
    }
    else if (!keepExtensions && !uploadDirSet) {
        message = 'Restrict folder destination of uploaded files.';
    }
    else if (keepExtensions && !uploadDirSet) {
        message = 'Restrict the extension and folder destination of uploaded files.';
    }
    if (message) {
        (0, helpers_1.report)(context, {
            message,
            node: callExpression.callee,
        }, secondaryLocation ? [secondaryLocation] : []);
    }
}
//# sourceMappingURL=rule.js.map