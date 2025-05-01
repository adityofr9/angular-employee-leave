import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HeaderFilterComponent } from './header-filter.component';
import { PrimengModule } from '../../library/primeng.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimengModule
  ],
  declarations: [HeaderFilterComponent],
  exports: [HeaderFilterComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HeaderFilterModule {}
