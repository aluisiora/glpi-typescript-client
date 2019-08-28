import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { GlpiResponseException } from './GlpiResponseException';

export class GlpiSocket {
    private http: AxiosInstance;

    private url: string;

    constructor(url: string, headers: any = {}) {
        this.url = url.replace(/\/$/, '') + '/';
        this.setHeader(headers);
    }

    public getHttp(): AxiosInstance {
        return this.http;
    }

    public setHeader(headers: any = {}) {
        this.http = this.makeHttpSocket(this.url, headers);
    }

    public async call<T>(method: string, path: string, options: any = {}): Promise<AxiosResponse<T>> {
        try {
            return await this.http.request<T>(
                Object.assign(
                    {
                        url: path,
                        method: method.toLowerCase(),
                    },
                    options,
                ),
            );
        } catch (error) {
            throw new GlpiResponseException(error);
        }
    }

    private makeHttpSocket(url: string, extraHeaders: any = {}) {
        const http = axios.create({
            baseURL: url,
            headers: Object.assign(
                {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                extraHeaders,
            ),
            timeout: 40000,
            // @ts-ignore
            retries: 0,
        });

        // Retry timeout
        http.interceptors.response.use(null, error => {
            if (error.code === 'ECONNABORTED' && error.config && error.config.retries < 3) {
                error.config.retries++;
                return http.request(error.config);
            }

            return Promise.reject(error);
        });

        return http;
    }
}
