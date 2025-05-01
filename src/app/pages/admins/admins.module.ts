import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminsComponent } from './admins.component';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { LibaryModule } from 'src/app/shared/library/library.module';

const routes: Routes = [
  {
    path: '', redirectTo: 'list', pathMatch: 'full'
  },
  {
    path: 'list',
    component: ListComponent,
    title: 'History',
  },
];

@NgModule({
  imports: [
    LibaryModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    AdminsComponent,
    ListComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AdminsModule { }
