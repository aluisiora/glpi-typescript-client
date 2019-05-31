import { IAuthParams } from './interfaces/IAuthParams';
import { GlpiSocket } from './GlpiSocket';
import { GlpiAPI } from './GlpiAPI';

export class GlpiClient {
    private url: string;

    private isReloging: boolean = false;

    private reloginTries: number = 0;

    private httpDefaults: any = {};

    constructor(url: string) {
        this.url = url;
    }

    public async initSession(auth: IAuthParams, relogin: boolean = false): Promise<GlpiAPI> {
        let authorization = '';
        if (auth.user) {
            const b64 = Buffer.from(`${auth.user.username}:${auth.user.password}`).toString('base64');
            authorization = 'Basic ' + b64;
        } else {
            authorization = 'user_token ' + auth.userToken;
        }

        const socket = new GlpiSocket(this.url, {
            'Authorization': authorization,
            'App-Token': auth.appToken,
        });

        const response = await socket.call('GET', 'initSession');

        const authenticatedSocket = new GlpiSocket(this.url, {
            'App-Token': auth.appToken,
            'Session-Token': response.data.session_token,
        });

        const api = new GlpiAPI(authenticatedSocket);

        if (relogin) this.ajustRelogin(api, auth);

        return api;
    }

    private ajustRelogin(api: GlpiAPI, auth: IAuthParams) {
        const http = api.getHttpSocket();
        const interceptor: number = http.interceptors.response.use(
            response => {
                this.reloginTries = 0;
                return response;
            },
            async error => {
                const status = error.response ? error.response.status : 0;

                if (status === 401) {
                    // If the glpi api is being recreated,
                    // hold the request for 3 seconds
                    if (this.isReloging) {
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    } else {
                        this.reloginTries++;
                        this.isReloging = true;

                        if (this.reloginTries > 3) {
                            if (this.reloginTries > 60) this.reloginTries = 60;
                            await new Promise(resolve => setTimeout(resolve, 1000 * this.reloginTries));
                        }

                        try {
                            const client = new GlpiClient(this.url);
                            const newApi = await client.initSession(auth);

                            const originalHttp = api.getHttpSocket();
                            const newHttp = newApi.getHttpSocket();

                            Object.assign(originalHttp.defaults, newHttp.defaults);
                            Object.assign(this.httpDefaults, originalHttp.defaults);

                            this.isReloging = false;
                        } catch (error) {}
                    }

                    Object.assign(error.config, this.httpDefaults);
                    return api.getHttpSocket().request(error.config);
                }
                throw error;
            },
        );
        api.setReloginInterceptor(interceptor);
    }
}
