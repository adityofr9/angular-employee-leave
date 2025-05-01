
type CategoryKey = 'pizzas'|'sandwiches'|'burgers'|'fries';

export interface Response {
    success: string,
    message: string,
    data: any,
    attributes: any[]
}

export interface Response_list {
    success: string,
    message: string,
    data: Response_data,
    attributes: any[]
}

export interface Response_nolist {
    success: string,
    message: string,
    data: any,
    attributes: any[]
}

export interface Response_data {
    result:any[],
    currentPage?: number,
    prevPage?:number,
    nextPage?:number,
    firstPage?:number,
    lastPage?:number,
    perPage?:number,
    totalItems?: number,
}


export interface Filters_field {
    name: string;
    slug: string;
    placeholder: string;
    type: string;
    disabled?:boolean;
    value: any | null;
    options: any[];
  }

  export enum Permissions {
    VIEW = '_VIEW',
    READ = '_READ',
    CREATE = '_CREATE',
    DELETE = '_DELETE',
    UPDATE = '_UPDATE',
    APPROVAL = '_APPROVAL',
    EXPORT = '_EXPORT',
    IMPORT = '_IMPORT',
    UPDATESTATUS = '_UPDATESTATUS',
    FILTER = '_FILTER',
  }

