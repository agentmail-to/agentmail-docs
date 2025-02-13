/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../../../index";
import * as AgentMailApi from "../../../../api/index";
import * as core from "../../../../core";
import { SendMessageTo } from "./SendMessageTo";
import { SendMessageCc } from "./SendMessageCc";
import { SendMessageBcc } from "./SendMessageBcc";
import { MessageText } from "./MessageText";
import { MessageHtml } from "./MessageHtml";
export declare const ReplyToMessageRequest: core.serialization.ObjectSchema<serializers.ReplyToMessageRequest.Raw, AgentMailApi.ReplyToMessageRequest>;
export declare namespace ReplyToMessageRequest {
    interface Raw {
        to?: SendMessageTo.Raw | null;
        cc?: SendMessageCc.Raw;
        bcc?: SendMessageBcc.Raw;
        text?: MessageText.Raw;
        html?: MessageHtml.Raw;
    }
}
