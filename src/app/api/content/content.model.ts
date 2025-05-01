export enum Status_Content_Promoted{
    RUNNING = 'Running',
    SCHEDULE = 'Schedule',
    PAUSED = 'Paused',
    COMPLETED = 'Completed',
    NOSCHEDULE = 'NOT_DEFINED'
 }

 export interface ReportContent_m {
    id: string;
    creator: string;
    createAt: string;
    chanelName: any;
    isPublished: boolean;
    description: string;
    highlight: any[];
    tags: any;
    contents: listContents[];
  }
  
  export interface listContents {
    content: string;
  }
  