import 'dotenv/config';
import { runProject, listProjects, createProject } from './orchestrator.js';

const HELP_TEXT = `
Zeus Orchestrator - AI-powered development orchestration
Powered by OpenAI Agents SDK

Usage:
  npx tsx core/index.ts <command> [options]

Commands:
  run <project-id> [--phase <n>] [--dry-run]   Run orchestration for a project
  list                                          List all projects
  create <project-name>                         Create a new project from template

Options:
  --phase <n>    Start from a specific phase (default: current phase)
  --dry-run      Preview what would happen without making API calls

Examples:
  npx tsx core/index.ts run my-saas-app
  npx tsx core/index.ts run my-saas-app --phase 0
  npx tsx core/index.ts run my-saas-app --dry-run
  npx tsx core/index.ts list
  npx tsx core/index.ts create "My New Project"
`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  const command = args[0];

  try {
    switch (command) {
      case 'run': {
        const projectId = args[1];
        if (!projectId) {
          console.error('Error: Project ID required');
          console.log('Usage: npx tsx core/index.ts run <project-id>');
          process.exit(1);
        }

        const phaseIndex = args.indexOf('--phase');
        const startPhase = phaseIndex !== -1 ? parseInt(args[phaseIndex + 1], 10) : undefined;

        const dryRun = args.includes('--dry-run');

        console.log('\n');
        const result = await runProject({
          projectId,
          startPhase,
          dryRun,
        });

        console.log('\n');
        console.log('═'.repeat(60));
        console.log('ORCHESTRATION RESULT');
        console.log('═'.repeat(60));
        console.log(`Success: ${result.success}`);
        console.log(`Project: ${result.projectId}`);
        console.log(`Phases Completed: ${result.phasesCompleted.join(', ') || 'None'}`);
        console.log(`Summary: ${result.summary}`);

        if (result.errors.length > 0) {
          console.log('\nErrors:');
          for (const error of result.errors) {
            console.log(`  - ${error}`);
          }
        }

        process.exit(result.success ? 0 : 1);
        break;
      }

      case 'list': {
        const projects = await listProjects();

        console.log('\nAvailable Projects:');
        console.log('─'.repeat(40));

        if (projects.length === 0) {
          console.log('No projects found. Create one with:');
          console.log('  npx tsx core/index.ts create "My Project"');
        } else {
          for (const project of projects) {
            console.log(`  - ${project}`);
          }
        }

        console.log('');
        break;
      }

      case 'create': {
        const projectName = args[1];
        if (!projectName) {
          console.error('Error: Project name required');
          console.log('Usage: npx tsx core/index.ts create "My Project Name"');
          process.exit(1);
        }

        const projectId = await createProject(projectName);
        console.log(`\nProject created successfully!`);
        console.log(`  ID: ${projectId}`);
        console.log(`  Path: projects/${projectId}/`);
        console.log(`\nNext steps:`);
        console.log(`  1. Edit projects/${projectId}/PRODUCT_SPEC.md with your requirements`);
        console.log(`  2. Edit projects/${projectId}/PROJECT_CONFIG.json with your settings`);
        console.log(`  3. Run: npx tsx core/index.ts run ${projectId}`);
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        console.log(HELP_TEXT);
        process.exit(1);
    }
  } catch (error) {
    console.error('\nFatal error:', error);
    process.exit(1);
  }
}

main();
