import { Component } from '@angular/core';
import { ApiService } from './api.service';
import {
  ISingleInputStructure,
  RuleGroupTableStructure,
} from './dynamic-form/form.interface';
import * as _ from 'lodash';
import { IruleParent, RuleGroup, UWRuleTableStructure } from './app.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  ruleGroups!: any;
  groupRuleTypes: string[] = [];
  formStructure: ISingleInputStructure[] = [];
  dynamicForms: Record<string, FormGroup> = {}; // Dictionary to hold forms
  transformedRuleGroups: IruleParent = {};
  JsonResponse:any;
  constructor(private apiService: ApiService, private fb: FormBuilder) {}



  async ngOnInit() {
    let apiResponse = await this.apiService.getApiCall('group-rule/josndriven');
    // console.log(apiResponse.response);
    this.JsonResponse =apiResponse;
    this.ruleGroups = _.groupBy(
      apiResponse.response,
      'group_name'
    ) as IruleParent;

    console.log('ruleGroups', this.ruleGroups);
    this.groupRuleTypes = Object.keys(this.ruleGroups);
    // console.log("group rules-------->",this.groupRuleTypes);
    // console.log("ruleGroups----------->",this.ruleGroups)

    this.groupRuleTypes.forEach((key) => {
      let formGroup: Record<string, any> = {};
      this.ruleGroups[key].forEach((rule: UWRuleTableStructure) => {
        rule.form_config = JSON.parse(rule.form_config);
        if (Array.isArray(rule.form_config)) {
          rule.form_config.forEach((control) => {
            let controlValidators: Validators[] = [];
            if (control.validations) { 
              control.validations.forEach(
                (validation: {
                  name: string;
                  validator: string;
                  message: string;
                }) => {
                  if (validation.validator === 'required')
                    controlValidators.push(Validators.required);
                  if (validation.validator === 'email')
                    controlValidators.push(Validators.email);
                }
              );
            }
            formGroup[control.name] = [control.value || '', controlValidators];
          });

          this.dynamicForms[rule.uw_rule_id] = this.fb.group(formGroup);
        }
      });
      formGroup={}
    });
    this.transformedRuleGroups = this.ruleGroups;
    console.log('dynamicForm', this.dynamicForms);
  }
  getErrorMessage(control: any) {
    const formGroup = this.dynamicForms[control.uw_rule_group_id];
    const formControl = formGroup?.get(control.name);

    if (!formControl) {
      return '';
    }

    for (let validation of control.validations) {
      if (formControl.hasError(validation.name)) {
        return validation.message;
      }
    }
    return '';
  }

  onSubmit(ruleId: number) {
    console.log(this.JsonResponse.response, ruleId);
    const form = this.dynamicForms[ruleId];
    let previousJsonData:UWRuleTableStructure[]= this.JsonResponse?.response.filter((jsonData:UWRuleTableStructure)=>jsonData.uw_rule_id ==ruleId)
    if (form.valid&&previousJsonData.length) {
      let updateJsonFormValue = {
        groupRuleId:previousJsonData[0].uw_rule_group_id,
        uwRuleId:previousJsonData[0].uw_rule_id,
        previousValue:JSON.stringify(previousJsonData[0].form_config),
        updatedData:JSON.stringify(form.value),
        updatedBy:"sujith"
      }
      console.log("upated values------->",updateJsonFormValue)
    } else {
      console.log('Form is invalid');
    }
  }
}
