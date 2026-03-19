# Model Registry

> **Authority:** This document is owned exclusively by Company Head. All other agents have READ-ONLY access.
> **Purpose:** Track available OpenAI models and their best use cases for easy swap-out.

---

## 1. Current Model Assignments

| Agent Level | Default Model | Fallback Model | Rationale |
|-------------|---------------|----------------|-----------|
| Company Head | `gpt-5.2` | `gpt-5-mini` | Best for coding and agentic tasks, complex orchestration |
| Department Heads | `gpt-5-mini` | `gpt-4.1` | Fast, cost-efficient for well-defined task breakdown |
| Sub-Agents | `gpt-5-mini` | `gpt-5-nano` | Implementation work, code generation |
| Memory Summarization | `gpt-5-nano` | `gpt-4.1-nano` | Fastest, most cost-efficient for summarization |
| Complex Debugging | `gpt-5.2-pro` | `gpt-5.2` | Smarter, more precise responses for hard problems |

---

## 2. Available Models (as of 2026-01-31)

### GPT-5 Series (Frontier - RECOMMENDED)

| Model | Description | Best For |
|-------|-------------|----------|
| `gpt-5.2` | Best model for coding and agentic tasks | Company Head, complex architecture |
| `gpt-5.2-pro` | Smarter, more precise version of GPT-5.2 | Critical decisions, complex debugging |
| `gpt-5.1` | Previous GPT-5 with configurable reasoning | Fallback for 5.2 |
| `gpt-5` | Original GPT-5 reasoning model | Legacy fallback |
| `gpt-5-mini` | Faster, cost-efficient GPT-5 | Department Heads, Sub-Agents |
| `gpt-5-nano` | Fastest, most cost-efficient GPT-5 | Memory summarization, simple tasks |
| `gpt-5-pro` | More precise version of GPT-5 | Complex reasoning when 5.2-pro unavailable |

### GPT-5 Codex Series (Specialized for Coding)

| Model | Description | Best For |
|-------|-------------|----------|
| `gpt-5.2-codex` | Most intelligent coding model, long-horizon agentic | Large refactors, complex implementations |
| `gpt-5.1-codex` | Optimized for agentic coding | Standard coding tasks |
| `gpt-5.1-codex-max` | Optimized for long-running tasks | Extended coding sessions |
| `gpt-5.1-codex-mini` | Smaller, cost-effective coding | Simple code generation |
| `gpt-5-codex` | Original GPT-5 coding optimization | Legacy coding tasks |

### GPT-4.1 Series (Non-Reasoning)

| Model | Description | Best For |
|-------|-------------|----------|
| `gpt-4.1` | Smartest non-reasoning model | When reasoning overhead not needed |
| `gpt-4.1-mini` | Smaller, faster GPT-4.1 | Quick non-reasoning tasks |
| `gpt-4.1-nano` | Fastest, most cost-efficient GPT-4.1 | Bulk simple operations |

### O-Series (Reasoning - Legacy)

| Model | Description | Best For |
|-------|-------------|----------|
| `o4-mini` | Fast, cost-efficient reasoning (succeeded by GPT-5 mini) | Legacy compatibility |
| `o3` | Complex reasoning (succeeded by GPT-5) | Legacy compatibility |
| `o3-pro` | More compute for better responses | Legacy complex tasks |
| `o3-mini` | Small reasoning model | Legacy fallback |

### GPT-4o Series (Legacy)

| Model | Description | Best For |
|-------|-------------|----------|
| `gpt-4o` | Fast, intelligent, flexible | Legacy projects |
| `gpt-4o-mini` | Fast, affordable small model | Legacy cost-sensitive |
| `gpt-4-turbo` | Older high-intelligence model | Legacy only |

### Specialized Models (Reference)

| Model | Description | Use Case |
|-------|-------------|----------|
| `o3-deep-research` | Most powerful deep research | Research tasks |
| `o4-mini-deep-research` | Faster deep research | Quick research |
| `text-embedding-3-large` | Most capable embedding | Semantic search |
| `text-embedding-3-small` | Small embedding model | Cost-efficient embeddings |

