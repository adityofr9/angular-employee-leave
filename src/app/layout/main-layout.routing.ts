import { MasterMenuModule } from './../pages/master-data/master-menu/master-menu.module';
import { Routes, RouterModule } from '@angular/router';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { SetRouteDataService } from 'src/app/services/setRouteData.service';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadChildren: () =>
          import('../pages/home/home.module').then((m) => m.HomeModule),
      },

      {
        path: 'admin',
        loadChildren: () =>
          import('../pages/admins/admins.module').then((m) => m.AdminsModule),
      },

      {
        path: 'employee',
        loadChildren: () =>
          import('../pages/history/history.module').then((m) => m.HistoryModule),
      },

      {
        path: 'setting/user-management',
        loadChildren: () =>
          import('../pages/settings/user-management/user-management.module').then((m) => m.UserManagementModule),
      },

      {
        path: 'master-user',
        loadChildren: () =>
          import('../pages/master-data/master-user/master-user.module').then(
            (m) => m.MasterUserModule
          ),
      },

      {
        path: 'master-booth',
        loadChildren: () =>
          import('../pages/master-data/master-booth/master-booth.module').then(
            (m) => m.MasterBoothModule
          ),
      },

      {
        path: 'master-menu',
        loadChildren: () =>
          import('../pages/master-data/master-menu/master-menu.module').then(
            (m) => m.MasterMenuModule
          ),
      },
    ],
  },
];

export const MainLayoutRoutes = RouterModule.forChild(routes);
