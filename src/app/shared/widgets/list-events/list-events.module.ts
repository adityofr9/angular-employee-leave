import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrimengModule } from '../../library/primeng.module';
import { ListEventsComponent } from './list-events.component';
import { NgxPermissionsModule } from 'ngx-permissions';

@NgModule({
  imports: [
    CommonModule,
    PrimengModule,
    NgxPermissionsModule.forChild()
  ],
  declarations: [ListEventsComponent],
  exports: [ListEventsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ListEventsModule { }
