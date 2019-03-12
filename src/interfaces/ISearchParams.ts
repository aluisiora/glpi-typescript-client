export interface ICriteria {
    link?: string;
    field: string;
    meta?: string;
    itemtype?: string;
    searchtype: string;
    value: any;
    criteria?: ICriteria[];
}

export interface ISearchParams {
    criteria?: ICriteria[];
    sort?: number;
    order?: string;
    range?: string;
    forcedisplay?: number[];
    rawdata?: boolean;
    withindexes?: boolean;
    uid_cols?: boolean;
    giveItems?: boolean;
}
