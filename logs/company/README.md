# Company Logs

This directory contains daily logs of Company Head decisions and actions.

---

## Log File Naming

**Format:** `YYYY-MM-DD.md`

**Examples:**
- `2026-01-31.md`
- `2026-02-01.md`

One log file per day. Create new file at start of each day with activity.

---

## What Gets Logged

| Event Type | Description |
|------------|-------------|
| Phase Transition | Moving from one phase to another |
| CR Decision | Approval or rejection of Change Requests |
| Escalation Resolution | Handling escalated issues from departments |
| Agent Creation | Approval of new agent definitions |
| Quality Gate Override | Any override of quality gates |
| Critical Blocker | Critical issues affecting multiple departments |
| SSoT Update | Any change to SSoT documents |

---

## Required Log Entry Format

```markdown
## [HH:MM] - [EVENT TYPE]

**Action:** [What was done]
**Rationale:** [Why this decision was made]
**Evidence:** [Links to CRs, handoffs, or other artifacts]
**Impact:** [What this affects]
**Next Steps:** [What follows from this decision]

---
```

---

## Example Log Entry

```markdown
## [14:30] - PHASE TRANSITION

**Action:** Approved transition from Phase 1 (Schema & Data) to Phase 2 (API Layer)
**Rationale:** All exit criteria met, all required artifacts verified, all department sign-offs received
**Evidence:** 
- Architecture sign-off: /handoffs/architecture/TASK-ARCH-20260131-005.md
- Data sign-off: /handoffs/data/TASK-DATA-20260131-012.md
- QA sign-off: /handoffs/qa_security/TASK-QA-20260131-003.md
**Impact:** API Department can now begin endpoint implementation
**Next Steps:** Issue Phase 2 tasks to API Department Head

---
```

---

## Log Template

```markdown
# Company Log: YYYY-MM-DD

## Summary
- Total events: [N]
- Phase transitions: [N]
- CR decisions: [N]
- Escalations: [N]

---

## [HH:MM] - [EVENT TYPE]

**Action:** 
**Rationale:** 
**Evidence:** 
**Impact:** 
**Next Steps:** 

---
```

---

## Retention

- All company logs are retained indefinitely
- Do not delete or modify historical log entries
- Corrections should be added as new entries referencing the original

---

*Version: 1.0.0*
*Owner: Company Head*
