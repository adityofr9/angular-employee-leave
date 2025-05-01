import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SanitizerPipe } from 'src/app/core/pipe/sanitizer.pipe';

import { IconModule } from './icon/icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { MomentModule } from 'ngx-moment';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MenuModule } from 'headlessui-angular';

import { AlertErrorInputModule } from '../widgets/alert-error-input/alert-error-input.module';
import { ListEventsModule } from '../widgets/list-events/list-events.module';
import { HeaderModule } from '../widgets/header/header.module';
import { PopupFormModule } from 'src/app/popup/popup-form/popup-form.module';
import { PrimengModule } from './primeng.module';
import { PaginatorBottomModule } from '../widgets/paginator-bottom/paginator-bottom.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { PanelModule } from 'primeng/panel';
import { FilterTableUserModule } from '../widgets/filter-table-user/filter-table-user.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    IconModule,
    TranslateModule,
    // NgScrollbarModule
    MenuModule,
    MomentModule,
    AlertErrorInputModule,
    ListEventsModule,
    HeaderModule,
    PopupFormModule,
    PrimengModule,
    PaginatorBottomModule,
    PanelModule,
    FilterTableUserModule
  ],

  exports:[
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    IconModule,
    TranslateModule,
    MenuModule,
    SanitizerPipe,
    MomentModule,
    CarouselModule,
    AlertErrorInputModule,
    ListEventsModule,
    HeaderModule,
    PopupFormModule,
    PrimengModule,
    PaginatorBottomModule,
    NgxPermissionsModule,
    PanelModule,
    FilterTableUserModule
  ],
  declarations: [
    SanitizerPipe
  ]
})
export class LibaryModule { }
