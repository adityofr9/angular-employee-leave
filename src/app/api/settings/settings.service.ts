import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractApiService } from 'src/app/core/pipe/jsonrpc';

export enum setting_endpoint{
  admin = '/cms/v1/am/admin',
  account = '/cms/v1/accounts',

}

@Injectable({
  providedIn: 'root'
})
export class SettingsService extends AbstractApiService<any> {

  constructor(
    http:HttpClient
  ) {
    super(http, 'null');
   }

}
