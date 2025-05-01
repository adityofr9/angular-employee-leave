import { Injectable } from '@angular/core';
import { NgxPermissionsService , NgxRolesService} from 'ngx-permissions';
import { SessionPermissionType } from './sessions.types';
import { AuthService } from 'src/app/api/auth/auth.service';
import { lastValueFrom } from 'rxjs';
import { StorageMap } from '@ngx-pwa/local-storage';
import { PERMISSIONS_DATA } from 'src/app/layout/sidebar/metadata';

@Injectable({
  providedIn: 'root',
})
export class SessionsService {

  permissionData: any = PERMISSIONS_DATA;

  getPermissions() {
    throw new Error('Method not implemented.');
  }

  constructor(
    private permissionService: NgxPermissionsService,
    private role: NgxRolesService,
    private auth: AuthService,
    private storage: StorageMap
  ) {
    this.loadSession();
    this.auth.users$.subscribe((res:any)=>{
      if(res){

        this.role = res.roleName;

        // if(res.permissions){
          this.loadPermissions(this.permissionData);

        // }

      }
    })

  }

  loadSession(){
    lastValueFrom(this.storage.get('users')).then((res:any)=>{
      if(res){
        this.loadPermissions(this.permissionData);
      }
    })
  }

  loadPermissions(menuPermissions: any[]) {
    const activePermissions: any[] = [];

    menuPermissions.forEach((menu) => {
      menu.permissions.forEach((permission: any) => {
        if (permission.active && !permission.disabled) {
          activePermissions.push(
            menu.menuName.toUpperCase() +
            '_' +
            permission.permissionName.toUpperCase()
            // menu.menuName.toUpperCase() +
            //   '_' +
            //   permission.permissionName.toUpperCase()
          );
        }
      });
    });

    this.permissionService.loadPermissions(activePermissions);
  }

  clearPermissions() {
    this.permissionService.flushPermissions();
  }

  addRole(role: any, status: any) {
    switch (role) {
      case 'Owner':
        this.permissionService.addPermission([
          SessionPermissionType.OWNER,
          status,
        ]);
        break;
      case 'Manager':
        this.permissionService.addPermission([
          SessionPermissionType.MANAGER,
          status,
        ]);
        break;
      case 'FO':
        this.permissionService.addPermission([
          SessionPermissionType.FO,
          status,
        ]);
        break;
      case 'HK':
        this.permissionService.addPermission([
          SessionPermissionType.HK,
          status,
        ]);
        break;
      default:
        break;
    }
  }

  removeRole() {
    this.role.flushRoles();
    //this.roleService.removeRole('GUEST')
  }
}
