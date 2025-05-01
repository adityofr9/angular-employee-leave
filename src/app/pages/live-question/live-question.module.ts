import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiveQuestionComponent } from './live-question.component';
import { RouterModule, Routes } from '@angular/router';
import { PrimengModule } from 'src/app/shared/library/primeng.module';

const routes: Routes = [
  {
    path: '', redirectTo: '/u/dashboard', pathMatch: 'full'
  },
  {
    path: ':id',
    children: [
      { path: '', redirectTo: '/u/dashboard', pathMatch: 'full' },
      {
        path: 'live-question',
        children: [
          { path: '', component: LiveQuestionComponent },
          { path: ':scheduleId', component: LiveQuestionComponent },
        ]
      },
    ]
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    PrimengModule,
  ],
  declarations: [LiveQuestionComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LiveQuestionModule { }
