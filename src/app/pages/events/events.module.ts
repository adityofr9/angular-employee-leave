import { ScheduleComponent } from './schedule/schedule.component';
import { BoothComponent } from './booth/booth.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsComponent } from './events.component';
import { ROUTES } from 'src/app/layout/menu-item';
import { ngxPermissionsGuard } from 'ngx-permissions';
import { ListComponent } from './list/list.component';
import { HelperService } from 'src/app/services/helper.service';
import { LibaryModule } from 'src/app/shared/library/library.module';
import { RouterModule, Routes } from '@angular/router';
import { DirectiveSharedModule } from 'src/app/core/directive/directive.module';
import { ParticipantsComponent } from './participants/participants.component';
import { DetailComponent } from './detail/detail.component';
import { PopoupCreateComponent } from './popoup-create/popoup-create.component';
// import { ParticipantsComponent } from './participants/participants.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { BannerComponent } from './banner/banner.component';
import { GeneralInfoComponent } from './general-info/general-info.component';
import { TabFormComponent } from './tab-form/tab-form.component';
import { ActivityLogsComponent } from './detail/activity-logs/activity-logs.component';
import { PopupBannerComponent } from './banner/popup-banner/popup-banner.component';
import { FileUploadModule } from 'src/app/shared/widgets/file-upload/file-upload.module';
import { DetailFormComponent } from './tab-form/detail-form/detail-form.component';
import { MenuSettingsComponent } from './menu-settings/menu-settings.component';
import { ListMenuComponent } from './menu-settings/list-menu/list-menu.component';
import { ActivitySettingsComponent } from './menu-settings/activity-settings/activity-settings.component';
import { PopupBoothComponent } from './booth/popup-booth/popup-booth.component';
import { PopupFormComponent } from './tab-form/popup-form/popup-form.component';
import { PopupRsvpComponent } from './detail/popup-rsvp/popup-rsvp.component';
import { CalendarDateFormatter, CalendarModule, CalendarNativeDateFormatter, DateAdapter, DateFormatterParams } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { HeaderComponent } from './schedule/header/header.component';
import { PopupCreateComponent } from './schedule/popup-create/popup-create.component';
import { PopupAddMenuComponent } from './menu-settings/popup-add-menu/popup-add-menu.component';
import { QuestionComponent } from './tab-form/question/question.component';
import { DetailScheduleComponent } from './schedule/detail-schedule/detail-schedule.component';
import { TableFilterModule } from 'src/app/shared/widgets/table-filter/table-filter.module';


const slug = HelperService.findRouteByTitle?.(ROUTES, 'Master Event')?.toUpperCase() || '';
const routes: Routes = [
  {
    path: '', redirectTo: 'list', pathMatch: 'full'
  },
  {
    path: 'list', component: ListComponent,
    title: 'Master Event',
    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: slug + '_VIEW',
        redirectTo: 'u/dashboard'
      },
    },
  },
  {
    path: ':id',
    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: slug + '_VIEW',
        redirectTo: 'u/master-event'
      },
    },
    children: [
      { path: '', component: DetailComponent },
      { path: 'activity-logs', component: ActivityLogsComponent },
      {
        path: 'form/:subId',
        children: [
          { path: '', component: DetailFormComponent },
          { path: 'question', component: QuestionComponent },
        ]
      },
      {
        path:'form',
        pathMatch: 'full',
        redirectTo: ''
      },
      { path: 'menu-settings', component: MenuSettingsComponent },
      { path: 'leaderboard', component: LeaderboardComponent },
      {
        path: 'schedule/:subId',
        children: [
          { path: '', component: DetailScheduleComponent }
        ]
      },
      {
        path:'schedule',
        pathMatch: 'full',
        redirectTo: ''
      }
    ]
  },
];

@NgModule({
  imports: [
    CommonModule,
    LibaryModule,
    RouterModule.forChild(routes),
    DirectiveSharedModule,
    NgSelectModule,
    FileUploadModule,
    TableFilterModule,
    CalendarModule.forRoot(
      {
        provide: DateAdapter,
        useFactory: adapterFactory,
      },
      {
        dateFormatter: {
          provide: CalendarDateFormatter,
          useClass: EventsModule,
        },
      }
    ),
  ],
  declarations: [
    EventsComponent, // Make sure EventsComponent is declared here
    ListComponent,
    DetailComponent,
    ParticipantsComponent,
    PopoupCreateComponent,
    BannerComponent,
    GeneralInfoComponent,
    BoothComponent,
    TabFormComponent,
    ScheduleComponent,
    ActivityLogsComponent,
    PopupBannerComponent,
    DetailFormComponent,
    MenuSettingsComponent,
    ListMenuComponent,
    ActivitySettingsComponent,
    PopupBoothComponent,
    PopupFormComponent,
    PopupRsvpComponent,
    LeaderboardComponent,
    HeaderComponent,
    PopupCreateComponent,
    PopupAddMenuComponent,
    QuestionComponent,
    DetailScheduleComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class EventsModule extends CalendarNativeDateFormatter {
  public override weekViewHour({ date, locale }: DateFormatterParams): string {
    return new Intl.DateTimeFormat('id-ID', {
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  }

  public override dayViewHour({ date, locale }: DateFormatterParams): string {
    return new Intl.DateTimeFormat('id-ID', {
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  }
}
