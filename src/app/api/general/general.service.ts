import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractApiService } from 'src/app/core/pipe/jsonrpc';

export enum general_endpoint {

  // Attribute
  role = '/cms/v1/attribute/role',
  events = '/cms/v1/events',
  attrib_accounts= '/cms/v1/attribute/accounts',
}

@Injectable({
  providedIn: 'root'
})
export class GeneralService extends AbstractApiService<any> {

constructor(
  http:HttpClient
) {
  super(http, 'null');
 }

}
