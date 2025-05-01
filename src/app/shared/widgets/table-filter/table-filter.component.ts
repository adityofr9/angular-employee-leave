import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { QueryParams } from 'src/app/core/models/query-params.model';
import * as moment from 'moment';

@Component({
  selector: 'app-table-filter',
  templateUrl: './table-filter.component.html',
  styleUrls: ['./table-filter.component.scss']
})

export class TableFilterComponent implements OnInit, OnChanges {
  @Input() query!: QueryParams;
  @Input() usersList: any[] = [];
  @Input() actionsList: any[] = [];
  @Input() sourcesList: any[] = [];

  @Output() filterEvent: EventEmitter<any> = new EventEmitter();

  selectedUsers: any[] = [];
  selectedCin: any[] = [];
  selectedActions: any[] = [];
  selectedSources: any[] = [];

  oriUserList: any[] = [];
  oriActList: any[] = [];
  oriSrcList: any[] = [];

  startDate: any;
  startTime: any;
  endDate: any;
  endTime: any;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.oriActList = Object.assign([], this.actionsList);
    this.oriSrcList = Object.assign([], this.sourcesList);
    this.oriUserList = Object.assign([], this.usersList);
  }

  onBlur(event: any, type: string) {
    // console.log(event, type);
  }

  onShow(event: any, type: string) {
    const newValue = moment(event?.element?.textContent , 'HH:mm').toDate();
    if (type == 'start') {
      this.startTime = newValue;
    } else {
      this.endTime = newValue;
    }
  }

  filter(element: any, event: any) {
    // console.log(element, event);
    return element.filter(event.target.value);

  }

  reset() {
    this.selectedUsers = [];
    this.selectedCin = [];
    this.selectedActions = [];
    this.selectedSources = [];
    this.startDate = null;
    this.startTime = null;
    this.endDate = null;
    this.endTime = null;

    const filterParams: any = {
      users: '',
      action: '',
      sources: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
    };
    this.filterEvent.emit(filterParams);
  }

  getLimitTime(type: any) {
    const stDate = this.startDate ? moment(this.startDate).format('YYYY-MM-DD') : null;
    const edDate = this.endDate ? moment(this.endDate).format('YYYY-MM-DD') : null;
    if (type == 'start') {
      return stDate == edDate ? this.endTime : null ;
    } else {
      return stDate == edDate ? this.startTime : null;
    }
  }

  applyFilter() {
    const filterParams: any = {
      users: this.selectedUsers.map(user => user.value),
      actions: this.selectedActions.map(action => action.value),
      sources: this.selectedSources.map(source => source.value),
      startDate: this.startDate ? moment(this.startDate).format('YYYY-MM-DD') : '',
      endDate: this.endDate ? moment(this.endDate).format('YYYY-MM-DD') : '',
      startTime: this.startTime ? moment(this.startTime).format('HH:mm') + ':00' : '',
      endTime: this.endTime ? moment(this.endTime).format('HH:mm') + ':00' : '',
    };

    this.filterEvent.emit(filterParams);
  }

  updateOptions(event: any, field: string) {
    if (field) {
      switch (field) {
        case 'users':
          let arrU = this.sortedList(this.selectedUsers, this.usersList, this.oriUserList);
          this.usersList = arrU;
          break;
        case 'actions':
          let arrA = this.sortedList(this.selectedActions, this.actionsList, this.oriActList);
          this.actionsList = arrA;
          break;
        case 'sources':
          let arrS = this.sortedList(this.selectedSources, this.sourcesList, this.oriSrcList);
          this.sourcesList = arrS;
          break;
        default:
          break;
      }
    }
  }

  sortedList(selectedList: any[], currentlist: any[], originalList: any[]) {
    currentlist = Object.assign([], originalList);
    selectedList.forEach((element, index) => {
        let indexJ = currentlist.findIndex((item: any) => item == element);
        if (indexJ > -1) {
          currentlist.splice(indexJ, 1);
        }
    });

    let result = selectedList.concat(currentlist);
    return result;
  }
}
