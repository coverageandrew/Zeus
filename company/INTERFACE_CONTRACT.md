# Interface Contract

> **Authority:** This document is owned exclusively by Company Head. All other agents have READ-ONLY access.

---

## 1. API Contract Rules

### Endpoint Definition Format

All API endpoints must be documented with:

```markdown
### [METHOD] /api/[path]

**Description:** [what it does]
**Auth Required:** [yes/no, type]
**Rate Limited:** [yes/no, limit]

**Request:**
- Headers: [required headers]
- Body: [schema or type reference]
- Query Params: [if applicable]

**Response:**
- Success (200): [schema]
- Error (4xx/5xx): [error schema]

**Example:**
```json
// Request
{}
// Response
{}
```
```

### API Versioning

- Version in URL path: `/api/v1/...`
- Breaking changes require new version
- Deprecation notice: minimum 30 days before removal

### Breaking Change Definition

A change is **breaking** if it:
- Removes an endpoint
- Removes a required field from response
- Adds a required field to request
- Changes field type
- Changes authentication requirements

**Breaking changes require CR to Company Head.**

---

## 2. Event Payload Rules

### Event Format

All events must follow this structure:

```typescript
interface Event<T> {
  id: string;           // UUID
  type: string;         // event type identifier
  timestamp: string;    // ISO 8601
  source: string;       // originating service/agent
  data: T;              // payload
  metadata?: {
    correlationId?: string;
    causationId?: string;
    version: string;
  };
}
```

### Event Naming

Format: `<domain>.<entity>.<action>`

Examples:
- `user.account.created`
- `order.payment.completed`
- `auth.session.expired`

### Event Documentation

Each event type must be documented with:
- Event name
- Trigger conditions
- Payload schema
- Consumers list
- Retry policy

---

## 3. Database Schema Expectations

### Schema Documentation Format

```markdown
### Table: [table_name]

**Description:** [purpose]
**Owner:** [department]

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| ... | ... | ... | ... | ... |

**Indexes:**
- [index_name]: [columns] ([type])

**Foreign Keys:**
- [column] → [table.column]

**RLS Policies:**
- [policy_name]: [description]
```

### Schema Change Rules

1. All schema changes require migration file
2. Migration naming: `YYYYMMDD_##_description.sql`
3. Migrations are CREATE ONLY until approved
4. RLS policies required for all user-facing tables
5. Schema changes require CR if they affect interfaces

### Type Generation

- TypeScript types must be generated from schema
- Types must be regenerated after schema changes
- Type file location: **[MUST BE CONFIGURED]**

---

## 4. UI Route Contract Rules

### Route Documentation Format

```markdown
### Route: /[path]

**Description:** [purpose]
**Auth Required:** [yes/no]
**Roles:** [allowed roles]
**Layout:** [layout component]

**Parameters:**
- [param]: [type] - [description]

**Query Params:**
- [param]: [type] - [description]

**Data Requirements:**
- [what data is fetched]

**Components Used:**
- [list of components]
```

### Route Naming

| Type | Format | Example |
|------|--------|---------|
| Static | `/path` | `/dashboard` |
| Dynamic | `/path/[param]` | `/users/[id]` |
| Catch-all | `/path/[...slug]` | `/docs/[...slug]` |
| Optional catch-all | `/path/[[...slug]]` | `/blog/[[...slug]]` |

### Route Change Rules

- New routes must be documented before implementation
- Route removal requires deprecation notice
- Route parameter changes require CR if breaking

---

## 5. Versioning Rules

### Semantic Versioning

Format: `MAJOR.MINOR.PATCH`

- **MAJOR:** Breaking changes
- **MINOR:** New features, backward compatible
- **PATCH:** Bug fixes, backward compatible

### Version Locations

| Item | Version Location |
|------|------------------|
| API | URL path (`/api/v1/`) |
| Events | Metadata field |
| Schema | Migration sequence |
| UI Routes | N/A (path is version) |

---

## 6. Breaking Change Handling

### Process

1. **Identify** the breaking change
2. **Submit CR** to Company Head with:
   - What is changing
   - Why it's necessary
   - Impact analysis
   - Migration path for consumers
3. **Approval** from Company Head
4. **Deprecation notice** (if applicable)
5. **Implementation** with version bump
6. **Documentation update**

### Impact Analysis Template

```markdown
## Breaking Change Impact Analysis

**Change:** [description]
**Affected Interfaces:**
- [ ] API endpoints: [list]
- [ ] Events: [list]
- [ ] DB schema: [list]
- [ ] UI routes: [list]

**Affected Consumers:**
- [consumer 1]: [impact]
- [consumer 2]: [impact]

**Migration Path:**
1. [step 1]
2. [step 2]

**Rollback Plan:**
[how to rollback if needed]
```

---

## 7. Evidence Requirements

### Schema/Type Evidence

- Migration file created (path)
- Types generated (command + output)
- Type file updated (diff)

### API Evidence

- Endpoint implemented (file path)
- Request/response tested (command + output)
- Documentation updated (diff)

### Event Evidence

- Event schema defined (file path)
- Event published/consumed tested
- Documentation updated

### Route Evidence

- Route file created (path)
- Route accessible (manual or automated test)
- Documentation updated

---

## 8. Contract Validation

### Automated Checks

| Check | Tool | When |
|-------|------|------|
| Type safety | TypeScript | Build |
| API schema | **[TO BE CONFIGURED]** | CI |
| Event schema | **[TO BE CONFIGURED]** | CI |
| Route validity | **[TO BE CONFIGURED]** | Build |

### Manual Checks

- Cross-department interface review
- Breaking change review by Company Head
- Consumer notification for changes

---

*Version: 1.0.0*
*Last Updated: 2026-01-31*
*Owner: Company Head*
