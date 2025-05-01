import { Injectable } from '@angular/core';
import { Router } from '@angular/router';


import { map} from 'rxjs';
import { StorageMap } from '@ngx-pwa/local-storage';
import { AuthService } from 'src/app/api/auth/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SessionsService } from '../sessions/sessions.service';


@Injectable({
  providedIn: 'root',
})
export class AuthGuard  {

  validation = new JwtHelperService();

  constructor(
    private auth: AuthService,
    protected storage : StorageMap,
    private router: Router,
    private sessions: SessionsService
    // private socialAuth: SocialAuthService
    ) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate() {
    return this.storage.get('token-x').pipe(
      map((token:any)=>{
        if(token){

          let isExipred = this.validation.isTokenExpired(token);

          if(isExipred){
            this.auth.logout_end_session();
            this.router.navigate(['authentication/login']).then(() => {
              this.auth.logout();
              // window.location.reload();
            });
            return false;

          } else {
            this.auth.token = token;
            this.sessions.loadSession();
            // For excluding the user role in the session
            // this.auth.users$.subscribe((res: any) => {
            //   if (res) {
            //     if (res.role.toUpperCase() === 'user') {
            //       this.auth.showAlertCreds('', 'Sorry, we can\'t find your account.<br>Please ensure that you\'ve<br>already registered as an admin.', true);
            //     }
            //   }
            // });
            return true;
          }

        } else {
          // this.authService.removeSession();
          this.auth.token = false;
          this.router.navigate(['authentication/login']);
          return false
        }
      })
    )
  }

}


@Injectable({
  providedIn: 'root',
})
export class LoginGuard  {
  constructor(
    protected storage : StorageMap,
    private router: Router,
    ) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate() {
    return this.storage.get('token-x').pipe(
      map(data=>{
        if(data){
          this.router.navigate(['u/dashboard']);
          return false;
        } else {
          return true;
        }
      })
    )
  }

}
