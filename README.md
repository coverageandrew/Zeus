```
                              ██████████████████
                          ████░░░░░░░░░░░░░░░░░░████
                       ███░░░░░░░░░░░░░░░░░░░░░░░░░░███
                     ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██
                   ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██
                  ██░░░░░░░░░░░░░░░░⚡░░░░░░░░░░░░░░░░░░░░██
                 ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██
                ██████████████████████████████████████████████
               ██▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██
              ██████████████████████████████████████████████████
              ██                                              ██
              ██    ██████    ██████    ██████    ██████      ██
              ██    ██  ██    ██  ██    ██  ██    ██  ██      ██
              ██    ██  ██    ██  ██    ██  ██    ██  ██      ██
              ██    ██  ██    ██  ██    ██  ██    ██  ██      ██
              ██    ██  ██    ██  ██    ██  ██    ██  ██      ██
              ██    ██  ██    ██  ██    ██  ██    ██  ██      ██
              ██    ██  ██    ██  ██    ██  ██    ██  ██      ██
              ██████████████████████████████████████████████████
              ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

                   ███████╗ ███████╗ ██╗   ██╗ ███████╗
                   ╚══███╔╝ ██╔════╝ ██║   ██║ ██╔════╝
                     ███╔╝  █████╗   ██║   ██║ ███████╗
                    ███╔╝   ██╔══╝   ██║   ██║ ╚════██║
                   ███████╗ ███████╗ ╚██████╔╝ ███████║
                   ╚══════╝ ╚══════╝  ╚═════╝  ╚══════╝

```

> ## ⚠️ IMPORTANT NOTICE: PawSafe Project
> 
> **The `/projects/pawsafe/` directory was inadvertently included in this repository prior to February 2, 2026.** This project is **proprietary software** and is **NOT covered by the MIT license** of the Zeus framework.
> 
> If you cloned this repository before February 2, 2026 and have a copy of the PawSafe project:
> - **You are required to delete all PawSafe files immediately**
> - You do NOT have permission to use, modify, or distribute this code
> - Commercial use is strictly prohibited
> - Unauthorized use will result in legal action
> 
> **✅ The PawSafe project is now covered by a proprietary license and has been legally protected.** The project has been removed from this repository and secured with appropriate legal notices.
> 
> Thank you for your understanding.

---

# Zeus: AI-Powered Software Development Framework

Zeus is an intelligent orchestration framework that automates software development through a hierarchical system of AI agents. It provides structured, phase-based project execution with built-in quality gates, change management, and comprehensive logging.

## ⚠️ Current State

> **Status: Framework Design Complete | Agent Execution Pending**

Zeus is currently in a **documentation and architecture phase**. The framework structure, agent definitions, workflows, and orchestration logic are fully designed and implemented. However, **autonomous agent execution is not yet operational** due to current OpenAI API limitations.

### What's Working Now
- ✅ Complete framework architecture and hierarchy
- ✅ All agent definitions and skill mappings
- ✅ SSoT documentation system
- ✅ Change Request workflow templates
- ✅ Phase-based project structure
- ✅ Handoff and logging systems
- ✅ TypeScript orchestrator code

### What's Pending
- ⏳ **Full autonomous execution** - End-to-end agent workflows with minimal human intervention
- ⏳ **Production hardening** - Error recovery, retry logic, and edge case handling
- ⏳ **Multi-project orchestration** - Running multiple projects simultaneously

### Current Usage
Zeus supports two execution modes, toggled in the UI:

1. **SDK Mode** - Zeus makes LLM API calls directly using the **Vercel AI SDK**. Requires an API key (OpenAI, Anthropic, etc.). Best for automated workflows.
2. **IDE Mode** - Your IDE (Windsurf, Cursor, etc.) acts as the LLM. Zeus manages project files, prompts, and context while you use your IDE's AI assistant to execute tasks. No API key required.

**For IDE Mode:** See [`IDE_INSTRUCTIONS.md`](IDE_INSTRUCTIONS.md) for the complete workflow guide.

> 💡 **Toggle between modes** in the Zeus UI Settings panel. IDE Mode is recommended for getting started without API costs.

## 🏛️ Architecture Overview

Zeus operates on a three-tier hierarchy:

```
Company Head (Level 0)
    └── Department Heads (Level 1)
            └── Specialized Agents (Level 2)
```

### Departments
- **Architecture** - CI/CD, deployment, scaffolding
- **Data** - Database schema, migrations, RLS policies
- **API** - Endpoints, integrations, background jobs
- **UI** - Components, routes, forms, responsive design
- **QA & Security** - Testing, security audit, performance

## 🚀 How It Works

### 1. Project Setup
Projects are created from standardized templates with:
- Product specifications
- Phase plans
- Interface contracts
- Quality gates

### 2. Phase-Based Execution
Zeus executes projects through 7 structured phases:

| Phase | Name | Description |
|-------|------|-------------|
| 0 | Foundation | Repo setup, tooling, base configuration |
| 1 | Schema & Data | Database schema, migrations, seed data |
| 2 | API Layer | Endpoints, integrations, background jobs |
| 3 | UI Layer | Routes, components, forms |
| 4 | Integration | End-to-end flows, cross-department validation |
| 5 | QA & Hardening | Testing, security audit, performance |
| 6 | Deployment | CI/CD, staging, production release |

### 3. Intelligent Task Distribution
- **Company Head** breaks down phases into department tasks
- **Department Heads** assign tasks to specialized sub-agents
- **Sub-Agents** execute specific tasks with evidence collection

### 4. Quality Gates & Validation
- Definition of Done (DoD) enforcement
- Evidence-based task completion
- Automated handoff validation
- Two-strike failure escalation with task splitting

