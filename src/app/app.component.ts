import { Component } from '@angular/core';
import { ApiService } from './api.service';
import { RuleGroupTableStructure } from './dynamic-form/form.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  ruleGroups:RuleGroupTableStructure[] = []
  constructor(private apiService:ApiService ) {}
  async ngOnInit() {
    this.ruleGroups = await this.apiService.getApiCall("group-rule/josndriven");
    console.log("ruleGroups", this.ruleGroups)
  }

}
