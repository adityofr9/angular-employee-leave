import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ROUTES } from 'src/app/layout/menu-item';
import { ngxPermissionsGuard } from 'ngx-permissions';
import { FormComponent } from './form/form.component';
import { ListComponent } from './list/list.component';
import { HelperService } from 'src/app/services/helper.service';
import { LibaryModule } from 'src/app/shared/library/library.module';
import { RouterModule, Routes } from '@angular/router';
import { DirectiveSharedModule } from 'src/app/core/directive/directive.module';
import { ParticipantsComponent } from './participants.component';
// import { ParticipantsComponent } from './participants/participants.component';

const slug = HelperService.findRouteByTitle?.(ROUTES, 'Event')?.toLowerCase() || '';
const routes: Routes = [
  {
    path: '', // Root path inherits the parent eventId parameter
    component: ParticipantsComponent,
    title: 'Participants',
    // canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: slug + '.view',
        redirectTo: 'u/dashboard'
      },
    },
    children: [
      {
        path: '', // Matches 'events/:eventId/participants'
        component: ListComponent,
      },
      {
        path: 'add', // Matches 'events/:eventId/participants/add'
        component: FormComponent,
        // canActivate: [ngxPermissionsGuard],
        data: {
          permissions: {
            only: slug + '_CREATE',
            redirectTo: 'u/master-event'
          },
        },
      },
      {
        path: 'edit/:id', // Matches 'events/:eventId/participants/edit/:participantId'
        component: FormComponent,
        // canActivate: [ngxPermissionsGuard],
        data: {
          permissions: {
            only: slug + '.view',
            redirectTo: 'u/master-event'
          },
        },
      },
    ]
  }
];


@NgModule({
  imports: [
    CommonModule,
    LibaryModule,
    RouterModule.forChild(routes),
    DirectiveSharedModule,
  ],
  declarations: [
    ListComponent,
    FormComponent,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class ParticipantsModule { }
