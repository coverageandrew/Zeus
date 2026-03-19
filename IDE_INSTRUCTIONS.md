# Zeus IDE Mode Instructions

This document explains how to use Zeus with your IDE (Windsurf, Cursor, VS Code + Copilot, etc.) as the LLM instead of making API calls.

## Overview

In **IDE Mode**, Zeus does not make any LLM API calls. Instead:
- Zeus manages project structure, files, and UI
- Your IDE's AI assistant acts as the "brain"
- You work with your IDE to read Zeus files and make updates

This is useful when:
- You want to use your IDE's built-in AI (which may have better context)
- You don't want to manage separate API keys
- You prefer the IDE's chat interface for complex discussions

---

## Setup

1. Open Zeus UI at `http://localhost:3000`
2. Go to **Settings**
3. Toggle **Execution Mode** to **IDE Mode**
4. Click **Save All**

---

## Project Structure

When you create a project in Zeus, it creates this structure:

```
projects/
└── {project-id}/
    ├── PROJECT_CONFIG.json    # Project metadata
    ├── PROJECT_STATUS.md      # Current phase and status
    ├── PRODUCT_SPEC.md        # Product specification (intake output)
    ├── PHASE_PLAN.md          # Detailed phase plan
    ├── logs/
    │   ├── activity.json      # Structured activity log
    │   └── *.md               # Agent conversation logs
    ├── memory/
    │   └── *.json             # Agent memory files
    └── src/                   # Generated source code
```

---

## Workflow

### Phase 0: Intake

**Goal:** Define the product specification through conversation.

1. **Zeus UI:** User creates a new project and starts chatting
2. **Your task (IDE):** Read the conversation from `logs/intake_*.md` and update `PRODUCT_SPEC.md`
3. **Key file:** `PRODUCT_SPEC.md` - This is the source of truth for what to build

**What to update in PRODUCT_SPEC.md:**
- Project name and description
- Core features list
- Technical requirements
- User stories
- API requirements
- UI/UX requirements

**When intake is complete:**
- User clicks "Confirm & Start Development" in Zeus UI
- `PROJECT_STATUS.md` updates to show Phase 1

---

### Phase 1: Architecture & Setup

**Goal:** Create the project scaffold and architecture.

**Files to create/update:**
- `src/` directory structure
- `package.json` or equivalent
- Configuration files
- Database schema (if applicable)
- API route stubs

**Read:** `PRODUCT_SPEC.md` for requirements
**Update:** `PROJECT_STATUS.md` when complete

---

### Phase 2: Core Implementation

**Goal:** Implement the core features.

**Read:** 
- `PRODUCT_SPEC.md` for feature requirements
- `PHASE_PLAN.md` for implementation order

**Create:**
- Components, pages, API routes
- Database models and migrations
- Business logic

---

### Phase 3: Integration & Polish

**Goal:** Connect everything and polish.

**Tasks:**
- Wire up frontend to backend
- Add error handling
- Implement authentication (if needed)
- Add loading states and UX polish

---

### Phase 4: Testing & QA

**Goal:** Ensure quality.

**Tasks:**
- Write/run tests
- Fix bugs
- Security review
- Performance optimization

---

## Key Files Reference

| File | Purpose | When to Read | When to Update |
|------|---------|--------------|----------------|
| `PRODUCT_SPEC.md` | What to build | Always | During intake |
| `PROJECT_STATUS.md` | Current progress | To know current phase | After completing phases |
| `PHASE_PLAN.md` | Detailed plan | Before starting work | When plan changes |
| `PROJECT_CONFIG.json` | Metadata | Rarely | Rarely |
| `logs/activity.json` | Activity history | To see what happened | After major actions |

---

## Tips for IDE Users

### Windsurf / Cursor

1. Open the Zeus project folder in your IDE
2. Use `@workspace` or similar to give context
3. Reference this file: "Follow the Zeus workflow in IDE_INSTRUCTIONS.md"
4. Ask your IDE to read `PRODUCT_SPEC.md` and implement features

### Example Prompts

**Starting intake:**
```
Read the conversation in logs/intake_*.md and update PRODUCT_SPEC.md 
with the user's requirements. Follow the Zeus framework structure.
```

**Starting development:**
```
Read PRODUCT_SPEC.md and PHASE_PLAN.md. Create the initial project 
scaffold in src/ following the architecture requirements.
```

**Implementing a feature:**
```
Read PRODUCT_SPEC.md section on [feature]. Implement it following 
the existing code patterns in src/.
```

---

## Updating Status

When you complete a phase, update `PROJECT_STATUS.md`:

```markdown
# Project Status

## Current Phase: 2 - Core Implementation

## Progress
- [x] Phase 0: Intake - Complete
- [x] Phase 1: Architecture - Complete  
- [ ] Phase 2: Core Implementation - In Progress
- [ ] Phase 3: Integration
- [ ] Phase 4: Testing

## Recent Activity
- 2024-01-15: Completed user authentication
- 2024-01-14: Set up database schema
```

---

## Logging Activity

Add entries to `logs/activity.json` for major actions:

```json
{
  "entries": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "agent": "IDE",
      "action": "Implemented user authentication",
      "phase": 2,
      "status": "completed"
    }
  ]
}
```

This helps Zeus UI show progress and history.

---

## Questions?

If something is unclear, check:
1. `PRODUCT_SPEC.md` for requirements
2. `PHASE_PLAN.md` for the plan
3. `PROJECT_STATUS.md` for current state
4. This file for workflow guidance
