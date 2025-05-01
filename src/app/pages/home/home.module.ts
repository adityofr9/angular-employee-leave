import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule, Routes } from '@angular/router';
import { LibaryModule } from 'src/app/shared/library/library.module';
import { BreadCrumbModule } from "../../shared/widgets/breadcrumb/breadcrumb.module";
import { NgApexchartsModule } from 'ng-apexcharts';

const routes: Routes = [
  {
    path:'', component:HomeComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    LibaryModule,
    BreadCrumbModule,
    NgApexchartsModule
],
  declarations: [
    HomeComponent,
  ],
  schemas:[
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class HomeModule { }
