import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorBottomComponent } from './paginator-bottom.component';
import { PrimengModule } from '../../library/primeng.module';

@NgModule({
  imports: [
    CommonModule,
    PrimengModule,
  ],
  declarations: [PaginatorBottomComponent],
  exports:[PaginatorBottomComponent]
})
export class PaginatorBottomModule { }
