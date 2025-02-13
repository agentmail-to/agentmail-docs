/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../../../index";
import * as AgentMailApi from "../../../../api/index";
import * as core from "../../../../core";
import { InboxId } from "./InboxId";
import { DisplayName } from "./DisplayName";
export declare const Inbox: core.serialization.ObjectSchema<serializers.Inbox.Raw, AgentMailApi.Inbox>;
export declare namespace Inbox {
    interface Raw {
        inbox_id: InboxId.Raw;
        organization_id: string;
        display_name: DisplayName.Raw;
        created_at: string;
    }
}
