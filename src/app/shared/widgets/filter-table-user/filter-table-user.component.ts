import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'filter-table-user',
  templateUrl: './filter-table-user.component.html',
  styleUrls: ['./filter-table-user.component.scss'],
})
export class FilterTableUserComponent implements OnInit, OnDestroy {
  @Input() fields: Array<any> = [];
  @Input() shadow: boolean = false;
  @Input() isConfirmed: boolean = false;
  @Input() value: any;
  @Input() isDefault: boolean = false;

  forms!: FormGroup;

  unsub: Subscription | undefined;

  form(name: string) {
    return this.forms.get(name);
  }

  @Output() onSubmitFilter = new EventEmitter();
  debounceTimeout: any;

  isClear = false;

  data: any;
  constructor(private fb: FormBuilder, private helper: HelperService) {}

  ngOnInit(): void {
    this.forms = this.fb.group({});
    this.setupForm();

    this.unsub = this.forms.valueChanges.subscribe((value) => {
      if (!value) {
        return;
      }
      let clear = Object.values(value).every(
        (val) => val === '' || val === null
      );
      if (!clear) {
        this.isClear = true;
      } else {
        this.isClear = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.unsub?.unsubscribe();
  }

  setupForm() {
    this.fields.forEach((field) => {
      if (Array.isArray(field.slug)) {
        // field.slug.forEach((slug: any) => {
        //   this.addFormControl(slug, [], field.value);
        // });
      } else {
        this.addFormControl(field.slug, [], field.value);
      }
    });
  }

  addFormControl(
    fieldName: string,
    validators: any[] = [],
    defaultValue: any = ''
  ) {
    this.forms!.addControl(
      fieldName,
      this.fb.control(defaultValue, validators)
    );
  }

  onChangeSelected(event: any, slug: string) {
    // slug = slug === 'role' ? 'roleId' : slug;
    console.log('val', event, slug);

    const acc: any = {};
    if (slug.toLocaleLowerCase().includes('status')) {
      acc[slug] =
        event?.value?.id ??
        event?.value?.value ??
        (event?.value?.name !== 'All' ? event?.value?.name : '') ??
        '';
    } else if (slug.toLocaleLowerCase().includes('issenior')) {
      acc[slug] =
        event?.value && event?.value?.id !== null ? event?.value?.id : '';
    } else {
      acc[slug] = event?.value?.id ?? '';
    }

    if (acc[slug] === '') {
      delete this.data[slug];
    }

    this.data = { ...this.data, ...acc };
    this.onSubmitFilter.emit(this.data);
  }

  onChangeDateRange(event: any, slug: any, calendar: any, multiData?: any) {
    const acc: any = {};

    if (Array.isArray(event)) {
      event.forEach((date: any, index: number) => {
        acc[index == 0 ? 'startDate' : 'endDate'] = date
          ? moment(date).format('YYYY-MM-DD')
          : '';
      });
    } else {
      acc[slug] = event ? moment(event).format('YYYY-MM-DD') : '';
    }

    if (acc['endDate']) {
      calendar.overlayVisible = false;
    }

    if (acc['endDate']) {
      if (multiData) {
        let d = {
          [multiData[0]]: acc['startDate'],
          [multiData[1]]: acc['endDate'],
        };

        this.data = { ...this.data, ...d };
        this.onSubmitFilter.emit(this.data);
      } else {
        this.data = { ...this.data, ...acc };
        this.onSubmitFilter.emit(this.data);
      }
    }
  }

  onChangeNewRange(event: any, slug: any, calendar: any) {
    const acc: any = {};
    if (!Array.isArray(event)) {
      return;
    }

    event.forEach((date: any, index: number) => {
      acc[index == 0 ? 'startDate' : 'endDate'] = date
        ? moment(date).format('YYYY-MM-DD')
        : '';
    });

    if (acc['endDate']) {
      calendar.overlayVisible = false;
      let obj = {
        [slug]: { startDate: acc['startDate'], endDate: acc['endDate'] },
      };
      this.data = { ...this.data, ...obj };
      this.onSubmitFilter.emit(this.data);
    }
  }

  onClear() {
    Object.keys(this.data).forEach((key) => {
      this.data[key] = '';
    });

    if (this.isDefault) {
      this.fields.forEach((field) => {
        this.forms.patchValue({ [field.slug]: field.value });
      });
      this.isClear = false;
    } else {
      this.forms.reset();
      this.onSubmitFilter.emit({
        ...this.data,
        ...{ startDate: '', endDate: '' },
      });
    }
  }

  onSearch(value: any, slug: string) {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      if (!value) {
        delete this.data[slug];
      }
      this.data = { ...this.data, ...{ [slug]: value ? value : '' } };
      this.onSubmitFilter.emit(this.data);
    }, 800);
  }

  onSubmit() {
    const formattedData = this.fields.reduce((acc, item) => {
      if (item.type === 'date') {
      } else if (item.type === 'selected') {
        if (item.slug == 'status') {
          acc[item.slug] =
            this.form(item.slug)?.value?.id ??
            this.form(item.slug)?.value?.value ??
            '';
        } else {
          acc[item.slug] = this.form(item.slug)?.value?.id ?? '';
        }
      } else {
        acc[item.slug] = this.form(item.slug)?.value ?? '';
      }
      return acc;
    }, {});

    this.onSubmitFilter.emit(formattedData);
  }
}
