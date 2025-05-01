import { HelperService } from 'src/app/services/helper.service';
import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { permission } from 'process';

import { ROUTES } from '../menu-item';
import { AuthService } from 'src/app/api/auth/auth.service';
import { events_endpoint } from 'src/app/api/events/events.service';
import { GeneralService } from 'src/app/api/general/general.service';
import { slideDownUp } from 'src/app/shared/library/animations';
import { SessionsService } from 'src/app/core/sessions/sessions.service';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { PERMISSIONS_DATA } from './metadata';

@Component({
  moduleId: module.id,
  selector: 'sidebar',
  templateUrl: './sidebar.html',
  animations: [slideDownUp],
})
export class SidebarComponent {
  active = false;
  store: any;

  menus = ROUTES;

  sidebarVisible: boolean = false;

  activeDropdown: string[] = [];
  parentDropdown: string = '';

  user!: any;
  role: any = '';
  permissions: any = {};


  ep_events = events_endpoint.sidebar

  Query:QueryParams = Object.assign({}, QueryData);
  listEvent:any[]=[]

  counts = 0;
  isSidebarOpen = true;

  permissionData: any = PERMISSIONS_DATA;

  constructor(
    public translate: TranslateService,
    public storeData: Store<any>,
    public router: Router,
    private sessions: SessionsService,
    private permissionService: NgxPermissionsService,
    private auth: AuthService,
    private api : GeneralService,
    private helper: HelperService
  ) {
    this.initStore();

    this.auth.users$.subscribe((res: any) => {
      if (res) {
        this.role = res.role;
        this.user = res;

        // If database has permissions
        // if (res.permissions) {
          this.sessions.loadPermissions(this.permissionData);
        // }
      }
    });
  }

  ngOnInit() {
    let i = 0;
    this.permissionService.permissions$.subscribe((permission) => {
      // Prevent when permission is empty and looping more than 1
      if (permission && Object.keys(permission).length > 0 && i < 1) {
        this.permissions = permission;
        this.runSession(this.permissions);
        i++;
      }
    });

    this.setActiveDropdown();
  }

  async initStore() {
    this.storeData
      .select((d) => d.index)
      .subscribe((d) => {
        this.store = d;
      });
  }

  // Method untuk mengecek apakah izin tertentu ada
  hasPermission(permissionName: string): boolean {
    return !!this.permissions[permissionName];
  }

  runSession(permission: any) {
    console.log('[MENUS]' + ++this.counts, permission);

    let sess = permission;
    let menus = this.menus;

    // if (this.role == 'admin') {
    // MARK: Force all menu to true
      menus.forEach((menu: any) => {
        menu.permissions = true;
        menu.submenu.forEach((submenu: any) => {
          submenu.permissions = true;
          submenu.submenu.forEach((sub_submenu: any) => {
            sub_submenu.permissions = true;
          });
        });
      });
    // } else {
    //   menus.forEach((menu: any) => {
    //     menu.permissions = Object.keys(sess).some((key) =>
    //       key.toLowerCase().includes(menu.slug.toLowerCase())
    //     );
    //     menu.submenu.forEach((submenu: any) => {
    //       submenu.permissions = Object.keys(sess).some((key) =>
    //         key.toLowerCase().includes(submenu.slug.toLowerCase())
    //       );
    //       submenu.submenu.forEach((sub_submenu: any) => {
    //         sub_submenu.permissions = Object.keys(sess).some((key) =>
    //           key.toLowerCase().includes(sub_submenu.slug.toLowerCase())
    //         );
    //       });
    //       // Set parent submenu permissions to true if any sub_submenu has permissions
    //       if (
    //         submenu.submenu.some((sub_submenu: any) => sub_submenu.permissions)
    //       ) {
    //         submenu.permissions = true;
    //       }
    //     });
    //     // Set parent menu permissions to true if any submenu has permissions
    //     if (menu.submenu.some((submenu: any) => submenu.permissions)) {
    //       menu.permissions = true;
    //     } else {
    //       menu.permissions = false;
    //   }
    //   });
    // }

    console.log('[Session]', menus);
  }

  setCurrentPath(data: any) {
    // this.auth.currentPath = data;
  }

  setActiveDropdown() {
    // console.log(window.location.pathname);
    const selector = document.querySelector('.sidebar ul');
    // console.log(selector);
    if (selector) {
      selector.classList.add('active');
      const ul: any = selector.closest('ul.sub-menu');
      if (ul) {
        let ele: any =
          ul.closest('li.menu').querySelectorAll('.nav-link') || [];
        if (ele.length) {
          ele = ele[0];

          setTimeout(() => {
            ele.click();
          }, 100);
        }
      }
    }
  }

  toggleMobileMenu() {
    if (window.innerWidth < 1024) {
      this.storeData.dispatch({ type: 'toggleSidebar' });
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  }

  toggleAccordion(name: string, parent?: string) {
    if (this.activeDropdown.includes(name)) {
      this.activeDropdown = this.activeDropdown.filter((d) => d !== name);
    } else {
      this.activeDropdown.push(name);
    }
  }

  logout() {
    const popupData : any = {
      type: 'warning',
      title: '',
      message: 'Are you sure <br>you want to log out?',
      button: 'Yes',
      cancelButton: 'No',
    }

    this.helper.showConfirmationAlert(popupData).then((res) => {
      if (res) {
        // this.auth.logoutAdfs().then((res) => {
        //   if (res.output_schema) {
        //     // this.helper.showSuccessAlert('Success', 'Logout berhasil.');
        //     setTimeout(() => {
        //       const externalUrl = res.output_schema.logout_url;
        //       if (externalUrl) {
                this.auth.logout();
        //         window.location.href = externalUrl;
        //       }
        //     }, 500);
        //   }
        // });
      }
    });
  }

  formattedName(name: string = '') {
    return this.helper.formatedUserName(name, 15) + '!';
  }

  // Fungsi untuk mengecek apakah route saat ini aktif
  isActive(path: string, isMasterData: boolean = false): boolean {
    return isMasterData
      ? ['master-booth', 'master-menu', 'master-user'].some(subPath => this.router.url.includes(subPath))
      : this.router.url.includes(path);
  }

   // Fungsi untuk mengecek apakah menu utama harus dianggap aktif
   isMenuActive(menu: any): boolean {
    return (
      (menu?.submenu?.length > 0 && (menu.slug === 'master-data') ? menu.submenu.some((i:any) => this.isActive('/u/' + i.path, true)) :  menu.submenu.some((i:any) => this.isActive('/u/' + i.path)))
    );
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const width = (event.target as Window).innerWidth;
    this.isSidebarOpen = width >= 1024; // Sidebar tetap terbuka di layar besar
  }
}
