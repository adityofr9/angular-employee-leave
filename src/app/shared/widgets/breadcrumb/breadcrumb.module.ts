import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from './breadcrumb.component';
import { BreadcrumbModule } from 'primeng/breadcrumb';

@NgModule({
  imports: [
    CommonModule,
    BreadcrumbModule
  ],
  exports: [BreadcrumbComponent],
  declarations: [BreadcrumbComponent]
})
export class BreadCrumbModule { }
