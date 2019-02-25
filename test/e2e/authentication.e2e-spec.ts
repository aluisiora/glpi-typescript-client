import { start, stop, testuser, appToken, genericError } from '../pseudo-server';
import { GlpiClient, GlpiAPI } from '../../src';
import { GlpiResponseException } from '../../src/GlpiResponseException';

describe('Authentication Tests', () => {
    const apis: GlpiAPI[] = [];
    let url: string = '';

    beforeAll(async () => {
        const port = 2345;
        url = 'http://localhost:' + port;
        await start(port);
    });

    it('should login via user token', async () => {
        const client = new GlpiClient(url);
        const api = await client.initSession({
            appToken,
            userToken: testuser.token,
        });

        apis.push(api);

        expect(api).toBeInstanceOf(GlpiAPI);
    });

    it('should login via username and password', async () => {
        const client = new GlpiClient(url);
        const api = await client.initSession({
            appToken,
            user: {
                username: testuser.username,
                password: testuser.password,
            },
        });

        apis.push(api);

        expect(api).toBeInstanceOf(GlpiAPI);
    });

    it('should fail login', async () => {
        const client = new GlpiClient(url);

        try {
            const api = await client.initSession({
                appToken,
                user: {
                    username: 'wrongusername',
                    password: 'wrongpassword',
                },
            });
        } catch (error) {
            expect(error).toBeInstanceOf(GlpiResponseException);
            expect(error.reason).toBe(genericError[0]);
            expect(error.message).toBe(genericError[1]);
        }
    });

    afterAll(async () => {
        for (const api of apis) {
            await api.killSession();
        }
        await stop();
    });
});
