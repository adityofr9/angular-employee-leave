import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignInComponent } from './sign-in/sign-in.component';
import { Page404Component } from './page404/page404.component';
import { RouterModule, Routes } from '@angular/router';

import { LibaryModule } from '../shared/library/library.module';
import { SuccessComponent } from './success/success.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: SignInComponent,
  },
  {
    path: 'login/dev',
    component: SignInComponent,
  },
  {
    path: 'success',
    component: SuccessComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    LibaryModule
  ],
  declarations: [
    SignInComponent,
    Page404Component,
    SuccessComponent,
  ],
})
export class AuthenticationModule {}
