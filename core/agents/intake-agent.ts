import { Agent } from '@openai/agents';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  createProjectFolderTool,
  writeProductSpecTool,
  writeProjectConfigTool,
  writeProjectStatusTool,
  saveIntakeConversationTool,
  readProductSpecTool,
  copyPhasePlanTemplateTool,
} from '../tools/intake-tools.js';

const ZEUS_ROOT = process.cwd();

/**
 * Load instructions from the project_intake_agent.md file
 */
async function loadIntakeAgentInstructions(): Promise<string> {
  const filePath = path.join(ZEUS_ROOT, 'agents', 'project_intake_agent.md');
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return getDefaultIntakeInstructions();
  }
}

/**
 * Default instructions if file not found
 */
function getDefaultIntakeInstructions(): string {
  return `# Project Intake Agent

You are the Intake Agent. Your job is to gather project requirements from users through conversation.

## Your Process

1. **Listen** - Understand what the user wants to build
2. **Clarify** - Ask questions about:
   - Core features and functionality
   - Technical requirements (database, APIs, integrations)
   - UI preferences (colors, style, component libraries)
   - What is explicitly OUT of scope
3. **Document** - Create/update PRODUCT_SPEC.md as you learn more
4. **Confirm** - Show the user the current spec and ask for feedback
5. **Iterate** - Keep refining until the user is satisfied
6. **Handoff** - Only when user says "ready to begin" or similar, hand off to Company Head

## Important Rules

- ALWAYS create the project folder and PRODUCT_SPEC.md early in the conversation
- UPDATE the PRODUCT_SPEC.md whenever the user provides new information or changes
- Ask about SPECIFIC things: features, colors, APIs, dependencies, tech stack
- Do NOT ask generic questions about budget, timeline, or team size
- Do NOT proceed to Company Head until user explicitly confirms they are ready
- Save the conversation history before handoff
`;
}

/**
 * Create the Intake Agent with all necessary tools
 */
export async function createIntakeAgent(): Promise<Agent> {
  const instructions = await loadIntakeAgentInstructions();

  const enhancedInstructions = `${instructions}

---

## Tool Usage Guidelines

You have access to the following tools:

1. **create_project_folder** - Use this FIRST when starting a new project
2. **write_product_spec** - Use this to create/update PRODUCT_SPEC.md (call this frequently as you learn more)
3. **read_product_spec** - Use this to review the current spec before making changes
4. **write_project_config** - Use this to create PROJECT_CONFIG.json (call before handoff)
5. **write_project_status** - Use this to create PROJECT_STATUS.md (call before handoff)
6. **copy_phase_plan_template** - Use this to copy PHASE_PLAN.md (call before handoff)
7. **save_intake_conversation** - Use this to save the conversation history (call before handoff)

## Conversation Flow

1. User describes their project idea
2. You immediately:
   - Generate a project ID (kebab-case from project name)
   - Call create_project_folder
   - Call write_product_spec with initial understanding
3. Ask clarifying questions about:
   - Specific features they need
   - Database/backend requirements
   - Authentication needs
   - Third-party APIs or integrations
   - UI colors and style preferences
   - What should NOT be included (non-goals)
4. After each user response, call write_product_spec to update the spec
5. Periodically summarize and show the user what you have
6. When user says they're ready, ask: "Ready to begin the project?"
7. On confirmation:
   - Call write_project_config
   - Call write_project_status
   - Call copy_phase_plan_template
   - Call save_intake_conversation
   - Output handoff message for Company Head

**Note:** You do NOT need to determine API requirements. A separate API Analyzer Agent will automatically analyze the PRODUCT_SPEC.md and determine required API keys when the project begins.

## Output Format for Handoff

When the user confirms they're ready, output:

\`\`\`
# PROJECT READY FOR HANDOFF

**Project ID:** {project_id}
**Project Name:** {project_name}
**Location:** /projects/{project_id}/

## Files Created
- PRODUCT_SPEC.md
- PROJECT_CONFIG.json
- PROJECT_STATUS.md
- PHASE_PLAN.md
- API_REQUIREMENTS.md
- intake/INTAKE_CONVERSATION.md

## API Keys Required
{list of env variables the user needs to configure}

## Summary
{brief summary of what will be built}

## Recommended First Phase
Phase 0: Foundation

---
**HANDOFF TO COMPANY HEAD**
\`\`\`
`;

  return new Agent({
    name: 'IntakeAgent',
    instructions: enhancedInstructions,
    model: process.env.OPENAI_MODEL_INTAKE || process.env.OPENAI_MODEL_COMPANY_HEAD || 'gpt-4o',
    tools: [
      createProjectFolderTool,
      writeProductSpecTool,
      writeProjectConfigTool,
      writeProjectStatusTool,
      saveIntakeConversationTool,
      readProductSpecTool,
      copyPhasePlanTemplateTool,
    ],
  });
}

/**
 * Check if a message indicates the user is ready to begin
 */
export function isReadyTrigger(message: string): boolean {
  const triggers = [
    'you may begin the project',
    'you may begin',
    'begin the project',
    'start the project',
    "let's begin",
    'go ahead',
    'approved',
    'looks good, start',
    'ready to begin',
    "let's start",
    'start it',
    'begin it',
    'yes, begin',
    'yes begin',
    'yes, start',
    'yes start',
  ];

  const lowerMessage = message.toLowerCase().trim();
  return triggers.some(trigger => lowerMessage.includes(trigger));
}

/**
 * Generate a project ID from a project name
 */
export function generateProjectId(projectName: string): string {
  return projectName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

/**
 * Run the Intake Agent with a conversation history
 */
export async function runIntakeAgent(
  projectId: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<{ response: string; specUpdated: boolean }> {
  const { run } = await import('@openai/agents');
  
  const agent = await createIntakeAgent();
  
  // Build the input message with context
  const lastUserMessage = conversationHistory[conversationHistory.length - 1];
  const contextMessage = `
Project ID: ${projectId}
Project Path: ${ZEUS_ROOT}/projects/${projectId}

Previous conversation:
${conversationHistory.slice(0, -1).map(m => `${m.role}: ${m.content}`).join('\n')}

Current user message: ${lastUserMessage.content}
`;

  try {
    const result = await run(agent, contextMessage);
    
    // Check if spec was updated by looking for tool calls
    const specUpdated = result.newItems?.some(
      (item: { type: string; name?: string }) => 
        item.type === 'tool_call_item' && 
        (item.name === 'write_product_spec' || item.name === 'read_product_spec')
    ) || false;

    // Extract the final text response
    const textItems = result.newItems?.filter(
      (item: { type: string }) => item.type === 'message_output_item'
    ) || [];
    
    const response = textItems.length > 0 
      ? (textItems[textItems.length - 1] as { content?: Array<{ text?: string }> }).content?.[0]?.text || result.finalOutput || 'I understand. Let me help you with that.'
      : result.finalOutput || 'I understand. Let me help you with that.';

    return { response, specUpdated };
  } catch (error) {
    console.error('Error running intake agent:', error);
    throw error;
  }
}
