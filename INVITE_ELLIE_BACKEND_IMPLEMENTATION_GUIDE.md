# Invite Ellie Backend - Workspace & Folder Management Implementation Guide

## Overview
This document outlines the backend changes required in **Invite-ellie-backend** to implement the Workspace & Folder Management system. This is a high-level overview of what needs to be implemented, without code examples.

---

## ✅ **CURRENT STATE (Already Implemented)**

### Models
- `Workspace` model exists with owner, name, and category fields
- `Folder` model exists with workspace foreign key, name, and is_pinned flag
- `Meeting` model exists with folder foreign key, title, platform, transcript, summary, and action_items
- Proper relationships are established: Profile → Workspace → Folder → Meeting

### API Endpoints
- Workspace CRUD endpoints (`GET/POST /api/workspaces/`)
- Folder CRUD endpoints (`GET/POST /api/folders/`)
- Meeting CRUD endpoints (`GET/POST /api/meetings/`)
- Global search endpoint (`GET /api/search/?q=...`)

---

## 🔧 **REQUIRED CHANGES**

### 1. Automatic Workspace Creation from Email Domain

#### What Needs to Be Done:
When a user profile is created or updated, automatically create a workspace based on their email domain. The workspace name should be derived from the domain name.

#### Business Logic:
- Extract the domain from the user's email address (the part after the @ symbol)
- Convert the domain to a workspace name:
  - For common personal email providers (gmail.com, yahoo.com, outlook.com), use "Personal"
  - For other domains, capitalize the domain name (e.g., "webring.ltd" becomes "Webring", "inviteellie.ai" becomes "Invite Ellie")
- Create one workspace per user per domain
- If a workspace already exists for that domain, don't create a duplicate

#### Implementation Approach:
- Add a method to the Profile model that extracts the domain and creates/retrieves the workspace
- Create a Django signal that triggers when a Profile is created or saved
- Ensure the signal is registered in the app configuration
- Create a data migration to backfill workspaces for existing users who don't have one yet

#### Database Impact:
- No new fields needed
- Existing Workspace model can be used
- Migration needed to create workspaces for existing users

---

### 2. Add Folder Aliases Feature

#### What Needs to Be Done:
Add the ability for folders to have multiple aliases or keywords. These aliases will be used in the future for automatically matching calendar event titles to folders.

#### Business Logic:
- Each folder can have zero or more aliases
- Aliases are simple text strings (keywords)
- Aliases should be case-insensitive for matching purposes
- Users should be able to add, edit, and remove aliases through the API

#### Implementation Approach:
- Add an `aliases` field to the Folder model
- Use an ArrayField (PostgreSQL) or JSONField to store the list of aliases
- Update the Folder serializer to include aliases in the API response
- Update the Folder creation/update endpoints to accept aliases in the request

#### Database Impact:
- New field: `aliases` (array of strings)
- Migration required to add the field (default to empty array for existing folders)

---

### 3. Link Meetings to Recall Backend Data

#### What Needs to Be Done:
Establish a connection between meetings created in Invite-ellie-backend and the corresponding data in the Recall backend (CalendarEvent, BotRecording, MeetingTranscription).

#### Business Logic:
- When a bot joins a meeting in Recall backend, we need to create or update a Meeting record in Invite-ellie-backend
- The Meeting record should link to the Recall backend's CalendarEvent via a calendar_event_id
- The Meeting record should store the bot_id for reference
- The Meeting record should optionally link to the transcription via recall_transcription_id
- Track the folder assignment status (unresolved, pending confirmation, confirmed, locked)
- Track who assigned the folder and when

#### Implementation Approach:
- Add new fields to the Meeting model:
  - `calendar_event_id`: UUID field to link to Recall's CalendarEvent
  - `bot_id`: String field to store the bot ID
  - `recall_transcription_id`: UUID field to link to Recall's MeetingTranscription
  - `folder_assignment_status`: Choice field with values: unresolved, pending_confirmation, confirmed, locked
  - `folder_assigned_at`: DateTime field to track when folder was assigned
  - `folder_assigned_by`: Foreign key to Profile to track who assigned the folder
- Add database indexes on these new fields for performance
- Update the Meeting serializer to include these new fields
- Make folder_id nullable since meetings can exist without a folder initially (unresolved state)

