import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { filter, Subscription } from 'rxjs';
import { AuthService } from 'src/app/api/auth/auth.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent implements OnInit {
  items: any[] = [];

  menuItems: any;

  unsub?: Subscription;
  data: any;

  constructor(
    private auth: AuthService,
    private router: Router,
    private helper: HelperService
  ) {}

  ngOnInit() {
    this.unsub = this.helper.routerData.subscribe((data: any) => {
      if (data) {
        this.data = data;
      }
    });

    // console.log(menus);
    this.listenChange();
    this.getPath();
  }

  ngOnDestroy(): void {
    this.unsub?.unsubscribe();
  }

  getPath() {
    this.items = this.auth.currentPath;

    // Memisahkan URL path berdasarkan '/'
    const path = this.router.url.split('/').slice(2);

    // Menyusun array 'menus' dengan memetakan setiap segmen path
    const menus = path
      .filter((segment) => !segment.includes('list')) // Filter 'list' dari path
      .map((segment, idx) => {
        // Menghitung route secara dinamis
        const route =
          idx === path.length - 1 ? '' : '../'.repeat(path.length - idx - 1);

        return {
          label: this.makeTitle(segment),
          route,
          idx,
        };
      });

    // Menambahkan 'home' di awal array
    this.items = [menus[0], ...menus];
  }

  convertPath(arr: string[], depth: number): string {
    if (depth <= 0 || depth > arr.length) {
      throw new Error(
        'Depth must be greater than 0 and less than or equal to the array length'
      );
    }

    // Slice the array up to the depth
    const result = arr.slice(0, depth);

    return result.join('/');
  }

  listenChange() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ) // This is type narrowing
      )
      .subscribe((event: NavigationEnd) => {
        // console.log('Route changed to: ', event.urlAfterRedirects);
        this.getPath();
      });
  }

  goto(url: any) {
    this.router.navigateByUrl(url);
  }

  replaceName(label: any) {
    let name = label.replace(/\s+/g, '-').toLowerCase();

    // console.log(label);
    if (this.data[name]) {
      // console.log(this.data[name]);
      return this.data[name];
    }

    return label;
  }

  removeQuery(url: any) {
    const [baseUrl] = url.split('?');

    if (this.data) {
      if (this.data[baseUrl]) {
        return this.data[baseUrl];
      }
    }

    return baseUrl;
  }

  makeTitle(title: string) {
    var words = title.split('-');

    // for (var i = 0; i < words.length; i++) {
    //   var word = words[i];
    //   words[i] = word.charAt(0).toUpperCase() + word.slice(1);
    // }

    return words.join(' ');
  }
}
