"use strict";
/**
 * This file was auto-generated by Fern from our API Definition.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentMailApiClient = void 0;
const Client_1 = require("./api/resources/inboxes/client/Client");
const Client_2 = require("./api/resources/threads/client/Client");
const Client_3 = require("./api/resources/messages/client/Client");
class AgentMailApiClient {
    constructor(_options) {
        this._options = _options;
    }
    get inboxes() {
        var _a;
        return ((_a = this._inboxes) !== null && _a !== void 0 ? _a : (this._inboxes = new Client_1.Inboxes(this._options)));
    }
    get threads() {
        var _a;
        return ((_a = this._threads) !== null && _a !== void 0 ? _a : (this._threads = new Client_2.Threads(this._options)));
    }
    get messages() {
        var _a;
        return ((_a = this._messages) !== null && _a !== void 0 ? _a : (this._messages = new Client_3.Messages(this._options)));
    }
}
exports.AgentMailApiClient = AgentMailApiClient;
