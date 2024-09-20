import { Component, OnInit } from '@angular/core';
import { RuleGroupTableStructure } from './form.interface';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css']
})
export class DynamicFormComponent implements OnInit {
  ruleGroups:RuleGroupTableStructure[] = []
  constructor() { }
  async ngOnInit() {
    
  }

}
