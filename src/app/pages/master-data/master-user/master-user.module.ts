import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MasterUserComponent } from './master-user.component';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { LibaryModule } from 'src/app/shared/library/library.module';
import { HelperService } from 'src/app/services/helper.service';
import { ROUTES } from 'src/app/layout/menu-item';
import { ngxPermissionsGuard } from 'ngx-permissions';

const slug = HelperService.findRouteByTitle?.(ROUTES, 'Master User')?.toUpperCase() || '';
const routes: Routes = [
  {
    path:'',
    component: ListComponent,
    title: 'Master User',
    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: slug + '_VIEW',
        redirectTo: 'u/dashboard'
      },
    },
  }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    LibaryModule,
  ],
  declarations: [
    MasterUserComponent,
    ListComponent
  ]
})
export class MasterUserModule { }
