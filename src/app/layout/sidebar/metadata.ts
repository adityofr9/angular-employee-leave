export interface Route {
    title:string;
    slug:string;
    permissions?: any;
    submenu:RouteInfo[]
    icon?: string;
    iconType?:string;
  }


export interface RouteInfo {
    path: string;
    title: string;
    icon?: string;
    id?:string;
    permissions?: any;
    slug:string;
    iconType?:string;
    submenu: RouteInfo[];
}

export const PERMISSIONS_DATA = [
  {
    "menuName": "dashboard",
    "permissions": [
      {
        "permissionId": 6,
        "permissionName": "view",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 7,
        "permissionName": "create",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 8,
        "permissionName": "read",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 31,
        "permissionName": "update",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 32,
        "permissionName": "delete",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "export",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "updateStatus",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "filter",
        "disabled": false,
        "active": true
      }
    ]
  },
  {
    "menuName": "history",
    "permissions": [
      {
        "permissionId": 6,
        "permissionName": "view",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 7,
        "permissionName": "create",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 8,
        "permissionName": "read",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 31,
        "permissionName": "update",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 32,
        "permissionName": "delete",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "export",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "updateStatus",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "filter",
        "disabled": false,
        "active": true
      }
    ]
  },
  {
    "menuName": "setting",
    "permissions": [
      {
        "permissionId": 6,
        "permissionName": "view",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 7,
        "permissionName": "create",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 8,
        "permissionName": "read",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 31,
        "permissionName": "update",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 32,
        "permissionName": "delete",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "export",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "updateStatus",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "filter",
        "disabled": false,
        "active": true
      }
    ]
  },
  {
    "menuName": "web_settings",
    "permissions": [
      {
        "permissionId": 6,
        "permissionName": "view",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 7,
        "permissionName": "create",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 8,
        "permissionName": "read",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 31,
        "permissionName": "update",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 32,
        "permissionName": "delete",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "export",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "updateStatus",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "filter",
        "disabled": false,
        "active": true
      }
    ]
  },
  {
    "menuName": "user_management",
    "permissions": [
      {
        "permissionId": 6,
        "permissionName": "view",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 7,
        "permissionName": "create",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 8,
        "permissionName": "read",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 31,
        "permissionName": "update",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 32,
        "permissionName": "delete",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "export",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "updateStatus",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "filter",
        "disabled": false,
        "active": true
      }
    ]
  },
  {
    "menuName": "users",
    "permissions": [
      {
        "permissionId": 6,
        "permissionName": "view",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 7,
        "permissionName": "create",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 8,
        "permissionName": "read",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 31,
        "permissionName": "update",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 32,
        "permissionName": "delete",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "export",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "updateStatus",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "filter",
        "disabled": false,
        "active": true
      }
    ]
  },
  {
    "menuName": "events",
    "permissions": [
      {
        "permissionId": 6,
        "permissionName": "view",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 7,
        "permissionName": "create",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 8,
        "permissionName": "read",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 31,
        "permissionName": "update",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": 32,
        "permissionName": "delete",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "export",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "updateStatus",
        "disabled": false,
        "active": true
      },
      {
        "permissionId": null,
        "permissionName": "filter",
        "disabled": false,
        "active": true
      }
    ]
  }
]
