import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import { Server } from 'http';

const testapp = express();

testapp.use(cors());
testapp.use(bodyParser.json());

let server: Server;

export const appToken = Math.random().toString(36);
export const testuser = {
    username: Math.random().toString(36),
    password: Math.random().toString(36),
    token: Math.random().toString(36),
};
export const sessionToken = Math.random().toString(36);

export const genericError = ['#SOME_ERROR', 'The error message referencing a link. http://somelink.com/#SOME_ERROR'];

export const start = async (port: number) => {
    return new Promise(resolve => {
        server = testapp.listen(port, () => {
            console.log(`Test server started at port ${port}`); // tslint:disable-line
            resolve();
        });
    });
};

export const stop = async () => {
    return new Promise(resolve => {
        if (!server) return resolve();
        server.close(() => {
            console.log("Test server stopped"); // tslint:disable-line
            resolve();
        });
    });
};

testapp.get('/initSession', (req, res) => {
    const headers = req.headers;

    if (headers['app-token'] !== appToken) return res.status(400).send(genericError);

    if (headers.authorization) {
        if (headers.authorization.includes('Basic')) {
            const b64 = Buffer.from(`${testuser.username}:${testuser.password}`).toString('base64');
            if (headers.authorization === 'Basic ' + b64) {
                return res.json({ session_token: sessionToken });
            }
        } else if (headers.authorization.includes('user_token')) {
            if (headers.authorization === 'user_token ' + testuser.token) {
                return res.json({ session_token: sessionToken });
            }
        }
    }

    return res.status(400).send(genericError);
});

testapp.get('/killSession', (req, res) => {
    res.send();
});
