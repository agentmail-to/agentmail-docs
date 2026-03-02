# AgentMail API Reference - Endpoint Descriptions

## Inboxes (邮箱管理)

### List Inboxes
**Endpoint:** `GET /inboxes`
**Description:** Retrieves a paginated list of all inboxes in your AgentMail account, ordered by creation date descending.

### Create Inbox
**Endpoint:** `POST /inboxes`
**Description:** Creates a new email inbox with a specified username and domain for your AI agent to send and receive emails.

### Get Inbox
**Endpoint:** `GET /inboxes/{inbox_id}`
**Description:** Retrieves detailed information about a specific inbox including its configuration, status, and metadata.

### Update Inbox
**Endpoint:** `PATCH /inboxes/{inbox_id}`
**Description:** Updates the configuration or settings of an existing inbox such as display name or forwarding rules.

### Delete Inbox
**Endpoint:** `DELETE /inboxes/{inbox_id}`
**Description:** Permanently deletes an inbox and all associated messages, threads, and drafts.

---

## Threads (邮件线程管理)

### List Threads
**Endpoint:** `GET /inboxes/{inbox_id}/threads`
**Description:** Returns all email conversation threads in a specific inbox, grouped by related messages.

### Get Thread
**Endpoint:** `GET /inboxes/{inbox_id}/threads/{thread_id}`
**Description:** Retrieves a complete email thread including all messages, participants, and conversation history.

### List All Threads
**Endpoint:** `GET /threads`
**Description:** Retrieves threads across all inboxes in your account for a global view of email conversations.

---

## Messages (消息管理)

### List Messages
**Endpoint:** `GET /inboxes/{inbox_id}/messages`
**Description:** Returns all email messages in a specific inbox with options to filter by thread, date, or status.

### Get Message
**Endpoint:** `GET /inboxes/{inbox_id}/messages/{message_id}`
**Description:** Retrieves the full content of a specific email message including body, headers, and attachments.

### Send Message
**Endpoint:** `POST /inboxes/{inbox_id}/messages`
**Description:** Sends a new email message from the specified inbox to one or more recipients.

### Reply to Message
**Endpoint:** `POST /inboxes/{inbox_id}/messages/{message_id}/reply`
**Description:** Sends a reply to an existing message, automatically maintaining the email thread and conversation context.

### Update Message
**Endpoint:** `PATCH /inboxes/{inbox_id}/messages/{message_id}`
**Description:** Updates message metadata such as read status, labels, or custom flags.

---

## Drafts (草稿管理)

### List Drafts
**Endpoint:** `GET /inboxes/{inbox_id}/drafts`
**Description:** Retrieves all saved email drafts in a specific inbox that haven't been sent yet.

### Get Draft
**Endpoint:** `GET /inboxes/{inbox_id}/drafts/{draft_id}`
**Description:** Retrieves the content and metadata of a specific email draft for editing or review.

### Create Draft
**Endpoint:** `POST /inboxes/{inbox_id}/drafts`
**Description:** Creates a new email draft with recipient, subject, and body content that can be edited before sending.

### Update Draft
**Endpoint:** `PATCH /inboxes/{inbox_id}/drafts/{draft_id}`
**Description:** Updates the content or recipients of an existing draft before it is sent.

### Send Draft
**Endpoint:** `POST /inboxes/{inbox_id}/drafts/{draft_id}/send`
**Description:** Converts a draft into a sent message, delivering it to the specified recipients.

### Delete Draft
**Endpoint:** `DELETE /inboxes/{inbox_id}/drafts/{draft_id}`
**Description:** Permanently removes a draft from the inbox without sending it.

---

## Domains (域名管理)

### List Domains
**Endpoint:** `GET /domains`
**Description:** Retrieves all custom domains configured for your AgentMail account.

### Get Domain
**Endpoint:** `GET /domains/{domain}`
**Description:** Returns detailed information about a specific domain including verification status and DNS records.

