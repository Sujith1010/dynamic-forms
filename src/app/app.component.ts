import { Component } from '@angular/core';
import { ApiService } from './api.service';
import { RuleGroupTableStructure } from './dynamic-form/form.interface';
import * as _ from "lodash";
import { IruleParent, RuleGroup } from './app.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  ruleGroups!:IruleParent;
  groupRuleTypes :string[] = []
  constructor(private apiService:ApiService ) {}
  async ngOnInit() {
    let apiResponse = await this.apiService.getApiCall("group-rule/josndriven");
    console.log(apiResponse.response)
    this.ruleGroups = _.groupBy(apiResponse.response, "group_name") as IruleParent

    console.log("ruleGroups", this.ruleGroups)
    this.groupRuleTypes = Object.keys(this.ruleGroups);
    console.log(this.groupRuleTypes);


    


  }

}