#### Database Impact:
- Multiple new fields on Meeting model
- New indexes for query performance
- Migration required to add fields (existing meetings will have null values initially)

---

### 4. Create Meeting Sync Service

#### What Needs to Be Done:
Create a service layer that handles syncing meeting data between the Recall backend and Invite-ellie-backend. This service will be called when bots join meetings and when transcriptions are completed.

#### Business Logic:
- When a bot joins a meeting:
  - Create a Meeting record if it doesn't exist, or update if it does
  - If a folder_id is provided (user selected folder before joining), assign it and mark as confirmed
  - If no folder_id, mark as unresolved
  - Store all meeting metadata (title, URL, platform, start time, etc.)
- When transcription is completed:
  - Find the Meeting record by calendar_event_id
  - Update the Meeting with transcript text, summary, and action items
  - Only commit to long-term memory if folder is confirmed (memory safety rule)
  - Update meeting status to COMPLETED when all data is available

#### Implementation Approach:
- Create a new service class (e.g., `MeetingSyncService`) in a services.py file
- Implement methods:
  - `create_or_update_meeting_from_recall()`: Handles bot join event
  - `update_meeting_with_transcription()`: Handles transcription completion
  - `assign_folder_to_meeting()`: Handles explicit folder assignment by user
- Include proper error handling and logging
- Verify user ownership of folders/workspaces before assignments
- Log all folder assignments as activities for audit trail

#### Database Impact:
- No new tables, uses existing Meeting model
- Updates existing Meeting records

---

### 5. Add API Endpoints for Sync and Assignment

#### What Needs to Be Done:
Create new API endpoints that the Recall backend can call to sync meeting data, and that the frontend can call to assign folders to meetings.

#### Endpoints Needed:

**5.1 Meeting Sync Endpoint**
- **Purpose**: Called by Recall backend when bot joins a meeting
- **Method**: POST
- **Path**: `/api/meetings/sync/`
- **Authentication**: Required (JWT token)
- **Request Body**: Contains calendar_event_id, bot_id, optional folder_id, meeting metadata
- **Response**: Returns the created/updated Meeting object
- **Business Logic**: Uses the MeetingSyncService to create or update the meeting

**5.2 Transcription Update Endpoint**
- **Purpose**: Called by Recall backend when transcription is ready
- **Method**: POST
- **Path**: `/api/meetings/update-transcription/`
- **Authentication**: Required (JWT token)
- **Request Body**: Contains calendar_event_id, transcription_id, transcript_text, summary, action_items
- **Response**: Returns the updated Meeting object
- **Business Logic**: Uses the MeetingSyncService to update meeting with transcription data, respects memory safety rules

**5.3 Folder Assignment Endpoint**
- **Purpose**: Called by frontend when user explicitly assigns a folder
- **Method**: POST
- **Path**: `/api/meetings/{id}/assign-folder/`
- **Authentication**: Required (JWT token)
- **Request Body**: Contains folder_id
- **Response**: Returns the updated Meeting object
- **Business Logic**: 
  - Verifies folder belongs to user
  - Updates meeting with folder assignment
  - Marks as confirmed
  - Logs the assignment as an activity
  - If meeting was unresolved, now commits to memory

**5.4 Move Meeting Endpoint**
- **Purpose**: Called by frontend when user moves meeting to different folder
- **Method**: POST
- **Path**: `/api/meetings/{id}/move/`
- **Authentication**: Required (JWT token)
- **Request Body**: Contains new folder_id
- **Response**: Returns the updated Meeting object
- **Business Logic**:
  - Verifies both old and new folders belong to user
  - Updates meeting folder
  - Updates assignment timestamp and user
  - Logs the move as an activity

**5.5 Unresolved Meetings Endpoint**
- **Purpose**: Called by frontend to get list of meetings without folder assignment
- **Method**: GET
- **Path**: `/api/meetings/unresolved/`
- **Authentication**: Required (JWT token)
- **Response**: Returns paginated list of unresolved meetings
- **Business Logic**: Filters meetings where folder_assignment_status is 'unresolved', ordered by most recent

#### Implementation Approach:
- Add these endpoints to the existing MeetingViewSet or create a separate view
- Use proper permission classes to ensure users can only access their own data
- Include proper request/response serialization
- Add API documentation (OpenAPI/Swagger) annotations
- Include error handling for invalid requests

