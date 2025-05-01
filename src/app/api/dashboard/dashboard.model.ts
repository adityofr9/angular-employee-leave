export interface Summary_m {
  totalUserActive?: number;
  totalUserSuspended?: number;
  totalChannel?: number;
  totalContent?: number;
  totalUserActiveFromBeginning?: number;
  totalContentCms?: number;
}

export interface ActiveUserSegment_m {
  key?: string;
  data?: data_user;
}

export interface data_user {
  solitaire?: number;
  priority?: number;
  nonMember?: number;
}


export interface data_member_feedback {
  id?: string;
  index?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  isActive?: boolean;
  name?: string;
  email?: string;
  phone?: string;
  cin?: string;
  message?: string;
}