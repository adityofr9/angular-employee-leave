import { SessionPermissionType } from 'src/app/core/sessions/sessions.types';
import { Route } from './sidebar/metadata';

export let ROUTES: Route[] = [
  // --------------------------------- MARK: DASHBOARD ---------------------------------
  {
    title: 'Dashboard',
    permissions: false,
    slug: 'dashboard',
    icon: 'assets/media/icon-dashboard.png',
    iconType: 'image',
    submenu: [
      {
        path: 'dashboard',
        title: 'Dashboard',
        icon: 'assets/media/icon-dashboard.png',
        permissions: '',
        slug: 'dashboard',
        iconType: 'image',
        submenu: [],
      },
    ],
  },

  // --------------------------------- MARK:HISTORY ---------------------------------
  {
    title: 'User Management',
    permissions: false,
    slug: 'users',
    icon: 'assets/media/icon-user-management.png',
    iconType: 'image',
    submenu: [
      {
        path: 'admin',
        title: 'Admins',
        icon: 'assets/media/icon-user-management.png',
        permissions: '',
        slug: 'admin',
        iconType: 'image',
        submenu: [],
      },
      {
        path: 'employee',
        title: 'Employee',
        icon: 'assets/media/icon-user-management.png',
        permissions: '',
        slug: 'employee',
        iconType: 'image',
        submenu: [],
      },
    ],
  },

  // --------------------------------- MARK:MASTER EVENT ---------------------------------
  {
    title: 'Leave',
    permissions: false,
    slug: 'leave',
    submenu: [
      {
        path: 'leave',
        title: 'Leave',
        icon: 'assets/media/icon-calendar.png',
        permissions: '',
        slug: 'leave',
        iconType: 'image',
        submenu: [],
      },
    ],
  },
];
