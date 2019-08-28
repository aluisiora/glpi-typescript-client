import { GlpiSocket } from './GlpiSocket';
import { AxiosResponse, AxiosInstance } from 'axios';
import { IGetItemParams } from './interfaces/IGetItemParams';
import { IGetItemsParams } from './interfaces/IGetItemsParams';
import { IGetMultipleItemsParams } from './interfaces/IGetMultipleItemsParams';
import { ISearchParams } from './interfaces/ISearchParams';
import { IDeleteItemParams } from './interfaces/IDeleteItemParams';

export class GlpiAPI {
    private socket: GlpiSocket;

    private reloginInterceptor: number;

    constructor(socket: GlpiSocket) {
        this.socket = socket;
    }

    public getHttpSocket(): AxiosInstance {
        return this.socket.getHttp();
    }

    public getSocket(): GlpiSocket {
        return this.socket;
    }

    public setSocket(socket: GlpiSocket) {
        this.socket = socket;
    }

    public setReloginInterceptor(interceptor: number) {
        this.reloginInterceptor = interceptor;
    }

    public async killSession<T>(): Promise<AxiosResponse<T>> {
        const response = this.socket.call<T>('GET', 'killSession');
        if (this.reloginInterceptor) {
            this.getHttpSocket().interceptors.request.eject(this.reloginInterceptor);
        }
        return response;
    }

    public async lostPassword<T>(email: string, passwordForgetToken?: string, password?: string): Promise<AxiosResponse<T>> {
        const body: any = {
            email,
        };

        if (password) {
            body.password_forget_token = passwordForgetToken;
            body.password = password;
        }

        return this.socket.call<T>('PUT', 'lostPassword', { data: body });
    }

    public async getMyProfiles<T>(): Promise<AxiosResponse<T>> {
        return this.socket.call<T>('GET', 'getMyProfiles');
    }

    public async getActiveProfile<T>(): Promise<AxiosResponse<T>> {
        return this.socket.call<T>('GET', 'getActiveProfile');
    }

    public async changeActiveProfile<T>(profiles_id: number): Promise<AxiosResponse<T>> {
        return this.socket.call<T>('POST', 'changeActiveProfile', { data: { profiles_id } });
    }

    public async getMyEntities<T>(is_recursive: boolean = false): Promise<AxiosResponse<T>> {
        return this.socket.call<T>('GET', 'getMyEntities', { params: { is_recursive } });
    }

    public async getActiveEntities<T>(): Promise<AxiosResponse<T>> {
        return this.socket.call<T>('GET', 'getActiveEntities');
    }

    public async changeActiveEntities<T>(
        entities_id: string | number = 'all',
        is_recursive: boolean = false,
    ): Promise<AxiosResponse<T>> {
        return this.socket.call<T>('POST', 'changeActiveEntities', {
            data: {
                entities_id,
                is_recursive,
            },
        });
    }

    public async getFullSession<T>(): Promise<AxiosResponse<T>> {
        return this.socket.call<T>('GET', 'getFullSession');
    }

    public async getGlpiConfig<T>(): Promise<AxiosResponse<T>> {
        return this.socket.call<T>('GET', 'getGlpiConfig');
    }

    public async getItem<T>(item_type: string, id: number, options: IGetItemParams = {}): Promise<AxiosResponse<T>> {
        return this.socket.call<T>('GET', `${item_type}/${id}`, { params: options });
    }

    public async getItems<T>(item_type: string, options: IGetItemsParams = {}): Promise<AxiosResponse<T>> {
        const serializedParams = this.serializeObjectForGetMethod(['searchText'], options);
        return this.socket.call<T>('GET', item_type, { params: serializedParams });
    }

    public async getSubitems<T>(
        item_type: string,
        id: number,
        subitem_type: string,
        options: IGetItemsParams = {},
    ): Promise<AxiosResponse<T>> {
        const serializedParams = this.serializeObjectForGetMethod(['searchText'], options);
        return this.socket.call<T>('GET', `${item_type}/${id}/${subitem_type}`, {
            params: serializedParams,
        });
    }

    public async getMultipleItems<T>(options: IGetMultipleItemsParams): Promise<AxiosResponse<T>> {
        const serializedParams = this.serializeArrayForGetMethod(['items'], options);

        return this.socket.call<T>('GET', 'getMultipleItems', { params: serializedParams });
    }

    public async listSearchOptions<T>(item_type: string, raw?: boolean): Promise<AxiosResponse<T>> {
        const params: any = {};
        if (raw) params.raw = raw;
        return this.socket.call<T>('GET', `listSearchOptions/${item_type}`, { params });
    }

    public async search<T>(item_type: string, options: ISearchParams = {}): Promise<AxiosResponse<T>> {
        const serializedParams = this.serializeArrayForGetMethod(['criteria', 'forcedisplay'], options);

        return this.socket.call<T>('GET', `search/${item_type}`, { params: serializedParams });
    }

    public async addItem<T>(item_type: string, input: any = {}): Promise<AxiosResponse<T>> {
        return this.socket.call<T>('POST', item_type, { data: { input } });
    }

    public async updateItem<T>(item_type: string, id: number, input: any = {}): Promise<AxiosResponse<T>> {
        return this.socket.call<T>('PUT', `${item_type}/${id}`, { data: { input } });
    }

    public async deleteItem<T>(
        item_type: string,
        id: number | number[],
        options: IDeleteItemParams = {},
    ): Promise<AxiosResponse<T>> {
        if (Array.isArray(id)) {
            const params: any = Object.assign(
                {
                    input: id.map(i => ({ id: i })),
                },
                options,
            );
            return this.socket.call<T>('DELETE', item_type, { params });
        } else {
            return this.socket.call<T>('DELETE', `${item_type}/${id}`, { params: options });
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
