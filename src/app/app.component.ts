import { Component } from '@angular/core';
import { ApiService } from './api.service';
import { RuleGroupTableStructure } from './dynamic-form/form.interface';
import * as _ from "lodash";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  ruleGroups = {}
  constructor(private apiService:ApiService ) {}
  async ngOnInit() {
    let apiResponse = await this.apiService.getApiCall("group-rule/josndriven");
    this.ruleGroups = _.groupBy(apiResponse.response, "group_name")

    console.log("ruleGroups", this.ruleGroups)


  }

}
