export interface RuleGroup {
    uw_rule_group_id: number
    group_name: string
    show_ui: number
    apply_rule: number
    created_by: string
    created_at: string
    updated_at: string
    uw_rule_id: number
    form_name: string
    form_config: string
    evaluation: string
    outcome: string
    loading_premium?: number
    factor?: string
  }

  export interface IruleParent{
        [key:string] :RuleGroup[]
  }