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
    title: 'History',
    permissions: false,
    slug: 'history',
    icon: 'assets/media/icon-history.png',
    iconType: 'image',
    submenu: [
      {
        path: 'history/list',
        title: 'History',
        icon: 'assets/media/icon-history.png',
        permissions: '',
        slug: 'history',
        iconType: 'image',
        submenu: [],
      },
    ],
  },

  // --------------------------------- MARK:MASTER EVENT ---------------------------------
  {
    title: 'Setting',
    permissions: false,
    slug: 'setting',
    submenu: [
      {
        path: 'setting/web-settings',
        title: 'Web Settings',
        icon: 'assets/media/icon-web-setting.png',
        permissions: '',
        slug: 'web_settings',
        iconType: 'image',
        submenu: [],
      },
      {
        path: '',
        title: 'User Management',
        icon: 'assets/media/icon-user-management.png',
        permissions: '',
        slug: 'user_management',
        iconType: 'image',
        submenu: [
          {
            path: 'setting/user-management',
            title: 'List User',
            icon: '',
            permissions: '',
            slug: 'user_management',
            iconType: '',
            submenu: [],
          },
          {
            path: 'setting/privilege',
            title: 'Privilege',
            icon: '',
            permissions: '',
            slug: 'privilege',
            iconType: 'image',
            submenu: [],
          },
          {
            path: 'setting/participant',
            title: 'Participant',
            icon: '',
            permissions: '',
            slug: 'participant',
            iconType: 'image',
            submenu: [],
          },
        ],
      },
    ],
  },
];
