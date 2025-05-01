import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractApiService } from 'src/app/core/pipe/jsonrpc';

export enum dashboard_endpoint{
  summary = '/cms/v1/ms/branch/summary-dashboard',
  user_by_age = '/cms/v1/ms/branch/user-by-age',
  channel_and_content = '/cms/v1/ms/branch/channel-and-content',
  active_user_segmentation = '/cms/v1/ms/branch/active-user-segmentation',
  activity_user_apps = '/cms/v1/ms/branch/activity-user-apps',
  member_feedback = '/cms/v1/ms/branch/member-feedback',
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends AbstractApiService<any> {

  constructor(http: HttpClient) {
    super(http, '');
  }

}
