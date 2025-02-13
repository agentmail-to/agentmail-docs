"use strict";
/**
 * This file was auto-generated by Fern from our API Definition.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Threads = void 0;
const core = __importStar(require("../../../../core"));
const AgentMailApi = __importStar(require("../../../index"));
const serializers = __importStar(require("../../../../serialization/index"));
const url_join_1 = __importDefault(require("url-join"));
const errors = __importStar(require("../../../../errors/index"));
class Threads {
    constructor(_options) {
        this._options = _options;
    }
    /**
     * @param {AgentMailApi.InboxId} inboxId
     * @param {AgentMailApi.ListThreadsRequest} request
     * @param {Threads.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link AgentMailApi.InboxNotFoundError}
     *
     * @example
     *     await client.threads.listThreads("inbox_id")
     */
    listThreads(inboxId, request = {}, requestOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, lastKey } = request;
            const _queryParams = {};
            if (limit != null) {
                _queryParams["limit"] = limit.toString();
            }
            if (lastKey != null) {
                _queryParams["last_key"] = lastKey;
            }
            const _response = yield core.fetcher({
                url: (0, url_join_1.default)(yield core.Supplier.get(this._options.environment), `/v0/inboxes/${encodeURIComponent(serializers.InboxId.jsonOrThrow(inboxId))}/threads/`),
                method: "GET",
                headers: {
                    Authorization: yield this._getAuthorizationHeader(),
                    "X-Fern-Language": "JavaScript",
                    "X-Fern-Runtime": core.RUNTIME.type,
                    "X-Fern-Runtime-Version": core.RUNTIME.version,
                },
                contentType: "application/json",
                queryParameters: _queryParams,
                requestType: "json",
                timeoutMs: (requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.timeoutInSeconds) != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
                maxRetries: requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.maxRetries,
                abortSignal: requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.abortSignal,
            });
            if (_response.ok) {
                return serializers.ListThreadsResponse.parseOrThrow(_response.body, {
                    unrecognizedObjectKeys: "passthrough",
                    allowUnrecognizedUnionMembers: true,
                    allowUnrecognizedEnumValues: true,
                    breadcrumbsPrefix: ["response"],
                });
            }
            if (_response.error.reason === "status-code") {
                switch (_response.error.statusCode) {
                    case 404:
                        throw new AgentMailApi.InboxNotFoundError(serializers.InboxNotFoundError.parseOrThrow(_response.error.body, {
                            unrecognizedObjectKeys: "passthrough",
                            allowUnrecognizedUnionMembers: true,
                            allowUnrecognizedEnumValues: true,
                            breadcrumbsPrefix: ["response"],
                        }));
                    default:
                        throw new errors.AgentMailApiError({
                            statusCode: _response.error.statusCode,
                            body: _response.error.body,
                        });
                }
            }
            switch (_response.error.reason) {
                case "non-json":
                    throw new errors.AgentMailApiError({
                        statusCode: _response.error.statusCode,
                        body: _response.error.rawBody,
                    });
                case "timeout":
                    throw new errors.AgentMailApiTimeoutError();
                case "unknown":
                    throw new errors.AgentMailApiError({
                        message: _response.error.errorMessage,
                    });
            }
        });
    }
    /**
     * @param {AgentMailApi.InboxId} inboxId
     * @param {AgentMailApi.ThreadId} threadId
     * @param {Threads.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link AgentMailApi.InboxNotFoundError}
     * @throws {@link AgentMailApi.ThreadNotFoundError}
     *
     * @example
     *     await client.threads.getThread("inbox_id", "thread_id")
     */
    getThread(inboxId, threadId, requestOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const _response = yield core.fetcher({
                url: (0, url_join_1.default)(yield core.Supplier.get(this._options.environment), `/v0/inboxes/${encodeURIComponent(serializers.InboxId.jsonOrThrow(inboxId))}/threads/${encodeURIComponent(serializers.ThreadId.jsonOrThrow(threadId))}`),
                method: "GET",
                headers: {
                    Authorization: yield this._getAuthorizationHeader(),
                    "X-Fern-Language": "JavaScript",
                    "X-Fern-Runtime": core.RUNTIME.type,
                    "X-Fern-Runtime-Version": core.RUNTIME.version,
                },
                contentType: "application/json",
                requestType: "json",
                timeoutMs: (requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.timeoutInSeconds) != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
                maxRetries: requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.maxRetries,
                abortSignal: requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.abortSignal,
            });
            if (_response.ok) {
                return serializers.Thread.parseOrThrow(_response.body, {
                    unrecognizedObjectKeys: "passthrough",
                    allowUnrecognizedUnionMembers: true,
                    allowUnrecognizedEnumValues: true,
                    breadcrumbsPrefix: ["response"],
                });
            }
            if (_response.error.reason === "status-code") {
                switch (_response.error.statusCode) {
                    case 404:
                        throw new AgentMailApi.InboxNotFoundError(serializers.InboxNotFoundError.parseOrThrow(_response.error.body, {
                            unrecognizedObjectKeys: "passthrough",
                            allowUnrecognizedUnionMembers: true,
                            allowUnrecognizedEnumValues: true,
                            breadcrumbsPrefix: ["response"],
                        }));
                    case 404:
                        throw new AgentMailApi.ThreadNotFoundError(serializers.ThreadNotFoundError.parseOrThrow(_response.error.body, {
                            unrecognizedObjectKeys: "passthrough",
                            allowUnrecognizedUnionMembers: true,
                            allowUnrecognizedEnumValues: true,
                            breadcrumbsPrefix: ["response"],
                        }));
                    default:
                        throw new errors.AgentMailApiError({
                            statusCode: _response.error.statusCode,
                            body: _response.error.body,
                        });
                }
            }
            switch (_response.error.reason) {
                case "non-json":
                    throw new errors.AgentMailApiError({
                        statusCode: _response.error.statusCode,
                        body: _response.error.rawBody,
                    });
                case "timeout":
                    throw new errors.AgentMailApiTimeoutError();
                case "unknown":
                    throw new errors.AgentMailApiError({
                        message: _response.error.errorMessage,
                    });
            }
        });
    }
    /**
     * Delete thread and all of its messages and attachments.
     *
     * @param {AgentMailApi.InboxId} inboxId
     * @param {AgentMailApi.ThreadId} threadId
     * @param {Threads.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link AgentMailApi.InboxNotFoundError}
     * @throws {@link AgentMailApi.ThreadNotFoundError}
     *
     * @example
     *     await client.threads.deleteThread("inbox_id", "thread_id")
     */
    deleteThread(inboxId, threadId, requestOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const _response = yield core.fetcher({
                url: (0, url_join_1.default)(yield core.Supplier.get(this._options.environment), `/v0/inboxes/${encodeURIComponent(serializers.InboxId.jsonOrThrow(inboxId))}/threads/${encodeURIComponent(serializers.ThreadId.jsonOrThrow(threadId))}`),
                method: "DELETE",
                headers: {
                    Authorization: yield this._getAuthorizationHeader(),
                    "X-Fern-Language": "JavaScript",
                    "X-Fern-Runtime": core.RUNTIME.type,
                    "X-Fern-Runtime-Version": core.RUNTIME.version,
                },
                contentType: "application/json",
                requestType: "json",
                timeoutMs: (requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.timeoutInSeconds) != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
                maxRetries: requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.maxRetries,
                abortSignal: requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.abortSignal,
            });
            if (_response.ok) {
                return;
            }
            if (_response.error.reason === "status-code") {
                switch (_response.error.statusCode) {
                    case 404:
                        throw new AgentMailApi.InboxNotFoundError(serializers.InboxNotFoundError.parseOrThrow(_response.error.body, {
                            unrecognizedObjectKeys: "passthrough",
                            allowUnrecognizedUnionMembers: true,
                            allowUnrecognizedEnumValues: true,
                            breadcrumbsPrefix: ["response"],
                        }));
                    case 404:
                        throw new AgentMailApi.ThreadNotFoundError(serializers.ThreadNotFoundError.parseOrThrow(_response.error.body, {
                            unrecognizedObjectKeys: "passthrough",
                            allowUnrecognizedUnionMembers: true,
                            allowUnrecognizedEnumValues: true,
                            breadcrumbsPrefix: ["response"],
                        }));
                    default:
                        throw new errors.AgentMailApiError({
                            statusCode: _response.error.statusCode,
                            body: _response.error.body,
                        });
                }
            }
            switch (_response.error.reason) {
                case "non-json":
                    throw new errors.AgentMailApiError({
                        statusCode: _response.error.statusCode,
                        body: _response.error.rawBody,
                    });
                case "timeout":
                    throw new errors.AgentMailApiTimeoutError();
                case "unknown":
                    throw new errors.AgentMailApiError({
                        message: _response.error.errorMessage,
                    });
            }
        });
    }
    _getAuthorizationHeader() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const bearer = (_a = (yield core.Supplier.get(this._options.apiKey))) !== null && _a !== void 0 ? _a : process === null || process === void 0 ? void 0 : process.env["AGENTMAIL_API_KEY"];
            if (bearer == null) {
                throw new errors.AgentMailApiError({
                    message: "Please specify AGENTMAIL_API_KEY when instantiating the client.",
                });
            }
            return `Bearer ${bearer}`;
        });
    }
}
exports.Threads = Threads;
