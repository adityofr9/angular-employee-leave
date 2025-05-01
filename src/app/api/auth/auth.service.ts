import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, lastValueFrom, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiEnv: any = environment.apiUrl;

  token:any

  currentPath:any;

  public user = new BehaviorSubject<any>(null)
  users$ = this.user.asObservable()

  users!: any;

  constructor(
    private http: HttpClient,
  ) {

  }

  validationToken(){
    const helper = new JwtHelperService();
  }

  login(data:any){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    return lastValueFrom(this.http.get<any>(`${this.apiEnv}/users`, { params: data }));
  }

  GET_UserData(){
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.user.next(userStr);
      this.users = userStr;
    } else {
      this.logout();
    }
  }

  logout(){
    localStorage.removeItem('currentUser');
  }

  async showAlertCreds(title: any, message: any, showBg: boolean = false): Promise<boolean> {
    return Swal.fire({
      html: `
      <img class="" src="assets/icon/icon-warning.svg" alt="Icon Warning" />
      <h4 class="text-[18px] lg:text-[24px] mb-5">${title}</h4>
      <p class="text-2xl mb-6 font-semibold">${message}</p>
      `,
      showCancelButton: false,
      confirmButtonText: 'OK',
      confirmButtonColor: 'indigo',
      customClass: {
      confirmButton: 'custom-confirm-button !rounded-full font-bold',
      },
      backdrop: showBg ? `
      rgba(0,0,123,0.4)
      url("assets/media/bg-login-new.jpg")
      center
      no-repeat
      ` : '',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      preConfirm: () => {
        this.logout();
        window.location.reload();
        return false; // Prevent closing the Swal
      }
    }).then((result) => result.isConfirmed);
  }
}
