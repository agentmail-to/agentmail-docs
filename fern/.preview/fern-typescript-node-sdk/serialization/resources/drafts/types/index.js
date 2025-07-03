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
__exportStar(require("./DraftId"), exports);
__exportStar(require("./DraftLabels"), exports);
__exportStar(require("./DraftReplyTo"), exports);
__exportStar(require("./DraftTo"), exports);
__exportStar(require("./DraftCc"), exports);
__exportStar(require("./DraftBcc"), exports);
__exportStar(require("./DraftSubject"), exports);
__exportStar(require("./DraftPreview"), exports);
__exportStar(require("./DraftText"), exports);
__exportStar(require("./DraftHtml"), exports);
__exportStar(require("./DraftAttachments"), exports);
__exportStar(require("./DraftUpdatedAt"), exports);
__exportStar(require("./DraftItem"), exports);
__exportStar(require("./Draft"), exports);
__exportStar(require("./ListDraftsResponse"), exports);
__exportStar(require("./CreateDraftRequest"), exports);
