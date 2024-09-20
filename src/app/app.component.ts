import { Component } from '@angular/core';
import { ApiService } from './api.service';
import { ISingleInputStructure, RuleGroupTableStructure } from './dynamic-form/form.interface';
import * as _ from "lodash";
import { IruleParent, RuleGroup } from './app.interface';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  ruleGroups!:IruleParent;
  groupRuleTypes: string[] = []
  formStructure: ISingleInputStructure[] = [];
  dynamicForm: FormGroup = this.fb.group({});
  constructor(private apiService: ApiService, private fb: FormBuilder) { }
  

  async ngOnInit() {
    let apiResponse = await this.apiService.getApiCall("group-rule/josndriven");
    console.log(apiResponse.response)
    this.ruleGroups = _.groupBy(apiResponse.response, "group_name") as IruleParent

    console.log("ruleGroups", this.ruleGroups)
    this.groupRuleTypes = Object.keys(this.ruleGroups);
    console.log(this.groupRuleTypes);

    
    this.groupRuleTypes.forEach((key) => {
      this.ruleGroups[key].forEach((rule) => {
        rule.form_config = typeof (rule.form_config) === "string" ? JSON.parse(rule.form_config) : null
        // rule.form_config.forEach((control) => {
        //   let controlValidators: Validators[] = [];
    
        //   if (control.validations) {
        //     ``;
        //     control.validations.forEach(
        //       (validation: {
        //         name: string;
        //         validator: string;
        //         message: string;
        //       }) => {
        //         if (validation.validator === 'required')
        //           controlValidators.push(Validators.required);
        //         if (validation.validator === 'email')
        //           controlValidators.push(Validators.email);
        //         // Add more built-in validators as needed
        //       }
        //     );
        //   }
      })
    })

    


  }

}
