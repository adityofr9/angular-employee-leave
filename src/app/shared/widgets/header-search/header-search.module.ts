import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderSearchComponent } from './header-search.component';
import { PrimengModule } from '../../library/primeng.module';

@NgModule({
  imports: [
    CommonModule,
    PrimengModule
  ],
  declarations: [HeaderSearchComponent],
  exports: [HeaderSearchComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HeaderSearchModule { }
