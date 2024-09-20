import { Component, OnInit } from '@angular/core';
import { RuleGroupTableStructure } from './form.interface';
import { ApiService } from '../api.service';
@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css']
})
export class DynamicFormComponent  {
  // ruleGroups:RuleGroupTableStructure[] = []
  // constructor(private apiService:ApiService ) {}
  // async ngOnInit() {
  //   this.ruleGroups = await this.apiService.getApiCall("group-rule/josndriven");
  //   console.log("ruleGroups", this.ruleGroups)
  // }

}
