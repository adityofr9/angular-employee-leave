import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterTableUserComponent } from './filter-table-user.component';
import { PrimengModule } from '../../library/primeng.module';
import { SearchModule } from '../search/search.module';

@NgModule({
  imports: [
    CommonModule,
    PrimengModule,
    ReactiveFormsModule,
    SearchModule,
    FormsModule,
  ],
  declarations: [FilterTableUserComponent],
  exports: [FilterTableUserComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FilterTableUserModule {}
