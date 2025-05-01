import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/api/auth/auth.service';
import { AppService } from 'src/app/services/app.service';
import { IdleService } from 'src/app/services/idle.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  store: any;
  showTopButton = false;
  isExpanded = false;

  user!: any;
  subs!: Subscription;
  notifSubs!: Subscription;

  constructor(
    public translate: TranslateService,
    public storeData: Store<any>,
    private authServ: AuthService,
    private service: AppService,
    private router: Router,
    private idleService: IdleService,
  ) {
    this.initStore();
  }
  headerClass = '';

  ngOnInit() {
    this.initAnimation();
    this.toggleLoader();
    window.addEventListener('scroll', () => {
      if (
        document.body.scrollTop > 50 ||
        document.documentElement.scrollTop > 50
      ) {
        this.showTopButton = true;
      } else {
        this.showTopButton = false;
      }
    });

    this.idleService.onIdleEvent.subscribe(() => {
      this.authServ.showAlertCreds('', 'Your session has expired.<br>Please login again.', false);
    });

    this.authServ.GET_UserData();
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', () => {});
  }

  initAnimation() {
    this.service.changeAnimation();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.service.changeAnimation();
      }
    });

    const ele: any = document.querySelector('.animation');
    ele.addEventListener('animationend', () => {
      this.service.changeAnimation('remove');
    });
  }

  toggleLoader() {
    this.storeData.dispatch({ type: 'toggleMainLoader', payload: true });
    setTimeout(() => {
      this.storeData.dispatch({ type: 'toggleMainLoader', payload: false });
    }, 500);
  }

  async initStore() {
    this.storeData
      .select((d) => d.index)
      .subscribe((d) => {
        this.store = d;
      });
  }

  goToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }
}
