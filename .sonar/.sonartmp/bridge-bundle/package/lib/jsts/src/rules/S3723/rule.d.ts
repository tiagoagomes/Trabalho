import { Rule } from 'eslint';
/**
 * S1537 ('comma-dangle') and S3723 ('enforce-trailing-comma') both depend on the
 * same ESLint implementation, but the plugin doesn't allow rule key duplicates.
 */
export declare const rule: {
    meta: Rule.RuleMetaData;
    create(context: Rule.RuleContext): Rule.RuleListener;
    schema?: Rule.RuleMetaData["schema"];
};
