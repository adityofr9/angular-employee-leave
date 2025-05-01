import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserManagementComponent } from './user-management.component';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { LibaryModule } from 'src/app/shared/library/library.module';
import { PaginatorBottomModule } from 'src/app/shared/widgets/paginator-bottom/paginator-bottom.module';

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
    CommonModule,
    LibaryModule,
    RouterModule.forChild(routes),
    PaginatorBottomModule,
  ],
  declarations: [
    UserManagementComponent,
    ListComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class UserManagementModule { }
