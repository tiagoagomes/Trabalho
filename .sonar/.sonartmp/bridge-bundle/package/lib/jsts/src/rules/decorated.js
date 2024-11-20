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
Object.defineProperty(exports, "__esModule", { value: true });
exports.S6535 = exports.S131 = exports.S1534 = exports.S107 = exports.S1438 = exports.S3512 = exports.S6557 = exports.S6666 = exports.S6661 = exports.S6606 = exports.S4156 = exports.S6598 = exports.S4138 = exports.S6572 = exports.S3498 = exports.S3504 = exports.S6647 = exports.S6676 = exports.S1068 = exports.S905 = exports.S1763 = exports.S6747 = exports.S3696 = exports.S4327 = exports.S7060 = exports.S6679 = exports.S6571 = exports.S6440 = exports.S2814 = exports.S6544 = exports.S6660 = exports.S2189 = exports.S6788 = exports.S1116 = exports.S6643 = exports.S4023 = exports.S1186 = exports.S6551 = exports.S4275 = exports.S2430 = exports.S4084 = exports.S6853 = exports.S6749 = exports.S5254 = exports.S1788 = exports.S1105 = exports.S6844 = exports.S6827 = exports.S1077 = exports.S2376 = void 0;
exports.S2688 = void 0;
var S2376_1 = require("./S2376"); // accessor-pairs
Object.defineProperty(exports, "S2376", { enumerable: true, get: function () { return S2376_1.rule; } });
var S1077_1 = require("./S1077"); // alt-text
Object.defineProperty(exports, "S1077", { enumerable: true, get: function () { return S1077_1.rule; } });
var S6827_1 = require("./S6827"); // anchor-has-content
Object.defineProperty(exports, "S6827", { enumerable: true, get: function () { return S6827_1.rule; } });
var S6844_1 = require("./S6844"); // anchor-is-valid
Object.defineProperty(exports, "S6844", { enumerable: true, get: function () { return S6844_1.rule; } });
var S1105_1 = require("./S1105"); // brace-style
Object.defineProperty(exports, "S1105", { enumerable: true, get: function () { return S1105_1.rule; } });
var S1788_1 = require("./S1788"); // default-param-last
Object.defineProperty(exports, "S1788", { enumerable: true, get: function () { return S1788_1.rule; } });
var S5254_1 = require("./S5254"); // html-has-lang
Object.defineProperty(exports, "S5254", { enumerable: true, get: function () { return S5254_1.rule; } });
var S6749_1 = require("./S6749"); // jsx-no-useless-fragment
Object.defineProperty(exports, "S6749", { enumerable: true, get: function () { return S6749_1.rule; } });
var S6853_1 = require("./S6853"); // label-has-associated-control
Object.defineProperty(exports, "S6853", { enumerable: true, get: function () { return S6853_1.rule; } });
var S4084_1 = require("./S4084"); // media-has-caption
Object.defineProperty(exports, "S4084", { enumerable: true, get: function () { return S4084_1.rule; } });
var S2430_1 = require("./S2430"); // new-cap
Object.defineProperty(exports, "S2430", { enumerable: true, get: function () { return S2430_1.rule; } });
var S4275_1 = require("./S4275"); // no-accessor-field-mismatch
Object.defineProperty(exports, "S4275", { enumerable: true, get: function () { return S4275_1.rule; } });
var S6551_1 = require("./S6551"); // no-base-to-string
Object.defineProperty(exports, "S6551", { enumerable: true, get: function () { return S6551_1.rule; } });
var S1186_1 = require("./S1186"); // no-empty-function
Object.defineProperty(exports, "S1186", { enumerable: true, get: function () { return S1186_1.rule; } });
var S4023_1 = require("./S4023"); // no-empty-interface
Object.defineProperty(exports, "S4023", { enumerable: true, get: function () { return S4023_1.rule; } });
var S6643_1 = require("./S6643"); // no-extend-native
Object.defineProperty(exports, "S6643", { enumerable: true, get: function () { return S6643_1.rule; } });
var S1116_1 = require("./S1116"); // no-extra-semi
Object.defineProperty(exports, "S1116", { enumerable: true, get: function () { return S1116_1.rule; } });
var S6788_1 = require("./S6788"); // no-find-dom-node
Object.defineProperty(exports, "S6788", { enumerable: true, get: function () { return S6788_1.rule; } });
var S2189_1 = require("./S2189"); // no-infinite-loop
Object.defineProperty(exports, "S2189", { enumerable: true, get: function () { return S2189_1.rule; } });
var S6660_1 = require("./S6660"); // no-lonely-if
Object.defineProperty(exports, "S6660", { enumerable: true, get: function () { return S6660_1.rule; } });
var S6544_1 = require("./S6544"); // no-misused-promises
Object.defineProperty(exports, "S6544", { enumerable: true, get: function () { return S6544_1.rule; } });
var S2814_1 = require("./S2814"); // no-redeclare
Object.defineProperty(exports, "S2814", { enumerable: true, get: function () { return S2814_1.rule; } });
var S6440_1 = require("./S6440"); // rules-of-hooks
Object.defineProperty(exports, "S6440", { enumerable: true, get: function () { return S6440_1.rule; } });
var S6571_1 = require("./S6571"); // no-redundant-type-constituents
Object.defineProperty(exports, "S6571", { enumerable: true, get: function () { return S6571_1.rule; } });
var S6679_1 = require("./S6679"); // no-self-compare
Object.defineProperty(exports, "S6679", { enumerable: true, get: function () { return S6679_1.rule; } });
var S7060_1 = require("./S7060"); // no-self-import
Object.defineProperty(exports, "S7060", { enumerable: true, get: function () { return S7060_1.rule; } });
var S4327_1 = require("./S4327"); // no-this-alias
Object.defineProperty(exports, "S4327", { enumerable: true, get: function () { return S4327_1.rule; } });
var S3696_1 = require("./S3696"); // no-throw-literal
Object.defineProperty(exports, "S3696", { enumerable: true, get: function () { return S3696_1.rule; } });
var S6747_1 = require("./S6747"); // no-unknown-property
Object.defineProperty(exports, "S6747", { enumerable: true, get: function () { return S6747_1.rule; } });
var S1763_1 = require("./S1763"); // no-unreachable
Object.defineProperty(exports, "S1763", { enumerable: true, get: function () { return S1763_1.rule; } });
var S905_1 = require("./S905"); // no-unused-expressions
Object.defineProperty(exports, "S905", { enumerable: true, get: function () { return S905_1.rule; } });
var S1068_1 = require("./S1068"); // no-unused-private-class-members
Object.defineProperty(exports, "S1068", { enumerable: true, get: function () { return S1068_1.rule; } });
var S6676_1 = require("./S6676"); // no-useless-call
Object.defineProperty(exports, "S6676", { enumerable: true, get: function () { return S6676_1.rule; } });
var S6647_1 = require("./S6647"); // no-useless-constructor
Object.defineProperty(exports, "S6647", { enumerable: true, get: function () { return S6647_1.rule; } });
var S3504_1 = require("./S3504"); // no-var
Object.defineProperty(exports, "S3504", { enumerable: true, get: function () { return S3504_1.rule; } });
var S3498_1 = require("./S3498"); // object-shorthand
Object.defineProperty(exports, "S3498", { enumerable: true, get: function () { return S3498_1.rule; } });
var S6572_1 = require("./S6572"); // prefer-enum-initializers
Object.defineProperty(exports, "S6572", { enumerable: true, get: function () { return S6572_1.rule; } });
var S4138_1 = require("./S4138"); // prefer-for-of
Object.defineProperty(exports, "S4138", { enumerable: true, get: function () { return S4138_1.rule; } });
var S6598_1 = require("./S6598"); // prefer-function-type
Object.defineProperty(exports, "S6598", { enumerable: true, get: function () { return S6598_1.rule; } });
var S4156_1 = require("./S4156"); // prefer-namespace-keyword
Object.defineProperty(exports, "S4156", { enumerable: true, get: function () { return S4156_1.rule; } });
var S6606_1 = require("./S6606"); // prefer-nullish-coalescing
Object.defineProperty(exports, "S6606", { enumerable: true, get: function () { return S6606_1.rule; } });
var S6661_1 = require("./S6661"); // prefer-object-spread
Object.defineProperty(exports, "S6661", { enumerable: true, get: function () { return S6661_1.rule; } });
var S6666_1 = require("./S6666"); // prefer-spread
Object.defineProperty(exports, "S6666", { enumerable: true, get: function () { return S6666_1.rule; } });
var S6557_1 = require("./S6557"); // prefer-string-starts-ends-with
Object.defineProperty(exports, "S6557", { enumerable: true, get: function () { return S6557_1.rule; } });
var S3512_1 = require("./S3512"); // prefer-template
Object.defineProperty(exports, "S3512", { enumerable: true, get: function () { return S3512_1.rule; } });
var S1438_1 = require("./S1438"); // semi
Object.defineProperty(exports, "S1438", { enumerable: true, get: function () { return S1438_1.rule; } });
var S107_1 = require("./S107"); // sonar-max-params
Object.defineProperty(exports, "S107", { enumerable: true, get: function () { return S107_1.rule; } });
var S1534_1 = require("./S1534"); // sonar-no-dupe-keys
Object.defineProperty(exports, "S1534", { enumerable: true, get: function () { return S1534_1.rule; } });
var S131_1 = require("./S131"); // switch-without-default
Object.defineProperty(exports, "S131", { enumerable: true, get: function () { return S131_1.rule; } });
var S6535_1 = require("./S6535"); // unnecessary-character-escapes
Object.defineProperty(exports, "S6535", { enumerable: true, get: function () { return S6535_1.rule; } });
var S2688_1 = require("./S2688"); // use-isnan
Object.defineProperty(exports, "S2688", { enumerable: true, get: function () { return S2688_1.rule; } });
//# sourceMappingURL=decorated.js.map