import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { ApiService } from './api.service';
import {
  ISingleInputStructure,
  RuleGroupTableStructure,
} from './dynamic-form/form.interface';
import * as _ from 'lodash';
import { disableInterface, EvaluateInput, IParsedFormConfig, IruleParent, RuleGroup, UpdateJsonFormValue, UWRuleTableStructure } from './app.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';


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
  memberCount: number = 0;
  evaluateRuleData: EvaluateInput[] = [];
  JsonResponse: any;

  @ViewChild('fileInput') public fileInput!: TemplateRef<unknown>;

  constructor(private apiService: ApiService, private fb: FormBuilder) {}

  async ngOnInit() {
    let apiResponse = await this.apiService.getApiCall('group-rule/josndriven');
    // console.log(apiResponse.response);
    this.JsonResponse = apiResponse.response;
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
        let parsedFormConfig = JSON.parse(
          rule.form_config as string
        ) as IParsedFormConfig;
        rule.form_config = parsedFormConfig;
        console.log('rule.form_config', rule.form_config);
        console.log('parsedFormConfig', parsedFormConfig);
        if (Array.isArray(rule.form_config.uiRenderingFields)) {
          rule.form_config.uiRenderingFields.forEach((control) => {
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
    let previousJsonData: UWRuleTableStructure[] =
      this.JsonResponse?.response.filter(
        (jsonData: UWRuleTableStructure) => jsonData.uw_rule_id == ruleId
      );
    if (form.valid && previousJsonData.length) {
      let updateJsonFormValue: UpdateJsonFormValue = {
        groupRuleId: previousJsonData[0].uw_rule_group_id,
        uwRuleId: previousJsonData[0].uw_rule_id,
        previousValue: JSON.stringify(previousJsonData[0].form_config),
        updatedData: JSON.stringify(form.value),
        updatedBy: 'sujith',
      };
      await this.apiService.putApiCall(
        'group-rule/update-rule-group',
        updateJsonFormValue
      );
      alert('updated successfully');
    } else {
      console.log('Form is invalid');
    }
  }

  async ruleStatusChange(
    ruleGroupName: string,
    ruleId: number | null,
    state: string
  ) {
    let matchedRuleGroup = this.ruleGroups[
      ruleGroupName
    ] as UWRuleTableStructure[];
    const ruleGroupId = matchedRuleGroup[0].uw_rule_group_id;
    try {
      const apiPayload: disableInterface = {
        groupRuleId: ruleGroupId,
        ruleId: ruleId,
        disableRuleGroup:
          state.trim().toLocaleLowerCase() == 'disable'
            ? ruleGroupId
              ? 1
              : 0
            : ruleGroupId
            ? 0
            : 1,
        disableRule:
          state.trim().toLocaleLowerCase() == 'disable'
            ? ruleId
              ? 1
              : 0
            : ruleGroupId
            ? 0
            : 1,
      };
      console.log(apiPayload);
      let apiResponse = await this.apiService.putApiCall(
        'group-rule/rule-status',
        apiPayload
      );
      console.log('apiResponse', apiResponse);
      if (apiResponse.statusCode == 200) {
        console.log(`Successfully ${state}d the group`);
      } else {
        console.log('Something went wrong');
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  getMembers() {
    return Array.from({ length: this.memberCount }, (_, i) => i);
  }

  updateEvaluateRuleData() {
    // Ensure evaluateRuleData is initialized for each member
    this.evaluateRuleData = Array.from({ length: this.memberCount }, () => ({
      age: 0,
      gender: '',
      nationality: '',
      benefits: [],
    }));
  }

  async evaluateRule() {
    let data: EvaluateInput[] = this.evaluateRuleData;
    if (!this.evaluateRuleData) {
      data = [
        {
          age: 78,
          gender: 'male',
          benefits: ['worldwide', '20%copay'],
          nationality: 'indian',
        },
        {
          age: 30,
          gender: 'male',
          benefits: ['worldwide'],
          nationality: 'india',
        },
        {
          age: 30,
          gender: 'female',
          benefits: ['worldwide', '20%copay'],
          nationality: 'canada',
        },
        {
          age: 30,
          gender: 'female',
          benefits: ['20%copay'],
          nationality: 'usa',
        },
      ];
    }
    const result = await this.apiService.putApiCall(
      'group-rule/eveluate-rule',
      data
    );
    console.log(result);
  }

  async convertToBuffer(file: File) {
    let bufferValue;
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
          bufferValue = reader.result;
          resolve(bufferValue);
        };
      } catch (exception) {
        reject(exception);
      }
    });
  }

  async uploadUwRules(event: any, uwRuleId: string, fileInput: any) {
    let formData = new FormData();
    if (!event.target.files) return;
    const file = event.target.files[0];
    this.fileValidation(file, uwRuleId as unknown as number)
    formData.append('tableConfig', file);
    formData.append('uwRuleId', uwRuleId);
    await this.apiService.postApiCall(
      'group-rule/upload-table-config',
      formData
    );
    fileInput.value = '';
  }

  async downloadFile(uwRuleId: string, downloadFileType: string) {
    const data = { uwRuleId, downloadFileType };
    console.log(data);

    const urlResponse = await this.apiService.postApiCall(
      'group-rule/dowload-file',
      data
    );
    console.log(urlResponse.response);
    window.open(urlResponse.response.signedUrl, '_blank');
  }

  async fileValidation(file: File, uwRuleId: number) {
    const matchingRule = this.JsonResponse.find(
      (rule: UWRuleTableStructure) => rule.uw_rule_id == uwRuleId
    );
    const excelValidationColumns =
      matchingRule.form_config.excelValidationColumns;
    const dataInFile = await this.documentToJson(file);
        console.log(matchingRule);
        console.log(excelValidationColumns);
        console.log(dataInFile);
  }

  async documentToJson(file:File) {
    try {
      return new Promise(function (resolve, reject) {
        if (
          file.type ==
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
          setTimeout(() => {
            let a = file;
            let fileReaderxlsx = new FileReader();
            fileReaderxlsx.readAsArrayBuffer(a);
            fileReaderxlsx.onload = async (_e) => {
              let b: any = fileReaderxlsx.result;
              var xlsxdata = new Uint8Array(b);
              var array = new Array();
              for (var i = 0; i != xlsxdata.length; ++i) {
                array[i] = String.fromCharCode(xlsxdata[i]);
              }

              var bstr = array.join('');
              var workbook = XLSX.read(bstr, {
                type: 'binary',
              });
              var first_sheet_name = workbook.SheetNames[0];
              var worksheet = workbook.Sheets[first_sheet_name];
              let arraylis = XLSX.utils.sheet_to_json(worksheet);

              resolve(arraylis);
            };
          }, 300);
        }
      });
    } catch {
      return null;
    }
  }
}
