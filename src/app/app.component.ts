import { AfterViewInit, Component } from '@angular/core';
import { ApiService } from './api.service';
import {
  ISingleInputStructure,
  RuleGroupTableStructure,
} from './dynamic-form/form.interface';
import * as _ from 'lodash';
import { disableInterface, EvaluateInput, IDynamicTable, IDynamicTableHeader, IruleParent, RuleGroup, UpdateJsonFormValue, UWRuleTableStructure } from './app.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit{
  ruleGroups!: any;
  groupRuleTypes: string[] = [];
  formStructure: ISingleInputStructure[] = [];
  dynamicForms: Record<string, FormGroup> = {}; // Dictionary to hold forms
  transformedRuleGroups: IruleParent = {};
  memberCount: number = 0;
  evaluateRuleData: EvaluateInput[] = [];
  JsonResponse: any;
  

  //Dynamic Table Variables
  tableData:IDynamicTable = {headers:[], data:[]}
  allHeaders :IDynamicTableHeader[]= []

  constructor(private apiService: ApiService, private fb: FormBuilder) { }
  

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

          //Dynamic Table Rendering
          this.tableData = { headers: [], data: [] };
          this.allHeaders = []
        }
      });
    });
    this.transformedRuleGroups = this.ruleGroups;
    console.log('dynamicForm', this.dynamicForms);


  }

  ngAfterViewInit(): void {
    this.groupRuleTypes.forEach((key) => {
      this.ruleGroups[key].forEach((rule: UWRuleTableStructure) => {
        if (Array.isArray(rule.form_config)) {
          //Dynamic Table Rendering
          const parsedTableConfig = JSON.parse(rule.table_config);
          console.log(parsedTableConfig, '---parsedTableConfig');
          const headersArray = parsedTableConfig.columns as Array<string>;
          const tableBody = parsedTableConfig.data;
          console.log('headersArray', headersArray);
          console.log('tableBody', tableBody);
          const headersForTable = headersArray.map(
            (header, index) => ({ key: header, index } as IDynamicTableHeader)
          );
          this.renderTable(headersForTable, tableBody);
        }
      });
    });
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

  getMembers() {
    return Array.from({ length: this.memberCount }, (_, i) => i);
  }

  updateEvaluateRuleData() {
    // Ensure evaluateRuleData is initialized for each member
    this.evaluateRuleData = Array.from({ length: this.memberCount }, () => ({ age: 0, gender: '', nationality:'', benefits:[]}));
  }

  async evaluateRule() {
    let data: EvaluateInput[] = this.evaluateRuleData
    if(!this.evaluateRuleData){
     data  = [
      {
        age: 78,
        gender: 'male',
        benefits: ['worldwide', '20%copay'],
        nationality: 'indian'
      },
      {
        age: 30,
        gender: 'male',
        benefits: ['worldwide'],
        nationality: 'india'
      },
      {
        age: 30,
        gender: 'female',
        benefits: ['worldwide', '20%copay'],
        nationality: 'canada'
      },
      {
        age: 30,
        gender: 'female',
        benefits: ['20%copay'],
        nationality: 'usa'
      },
      ]
    }
    const result =  await this.apiService.putApiCall('group-rule/eveluate-rule', data);
    console.log(result)
  }

  
  renderTable(headers: IDynamicTableHeader[], data: any[]) {
    this.tableData = {
      headers: headers.filter(header => header.isSelected),
      data:data
    }
    this.allHeaders = headers
  }
}
