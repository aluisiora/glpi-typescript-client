import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class GlpiSocket {
    private http: AxiosInstance;

    private url: string;

    constructor(url: string, headers: any = {}) {
        this.url = url.replace(/\/$/, '') + '/';
        this.setHeader(headers);
    }

    public setHeader(headers: any = {}) {
        this.http = this.makeHttpSocket(this.url, headers);
    }

    public async call(method: string, path: string, options: any = {}): Promise<AxiosResponse> {
        return this.http.request(
            Object.assign(
                {
                    url: path,
                    method: method.toLocaleLowerCase(),
                },
                options,
            ),
        );
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
