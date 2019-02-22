import { IGetSubitemsParams } from './IGetSubitemsParams';

export interface IGetItemsParams extends IGetSubitemsParams {
    searchText?: any;
    is_deleted?: boolean;
}
