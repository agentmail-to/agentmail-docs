/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as AgentMailApi from "../../../index";
export interface Thread {
    threadId: AgentMailApi.ThreadId;
    inboxId: AgentMailApi.InboxId;
    /** Time at which thread was created. */
    createdAt: Date;
    updatedAt: AgentMailApi.ThreadUpdatedAt;
    subject?: AgentMailApi.ThreadSubject;
    participants: AgentMailApi.ThreadParticipants;
    /** Messages in thread. Ordered by `sent_at` ascending. */
    messages: AgentMailApi.Message[];
}
