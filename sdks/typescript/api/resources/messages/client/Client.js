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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.Messages = void 0;
const core = __importStar(require("../../../../core"));
const AgentMailApi = __importStar(require("../../../index"));
const serializers = __importStar(require("../../../../serialization/index"));
const url_join_1 = __importDefault(require("url-join"));
const errors = __importStar(require("../../../../errors/index"));
class Messages {
    constructor(_options) {
        this._options = _options;
    }
    /**
     * @param {AgentMailApi.InboxId} inboxId
     * @param {AgentMailApi.ListMessagesRequest} request
     * @param {Messages.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link AgentMailApi.NotFoundError}
     *
     * @example
     *     await client.messages.listMessages("inbox_id")
     */
    listMessages(inboxId_1) {
        return __awaiter(this, arguments, void 0, function* (inboxId, request = {}, requestOptions) {
            var _a;
            const { limit, lastKey } = request;
            const _queryParams = {};
            if (limit != null) {
                _queryParams["limit"] = limit.toString();
            }
            if (lastKey != null) {
                _queryParams["last_key"] = lastKey;
            }
            const _response = yield core.fetcher({
                url: (0, url_join_1.default)((_a = (yield core.Supplier.get(this._options.baseUrl))) !== null && _a !== void 0 ? _a : (yield core.Supplier.get(this._options.environment)), `/v0/inboxes/${encodeURIComponent(serializers.InboxId.jsonOrThrow(inboxId))}/messages/`),
                method: "GET",
                headers: Object.assign({ Authorization: yield this._getAuthorizationHeader(), "X-Fern-Language": "JavaScript", "X-Fern-Runtime": core.RUNTIME.type, "X-Fern-Runtime-Version": core.RUNTIME.version }, requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.headers),
                contentType: "application/json",
                queryParameters: _queryParams,
                requestType: "json",
                timeoutMs: (requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.timeoutInSeconds) != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
                maxRetries: requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.maxRetries,
                abortSignal: requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.abortSignal,
            });
            if (_response.ok) {
                return serializers.ListMessagesResponse.parseOrThrow(_response.body, {
                    unrecognizedObjectKeys: "passthrough",
                    allowUnrecognizedUnionMembers: true,
                    allowUnrecognizedEnumValues: true,
                    breadcrumbsPrefix: ["response"],
                });
            }
            if (_response.error.reason === "status-code") {
                switch (_response.error.statusCode) {
                    case 404:
                        throw new AgentMailApi.NotFoundError(serializers.ErrorResponse.parseOrThrow(_response.error.body, {
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
                    throw new errors.AgentMailApiTimeoutError("Timeout exceeded when calling GET /v0/inboxes/{inbox_id}/messages/.");
                case "unknown":
                    throw new errors.AgentMailApiError({
                        message: _response.error.errorMessage,
                    });
            }
        });
    }
    /**
     * @param {AgentMailApi.InboxId} inboxId
     * @param {AgentMailApi.MessageId} messageId
     * @param {Messages.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link AgentMailApi.NotFoundError}
     *
     * @example
     *     await client.messages.getMessage("inbox_id", "message_id")
     */
    getMessage(inboxId, messageId, requestOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const _response = yield core.fetcher({
                url: (0, url_join_1.default)((_a = (yield core.Supplier.get(this._options.baseUrl))) !== null && _a !== void 0 ? _a : (yield core.Supplier.get(this._options.environment)), `/v0/inboxes/${encodeURIComponent(serializers.InboxId.jsonOrThrow(inboxId))}/messages/${encodeURIComponent(serializers.MessageId.jsonOrThrow(messageId))}`),
                method: "GET",
                headers: Object.assign({ Authorization: yield this._getAuthorizationHeader(), "X-Fern-Language": "JavaScript", "X-Fern-Runtime": core.RUNTIME.type, "X-Fern-Runtime-Version": core.RUNTIME.version }, requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.headers),
                contentType: "application/json",
                requestType: "json",
                timeoutMs: (requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.timeoutInSeconds) != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
                maxRetries: requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.maxRetries,
                abortSignal: requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.abortSignal,
            });
            if (_response.ok) {
                return serializers.Message.parseOrThrow(_response.body, {
                    unrecognizedObjectKeys: "passthrough",
                    allowUnrecognizedUnionMembers: true,
                    allowUnrecognizedEnumValues: true,
                    breadcrumbsPrefix: ["response"],
                });
            }
            if (_response.error.reason === "status-code") {
                switch (_response.error.statusCode) {
                    case 404:
                        throw new AgentMailApi.NotFoundError(serializers.ErrorResponse.parseOrThrow(_response.error.body, {
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
                    throw new errors.AgentMailApiTimeoutError("Timeout exceeded when calling GET /v0/inboxes/{inbox_id}/messages/{message_id}.");
                case "unknown":
                    throw new errors.AgentMailApiError({
                        message: _response.error.errorMessage,
                    });
            }
        });
    }
    /**
     * @throws {@link AgentMailApi.NotFoundError}
     */
    getAttachment(inboxId, messageId, attachmentId, requestOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const _response = yield core.fetcher({
                url: (0, url_join_1.default)((_a = (yield core.Supplier.get(this._options.baseUrl))) !== null && _a !== void 0 ? _a : (yield core.Supplier.get(this._options.environment)), `/v0/inboxes/${encodeURIComponent(serializers.InboxId.jsonOrThrow(inboxId))}/messages/${encodeURIComponent(serializers.MessageId.jsonOrThrow(messageId))}/attachments/${encodeURIComponent(serializers.AttachmentId.jsonOrThrow(attachmentId))}`),
                method: "GET",
                headers: Object.assign({ Authorization: yield this._getAuthorizationHeader(), "X-Fern-Language": "JavaScript", "X-Fern-Runtime": core.RUNTIME.type, "X-Fern-Runtime-Version": core.RUNTIME.version }, requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.headers),
                contentType: "application/json",
                requestType: "json",
                responseType: "streaming",
                timeoutMs: (requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.timeoutInSeconds) != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
                maxRetries: requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.maxRetries,
                abortSignal: requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.abortSignal,
            });
            if (_response.ok) {
                return _response.body;
            }
            if (_response.error.reason === "status-code") {
                switch (_response.error.statusCode) {
                    case 404:
                        throw new AgentMailApi.NotFoundError(serializers.ErrorResponse.parseOrThrow(_response.error.body, {
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
                    throw new errors.AgentMailApiTimeoutError("Timeout exceeded when calling GET /v0/inboxes/{inbox_id}/messages/{message_id}/attachments/{attachment_id}.");
                case "unknown":
                    throw new errors.AgentMailApiError({
                        message: _response.error.errorMessage,
                    });
            }
        });
    }
    /**
     * Delete message and its attachments.
     *
     * @param {AgentMailApi.InboxId} inboxId
     * @param {AgentMailApi.MessageId} messageId
     * @param {Messages.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link AgentMailApi.NotFoundError}
     *
     * @example
     *     await client.messages.deleteMessage("inbox_id", "message_id")
     */
    deleteMessage(inboxId, messageId, requestOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const _response = yield core.fetcher({
                url: (0, url_join_1.default)((_a = (yield core.Supplier.get(this._options.baseUrl))) !== null && _a !== void 0 ? _a : (yield core.Supplier.get(this._options.environment)), `/v0/inboxes/${encodeURIComponent(serializers.InboxId.jsonOrThrow(inboxId))}/messages/${encodeURIComponent(serializers.MessageId.jsonOrThrow(messageId))}`),
                method: "DELETE",
                headers: Object.assign({ Authorization: yield this._getAuthorizationHeader(), "X-Fern-Language": "JavaScript", "X-Fern-Runtime": core.RUNTIME.type, "X-Fern-Runtime-Version": core.RUNTIME.version }, requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.headers),
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
                        throw new AgentMailApi.NotFoundError(serializers.ErrorResponse.parseOrThrow(_response.error.body, {
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
                    throw new errors.AgentMailApiTimeoutError("Timeout exceeded when calling DELETE /v0/inboxes/{inbox_id}/messages/{message_id}.");
                case "unknown":
                    throw new errors.AgentMailApiError({
                        message: _response.error.errorMessage,
                    });
            }
        });
    }
    /**
     * @param {AgentMailApi.InboxId} inboxId
     * @param {AgentMailApi.SendMessageRequest} request
     * @param {Messages.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link AgentMailApi.NotFoundError}
     * @throws {@link AgentMailApi.ValidationError}
     *
     * @example
     *     await client.messages.sendMessage("inbox_id", {
     *         to: "to",
     *         cc: undefined,
     *         bcc: undefined,
     *         subject: undefined,
     *         text: undefined,
     *         html: undefined
     *     })
     */
    sendMessage(inboxId, request, requestOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const _response = yield core.fetcher({
                url: (0, url_join_1.default)((_a = (yield core.Supplier.get(this._options.baseUrl))) !== null && _a !== void 0 ? _a : (yield core.Supplier.get(this._options.environment)), `/v0/inboxes/${encodeURIComponent(serializers.InboxId.jsonOrThrow(inboxId))}/messages/`),
                method: "POST",
                headers: Object.assign({ Authorization: yield this._getAuthorizationHeader(), "X-Fern-Language": "JavaScript", "X-Fern-Runtime": core.RUNTIME.type, "X-Fern-Runtime-Version": core.RUNTIME.version }, requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.headers),
                contentType: "application/json",
                requestType: "json",
                body: serializers.SendMessageRequest.jsonOrThrow(request, { unrecognizedObjectKeys: "strip" }),
                timeoutMs: (requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.timeoutInSeconds) != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
                maxRetries: requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.maxRetries,
                abortSignal: requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.abortSignal,
            });
            if (_response.ok) {
                return serializers.SendMessageResponse.parseOrThrow(_response.body, {
                    unrecognizedObjectKeys: "passthrough",
                    allowUnrecognizedUnionMembers: true,
                    allowUnrecognizedEnumValues: true,
                    breadcrumbsPrefix: ["response"],
                });
            }
            if (_response.error.reason === "status-code") {
                switch (_response.error.statusCode) {
                    case 404:
                        throw new AgentMailApi.NotFoundError(serializers.ErrorResponse.parseOrThrow(_response.error.body, {
                            unrecognizedObjectKeys: "passthrough",
                            allowUnrecognizedUnionMembers: true,
                            allowUnrecognizedEnumValues: true,
                            breadcrumbsPrefix: ["response"],
                        }));
                    case 400:
                        throw new AgentMailApi.ValidationError(serializers.ValidationErrorResponse.parseOrThrow(_response.error.body, {
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
                    throw new errors.AgentMailApiTimeoutError("Timeout exceeded when calling POST /v0/inboxes/{inbox_id}/messages/.");
                case "unknown":
                    throw new errors.AgentMailApiError({
                        message: _response.error.errorMessage,
                    });
            }
        });
    }
    /**
     * @param {AgentMailApi.InboxId} inboxId
     * @param {AgentMailApi.MessageId} messageId
     * @param {AgentMailApi.ReplyToMessageRequest} request
     * @param {Messages.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link AgentMailApi.NotFoundError}
     * @throws {@link AgentMailApi.ValidationError}
     *
     * @example
     *     await client.messages.replyToMessage("inbox_id", "message_id", {
     *         to: undefined,
     *         cc: undefined,
     *         bcc: undefined,
     *         text: undefined,
     *         html: undefined
     *     })
     */
    replyToMessage(inboxId, messageId, request, requestOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const _response = yield core.fetcher({
                url: (0, url_join_1.default)((_a = (yield core.Supplier.get(this._options.baseUrl))) !== null && _a !== void 0 ? _a : (yield core.Supplier.get(this._options.environment)), `/v0/inboxes/${encodeURIComponent(serializers.InboxId.jsonOrThrow(inboxId))}/messages/${encodeURIComponent(serializers.MessageId.jsonOrThrow(messageId))}`),
                method: "POST",
                headers: Object.assign({ Authorization: yield this._getAuthorizationHeader(), "X-Fern-Language": "JavaScript", "X-Fern-Runtime": core.RUNTIME.type, "X-Fern-Runtime-Version": core.RUNTIME.version }, requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.headers),
                contentType: "application/json",
                requestType: "json",
                body: serializers.ReplyToMessageRequest.jsonOrThrow(request, { unrecognizedObjectKeys: "strip" }),
                timeoutMs: (requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.timeoutInSeconds) != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
                maxRetries: requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.maxRetries,
                abortSignal: requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.abortSignal,
            });
            if (_response.ok) {
                return serializers.SendMessageResponse.parseOrThrow(_response.body, {
                    unrecognizedObjectKeys: "passthrough",
                    allowUnrecognizedUnionMembers: true,
                    allowUnrecognizedEnumValues: true,
                    breadcrumbsPrefix: ["response"],
                });
            }
            if (_response.error.reason === "status-code") {
                switch (_response.error.statusCode) {
                    case 404:
                        throw new AgentMailApi.NotFoundError(serializers.ErrorResponse.parseOrThrow(_response.error.body, {
                            unrecognizedObjectKeys: "passthrough",
                            allowUnrecognizedUnionMembers: true,
                            allowUnrecognizedEnumValues: true,
                            breadcrumbsPrefix: ["response"],
                        }));
                    case 400:
                        throw new AgentMailApi.ValidationError(serializers.ValidationErrorResponse.parseOrThrow(_response.error.body, {
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
                    throw new errors.AgentMailApiTimeoutError("Timeout exceeded when calling POST /v0/inboxes/{inbox_id}/messages/{message_id}.");
                case "unknown":
                    throw new errors.AgentMailApiError({
                        message: _response.error.errorMessage,
                    });
            }
        });
    }
    _getAuthorizationHeader() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const bearer = (_a = (yield core.Supplier.get(this._options.apiKey))) !== null && _a !== void 0 ? _a : process === null || process === void 0 ? void 0 : process.env["AGENTMAIL_API_KEY"];
            if (bearer == null) {
                throw new errors.AgentMailApiError({
                    message: "Please specify a bearer by either passing it in to the constructor or initializing a AGENTMAIL_API_KEY environment variable",
                });
            }
            return `Bearer ${bearer}`;
        });
    }
}
exports.Messages = Messages;
