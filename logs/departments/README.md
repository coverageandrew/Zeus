# Department Logs

This directory contains daily logs for each department.

---

## Directory Structure

```
/logs/departments/
├── architecture/
│   └── YYYY-MM-DD.md
├── data/
│   └── YYYY-MM-DD.md
├── api/
│   └── YYYY-MM-DD.md
├── ui/
│   └── YYYY-MM-DD.md
└── qa_security/
    └── YYYY-MM-DD.md
```

---

## Log File Naming

**Format:** `/logs/departments/<department>/YYYY-MM-DD.md`

**Examples:**
- `/logs/departments/architecture/2026-01-31.md`
- `/logs/departments/data/2026-01-31.md`

One log file per department per day.

---

## What Gets Logged

| Event Type | Description |
|------------|-------------|
| Task Assignment | Tasks dispatched to sub-agents |
| Validation Decision | Accept/reject of sub-agent work |
| Task Failure | Sub-agent task failures |
| Task Split | Decomposition of failed tasks |
| CR Submission | Change requests submitted to Company Head |
| CR Review | Department Head review of sub-agent CRs |
| Escalation | Issues escalated to Company Head |
| Handoff Received | Work received from sub-agents |
| Handoff Sent | Work sent to Company Head or other departments |

---

## Required Log Entry Format

```markdown
## [HH:MM] - [EVENT TYPE]

**Agent:** [Sub-agent name or "Department Head"]
**Task:** [Task ID]
**Action:** [What was done]
**Result:** [Outcome]
**Evidence:** [Link to handoff, CR, or artifact]
**Next:** [Next steps]

---
```

---

## Example Log Entries

### Task Assignment
```markdown
## [09:15] - TASK ASSIGNMENT

**Agent:** Schema Agent
**Task:** TASK-DATA-20260131-001
**Action:** Assigned database schema creation for users table
**Result:** Task dispatched
**Evidence:** Task specification sent
**Next:** Await handoff from Schema Agent

---
```

### Validation Decision
```markdown
## [11:30] - VALIDATION DECISION

**Agent:** Schema Agent
**Task:** TASK-DATA-20260131-001
**Action:** Reviewed handoff for users table schema
**Result:** APPROVED
**Evidence:** /handoffs/data/TASK-DATA-20260131-001.md
**Next:** Proceed to RLS policy task

---
```

### Task Failure
```markdown
## [14:00] - TASK FAILURE (Attempt 1)

**Agent:** RLS Agent
**Task:** TASK-DATA-20260131-002
**Action:** Reviewed handoff for RLS policies
**Result:** REJECTED - Policies too permissive
**Evidence:** /handoffs/data/TASK-DATA-20260131-002.md
**Next:** Return to RLS Agent with feedback for revision

---
```

### Task Split
```markdown
## [16:00] - TASK SPLIT

**Agent:** RLS Agent
**Task:** TASK-DATA-20260131-002
**Action:** Second failure on RLS policy task - initiating task split
**Result:** Task decomposed into 2 sub-tasks
**Evidence:** 
- Original task: TASK-DATA-20260131-002
- New task 1: TASK-DATA-20260131-003 (read policies)
- New task 2: TASK-DATA-20260131-004 (write policies)
**Next:** Submit CR for new agent if needed, assign split tasks

---
```

---

## Log Template

```markdown
# Department Log: [Department Name] - YYYY-MM-DD

## Summary
- Tasks assigned: [N]
- Tasks completed: [N]
- Tasks failed: [N]
- Tasks split: [N]
- CRs submitted: [N]

---

## [HH:MM] - [EVENT TYPE]

**Agent:** 
**Task:** 
**Action:** 
**Result:** 
**Evidence:** 
**Next:** 

---
```

---

## Retention

- All department logs are retained for minimum 90 days
- Critical failures retained indefinitely
- Do not delete or modify historical entries

---

*Version: 1.0.0*
*Owner: Department Heads*