#### Database Impact:
- No new tables
- Uses existing Meeting model and relationships

---

### 6. Memory Safety Implementation

#### What Needs to Be Done:
Implement the rule that meeting data should only be committed to long-term memory (used for cross-meeting intelligence, knowledge graphs, etc.) after a folder is confirmed.

#### Business Logic:
- When a meeting has `folder_assignment_status = 'unresolved'`:
  - Store transcription data in the Meeting record (for display purposes)
  - Do NOT use this data for cross-meeting intelligence
  - Do NOT include in knowledge graph or memory systems
  - Mark data as "temporary" or "uncommitted"
- When a meeting has `folder_assignment_status = 'confirmed'`:
  - Data is committed to long-term memory
  - Can be used for cross-meeting intelligence
  - Can be included in knowledge graphs
  - Can be used for folder-scoped memory

#### Implementation Approach:
- Add a flag or use the existing `folder_assignment_status` field to determine commit status
- In any service that processes meeting data for memory/knowledge graph:
  - Check if folder is confirmed before processing
  - Filter out unresolved meetings from memory queries
- When folder is assigned (moves from unresolved to confirmed):
  - Trigger any necessary processes to commit data to memory systems
  - Update any related records

#### Database Impact:
- May need a flag field if not using folder_assignment_status
- No new tables required

---

### 7. Activity Logging for Folder Operations

#### What Needs to Be Done:
Log all folder assignment and move operations for audit and compliance purposes.

#### Business Logic:
- When a folder is assigned to a meeting, log:
  - Who assigned it (user)
  - When it was assigned (timestamp)
  - Which meeting and folder
  - Activity type: "MEETING_FOLDER_ASSIGNED"
- When a meeting is moved to a different folder, log:
  - Who moved it (user)
  - When it was moved (timestamp)
  - Which meeting
  - Old folder and new folder
  - Activity type: "MEETING_MOVED"

#### Implementation Approach:
- Use the existing ActivityLog model in accounts app
- Call `profile.log_activity()` method when folder operations occur
- Include relevant metadata (meeting_id, folder_id, etc.) in the activity log
- Ensure all folder assignment endpoints log activities

#### Database Impact:
- Uses existing ActivityLog model
- No new fields or tables needed

---

## 📋 **IMPLEMENTATION PRIORITY**

### Phase 1: Foundation (Critical)
1. Automatic workspace creation from email domain
   - Add method to Profile model
   - Create signal for auto-creation
   - Create migration to backfill existing users

2. Add folder aliases field
   - Add aliases field to Folder model
   - Update serializer
   - Create migration

3. Add Meeting model fields for Recall integration
   - Add calendar_event_id, bot_id, recall_transcription_id
   - Add folder_assignment_status and related fields
   - Create migration

### Phase 2: Sync Service (Critical)
4. Create MeetingSyncService
   - Implement create_or_update_meeting_from_recall method
   - Implement update_meeting_with_transcription method
   - Implement assign_folder_to_meeting method

5. Create sync API endpoints
   - Meeting sync endpoint (for Recall backend)
   - Transcription update endpoint (for Recall backend)
   - Folder assignment endpoint (for frontend)

### Phase 3: Management Features
6. Add move meeting endpoint
7. Add unresolved meetings endpoint
8. Implement memory safety checks
9. Add activity logging to all folder operations

---

## 🔌 **INTEGRATION WITH RECALL BACKEND**

### How Recall Backend Will Call These Endpoints:

**When Bot Joins Meeting:**
- Recall backend will POST to `/api/meetings/sync/`
- Sends calendar_event_id, bot_id, and optional folder_id if user selected one
- Sends meeting metadata (title, URL, platform, start time)
- Invite-ellie-backend creates/updates Meeting record

**When Bot Completes and Transcription is Ready:**
- Recall backend will POST to `/api/meetings/update-transcription/`
- Sends calendar_event_id, transcription_id, transcript_text, summary, action_items
- Invite-ellie-backend updates Meeting record with transcription data
- Respects memory safety (only commits if folder confirmed)

**Authentication:**
- Recall backend must include JWT token from Invite-ellie-backend
- Token should identify the user who owns the meeting
- All endpoints verify user ownership

