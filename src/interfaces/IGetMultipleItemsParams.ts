import { IGetItemParams } from './IGetItemParams';

export interface IGetMultipleItemsParams extends IGetItemParams {
    items: {
        itemtype: string;
        items_id: number;
    }[];
}
