
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/api/auth/auth.service';
import { HelperService } from 'src/app/services/helper.service';



@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService,
    private helper: HelperService
    ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        console.log(err.error.message);
        const errMsg = err?.error?.message
        switch (err.status) {
          case 400:
            // this.auth.errorLog();
            console.log(err.error.message);
            this.helper.showErrorAlert('Error',errMsg)
            break;

          case 500:

            if(errMsg){
              this.helper.showErrorAlert('Error',errMsg)
            }

          break;
          case 302:
          case 401:
            //JWT Expired
            this.auth.showAlertCreds('', 'Your session has expired.<br>Please login again.', false);
          break;


          default:
            this.helper.showErrorAlert('Error', err?.message)
            break;
        }


        // const error = err.error.message || err.statusText;
        const error = err.error;
        return throwError(error);
      })
    );
  }
}


