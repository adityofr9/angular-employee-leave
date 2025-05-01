import { NgModule } from '@angular/core';
import { NoPreloading, RouterModule, Routes } from '@angular/router';

import { AuthGuard, LoginGuard } from './core/guards/auth.guard';
import { Page404Component } from './authentication/page404/page404.component';

const routes: Routes = [
  { path: '', redirectTo: '/authentication/login', pathMatch: 'full' },

  //Login page if no login
  {
    path: 'authentication',
    canActivate: [LoginGuard],
    loadChildren: () =>
      import('./authentication/authentication.module').then(
        (m) => m.AuthenticationModule
      ),
  },

  //Dashboard if login only
  {
    path: 'u',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./layout/main-layout/main-layout.module').then(
        (m) => m.MainLayoutModule
      ),
  },

  {
    path: 'generate',
    loadChildren: () =>
      import('./generate-model-interface/generate-model-interface.module').then(
        (m) => m.GenerateModelInterfaceModule
      ),
  },

  {
    path: 'live',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/live-question/live-question.module').then(
        (m) => m.LiveQuestionModule
      ),
  },

  { path: '**', component: Page404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: NoPreloading })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
