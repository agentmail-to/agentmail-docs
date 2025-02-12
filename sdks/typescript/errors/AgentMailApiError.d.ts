/**
 * This file was auto-generated by Fern from our API Definition.
 */
export declare class AgentMailApiError extends Error {
    readonly statusCode?: number;
    readonly body?: unknown;
    constructor({ message, statusCode, body }: {
        message?: string;
        statusCode?: number;
        body?: unknown;
    });
}
