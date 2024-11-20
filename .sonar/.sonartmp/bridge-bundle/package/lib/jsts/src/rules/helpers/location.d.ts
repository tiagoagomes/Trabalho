import * as estree from 'estree';
import { AST, Rule } from 'eslint';
import RuleContext = Rule.RuleContext;
import ReportDescriptor = Rule.ReportDescriptor;
import { TSESLint, TSESTree } from '@typescript-eslint/utils';
export type LocationHolder = AST.Token | TSESTree.Node | estree.Node | {
    loc: AST.SourceLocation;
};
export interface IssueLocation {
    column: number;
    line: number;
    endColumn: number;
    endLine: number;
    message?: string;
}
export interface EncodedMessage {
    message: string;
    cost?: number;
    secondaryLocations: IssueLocation[];
}
export declare function encodeContents(message: string, secondaryLocations?: IssueLocation[], cost?: number): string;
/**
 * Encodes an ESLint descriptor message with secondary locations
 *
 * The encoding consists in stringifying a JavaScript object with
 * `JSON.stringify` that includes the ESLint's descriptor message
 * along with second location information: message and location.
 *
 * This encoded message is eventually decoded by the linter wrapper
 * on the condition that the rule definition of the flagged problem
 * defines the internal `sonar-runtime` parameter in its schema.
 *
 * @param reportDescriptor the ESLint report descriptor
 * @param secondaryLocations the secondary locations
 * @param cost the optional cost to fix
 * @returns the encoded message with secondary locations
 */
export declare function toEncodedMessage(reportDescriptor: Rule.ReportDescriptor, secondaryLocations?: IssueLocation[], cost?: number): Rule.ReportDescriptor;
export declare function toSecondaryLocation(startLoc: LocationHolder): IssueLocation;
export declare function toSecondaryLocation(startLoc: LocationHolder, message: string): IssueLocation;
export declare function toSecondaryLocation(startLoc: LocationHolder, endLoc: LocationHolder): IssueLocation;
export declare function toSecondaryLocation(startLoc: LocationHolder, endLoc: LocationHolder, message: string): IssueLocation;
/**
 * Wrapper for `context.report`, supporting secondary locations and cost.
 * Encode those extra information in the issue message when rule is executed
 * in Sonar* environment.
 */
export declare function report(context: RuleContext, reportDescriptor: ReportDescriptor, secondaryLocations?: IssueLocation[], cost?: number): void;
export declare function expandMessage(message: string, reportDescriptorData: Record<string, unknown> | undefined): string;
/**
 * Returns a location of the "main" function token:
 * - function name for a function declaration, method or accessor
 * - "function" keyword for a function expression
 * - "=>" for an arrow function
 */
export declare function getMainFunctionTokenLocation<T = string>(fn: TSESTree.FunctionLike, parent: TSESTree.Node | undefined, context: TSESLint.RuleContext<string, T[]>): TSESTree.SourceLocation;
export declare function getFirstTokenAfter<T = string>(node: TSESTree.Node, context: TSESLint.RuleContext<string, T[]>): TSESLint.AST.Token | null;
export declare function getFirstToken<T = string>(node: TSESTree.Node, context: TSESLint.RuleContext<string, T[]>): TSESLint.AST.Token;