### Open-Weight Models (Self-Hosted Option)

| Model | Description | Use Case |
|-------|-------------|----------|
| `gpt-oss-120b` | Most powerful open-weight, fits H100 | Self-hosted high-power |
| `gpt-oss-20b` | Medium open-weight, low latency | Self-hosted fast |

---

## 3. Model Selection Guidelines

### Use `gpt-5.2` when:
- Company Head orchestration
- Breaking down complex product specs
- Making architectural decisions
- Resolving cross-department conflicts
- Phase transition planning
- Task failure analysis and splitting

### Use `gpt-5.2-pro` when:
- Critical security decisions
- Complex debugging that other models failed
- Architecture decisions with major impact
- Precision is more important than speed

### Use `gpt-5-mini` when:
- Department Head task breakdown
- Sub-Agent implementation work
- Writing code
- Creating database schemas
- Building API endpoints
- Generating UI components
- Writing tests

### Use `gpt-5-nano` when:
- Summarizing conversation memory
- Simple validation checks
- Log formatting
- Non-critical text generation
- Maximum cost optimization

### Use `gpt-5.2-codex` when:
- Large-scale refactoring
- Complex multi-file implementations
- Long-horizon agentic coding tasks
- When standard models struggle with code complexity

---

## 4. Model Configuration

### Environment Variables

```env
# Default models (can be overridden per project)
OPENAI_MODEL_COMPANY_HEAD=gpt-5.2
OPENAI_MODEL_DEPT_HEAD=gpt-5-mini
OPENAI_MODEL_SUB_AGENT=gpt-5-mini
OPENAI_MODEL_SUMMARIZER=gpt-5-nano
OPENAI_MODEL_CODEX=gpt-5.2-codex
OPENAI_MODEL_DEBUG=gpt-5.2-pro
```

### Per-Project Override

In `/projects/{name}/PROJECT_CONFIG.json`:

```json
{
  "models": {
    "companyHead": "gpt-5.2",
    "deptHead": "gpt-5-mini",
    "subAgent": "gpt-5-mini",
    "summarizer": "gpt-5-nano",
    "codex": "gpt-5.2-codex",
    "debug": "gpt-5.2-pro"
  }
}
```

---

## 5. Cost Tracking

### Per-Call Logging

Each API call logs:
- Model used
- Input tokens
- Output tokens
- Cost (calculated)
- Timestamp

### Log Location

`/projects/{name}/logs/api_costs.json`

```json
{
  "totalCost": 0.00,
  "calls": [
    {
      "timestamp": "2026-01-31T22:00:00Z",
      "agent": "company_head",
      "model": "o3-mini",
      "inputTokens": 5000,
      "outputTokens": 2000,
      "cost": 0.0143
    }
  ]
}
```

---

## 6. Model Update Process

When OpenAI releases new models:

1. **Evaluate** — Test new model on sample tasks
2. **Document** — Add to this registry with benchmarks
3. **CR** — Submit Change Request if changing defaults
4. **Update** — Company Head approves and updates defaults
5. **Notify** — Log change in `/logs/company/`

---

## 7. Fallback Strategy

If primary model fails:

```
1. Retry with same model (3 attempts, exponential backoff)
2. If still failing: Switch to fallback model
3. If fallback fails: Log blocker, pause execution
4. Notify for manual intervention
```

---

## 8. Token Limits

### Context Window Management

| Model | Max Context | Reserved for Output | Available for Input |
|-------|-------------|--------------------|--------------------|
| `o3-mini` | 200K | 16K | 184K |
| `gpt-4o` | 128K | 16K | 112K |
| `gpt-4o-mini` | 128K | 8K | 120K |

### Input Budget Allocation

| Component | Token Budget |
|-----------|-------------|
| Agent Definition | ~2,000 |
| Skills (combined) | ~5,000 |
| SSoT Context | ~3,000 |
| Project Config | ~500 |
| Memory Context | ~2,000 |
| Handoff Payload | ~2,000 |
| **Total System** | ~14,500 |
| **Available for User Prompt** | ~97,500 (gpt-4o) |

