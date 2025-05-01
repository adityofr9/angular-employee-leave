import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { HeaderFilterModule } from '../header-filter/header-filter.module';
import { HeaderButtonActionModule } from '../header-button-action/header-button-action.module';
import { BreadCrumbModule } from '../breadcrumb/breadcrumb.module';
import { HeaderSearchModule } from "../header-search/header-search.module";

@NgModule({
  imports: [
    CommonModule,
    HeaderFilterModule,
    HeaderButtonActionModule,
    BreadCrumbModule,
    HeaderSearchModule
],
  declarations: [HeaderComponent],
  exports: [HeaderComponent]
})
export class HeaderModule { }
