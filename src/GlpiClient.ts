import { IAuthParams } from './interfaces/IAuthParams';
import { GlpiSocket } from './GlpiSocket';
import { GlpiAPI } from './GlpiAPI';

export class GlpiClient {
    private url: string;

    constructor(url: string) {
        this.url = url;
    }

    public async initSession(auth: IAuthParams): Promise<any> {
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

        return new GlpiAPI(authenticatedSocket);
    }
}
