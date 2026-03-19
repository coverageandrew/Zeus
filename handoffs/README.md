# Handoffs

This directory contains handoff packets for completed tasks.

---

## Overview

Handoffs are the formal mechanism for sub-agents to submit completed work to Department Heads. Every task completion requires a handoff packet.

---

## Directory Structure

```
/handoffs/
├── README.md
├── templates/
│   └── HANDOFF_TEMPLATE.md
├── architecture/
│   └── TASK-ARCH-YYYYMMDD-###.md
├── data/
│   └── TASK-DATA-YYYYMMDD-###.md
├── api/
│   └── TASK-API-YYYYMMDD-###.md
├── ui/
│   └── TASK-UI-YYYYMMDD-###.md
└── qa_security/
    └── TASK-QA-YYYYMMDD-###.md
```

---

## Naming Rules

**Format:** `/handoffs/<department>/<task_id>.md`

**Task ID Format:** `TASK-<DEPT_CODE>-YYYYMMDD-###`

| Department | Code |
|------------|------|
| Architecture | ARCH |
| Data | DATA |
| API | API |
| UI | UI |
| QA & Security | QA |

**Examples:**
- `/handoffs/architecture/TASK-ARCH-20260131-001.md`
- `/handoffs/data/TASK-DATA-20260131-005.md`

---

## Required Linkage

Every handoff must link to:

1. **Agent Log Entry:** Where the work was logged
   - Format: `/logs/agents/<agent_name>/YYYY-MM-DD.md`

2. **Change Requests (if any):** Related CRs
   - Format: `/change_requests/CR-YYYYMMDD-###.md`

3. **Created Artifacts:** Files created or modified
   - Full paths to files

---

## Handoff Lifecycle

```
┌─────────────────┐
│  Task Assigned  │ (Department Head → Sub-Agent)
└────────┬────────┘
         ▼
┌─────────────────┐
│  Work Executed  │ (Sub-Agent performs task)
└────────┬────────┘
         ▼
┌─────────────────┐
│ Handoff Created │ (Sub-Agent creates packet)
└────────┬────────┘
         ▼
┌─────────────────┐
│   Submitted     │ (Sub-Agent → Department Head)
└────────┬────────┘
         ▼
┌─────────────────┐
│   Validated     │ (Department Head reviews)
└────────┬────────┘
         │
         ├── If rejected → Return to Sub-Agent
         │
         ▼
┌─────────────────┐
│    Accepted     │ (Work approved)
└────────┬────────┘
         ▼
┌─────────────────┐
│    Archived     │ (Handoff retained)
└─────────────────┘
```

---

## Validation Checklist

Department Head validates handoff against:

- [ ] **Recap Match:** Does recap match original instructions?
- [ ] **Self-Check:** Are there any mismatches noted?
- [ ] **Work Performed:** Are all required files listed?
- [ ] **Evidence:** Are commands run with output captured?
- [ ] **Artifacts:** Do all listed files exist?
- [ ] **Quality:** Does work meet standards?

---

## Templates

- `/handoffs/templates/HANDOFF_TEMPLATE.md` - Standard handoff template

---

## Retention

- All handoffs are retained for minimum 90 days
- Handoffs for failed tasks retained indefinitely
- Do not delete handoffs

---

*Version: 1.0.0*
*Owner: All Agents*
