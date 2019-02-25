import { GlpiSocket } from './GlpiSocket';
import { AxiosResponse } from 'axios';
import { IGetItemParams } from './interfaces/IGetItemParams';
import { IGetItemsParams } from './interfaces/IGetItemsParams';
import { IGetMultipleItemsParams } from './interfaces/IGetMultipleItemsParams';
import { ISearchParams } from './interfaces/ISearchParams';
import { IDeleteItemParams } from './interfaces/IDeleteItemParams';

export class GlpiAPI {
    private socket: GlpiSocket;

    constructor(socket: GlpiSocket) {
        this.socket = socket;
    }

    public async killSession(): Promise<AxiosResponse> {
        return this.socket.call('get', 'killSession');
    }

    public async lostPassword(email: string, passwordForgetToken?: string, password?: string): Promise<AxiosResponse> {
        const body: any = {
            email,
        };

        if (password) {
            body.password_forget_token = passwordForgetToken;
            body.password = password;
        }

        return this.socket.call('put', 'lostPassword', { data: body });
    }

    public async getMyProfiles() {
        return this.socket.call('get', 'getMyProfiles');
    }

    public async getActiveProfile() {
        return this.socket.call('get', 'getActiveProfile');
    }

    public async changeActiveProfile(profiles_id: number) {
        return this.socket.call('post', 'changeActiveProfile', { data: { profiles_id } });
    }

    public async getMyEntities(is_recursive: boolean = false) {
        return this.socket.call('get', 'getMyEntities', { params: { is_recursive } });
    }

    public async getActiveEntities() {
        return this.socket.call('get', 'getActiveEntities');
    }

    public async changeActiveEntities(entities_id: string | number = 'all', is_recursive: boolean = false) {
        return this.socket.call('post', 'changeActiveEntities', {
            data: {
                entities_id,
                is_recursive,
            },
        });
    }

    public async getFullSession() {
        return this.socket.call('get', 'getFullSession');
    }

    public async getGlpiConfig() {
        return this.socket.call('get', 'getGlpiConfig');
    }

    public async getItem(item_type: string, id: number, options: IGetItemParams = {}) {
        return this.socket.call('get', `${item_type}/${id}`, { params: options });
    }

    public async getItems(item_type: string, options: IGetItemsParams = {}) {
        return this.socket.call('get', item_type, { params: options });
    }

    public async getSubitems(item_type: string, id: number, subitem_type: string, options: IGetItemsParams = {}) {
        return this.socket.call('get', `${item_type}/${id}/${subitem_type}`, { params: options });
    }

    public async getMultipleItems(options: IGetMultipleItemsParams) {
        const serializedParams = this.serializeArrayForGetMethod(['items'], options);

        return this.socket.call('get', 'getMultipleItems', { params: serializedParams });
    }

    public async listSearchOptions(item_type: string, raw?: any) {
        const params: any = {};
        if (raw) params.raw = raw;
        return this.socket.call('get', `listSearchOptions/${item_type}`, { params });
    }

    public async search(item_type: string, options: ISearchParams = {}) {
        const serializedParams = this.serializeArrayForGetMethod(['criteria', 'forcedisplay'], options);

        return this.socket.call('get', `search/${item_type}`, { params: serializedParams });
    }

    public async addItem(item_type: string, input: any = {}) {
        return this.socket.call('post', item_type, { data: { input } });
    }

    public async updateItem(item_type: string, id: number, input: any = {}) {
        return this.socket.call('put', `${item_type}/${id}`, { data: { input } });
    }

    public async deleteItem(item_type: string, id: number | number[], options: IDeleteItemParams = {}) {
        if (Array.isArray(id)) {
            const params: any = Object.assign(
                {
                    input: id.map(i => ({ id: i })),
                },
                options,
            );
            return this.socket.call('delete', item_type, { params });
        } else {
            return this.socket.call('delete', `${item_type}/${id}`, { params: options });
        }
    }

    private serializeArrayForGetMethod(originalKeys: string[], options: any) {
        const serializedOptions: any = Object.assign({}, options);

        for (const originalKey of originalKeys) {
            if (!options[originalKey] || !Array.isArray(options[originalKey])) continue;

            const arr = options[originalKey];

            for (let index = 0; index < arr.length; index++) {
                const item = arr[index];

                const keys = Object.keys(item);

                for (const key of keys) {
                    // If the subitem is also an array, we will need to
                    // stitch the subitem key with the root key
                    if (Array.isArray(item[key])) {
                        const newObj = { [key]: item[key] };

                        const serializedSubitem = this.serializeArrayForGetMethod([key], newObj);

                        const subkeys = Object.keys(serializedSubitem);

                        for (const subkey of subkeys) {
                            // Transform the key into something like: criteria[0][criteria][2][field]
                            const newKey = `${originalKey}[${index}][${key}]${subkey.replace(originalKey, '')}`;
                            serializedOptions[newKey] = serializedSubitem[subkey];
                        }
                    } else {
                        // Transform the key into something like: criteria[0][field]
                        const serializedKey = `${originalKey}[${index}][${key}]`;
                        serializedOptions[serializedKey] = item[key];
                    }
                }
            }

            delete serializedOptions[originalKey];
        }

        return serializedOptions;
    }
}
