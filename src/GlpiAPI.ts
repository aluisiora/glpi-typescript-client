import { GlpiSocket } from './GlpiSocket';
import { AxiosResponse, AxiosInstance } from 'axios';
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

    public getHttpSocket(): AxiosInstance {
        return this.socket.getHttp();
    }

    public async killSession(): Promise<AxiosResponse> {
        return this.socket.call('GET', 'killSession');
    }

    public async lostPassword(email: string, passwordForgetToken?: string, password?: string): Promise<AxiosResponse> {
        const body: any = {
            email,
        };

        if (password) {
            body.password_forget_token = passwordForgetToken;
            body.password = password;
        }

        return this.socket.call('PUT', 'lostPassword', { data: body });
    }

    public async getMyProfiles(): Promise<AxiosResponse> {
        return this.socket.call('GET', 'getMyProfiles');
    }

    public async getActiveProfile(): Promise<AxiosResponse> {
        return this.socket.call('GET', 'getActiveProfile');
    }

    public async changeActiveProfile(profiles_id: number): Promise<AxiosResponse> {
        return this.socket.call('POST', 'changeActiveProfile', { data: { profiles_id } });
    }

    public async getMyEntities(is_recursive: boolean = false): Promise<AxiosResponse> {
        return this.socket.call('GET', 'getMyEntities', { params: { is_recursive } });
    }

    public async getActiveEntities(): Promise<AxiosResponse> {
        return this.socket.call('GET', 'getActiveEntities');
    }

    public async changeActiveEntities(
        entities_id: string | number = 'all',
        is_recursive: boolean = false,
    ): Promise<AxiosResponse> {
        return this.socket.call('POST', 'changeActiveEntities', {
            data: {
                entities_id,
                is_recursive,
            },
        });
    }

    public async getFullSession(): Promise<AxiosResponse> {
        return this.socket.call('GET', 'getFullSession');
    }

    public async getGlpiConfig(): Promise<AxiosResponse> {
        return this.socket.call('GET', 'getGlpiConfig');
    }

    public async getItem(item_type: string, id: number, options: IGetItemParams = {}): Promise<AxiosResponse> {
        return this.socket.call('GET', `${item_type}/${id}`, { params: options });
    }

    public async getItems(item_type: string, options: IGetItemsParams = {}): Promise<AxiosResponse> {
        const serializedParams = this.serializeObjectForGetMethod(['searchText'], options);
        return this.socket.call('GET', item_type, { params: serializedParams });
    }

    public async getSubitems(
        item_type: string,
        id: number,
        subitem_type: string,
        options: IGetItemsParams = {},
    ): Promise<AxiosResponse> {
        const serializedParams = this.serializeObjectForGetMethod(['searchText'], options);
        return this.socket.call('GET', `${item_type}/${id}/${subitem_type}`, { params: serializedParams });
    }

    public async getMultipleItems(options: IGetMultipleItemsParams): Promise<AxiosResponse> {
        const serializedParams = this.serializeArrayForGetMethod(['items'], options);

        return this.socket.call('GET', 'getMultipleItems', { params: serializedParams });
    }

    public async listSearchOptions(item_type: string, raw?: boolean): Promise<AxiosResponse> {
        const params: any = {};
        if (raw) params.raw = raw;
        return this.socket.call('GET', `listSearchOptions/${item_type}`, { params });
    }

    public async search(item_type: string, options: ISearchParams = {}): Promise<AxiosResponse> {
        const serializedParams = this.serializeArrayForGetMethod(['criteria', 'forcedisplay'], options);

        return this.socket.call('GET', `search/${item_type}`, { params: serializedParams });
    }

    public async addItem(item_type: string, input: any = {}): Promise<AxiosResponse> {
        return this.socket.call('POST', item_type, { data: { input } });
    }

    public async updateItem(item_type: string, id: number, input: any = {}): Promise<AxiosResponse> {
        return this.socket.call('PUT', `${item_type}/${id}`, { data: { input } });
    }

    public async deleteItem(
        item_type: string,
        id: number | number[],
        options: IDeleteItemParams = {},
    ): Promise<AxiosResponse> {
        if (Array.isArray(id)) {
            const params: any = Object.assign(
                {
                    input: id.map(i => ({ id: i })),
                },
                options,
            );
            return this.socket.call('DELETE', item_type, { params });
        } else {
            return this.socket.call('DELETE', `${item_type}/${id}`, { params: options });
        }
    }

    private serializeArrayForGetMethod(originalKeys: string[], options: any) {
        const serializedOptions: any = { ...options };

        for (const originalKey of originalKeys) {
            if (!options[originalKey] || !Array.isArray(options[originalKey])) continue;

            const arr = options[originalKey];

            for (let index = 0; index < arr.length; index++) {
                const item = arr[index];

                if (typeof item !== 'object') {
                    // Transform the key into something like: forcedisplay[0]
                    const serializedKey = `${originalKey}[${index}]`;
                    serializedOptions[serializedKey] = item;
                } else {
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
            }

            delete serializedOptions[originalKey];
        }

        return serializedOptions;
    }

    private serializeObjectForGetMethod(originalKeys: string[], options: any) {
        const serializedOptions: any = { ...options };

        for (const originalKey of originalKeys) {
            if (typeof options[originalKey] !== 'object') continue;

            const subkeys = Object.keys(options[originalKey]);

            for (const subkey of subkeys) {
                const newKey = `${originalKey}[${subkey}]`;
                serializedOptions[newKey] = options[originalKey][subkey];
            }

            delete serializedOptions[originalKey];
        }

        return serializedOptions;
    }
}