---

## 9. Model Changelog

| Date | Change | Rationale |
|------|--------|-----------|
| 2026-01-31 | Initial registry created | Framework setup |
| 2026-01-31 | Updated to GPT-5 series as defaults | GPT-5.2 is best for coding/agentic tasks |

---

## 10. Full Model Reference (All Available)

### Text Generation Models

| Model ID | Type | Status | Notes |
|----------|------|--------|-------|
| `gpt-5.2` | Frontier | ✅ Active | Best for coding/agentic |
| `gpt-5.2-pro` | Frontier | ✅ Active | More precise responses |
| `gpt-5.1` | Frontier | ✅ Active | Configurable reasoning |
| `gpt-5` | Frontier | ✅ Active | Original GPT-5 |
| `gpt-5-mini` | Frontier | ✅ Active | Fast, cost-efficient |
| `gpt-5-nano` | Frontier | ✅ Active | Fastest, cheapest |
| `gpt-5-pro` | Frontier | ✅ Active | Precise GPT-5 |
| `gpt-5.2-codex` | Codex | ✅ Active | Best coding model |
| `gpt-5.1-codex` | Codex | ✅ Active | Agentic coding |
| `gpt-5.1-codex-max` | Codex | ✅ Active | Long-running tasks |
| `gpt-5.1-codex-mini` | Codex | ✅ Active | Cost-effective coding |
| `gpt-5-codex` | Codex | ✅ Active | Original codex |
| `gpt-4.1` | Non-Reasoning | ✅ Active | Smartest non-reasoning |
| `gpt-4.1-mini` | Non-Reasoning | ✅ Active | Faster 4.1 |
| `gpt-4.1-nano` | Non-Reasoning | ✅ Active | Cheapest 4.1 |
| `o4-mini` | Reasoning | ⚠️ Legacy | Succeeded by GPT-5 mini |
| `o3` | Reasoning | ⚠️ Legacy | Succeeded by GPT-5 |
| `o3-pro` | Reasoning | ⚠️ Legacy | More compute |
| `o3-mini` | Reasoning | ⚠️ Legacy | Small reasoning |
| `gpt-4o` | GPT-4 | ⚠️ Legacy | Previous gen |
| `gpt-4o-mini` | GPT-4 | ⚠️ Legacy | Previous gen mini |
| `gpt-4-turbo` | GPT-4 | ⚠️ Legacy | Older model |
| `gpt-3.5-turbo` | GPT-3.5 | ❌ Deprecated | Not recommended |

### Research Models

| Model ID | Type | Notes |
|----------|------|-------|
| `o3-deep-research` | Research | Most powerful research |
| `o4-mini-deep-research` | Research | Faster research |

### Embedding Models

| Model ID | Notes |
|----------|-------|
| `text-embedding-3-large` | Most capable |
| `text-embedding-3-small` | Cost-efficient |
| `text-embedding-ada-002` | Legacy |

### Open-Weight Models (Self-Hosted)

| Model ID | Notes |
|----------|-------|
| `gpt-oss-120b` | Fits H100, most powerful |
| `gpt-oss-20b` | Low latency |

### Audio/Realtime Models (Reference)

| Model ID | Notes |
|----------|-------|
| `gpt-realtime` | Realtime text/audio |
| `gpt-realtime-mini` | Cost-efficient realtime |
| `gpt-audio` | Audio I/O |
| `gpt-audio-mini` | Cost-efficient audio |
| `gpt-4o-mini-tts` | Text-to-speech |
| `gpt-4o-transcribe` | Speech-to-text |

### Image/Video Models (Reference)

| Model ID | Notes |
|----------|-------|
| `gpt-image-1.5` | State-of-the-art image gen |
| `gpt-image-1` | Previous image gen |
| `gpt-image-1-mini` | Cost-efficient image |
| `sora-2` | Video generation |
| `sora-2-pro` | Advanced video |

---

*Version: 1.1.0*
*Last Updated: 2026-01-31*
*Owner: Company Head*
