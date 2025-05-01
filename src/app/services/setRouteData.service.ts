import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SetRouteDataService {
  data:any
  resolve() {
    return Promise.resolve(this.data);
  }

}
