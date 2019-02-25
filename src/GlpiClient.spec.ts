import { GlpiSocket } from './GlpiSocket';
import { GlpiClient } from './GlpiClient';
import { GlpiAPI } from './GlpiAPI';

describe('GlpiClient', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initSession with user token', async () => {
        const url = 'http://someurl.com';
        const appToken = 'someapptoken';
        const userToken = 'sometoken';
        const sessionToken = 'somesessiontoken';

        const socketCallSpy = jest.spyOn(GlpiSocket.prototype, 'call');
        const socketHeaderSpy = jest.spyOn(GlpiSocket.prototype, 'setHeader');

        socketCallSpy.mockImplementation(
            (method: string, path: string): any => {
                return Promise.resolve({ data: { session_token: sessionToken } });
            },
        );

        const client = new GlpiClient(url);

        socketHeaderSpy.mockImplementationOnce((headers: any) => {
            expect(headers).toHaveProperty('Authorization', 'user_token ' + userToken);
            expect(headers).toHaveProperty('App-Token', appToken);
            expect(headers).not.toHaveProperty('Session-Token');

            socketHeaderSpy.mockImplementationOnce((headers2: any) => {
                expect(headers2).toHaveProperty('App-Token', appToken);
                expect(headers2).toHaveProperty('Session-Token', sessionToken);
                expect(headers2).not.toHaveProperty('Authorization');
            });
        });

        const api = await client.initSession({
            appToken,
            userToken,
        });

        expect(socketCallSpy).toBeCalledWith('GET', 'initSession');
        expect(api).toBeInstanceOf(GlpiAPI);
    });

    it('should initSession with user and password', async () => {
        const url = 'http://someurl2.com';
        const appToken = 'someapptoken2';
        const username = 'someuser';
        const password = 'somepassword';
        const sessionToken = 'somesessiontoken2';

        const userBase64 = Buffer.from(`${username}:${password}`).toString('base64');

        const socketCallSpy = jest.spyOn(GlpiSocket.prototype, 'call');
        const socketHeaderSpy = jest.spyOn(GlpiSocket.prototype, 'setHeader');

        socketCallSpy.mockImplementation(
            (method: string, path: string): any => {
                return Promise.resolve({ data: { session_token: sessionToken } });
            },
        );

        const client = new GlpiClient(url);

        socketHeaderSpy.mockImplementationOnce((headers: any) => {
            expect(headers).toHaveProperty('Authorization', 'Basic ' + userBase64);
            expect(headers).toHaveProperty('App-Token', appToken);
            expect(headers).not.toHaveProperty('Session-Token');

            socketHeaderSpy.mockImplementationOnce((headers2: any) => {
                expect(headers2).toHaveProperty('App-Token', appToken);
                expect(headers2).toHaveProperty('Session-Token', sessionToken);
                expect(headers2).not.toHaveProperty('Authorization');
            });
        });

        const api = await client.initSession({
            appToken,
            user: {
                username,
                password,
            },
        });

        expect(socketCallSpy).toBeCalledWith('GET', 'initSession');
        expect(api).toBeInstanceOf(GlpiAPI);
    });
});
