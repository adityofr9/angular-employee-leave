import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { throwIfAlreadyLoaded } from './guards/module-import.guard';
import { AuthGuard,LoginGuard } from './guards/auth.guard';
import { AppService } from '../services/app.service';
import { RoleService } from '../api/role/role.service';
import { DialogService } from 'primeng/dynamicdialog';


@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    AuthGuard,
    LoginGuard,
    RoleService,
    AppService,
    DialogService
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
