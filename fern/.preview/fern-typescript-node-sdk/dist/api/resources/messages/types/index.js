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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./MessageId"), exports);
__exportStar(require("./MessageLabels"), exports);
__exportStar(require("./MessageTimestamp"), exports);
__exportStar(require("./MessageFrom"), exports);
__exportStar(require("./MessageTo"), exports);
__exportStar(require("./MessageCc"), exports);
__exportStar(require("./MessageBcc"), exports);
__exportStar(require("./MessageSubject"), exports);
__exportStar(require("./MessagePreview"), exports);
__exportStar(require("./MessageText"), exports);
__exportStar(require("./MessageHtml"), exports);
__exportStar(require("./MessageAttachments"), exports);
__exportStar(require("./MessageItem"), exports);
__exportStar(require("./Message"), exports);
__exportStar(require("./ListMessagesResponse"), exports);
__exportStar(require("./Addresses"), exports);
__exportStar(require("./SendMessageReplyTo"), exports);
__exportStar(require("./SendMessageTo"), exports);
__exportStar(require("./SendMessageCc"), exports);
__exportStar(require("./SendMessageBcc"), exports);
__exportStar(require("./SendMessageAttachments"), exports);
__exportStar(require("./SendMessageRequest"), exports);
__exportStar(require("./SendMessageResponse"), exports);
__exportStar(require("./ReplyToMessageRequest"), exports);
__exportStar(require("./UpdateMessageRequest"), exports);
