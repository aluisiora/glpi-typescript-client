import { AxiosError } from 'axios';

export class GlpiResponseException extends Error {
    public statusCode: number;

    public statusText: string;

    public reason: string;

    public code: string;

    constructor(error: AxiosError) {
        super();

        this.code = error.code;

        if (error.response) {
            this.statusCode = error.response.status;
            this.statusText = error.response.statusText;

            if (Array.isArray(error.response.data)) {
                const [reason, message] = error.response.data;
                this.reason = reason;
                this.message = message;
            }
        }

        if (!this.message) {
            this.message = error.message;
        }
    }
}
