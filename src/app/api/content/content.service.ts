import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractApiService } from 'src/app/core/pipe/jsonrpc';

export enum content_endpoint{
  events = '/cms/v1/events',

}

@Injectable({
  providedIn: 'root'
})
export class ContentService  extends AbstractApiService<any> {

  constructor(
    http:HttpClient
  ) {
    super(http, 'null');
   }

}
