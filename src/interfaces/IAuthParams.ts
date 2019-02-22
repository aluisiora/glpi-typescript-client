export interface IAuthParams {
    appToken: string;
    userToken?: string;
    user?: {
        username: string;
        password: string;
    };
}
