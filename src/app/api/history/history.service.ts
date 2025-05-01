import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { AbstractApiService } from 'src/app/core/pipe/jsonrpc';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoryService extends AbstractApiService<any> {

  constructor(http: HttpClient) {
    super(http, '');
  }

  async GET_LIST(params?: any): Promise<any> {
    let param = new HttpParams({ fromObject: params }).toString();

    return lastValueFrom(
      this.http.get<any>(
        `${environment.apiUrl}/history` + (param ? '?' + param : '')
      )
    ).then((res: any) => {
      return res;
    });
  }

}
