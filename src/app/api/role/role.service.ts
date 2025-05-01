import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Response_list, } from 'src/app/core/models/general.model';
import { AbstractApiService } from 'src/app/core/pipe/jsonrpc';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends AbstractApiService<any> {

private path_permission = '/cms/v1/am/permission';

constructor(
  http: HttpClient,
) {
  super(http, '/cms/v1/am/role'); // URL API untuk ROLE
 }


async GET_Permission(id?:any): Promise<Response_list>{
  let param = id;
  return lastValueFrom(this.http.get<Response_list>(`${environment.apiUrl}`+this.path_permission + (param ? '/'+param : '') )).then((res:Response_list)=>{
     return res;
   })
 }


}
