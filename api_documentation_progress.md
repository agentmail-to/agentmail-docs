# API Documentation Progress Tracker

## Task: Add `docs:` fields to all Fern API endpoints

### Summary
- **Total Endpoints**: 67 endpoints + 1 WebSocket channel
- **Files to Update**: 15 files in `fern/definition/`
- **Status**: ✅ **COMPLETE** - All documentation re-added successfully after git recovery!

---

## Phase 1: Core Endpoints (High Priority)

### Inboxes (`fern/definition/inboxes/__package__.yml`) - 5 endpoints
- [x] list - "List Inboxes"
- [x] get - "Get Inbox"
- [x] create - "Create Inbox"
- [x] update - "Update Inbox"
- [x] delete - "Delete Inbox"

### Messages (`fern/definition/inboxes/messages.yml`) - 7 endpoints
- [x] list - "List Messages"
- [x] get - "Get Message"
- [x] getAttachment - "Get Attachment"
- [x] getRaw - "Get Raw Message"
- [x] send - "Send Message"
- [x] reply - "Reply To Message"
- [x] update - "Update Message"

### Threads - Inbox-scoped (`fern/definition/inboxes/threads.yml`) - 4 endpoints
- [x] list - "List Threads"
- [x] get - "Get Thread"
- [x] getAttachment - "Get Attachment"
- [x] delete - "Delete Thread"

### Threads - Global (`fern/definition/threads.yml`) - 3 endpoints
- [x] list - "List Threads"
- [x] get - "Get Thread"
- [x] getAttachment - "Get Attachment"

---

## Phase 2: Communication Features (Medium Priority)

### Drafts - Inbox-scoped (`fern/definition/inboxes/drafts.yml`) - 6 endpoints
- [x] list - "List Drafts"
- [x] get - "Get Draft"
- [x] create - "Create Draft"
- [x] update - "Update Draft"
- [x] send - "Send Draft"
- [x] delete - "Delete Draft"

### Drafts - Global (`fern/definition/drafts.yml`) - 2 endpoints
- [x] list - "List Drafts"
- [x] get - "Get Draft"

### Domains (`fern/definition/domains.yml`) - 6 endpoints
- [x] list - "List Domains"
- [x] get - "Get Domain"
- [x] getZoneFile - "Get Zone File"
- [x] create - "Create Domain"
- [x] delete - "Delete Domain"
- [x] verify - "Verify Domain"

### Webhooks (`fern/definition/webhooks/__package__.yml`) - 4 endpoints
- [x] list - "List Webhooks"
- [x] get - "Get Webhook"
- [x] create - "Create Webhook"
- [x] delete - "Delete Webhook"

---

## Phase 3: Administrative Features (Lower Priority)

### API Keys (`fern/definition/api-keys.yml`) - 3 endpoints
- [x] list - "List API Keys"
- [x] create - "Create API Key"
- [x] delete - "Delete API Key"

### Pods (`fern/definition/pods/__package__.yml`) - 4 endpoints
- [x] list - "List Pods"
- [x] get - "Get Pod"
- [x] create - "Create Pod"
- [x] delete - "Delete Pod"

### Pods - Inboxes (`fern/definition/pods/inboxes.yml`) - 4 endpoints
- [x] list - "List Inboxes"
- [x] get - "Get Inbox"
- [x] create - "Create Inbox"
- [x] delete - "Delete Inbox"

### Pods - Threads (`fern/definition/pods/threads.yml`) - 3 endpoints
- [x] list - "List Threads"
- [x] get - "Get Thread"
- [x] getAttachment - "Get Attachment"

### Pods - Drafts (`fern/definition/pods/drafts.yml`) - 2 endpoints
- [x] list - "List Drafts"
- [x] get - "Get Draft"

### Pods - Domains (`fern/definition/pods/domains.yml`) - 3 endpoints
- [x] list - "List Domains"
- [x] create - "Create Domain"
- [x] delete - "Delete Domain"

### Metrics (`fern/definition/inboxes/metrics.yml`) - 1 endpoint
- [x] get - "List Metrics"

### WebSockets (`fern/definition/websockets.yml`) - 1 channel
- [x] Connect - "Connect" (WebSocket channel)

---

## Notes
- Documentation format: Place `docs:` field directly below `display-name:`
- Keep descriptions concise (1-2 sentences)
- Use present tense, active voice
- Focus on what the endpoint does and when to use it