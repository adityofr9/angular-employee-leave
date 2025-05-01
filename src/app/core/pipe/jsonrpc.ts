import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Response, Response_list } from '../models/general.model';

export abstract class AbstractApiService<T> {
  // protected headers = new HttpHeaders({
  //   'Content-Type': 'application/json'
  // });

  constructor(protected http: HttpClient, protected path: string) { }

  protected createCustomHeaders(headers: { [key: string]: string }): HttpHeaders {
    let customHeaders = new HttpHeaders();
    for (const key in headers) {
      if (headers.hasOwnProperty(key)) {
        customHeaders = customHeaders.set(key, headers[key]);
      }
    }
    return customHeaders;
  }

  async getAll(params?:any,endpointURL?:string): Promise<any | Response_list>{
    let param = new HttpParams({fromObject: params}).toString()
    return lastValueFrom(this.http.get<any | Response_list>(`${environment.apiUrl}`+(endpointURL ? endpointURL : this.path) + (param ? '?'+param : '') ));
  }

  async getAll2(params?:any,endpointURL?:string): Promise<any>{
    let param = new HttpParams({fromObject: params}).toString()
    return lastValueFrom(this.http.get<any>(`${environment.apiUrl}`+(endpointURL ? endpointURL : this.path) + (param ? '?'+param : '') ));
  }

  async export(params?:any,endpointURL?:string): Promise<Response_list>{
    let param = new HttpParams({fromObject: params}).toString()
    return lastValueFrom(this.http.get<Response_list>(`${environment.apiUrl}`+(endpointURL ? endpointURL : this.path)+'/export'+ (param ? '?'+param : ''),   { responseType: 'blob' as 'json' } ));
  }

  async downloadFile(params?: any, endpointURL?: string): Promise<Blob> {
    let param = new HttpParams({ fromObject: params }).toString();
    return lastValueFrom(
      this.http.get(`${environment.apiUrl}` + (endpointURL ? endpointURL : this.path) + (param ? '?' + param : ''), {
        responseType: 'blob',
        headers: this.createCustomHeaders({
          'Accept': '*/*'
        })
      })
    );
  }

  async getId(id?:any, endpointURL?:string): Promise<Response>{
    return lastValueFrom(this.http.get<Response>(`${environment.apiUrl}`+(endpointURL ? endpointURL : this.path) +'/'+id));
  }



  async post(data: any, endpointURL?:string): Promise<Response> {
    return lastValueFrom(this.http.post<Response>(`${environment.apiUrl}`+(endpointURL ? endpointURL : this.path) , data));
  }


  //POST with form data
  async post_formdata(data: any, endpointURL?:string, params?:any): Promise<Response> {
    let param = new HttpParams({fromObject: params}).toString()
    let body = new FormData();
    for (var key in data) {
      if (data[key] !== undefined) {
        if (Array.isArray(data[key])) {
          data[key].forEach((item: any) => {
            body.append(key, item);
          });
        } else {
          body.append(key, data[key] === null ? '' : data[key]);
        }
      } else {
        body.append(key, '');
      }
    }


    return lastValueFrom(
      this.http.post<Response>(
        `${environment.apiUrl}`+(endpointURL ? endpointURL : this.path) + (param ? '?'+param : ''),
        body,
        {
          headers: this.createCustomHeaders({
            'Accept': 'application/json',
            // Add any other headers you need here
          })
        }
      ));
  }

  async put(id: number | string, data: T, endpointURL?:string): Promise<T> {
    return lastValueFrom(this.http.put<T>(`${environment.apiUrl}`+(endpointURL ? endpointURL : this.path) +'/'+id, data));
  }

  //put with form data
  async put_formdata(data: any, endpointURL?: string, params?: any): Promise<Response> {
    const param = new HttpParams({ fromObject: params }).toString();
    const body = new FormData();
    for (var key in data) {
      if (data[key] !== undefined) {
        if (Array.isArray(data[key])) {
          data[key].forEach((item: any) => {
            body.append(key, item);
          });
        } else {
          body.append(key, data[key] === null ? '' : data[key]);
        }
      } else {
        body.append(key, '');
      }
    }

    return lastValueFrom(
      this.http.put<Response>(
        `${environment.apiUrl}` + (endpointURL ? endpointURL : this.path) + (param ? '?' + param : ''),
        body,
        {
          headers: this.createCustomHeaders({
            'Accept': 'application/json',
            // Jangan tambahkan 'Content-Type'
          }),
        }
      )
    );
  }

  async delete(id: number | string, endpointURL?:string): Promise<Response> {
    return lastValueFrom(this.http.delete<Response>(`${environment.apiUrl}`+(endpointURL ? endpointURL : this.path) +'/'+id));
  }


  async patch(id: number | string, partialdata: Partial<T>,endpointURL?:string): Promise<T> {
    return lastValueFrom(this.http.patch<T>(`${environment.apiUrl}`+(endpointURL ? endpointURL : this.path) +'/'+id, partialdata));
  }



}
