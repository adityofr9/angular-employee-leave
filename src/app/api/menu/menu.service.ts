import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { AbstractApiService } from 'src/app/core/pipe/jsonrpc';
import { environment } from 'src/environments/environment';

export enum menus_endpoint {
  menus = '/cms/v1/menus',
}

@Injectable({
  providedIn: 'root',
})
export class MenuService extends AbstractApiService<any> {
  constructor(http: HttpClient) {
    super(http, 'null');
  }

  put_withParam(data: any, endpointURL: string, params?:any) {
    let param = new HttpParams({fromObject: params}).toString()
    return lastValueFrom(this.http.put<any>(`${environment.apiUrl}`+(endpointURL ? endpointURL : this.path) + (param ? '?'+param : ''), data))
  }
}
