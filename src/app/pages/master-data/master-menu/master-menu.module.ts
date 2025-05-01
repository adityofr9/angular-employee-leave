import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MasterMenuComponent } from './master-menu.component';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { LibaryModule } from 'src/app/shared/library/library.module';
import { PopoupEditComponent } from './popoup-edit/popoup-edit.component';
import { FileUploadModule } from 'src/app/shared/widgets/file-upload/file-upload.module';
import { HelperService } from 'src/app/services/helper.service';
import { ROUTES } from 'src/app/layout/menu-item';
import { ngxPermissionsGuard } from 'ngx-permissions';

const slug = HelperService.findRouteByTitle?.(ROUTES, 'Master Menu')?.toUpperCase() || '';
const routes: Routes = [
  // {path:'user', component:ListComponent}
  {
    path: '',
    component: ListComponent,
    title: 'Master Menu',
    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: slug + '_VIEW',
        redirectTo: 'u/dashboard'
      },
    },
  },
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    LibaryModule,
    FileUploadModule
  ],
  declarations: [
    MasterMenuComponent,
    ListComponent,
    PopoupEditComponent,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class MasterMenuModule { }
