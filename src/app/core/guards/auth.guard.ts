import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SessionsService } from '../sessions/sessions.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard  {
  constructor(
    private router: Router,
    private sessions: SessionsService
    ) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return this.router.createUrlTree(['authentication/login']);

    const user = JSON.parse(userStr);
    this.sessions.loadSession();

    return user.role === 'role 1'
      ? true
      : false;
  }
}


@Injectable({
  providedIn: 'root',
})
export class LoginGuard  {
  constructor(
    private router: Router,
    ) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate() {
    const user = localStorage.getItem('currentUser');
    if (user) {
      return this.router.createUrlTree(['u/dashboard']);
    }
    return true;
  }

}
