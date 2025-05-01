import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { AuthService } from 'src/app/api/auth/auth.service';
import { LoadingBarService } from '@ngx-loading-bar/core';


// import { AuthService, SharedService } from '@core';
// import { LoadingBarService } from '@ngx-loading-bar/core';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService ,
    private loader: LoadingBarService,
    // private uServ: SharedService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available
    // const currentUser = this.authenticationService.currentUserValue;
    // if (currentUser && currentUser.token) {

    const load = this.loader.useRef('http');
    //run loading
    const token = this.auth.token;
    if (token) {
        load.start();

        // Cek jika request URL mengandung '/adfs/logout' (atau endpoint yang khusus)
        if (request.url.includes('/adfs/logout')) {
          // Jika URL mengandung '/adfs/logout', kita tidak akan mengganti Authorization header
          return next.handle(request).pipe(
            finalize(() => {
              load.complete();
            })
          );
        }
        request = request.clone({
          setHeaders: {
            Authorization: 'Bearer ' + token,
            // 'Content-Type' : 'application/json'
          },
        });
      }


    return next.handle(request).pipe(
      finalize(()=>{
        load.complete();
        //end loading
      })
    )


  }
}
