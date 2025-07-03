"use strict";
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhooks = exports.threads = exports.messages = exports.drafts = exports.contexts = exports.attachments = exports.inboxes = void 0;
exports.inboxes = __importStar(require("./inboxes"));
exports.attachments = __importStar(require("./attachments"));
__exportStar(require("./attachments/types"), exports);
exports.contexts = __importStar(require("./contexts"));
__exportStar(require("./contexts/types"), exports);
exports.drafts = __importStar(require("./drafts"));
__exportStar(require("./drafts/types"), exports);
exports.messages = __importStar(require("./messages"));
__exportStar(require("./messages/types"), exports);
exports.threads = __importStar(require("./threads"));
__exportStar(require("./threads/types"), exports);
exports.webhooks = __importStar(require("./webhooks"));
__exportStar(require("./webhooks/types"), exports);
__exportStar(require("./messages/errors"), exports);
__exportStar(require("./contexts/client/requests"), exports);
__exportStar(require("./drafts/client/requests"), exports);
__exportStar(require("./threads/client/requests"), exports);
__exportStar(require("./webhooks/client/requests"), exports);
