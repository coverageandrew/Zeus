# Agent Logs

This directory contains daily logs for each sub-agent.

---

## Directory Structure

```
/logs/agents/
├── scaffolder_agent/
│   └── YYYY-MM-DD.md
├── ci_agent/
│   └── YYYY-MM-DD.md
├── deploy_agent/
│   └── YYYY-MM-DD.md
├── schema_agent/
│   └── YYYY-MM-DD.md
├── rls_agent/
│   └── YYYY-MM-DD.md
├── seed_agent/
│   └── YYYY-MM-DD.md
├── endpoint_agent/
│   └── YYYY-MM-DD.md
├── integration_agent/
│   └── YYYY-MM-DD.md
├── background_jobs_agent/
│   └── YYYY-MM-DD.md
├── routes_agent/
│   └── YYYY-MM-DD.md
├── components_agent/
│   └── YYYY-MM-DD.md
├── forms_agent/
│   └── YYYY-MM-DD.md
├── test_agent/
│   └── YYYY-MM-DD.md
├── security_agent/
│   └── YYYY-MM-DD.md
└── regression_agent/
    └── YYYY-MM-DD.md
```

---

## Log File Naming

**Format:** `/logs/agents/<agent_name>/YYYY-MM-DD.md`

**Examples:**
- `/logs/agents/schema_agent/2026-01-31.md`
- `/logs/agents/routes_agent/2026-01-31.md`

One log file per agent per day.

---

## What Gets Logged

| Event Type | Description |
|------------|-------------|
| Task Received | Task assignment from Department Head |
| Recap Created | Agent's understanding of instructions |
| Self-Check | Comparison of recap to instructions |
| Action Taken | Each action performed |
| Command Run | Commands executed with output |
| File Created | Files created or modified |
| Blocker | Issues that stopped progress |
| Handoff Submitted | Work submitted to Department Head |
| Revision | Re-attempt after failure feedback |

---

## Required Log Entry Format

```markdown
## [HH:MM] - [EVENT TYPE]

**Task:** [Task ID]
**Action:** [What was done]
**Details:**
[Specifics of the action]
**Result:** [Outcome]
**Evidence:** [Command output, file path, or link]

---
```

---

## Example Log Entries

### Task Received
```markdown
## [09:00] - TASK RECEIVED

**Task:** TASK-DATA-20260131-001
**Action:** Received task assignment from Data Department Head
**Details:**
Create database schema for users table with the following columns:
- id (uuid, primary key)
- email (text, unique)
- created_at (timestamp)
**Result:** Task accepted
**Evidence:** Task specification received

---
```

### Recap Created
```markdown
## [09:05] - RECAP CREATED

**Task:** TASK-DATA-20260131-001
**Action:** Created recap of instructions
**Details:**
I understand I need to:
1. Create a migration file for users table
2. Include id, email, created_at columns
3. Set appropriate constraints
**Result:** Recap complete
**Evidence:** See handoff packet

---
```

### Command Run
```markdown
## [09:30] - COMMAND RUN

**Task:** TASK-DATA-20260131-001
**Action:** Generated TypeScript types from schema
**Details:**
```bash
npx supabase gen types typescript --local > src/types/database.ts
```
**Result:** Exit code 0
**Evidence:**
```
Generating types for local database...
Types generated successfully.
```

---
```

### Handoff Submitted
```markdown
## [10:00] - HANDOFF SUBMITTED

**Task:** TASK-DATA-20260131-001
**Action:** Submitted handoff packet to Department Head
**Details:**
- Migration file: /supabase/migrations/20260131_001_create_users.sql
- Types generated: /src/types/database.ts
- Documentation updated
**Result:** Awaiting validation
**Evidence:** /handoffs/data/TASK-DATA-20260131-001.md

---
```

---

## Log Template

```markdown
# Agent Log: [Agent Name] - YYYY-MM-DD

## Summary
- Tasks received: [N]
- Tasks completed: [N]
- Commands run: [N]
- Files created: [N]
- Blockers: [N]

---

## [HH:MM] - [EVENT TYPE]

**Task:** 
**Action:** 
**Details:**

**Result:** 
**Evidence:** 

---
```

---

## Retention

- All agent logs are retained for minimum 90 days
- Logs related to failures retained indefinitely
- Do not delete or modify historical entries

---

*Version: 1.0.0*
*Owner: Sub-Agents*