---

## 🗄️ **DATABASE MIGRATIONS REQUIRED**

1. **Workspace Auto-Creation Migration**
   - Data migration to create workspaces for existing users
   - Extracts domain from email and creates workspace
   - One-time backfill operation

2. **Folder Aliases Migration**
   - Schema migration to add `aliases` field to Folder model
   - Default to empty array for existing folders

3. **Meeting Model Updates Migration**
   - Schema migration to add multiple new fields:
     - calendar_event_id (UUID, nullable, indexed)
     - bot_id (CharField, nullable, indexed)
     - recall_transcription_id (UUID, nullable, indexed)
     - folder_assignment_status (CharField with choices, default='unresolved')
     - folder_assigned_at (DateTimeField, nullable)
     - folder_assigned_by (ForeignKey to Profile, nullable)
   - Make folder_id nullable (to support unresolved meetings)
   - Add indexes for performance

---

## 📝 **IMPORTANT CONSIDERATIONS**

### Memory Safety
- Critical requirement: Unresolved meetings should NOT be used for cross-meeting intelligence
- Only confirmed meetings can be committed to long-term memory
- This is a compliance requirement (GDPR-safe)

### Permissions
- All endpoints must verify that folders/workspaces belong to the authenticated user
- Users cannot assign meetings to folders they don't own
- Users cannot access meetings from other users' workspaces

### Error Handling
- Return clear error messages if meeting/folder not found
- Return clear error messages if user doesn't have permission
- Handle cases where Recall backend sends invalid data
- Log all errors for debugging

### Data Consistency
- Ensure Meeting records stay in sync with Recall backend data
- Handle cases where Recall backend calls sync multiple times (idempotent operations)
- Handle cases where folder is assigned before transcription is ready

### Performance
- Add database indexes on frequently queried fields (calendar_event_id, bot_id, folder_assignment_status)
- Consider pagination for unresolved meetings endpoint
- Optimize queries to avoid N+1 problems

---

## 🚀 **DEPLOYMENT ORDER**

1. **Run schema migrations** for new fields (aliases, Meeting model updates)
2. **Deploy code changes** (models, services, endpoints)
3. **Run data migration** to backfill workspaces for existing users
4. **Test sync endpoints** with Recall backend (staging environment)
5. **Monitor logs** for any sync errors or issues
6. **Gradually roll out** to production

---

## 🧪 **TESTING REQUIREMENTS**

### Unit Tests Needed:
- Profile workspace auto-creation logic
- MeetingSyncService methods (create, update, assign)
- Folder assignment validation
- Memory safety checks

### Integration Tests Needed:
- Sync endpoint with valid/invalid data
- Folder assignment endpoint with valid/invalid folders
- Move meeting endpoint
- Unresolved meetings endpoint
- Activity logging verification

### Test Scenarios:
- New user signup (workspace auto-creation)
- Existing user (backfill migration)
- Bot joins meeting with folder selected
- Bot joins meeting without folder (unresolved)
- Transcription completes for unresolved meeting
- User assigns folder to unresolved meeting
- User moves meeting to different folder
- Multiple sync calls for same meeting (idempotency)

---

## 📞 **COORDINATION WITH RECALL BACKEND**

The Recall backend developer needs to:
1. Call `/api/meetings/sync/` when bot is created (with calendar_event_id and bot_id)
2. Call `/api/meetings/update-transcription/` when transcription is ready
3. Pass `folder_id` in sync call if user selected folder before joining
4. Handle authentication by including JWT token from Invite-ellie-backend
5. Handle error responses and retry logic if needed

---

## 📊 **SUCCESS CRITERIA**

- ✅ Every new user automatically gets a workspace based on email domain
- ✅ Existing users have workspaces created via migration
- ✅ Folders can have aliases for future calendar matching
- ✅ Every meeting from Recall backend has corresponding Meeting record
- ✅ Meetings can exist without folders (unresolved state)
- ✅ Folder assignment works via API endpoint
- ✅ Transcription data syncs from Recall backend
- ✅ Memory safety rules are enforced (no commits until confirmed)
- ✅ All folder operations are logged for audit
- ✅ Meetings can be moved between folders
- ✅ Unresolved meetings can be queried separately
