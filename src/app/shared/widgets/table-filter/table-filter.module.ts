import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableFilterComponent } from './table-filter.component';

import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CalendarModule } from 'primeng/calendar';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    OverlayPanelModule,
    InputTextModule,
    InputGroupModule,
    FloatLabelModule,
    CalendarModule,
    NgSelectModule
  ],
  declarations: [TableFilterComponent],
  exports: [TableFilterComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TableFilterModule { }
