import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { AuthService } from '../api/auth/auth.service';

@Injectable()
export class RoutesService extends TitleStrategy {

  constructor(private readonly title: Title, private auth: AuthService ) {
    // let a = route.snapshot.data['label']
    // console.log(a);
    super();
  }

  override updateTitle(routerState: RouterStateSnapshot ) {
    const title = this.buildTitle(routerState);
    if (title !== undefined) {

  
      let arr = title.split("-");
      this.auth.currentPath = arr;
      this.title.setTitle(`${title}`);
    }
  }



}



