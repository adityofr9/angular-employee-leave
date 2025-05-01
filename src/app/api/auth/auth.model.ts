export interface Users {
    id: number;
    name: string;
    email: string;
    role: string;
    permissions: permissions[];
  }

  export interface permissions {
    menuName: string;
    permissions: permissions[];
  }

  export interface permissions {
    permissionId: number;
    permissionName: string;
    disabled: boolean;
    active: boolean;
  }
