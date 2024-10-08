export interface ISingleInputStructure {
  type: string;
  label: string;
  name: string;
  value: string | number | boolean;
  options?: { label: string; value: number | string | boolean }[];
  validations?: {
    name: string;
    validator: string;
    message: string;
  }[];
}

export interface RuleGroupTableStructure {
uw_rule_group_id: number
rule_group_name: string
show_ui: number
apply_rule: number
created_by: number
disable_rule:number
user:string
created_date: string
modified_date:string
}
// export interface IConditionStructure {
//   field1: string
//   operator: string
//   field2 :string
// }
// export interface IEvaluationStructure {
//   condition_structure :IConditionStructure[]
// }
export interface UWRuleTableStructure {
uw_rule_id: number
uw_rule_group_id :number
form_config: string
form_name:string
evaluation: any //SHOULD CHANGE
show_ui: number
apply_rule: number
outcome: string
loading_premium: string
factor: string
created_by: string|number
created_date: string
modified_date:string
}