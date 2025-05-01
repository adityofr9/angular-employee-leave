import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { AbstractApiService } from 'src/app/core/pipe/jsonrpc';

export enum users_endpoint{
  user = '/cms/v1/users',
  assign = '/cms/v1/users/search-admin',
  assign_user = '/cms/v1/users/search-users-for-event',
}

@Injectable({
  providedIn: 'root',
})
export class UserService extends AbstractApiService<any> {

  public listAssign = new BehaviorSubject<any>(null)
  listAssign$ = this.listAssign.asObservable()

  constructor(http: HttpClient) {
    super(http, 'null');
  }

  GET_ListAssign() {
    const Query: QueryParams = Object.assign(
      {},
      QueryData,
      {
        limit: '',
        sortBy: 'name',
        direction: 'asc'
      });

    this.getAll(Query, users_endpoint.assign).then(
      (res) => {
        if (res.success) {
          // const reformatResult = res.data.result.map((item: any) => {
          //   return {
          //     label: item.cin + ' - ' + item.name,
          //     id: item.id,
          //   };
          // });
          this.listAssign.next(res.data);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
