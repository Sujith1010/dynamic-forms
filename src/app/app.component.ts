import { Component } from '@angular/core';
import { ApiService } from './api.service';
import {
  ISingleInputStructure,
  RuleGroupTableStructure,
} from './dynamic-form/form.interface';
import * as _ from 'lodash';
import { disableInterface, IruleParent, RuleGroup, UpdateJsonFormValue, UWRuleTableStructure } from './app.interface';
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
      this.ruleGroups[key].forEach((rule: UWRuleTableStructure) => {
        let formGroup: Record<string, any> = {};
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

 async onSubmit(ruleId: number) {
    console.log(this.JsonResponse.response, ruleId);
    const form = this.dynamicForms[ruleId];
    let previousJsonData:UWRuleTableStructure[]= this.JsonResponse?.response.filter((jsonData:UWRuleTableStructure)=>jsonData.uw_rule_id ==ruleId)
    if (form.valid&&previousJsonData.length) {
      let updateJsonFormValue:UpdateJsonFormValue = {
        groupRuleId:previousJsonData[0].uw_rule_group_id,
        uwRuleId:previousJsonData[0].uw_rule_id,
        previousValue:JSON.stringify(previousJsonData[0].form_config),
        updatedData:JSON.stringify(form.value),
        updatedBy:"sujith"
      }
     await this.apiService.putApiCall("group-rule/update-rule-group",updateJsonFormValue);
     alert("updated successfully")
    } else {
      console.log('Form is invalid');
    }
  }

  async ruleStatusChange(ruleGroupName: string , ruleId: number | null, state:string ){
    let matchedRuleGroup = this.ruleGroups[ruleGroupName] as UWRuleTableStructure[]
    const ruleGroupId = matchedRuleGroup[0].uw_rule_group_id
    try {
      const apiPayload:disableInterface = {
        groupRuleId: ruleGroupId,
        ruleId: ruleId,
        disableRuleGroup: state.trim().toLocaleLowerCase() == 'disable'? ruleGroupId ? 1 : 0 : ruleGroupId ? 0 : 1,
        disableRule: state.trim().toLocaleLowerCase() == 'disable'? ruleId ? 1 : 0: ruleGroupId ? 0 : 1,
      }
      console.log(apiPayload)
      let apiResponse = await this.apiService.putApiCall('group-rule/rule-status', apiPayload);
      console.log("apiResponse", apiResponse)
      if (apiResponse.statusCode == 200) {
        console.log(`Successfully ${state}d the group`);
      }
      else {
        console.log("Something went wrong");
      }
    }
    catch (exception) {
      console.log(exception)
    }
  }
}
