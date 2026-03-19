# Change Request System

This directory contains all Change Requests (CRs) for modifications to SSoT documents.

---

## Overview

Change Requests are the **only** mechanism for modifying SSoT documents (`/company/*.md`). This ensures all changes are tracked, reviewed, and approved through proper channels.

---

## CR Storage and Naming

### Location
All CRs are stored in `/change_requests/`

### Naming Convention
`CR-YYYYMMDD-###.md`

- `YYYYMMDD` = Date of submission
- `###` = Sequential number for that day (001, 002, etc.)

**Examples:**
- `CR-20260131-001.md`
- `CR-20260131-002.md`
- `CR-20260201-001.md`

---

## Submission Rules

### Who Can Submit
- **Sub-Agents:** Create CR draft, submit to Department Head
- **Department Heads:** Create CR, validate sub-agent CRs, escalate to Company Head
- **Company Head:** Create CR (self-initiated), approve/reject all CRs

### Submission Process

```
1. Identify need for SSoT change
2. Create CR using /change_requests/templates/CR_TEMPLATE.md
3. Fill all required sections
4. Submit to Department Head (if sub-agent)
   OR
   Submit directly to Company Head (if Department Head)
```

### Required Information
All CRs must include:
- CR ID (auto-generated based on naming convention)
- Requested change summary
- Rationale (why needed)
- Impact analysis
- Alternatives considered

---

## Escalation Rules

### Sub-Agent to Department Head
- Sub-agent creates CR draft
- Sub-agent submits to Department Head
- Department Head validates:
  - Is the change necessary?
  - Is the impact analysis complete?
  - Are alternatives considered?
- Department Head adds verdict (approve/reject with rationale)

### Department Head to Company Head
- Only Department Head can escalate to Company Head
- Sub-agents cannot bypass Department Head
- Department Head must include their verdict before escalating

### Company Head Review
- Company Head reviews CR and Department Head verdict
- Company Head makes final decision (approve/reject)
- Company Head documents rationale

---

## Closure Rules

### Approved CRs
1. Company Head applies change to SSoT document
2. Company Head updates CR with implementation notes
3. Company Head logs decision in `/logs/company/`
4. CR status updated to "CLOSED - APPROVED"
5. Originating agent notified

### Rejected CRs
1. Company Head documents rejection rationale
2. Company Head logs decision in `/logs/company/`
3. CR status updated to "CLOSED - REJECTED"
4. Originating agent notified with feedback

---

## CR Lifecycle

```
┌─────────────┐
│   DRAFT     │ (Sub-agent or Dept Head creates)
└──────┬──────┘
       ▼
┌─────────────┐
│  SUBMITTED  │ (Submitted to Dept Head)
└──────┬──────┘
       ▼
┌─────────────┐
│  VALIDATED  │ (Dept Head approves/rejects)
└──────┬──────┘
       │
       ├── If rejected by Dept Head → CLOSED - REJECTED
       │
       ▼
┌─────────────┐
│  ESCALATED  │ (Sent to Company Head)
└──────┬──────┘
       ▼
┌─────────────┐
│  REVIEWED   │ (Company Head decides)
└──────┬──────┘
       │
       ├── If rejected → CLOSED - REJECTED
       │
       ▼
┌─────────────┐
│  APPROVED   │ (Change applied to SSoT)
└──────┬──────┘
       ▼
┌─────────────┐
│   CLOSED    │
└─────────────┘
```

---

## Templates

- `/change_requests/templates/CR_TEMPLATE.md` - Standard CR template

---

## Archive

Closed CRs remain in this directory for audit purposes. Do not delete CRs.

---

*Version: 1.0.0*
*Owner: Company Head*