## 📋 Key Features

### 🔄 Change Management
- **Single Source of Truth (SSoT)** documentation
- **Change Request (CR)** workflow with approval chains
- **Authority-based permissions** and access control
- **Audit trails** for all modifications

### 🛡️ Quality Assurance
- **Automated testing** at multiple levels
- **Security scanning** and vulnerability detection
- **Performance benchmarking** and monitoring
- **Accessibility verification**

### 📊 Comprehensive Logging
- **Company-level logs** for phase transitions and decisions
- **Department logs** for task assignments and validations
- **Agent logs** for execution details and evidence
- **Structured handoffs** between departments

### 🎯 Intelligent Error Handling
- **Stop authority** for ambiguous instructions
- **Blocker detection** and escalation
- **Task decomposition** for repeated failures
- **Automatic retry** with alternative approaches

## 🛠️ Technical Stack

- **TypeScript** for type safety and developer experience
- **Node.js** runtime environment
- **Vercel AI SDK** for LLM integration (supports multiple providers)
- **Express** backend server for API routes
- **Markdown** for documentation and templates
- **JSON** for configuration and data exchange

## 📁 Repository Structure

```
zeus/
├── agents/              # Agent definitions and registry
├── company/             # SSoT documents (Product Spec, Phase Plan, etc.)
├── core/                # Core orchestrator code
│   ├── orchestrator.ts  # Main execution engine
│   ├── agents/          # Agent implementations
│   ├── lib/             # Supporting libraries
│   ├── tools/           # Agent tools
│   └── types/           # TypeScript definitions
├── departments/         # Department-specific agents and configurations
├── projects/            # Project workspaces
│   ├── _template/       # Project template
│   └── [project-id]/    # Active projects
├── ui/                  # Next.js web interface
│   └── src/             # UI source code
├── change_requests/     # Change management workflow
├── handoffs/            # Inter-department handoffs
├── logs/                # Execution logs and audit trails
└── .windsurf/           # Skills and capabilities
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Git
- API key (optional - only required for SDK Mode; supports OpenAI, Anthropic, etc.)

### Installation
```bash
# Clone the repository
git clone https://github.com/worksyncal/zeus.git
cd zeus

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your OpenAI API key
```

### Creating a New Project
```bash
# Using the CLI (coming soon)
npm run zeus create "My Project"

# Or manually copy the template
cp -r projects/_template projects/my-project
```

### Running a Project
```bash
# Execute next phase
npm run zeus run --project=my-project

# Dry run to preview execution
npm run zeus run --project=my-project --dry-run

# Start from specific phase
npm run zeus run --project=my-project --phase=2
```

## 📖 Documentation

### Core Concepts
- [SSoT Constitution](company/SSOT_CONSTITUTION.md) - Authority model and governance
- [Phase Plan](company/PHASE_PLAN.md) - Detailed phase breakdown
- [Interface Contract](company/INTERFACE_CONTRACT.md) - API and data contracts

### Agent System
- [Agent Registry](agents/AGENT_REGISTRY.md) - Available agents and capabilities
- [Department Heads](departments/*/department_head.md) - Department leadership
- [Specialized Agents](departments/*/agents/*.md) - Task-specific agents

### Project Management
- [Change Requests](change_requests/README.md) - Modification workflow
- [Handoffs](handoffs/README.md) - Inter-department coordination
- [Quality Gates](company/QUALITY_GATES.md) - Quality standards

## 🔧 Configuration

### Project Configuration
Each project has a `PROJECT_CONFIG.json` file:
```json
{
  "projectId": "my-project",
  "projectName": "My Project",
  "commands": {
    "lint": "npm run lint",
    "test": "npm run test",
    "build": "npm run build"
  },
  "paths": {
    "src": "/src",
    "types": "/src/types",
    "migrations": "/supabase/migrations"
  }
}
```

### Environment Variables
```bash
# Required for SDK Mode only (choose one or more providers)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional configuration
ZEUS_ROOT=/path/to/zeus
LOG_LEVEL=info
```

> **Note:** In IDE Mode, no API keys are required. Your IDE's AI assistant handles all LLM interactions.

## 🎯 Use Cases

### ✅ Ideal For
- **Multi-phase web applications** with complex requirements
- **Enterprise software** needing strict quality controls
- **Team-based development** requiring clear handoffs
- **Regulated industries** needing audit trails
- **Educational projects** teaching software development lifecycle

### ❌ Not Ideal For
- Simple static websites
- Small personal projects
- Rapid prototyping without structure
- Projects requiring minimal documentation

## 🔒 Security & Compliance

- **Secret scanning** prevents API key exposure
- **Role-based access control** for all operations
- **Audit logging** for all changes
- **Change approval workflows** for modifications
- **Environment isolation** for different stages

## 🤝 Contributing

Zeus follows a structured contribution process:

1. **Submit Change Request** via `/change_requests/`
2. **Department Review** by relevant department head
3. **Company Head Approval** for SSoT changes
4. **Implementation** with evidence collection
5. **Quality Gates** validation
6. **Integration** and deployment

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

> **Note:** Individual projects in the `/projects/` directory may have their own separate licenses. Each project's LICENSE file takes precedence over the framework license for that specific project.

## 🙏 Acknowledgments

Zeus builds upon concepts from:
- **Agile methodologies** for iterative development
- **DevOps practices** for automation and quality
- **Enterprise architecture** for structured governance
- **AI orchestration** for intelligent task management

---

**Built with ❤️ by the Zeus framework**

For questions and support, please refer to the [documentation](docs/) or submit an issue through the change request process.
