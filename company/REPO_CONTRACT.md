# Repository Contract

> **Authority:** This document is owned exclusively by Company Head. All other agents have READ-ONLY access.

---

## 1. Repository Structure

```
/zeus/
├── company/                    # SSoT documents (Company Head only)
│   ├── SSOT_CONSTITUTION.md
│   ├── PRODUCT_SPEC.md
│   ├── REPO_CONTRACT.md
│   ├── INTERFACE_CONTRACT.md
│   ├── PHASE_PLAN.md
│   └── QUALITY_GATES.md
│
├── projects/                   # Project instances
│   ├── README.md               # Project lifecycle documentation
│   ├── _template/              # Empty project template
│   │   ├── PRODUCT_SPEC.md
│   │   ├── PROJECT_STATUS.md
│   │   ├── PHASE_PLAN.md
│   │   ├── INTERFACE_CONTRACT.md
│   │   ├── QUALITY_GATES.md
│   │   ├── logs/
│   │   ├── change_requests/
│   │   └── handoffs/
│   └── {project_name}/         # Actual projects (created from template)
│
├── agents/                     # Agent definitions
│   ├── AGENT_REGISTRY.md
│   └── company_head.md
│
├── departments/                # Department structure
│   ├── architecture/
│   │   ├── department_head.md
│   │   └── agents/
│   │       ├── scaffolder_agent.md
│   │       ├── ci_agent.md
│   │       └── deploy_agent.md
│   ├── data/
│   │   ├── department_head.md
│   │   └── agents/
│   │       ├── schema_agent.md
│   │       ├── rls_agent.md
│   │       └── seed_agent.md
│   ├── api/
│   │   ├── department_head.md
│   │   └── agents/
│   │       ├── endpoint_agent.md
│   │       ├── integration_agent.md
│   │       └── background_jobs_agent.md
│   ├── ui/
│   │   ├── department_head.md
│   │   └── agents/
│   │       ├── routes_agent.md
│   │       ├── components_agent.md
│   │       └── forms_agent.md
│   └── qa_security/
│       ├── department_head.md
│       └── agents/
│           ├── test_agent.md
│           ├── security_agent.md
│           └── regression_agent.md
│
├── change_requests/            # CR system
│   ├── README.md
│   └── templates/
│       └── CR_TEMPLATE.md
│
├── logs/                       # Logging system
│   ├── company/
│   │   └── README.md
│   ├── departments/
│   │   └── README.md
│   └── agents/
│       └── README.md
│
├── handoffs/                   # Handoff system
│   ├── README.md
│   └── templates/
│       └── HANDOFF_TEMPLATE.md
│
├── windsurf/                   # Skills (to be populated)
│   └── skills/
│       └── README.md
│
└── docs/                       # Documentation
    └── working-on/
        └── zeus-company-framework/
            ├── 00-overview.md
            └── 01-ssot.md
```

---

## 2. Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| SSoT Documents | SCREAMING_SNAKE_CASE.md | `SSOT_CONSTITUTION.md` |
| Agent Definitions | snake_case.md | `scaffolder_agent.md` |
| Department Heads | `department_head.md` | `department_head.md` |
| Change Requests | `CR-YYYYMMDD-###.md` | `CR-20260131-001.md` |
| Logs | `YYYY-MM-DD.md` | `2026-01-31.md` |
| Handoffs | `<task_id>.md` | `TASK-001.md` |

### Folders

| Type | Convention | Example |
|------|------------|---------|
| Departments | snake_case | `qa_security` |
| Log Subdirs | snake_case | `architecture` |
| Agent Subdirs | `agents` | `agents/` |

### Task IDs

Format: `TASK-<DEPT_CODE>-<YYYYMMDD>-###`

| Department | Code |
|------------|------|
| Architecture | ARCH |
| Data | DATA |
| API | API |
| UI | UI |
| QA & Security | QA |

Example: `TASK-ARCH-20260131-001`

---

## 3. Required Commands

> **Note:** These are placeholders. Must be filled when repo has actual code.

| Command | Purpose | Status |
|---------|---------|--------|
| `npm run lint` | Linting | **[TBD - configured per project]** |
| `npm run typecheck` | Type checking | **[TBD - configured per project]** |
| `npm run test` | Run tests | **[TBD - configured per project]** |
| `npm run build` | Build project | **[TBD - configured per project]** |
| `npm run dev` | Development server | **[TBD - configured per project]** |

### Command Evidence Format
```markdown
**Command:** `[command]`
**Working Directory:** `[path]`
**Exit Code:** [0/1/etc]
**Output Summary:** [brief summary]
**Full Output:** [link or inline if short]
```

---

## 4. No Assumptions Rule

### Prohibited Actions

- **DO NOT** invent file paths that have not been verified
- **DO NOT** assume command names or arguments
- **DO NOT** guess at repo structure
- **DO NOT** fabricate skill filenames
- **DO NOT** claim success without evidence

### Required Verification

Before any action:

1. **Verify** the target path exists (or confirm it should be created)
2. **Verify** the command is valid for this repo
3. **Verify** skill files exist at specified paths
4. **Verify** dependencies are installed

### When Unknown

If any of the above cannot be verified:

1. **STOP** immediately
2. **Produce** a structured blocker note
3. **Request** clarification

### Blocker Note Format
```markdown
## BLOCKER: Unknown [Path/Command/Structure]

**Agent:** [name]
**Task:** [description]
**Unknown Item:** [what is unknown]
**Attempted Verification:** [what was tried]
**Required Information:** [what is needed]
```

---

## 5. File Creation Rules

### New Files

- Must follow naming conventions
- Must be placed in correct directory per structure
- Must include required sections per file type
- Must be logged in agent log

### File Modifications

- Must have evidence (diff or before/after)
- Must not modify SSoT without CR approval
- Must be logged in agent log

### File Deletion

- **PROHIBITED** without explicit Company Head approval
- Must be logged with rationale
- Must have CR if affects SSoT or agent definitions

---

## 6. Git Conventions

> **Note:** To be configured when repo is initialized with git.

### Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/<task-id>` | `feature/TASK-UI-20260131-001` |
| Fix | `fix/<task-id>` | `fix/TASK-QA-20260131-002` |
| Hotfix | `hotfix/<description>` | `hotfix/critical-auth-bug` |

### Commit Messages

Format: `[DEPT] <type>: <description>`

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Example: `[UI] feat: add login form component`

---

*Version: 1.0.0*
*Last Updated: 2026-01-31*
*Owner: Company Head*
