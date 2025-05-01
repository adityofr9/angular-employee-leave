import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MasterBoothComponent } from './master-booth.component';
import { RouterModule, Routes } from '@angular/router';
import { LibaryModule } from 'src/app/shared/library/library.module';
import { DetailComponent } from './detail/detail.component';
import { ListComponent } from './list/list.component';
import { PopoupCreateComponent } from './popoup-create/popoup-create.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { PopupSettingsComponent } from './popup-settings/popup-settings.component';
import { PopupUploadComponent } from './popup-upload/popup-upload.component';
import { FileUploadModule } from 'src/app/shared/widgets/file-upload/file-upload.module';
import { QuizComponent } from './quiz/quiz.component';
import { NgxPermissionsModule } from 'ngx-permissions';

const routes: Routes = [
  // {path:'user', component:ListComponent}
  {
    path: '',
    component: ListComponent,
  },
  {
    path: ':id',
    // path: ':id',
    // component: DetailComponent,
    // canActivate: [ngxPermissionsGuard],
    // data: {
    //   permissions: {
    //     only: slug + '_VIEW',
    //     redirectTo: 'u/master-event'
    //   },
    // },
    children: [
      { path: '', component: DetailComponent },
      { path: 'quiz', component: QuizComponent },
    ]

  },
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxPermissionsModule.forChild(),
    LibaryModule,
    NgSelectModule,
    FileUploadModule
  ],
  declarations: [
    MasterBoothComponent,
    ListComponent,
    DetailComponent,
    PopoupCreateComponent,
    PopupSettingsComponent,
    PopupUploadComponent,
    QuizComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class MasterBoothModule { }
