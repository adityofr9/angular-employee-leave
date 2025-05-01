import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Permissions } from 'src/app/core/models/general.model';
import { ROUTES } from 'src/app/layout/menu-item';

import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'list-events',
  templateUrl: './list-events.component.html',
  styleUrls: ['./list-events.component.scss']
})
export class ListEventsComponent implements OnInit, OnChanges {
  @Input() data!:any;
  @Output() deleteAction = new EventEmitter<any>();
  @Output() statusAction = new EventEmitter<any>();

  list:any[] = [];

  permission = '';
  state_permision = Permissions;

  constructor(
    private router: Router,
    private helper: HelperService,
    readonly title: Title,
  ) { }

  ngOnInit() {
    this.permission = this.helper.findRouteByTitle(ROUTES,'Master Event').toUpperCase();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.list = changes['data'].currentValue.result;
      this.list.forEach((item:any) => {
        item.labelName = this.helper.truncateText(item.name, 50);
      });
    }
  }

  onEdit(data:any) {
    this.router.navigateByUrl('/u/master-event/' + data.id);
  }

  onDelete(data:any) {
    this.deleteAction.emit(data);
  }

  onStatusChange(data:any) {
    this.statusAction.emit(data);
  }

  isSameDate(date1:any, date2:any) {
    return this.helper.isSameDate(date1, date2);
  }

}
