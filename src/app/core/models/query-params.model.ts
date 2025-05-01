export interface QueryParams {
    pages:number;
    limit:number;
    sortBy:string;
    direction:string;
    keyword:string;
    startDate:string;
    endDate:string;
    export?:boolean;
    action?:any;
    startTime?:string;
    endTime?:string;
    isElastic?:boolean;
    actions?:Array<any>;
    users?:Array<any>;
    sources?:Array<any>;
    [key: string]: any;
}

export const QueryData:QueryParams = {
    pages:0,
    limit:10,
    sortBy:'',
    direction:'desc',
    endDate:'',
    startDate:'',
    keyword:'',
    key:''
}
