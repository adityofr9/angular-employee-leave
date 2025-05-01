import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from './main-layout.component';
import { MainLayoutRoutes } from '../main-layout.routing';

import { LibaryModule } from 'src/app/shared/library/library.module';
import { SidebarComponent } from '../sidebar/sidebar';
import { HeaderComponent } from '../header/header';
import { FooterComponent } from '../footer/footer';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { IdleService } from 'src/app/services/idle.service';

@NgModule({
  imports: [
    CommonModule,
    MainLayoutRoutes,
    LibaryModule,
    LoadingBarRouterModule

  ],
  declarations: [
    MainLayoutComponent,
    SidebarComponent,
    HeaderComponent,
    FooterComponent

  ],
  providers: [IdleService],
})
export class MainLayoutModule { }
