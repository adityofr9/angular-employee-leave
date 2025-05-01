import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { AbstractApiService } from 'src/app/core/pipe/jsonrpc';
import { environment } from 'src/environments/environment';

export enum events_endpoint {
  events = '/cms/v1/events',
  sidebar = '/cms/v1/events/active',
}

@Injectable({
  providedIn: 'root',
})
export class EventsService extends AbstractApiService<any> {
  constructor(http: HttpClient) {
    super(http, 'null');
  }

  put_withParam(data: any, endpointURL: string, params?:any) {
    let param = new HttpParams({fromObject: params}).toString()
    return lastValueFrom(this.http.put<any>(`${environment.apiUrl}`+(endpointURL ? endpointURL : this.path) + (param ? '?'+param : ''), data))
  }
}
