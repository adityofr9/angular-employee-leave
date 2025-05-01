import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-header-button-action',
  templateUrl: './header-button-action.component.html',
  styleUrls: ['./header-button-action.component.scss']
})
export class HeaderButtonActionComponent implements OnInit {
  @Input() actions: any[] = [];

  @Output() onAction = new EventEmitter();

  constructor() { }

  ngOnInit() { }

  action(slug: any) {
    this.onAction.emit({ data: slug });
  }

}
