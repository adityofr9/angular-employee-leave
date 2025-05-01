import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-header-filter',
  templateUrl: './header-filter.component.html',
  styleUrls: ['./header-filter.component.scss']
})
export class HeaderFilterComponent implements OnInit {
  @Input() fields: any[] = [];

  @Output() onFilter = new EventEmitter();

  data: any;

  forms!: FormGroup;
  showHypen: boolean = false;

  minDate: Date | undefined;
  maxDate: Date | undefined;

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.forms = this.fb.group({});
    this.setupForm();

    if (!!this.fields && this.fields.length > 0) {
      this.showHypen = this.fields.some(field => field.slug === 'startDate') && this.fields.some(field => field.slug === 'endDate');
    }
  }

  setupForm(){
    if (!!this.fields && this.fields.length > 0) {
      this.fields.forEach((field) => {
        this.addFormControl(field.slug, [],field.value);
      })
    }
  }
  addFormControl(fieldName: string, validators: any[] = [],defaultValue:any = '') {
    this.forms!.addControl(fieldName, this.fb.control(defaultValue, validators));
  }

  getFormControl(name: string) {
    return this.forms?.controls[name];
  }

  onChangeDateRange(event:any, slug:any, calendar:any) {
    const acc: any = {};

    if (Array.isArray(event)) {
      event.forEach((date:any, index:number) => {
        acc[index == 0 ? 'startDate' : 'endDate'] = date ? moment(date).format('YYYY-MM-DD') : '';
      });
    } else {
      acc[slug] = event ? moment(event).format('YYYY-MM-DD') : '';
    }

    if (slug === 'startDate' || slug === 'endDate') {
      const startDateField = this.fields.find(field => field.slug === 'startDate');
      const endDateField = this.fields.find(field => field.slug === 'endDate');

      if (startDateField && endDateField) {
        if (slug === 'startDate') {
          endDateField.options.minDate = acc['startDate'] ? new Date(acc['startDate']) : null;
        } else if (slug === 'endDate') {
          startDateField.options.maxDate = acc['endDate'] ? new Date(acc['endDate']) : null;
        }
      }
    }

    this.data = {...this.data, ...acc};
    this.onFilter.emit(this.data);
  }
}
