export interface EventDetail {
  id: string;
  index: number;
  createdAt: string;
  updatedAt: string;
  createdBy: any;
  updatedBy: string;
  name: string;
  slug: string;
  description: string;
  startedAt: string;
  endedAt: string;
  qrImage: string;
  accessCode: any;
  status: boolean;
  scannedCount: number;
  users: users[];
  generalInfo: generalInfo;
  media: media;
}

export interface media {
  eventLogo: string;
  backgroundImage: string;
}

export interface generalInfo {
  shortDescription: string;
  information: string;
  location: string;
}

export interface users {
  cin: string;
  name: string;
}