### Add Domain
**Endpoint:** `POST /domains`
**Description:** Adds a new custom domain to your account for creating branded email addresses for your agents.

### Verify Domain
**Endpoint:** `POST /domains/{domain}/verify`
**Description:** Initiates domain verification process to confirm ownership through DNS records.

### Get Zone File
**Endpoint:** `GET /domains/{domain}/zone-file`
**Description:** Returns the DNS zone file configuration needed for proper email delivery (SPF, DKIM, DMARC records).

### Delete Domain
**Endpoint:** `DELETE /domains/{domain}`
**Description:** Removes a custom domain from your account and disables any inboxes using that domain.

---

## Webhooks (Webhook事件管理)

### List Webhooks
**Endpoint:** `GET /webhooks`
**Description:** Returns all configured webhook endpoints that receive real-time notifications for email events.

### Get Webhook
**Endpoint:** `GET /webhooks/{webhook_id}`
**Description:** Retrieves configuration details for a specific webhook including URL, events, and status.

### Create Webhook
**Endpoint:** `POST /webhooks`
**Description:** Creates a new webhook to receive real-time HTTP callbacks when email events occur (e.g., message received, sent).

### Update Webhook
**Endpoint:** `PATCH /webhooks/{webhook_id}`
**Description:** Updates webhook configuration such as target URL, subscribed events, or authentication.

### Delete Webhook
**Endpoint:** `DELETE /webhooks/{webhook_id}`
**Description:** Removes a webhook endpoint and stops sending event notifications to that URL.

### Test Webhook
**Endpoint:** `POST /webhooks/{webhook_id}/test`
**Description:** Sends a test event to the webhook URL to verify the endpoint is properly configured and responding.

---

## Websockets (实时连接)

### Connect
**Endpoint:** `WSS wss://ws.agentmail.to/v0`
**Description:** Establishes a WebSocket connection for real-time bidirectional communication to receive instant email notifications and events.

### Subscribe
**Message Type:** `subscribe`
**Description:** Subscribes to real-time updates for specific inbox IDs through the WebSocket connection.

### Message Received
**Event Type:** `message_received`
**Description:** Real-time event pushed through WebSocket when a new email message arrives in subscribed inboxes.

---

## Labels (标签管理)

### List Labels
**Endpoint:** `GET /inboxes/{inbox_id}/labels`
**Description:** Returns all custom labels created for organizing messages in a specific inbox.

### Create Label
**Endpoint:** `POST /inboxes/{inbox_id}/labels`
**Description:** Creates a new custom label for categorizing and organizing email messages.

### Apply Label
**Endpoint:** `POST /inboxes/{inbox_id}/messages/{message_id}/labels`
**Description:** Applies one or more labels to a specific message for organization and filtering.

---

## Attachments (附件管理)

### List Attachments
**Endpoint:** `GET /inboxes/{inbox_id}/messages/{message_id}/attachments`
**Description:** Returns metadata for all file attachments included in a specific email message.

### Get Attachment
**Endpoint:** `GET /inboxes/{inbox_id}/messages/{message_id}/attachments/{attachment_id}`
**Description:** Downloads the binary content of a specific email attachment.

### Upload Attachment
**Endpoint:** `POST /inboxes/{inbox_id}/attachments`
**Description:** Uploads a file to be attached to a draft or outgoing message before sending.

---

## Pods (多租户管理)

### List Pods
**Endpoint:** `GET /pods`
**Description:** Retrieves all pod configurations for multi-tenant applications, allowing isolation of inboxes by customer or project.

### Create Pod
**Endpoint:** `POST /pods`
**Description:** Creates a new pod for isolating email resources in multi-tenant architecture.

### Get Pod
**Endpoint:** `GET /pods/{pod_id}`
**Description:** Returns configuration and resource information for a specific pod.

### Delete Pod
**Endpoint:** `DELETE /pods/{pod_id}`
**Description:** Removes a pod and all associated inboxes, messages, and resources within that tenant boundary.
