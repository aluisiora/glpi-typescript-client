import axios from 'axios';
import { GlpiSocket } from './GlpiSocket';

describe('GlpiSocket', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('call glpi without any authentication params', async () => {
        const url = 'http://doenstmatter.com';
        const method = 'GET';
        const path = '/somepath';

        // @ts-ignore
        jest.spyOn(axios, 'create').mockImplementation((data: any) => {
            expect(data.baseURL).toBe(url + '/');
            expect(data.headers).toHaveProperty('Accept', 'application/json');
            expect(data.headers).toHaveProperty('Content-Type', 'application/json');
            expect(data.headers).not.toHaveProperty('Authorization');
            expect(data.headers).not.toHaveProperty('App-Token');
            expect(data.headers).not.toHaveProperty('Session-Token');
            return {
                interceptors: {
                    response: {
                        use: (param1, param2) => {
                            expect(param1).toBe(null);
                            expect(typeof param2).toBe('function');
                        },
                    },
                },
                request: async (obj: any): Promise<boolean> => {
                    expect(obj).toHaveProperty('url', path);
                    expect(obj).toHaveProperty('method', method.toLowerCase());
                    return true;
                },
            };
        });

        const socket = new GlpiSocket(url);
        const response = await socket.call(method, path);
        expect(response).toBeTruthy();
    });

    it('should call glpi with custom headers', async () => {
        const url = 'http://doenstmatter.com';
        const method = 'GET';
        const path = '/somepath';

        const authorization = 'Bearer thetoken';
        const xcustom = 'someval';

        const socket = new GlpiSocket(url);

        // @ts-ignore
        jest.spyOn(axios, 'create').mockImplementation((data: any) => {
            expect(data.baseURL).toBe(url + '/');
            expect(data.headers).toHaveProperty('Accept', 'application/json');
            expect(data.headers).toHaveProperty('Content-Type', 'application/json');
            expect(data.headers).toHaveProperty('Authorization', authorization);
            expect(data.headers).toHaveProperty('X-Custom', xcustom);
            return {
                interceptors: {
                    response: {
                        use: (param1, param2) => {
                            expect(param1).toBe(null);
                            expect(typeof param2).toBe('function');
                        },
                    },
                },
                request: async (obj: any): Promise<boolean> => {
                    expect(obj).toHaveProperty('url', path);
                    expect(obj).toHaveProperty('method', method.toLowerCase());
                    return true;
                },
            };
        });

        socket.setHeader({
            'Authorization': authorization,
            'X-Custom': xcustom,
        });
        const response = await socket.call(method, path);
        expect(response).toBeTruthy();
    });
});
