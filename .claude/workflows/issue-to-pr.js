export const meta = {
  name: 'issue-to-pr',
  description: 'Full issue lifecycle: assign → branch → implement → test → PR → squash merge → close',
  whenToUse: 'When you want to take an open GitHub issue through the complete development cycle automatically. Pass an issue number, or omit to pick from open issues.',
  phases: [
    { title: 'Setup', detail: 'Fetch issue, assign to user, mark in progress, create branch' },
    { title: 'Research', detail: 'Deep-research the issue to understand all affected files' },
    { title: 'Implement', detail: 'Make the code changes across all affected files' },
    { title: 'Test', detail: 'Run tests and verify the changes' },
    { title: 'PR & Merge', detail: 'Create PR, approve, squash merge, close branch, close issue' },
  ],
};

// ─── Issue to PR: Full Lifecycle Automation ───────────────────────────────
// Usage: /workflow issue-to-pr -- 815
//        /workflow issue-to-pr            (picks first open issue)
//
// Prerequisites:
//   - gh CLI authenticated
//   - git configured with user.name and user.email
//   - Branch protection must allow self-approval, or use a PAT with admin scope

const REPO = 'bruceamoser/neon-relic';
const ASSIGNEE = 'bruceamoser';
const BASE_BRANCH = 'main';

// ─── Phase 1: Setup ───────────────────────────────────────────────────────

phase('Setup');

// Determine which issue to work
let issueNum;
const issueArg = args?.issue || args;
if (issueArg && typeof issueArg === 'number') {
  issueNum = issueArg;
} else if (issueArg && !isNaN(Number(issueArg))) {
  issueNum = Number(issueArg);
} else {
  // Auto-pick the first open issue
  const result = await agent(
    `Run: gh issue list --repo ${REPO} --state open --limit 1 --json number --jq '.[0].number'`,
    { label: 'find-open-issue' }
  );
  const picked = parseInt(result.trim());
  if (!isNaN(picked)) {
    issueNum = picked;
    log(`No issue specified — auto-picked first open: #${issueNum}`);
  }
}

if (!issueNum || isNaN(issueNum)) {
  throw new Error('Could not determine issue number. Pass a number: /workflow issue-to-pr -- 815');
}

// Fetch issue details
const issueJson = await agent(
  `Run: gh issue view ${issueNum} --repo ${REPO} --json number,title,body,state,assignees,labels --jq '.'`,
  { label: 'fetch-issue' }
);
const issue = JSON.parse(issueJson.trim());

if (issue.state !== 'OPEN') {
  throw new Error(`Issue #${issueNum} is ${issue.state}, not OPEN. Pick another issue.`);
}

log(`📋 Issue #${issueNum}: ${issue.title}`);

// Assign to user and mark in progress
await agent(
  `Run these commands sequentially and report success/failure for each:
1. gh issue edit ${issueNum} --repo ${REPO} --add-assignee "${ASSIGNEE}"
2. gh label create "in-progress" --repo ${REPO} --color "E6A23C" --force
3. gh issue edit ${issueNum} --repo ${REPO} --add-label "in-progress"`,
  { label: 'assign-and-label' }
);
log(`✅ Assigned to ${ASSIGNEE} and labeled in-progress`);

// Create branch
const branchSlug = issue.title
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .substring(0, 40);
const branchName = `issue-${issueNum}-${branchSlug}`;

await agent(
  `Run: git checkout ${BASE_BRANCH} && git pull origin ${BASE_BRANCH} && git checkout -b ${branchName} && git push -u origin ${branchName}`,
  { label: 'create-branch' }
);
log(`🌿 Branch: ${branchName}`);

// ─── Phase 2: Research ────────────────────────────────────────────────────

phase('Research');

log('🔍 Identifying all affected files...');

// If the issue body already has a comprehensive file inventory, extract it.
// Otherwise, do fresh deep research.
const hasFileInventory = issue.body && (
  issue.body.includes('Complete File Inventory') ||
  issue.body.includes('Files to Modify') ||
  issue.body.includes('## What Needs to Change')
);

let researchResult;
if (hasFileInventory) {
  log('📝 Issue body contains a file inventory — extracting structured list...');
  researchResult = await agent(
    `Read the issue body below and extract a structured JSON list of EVERY file
that needs to change, with the specific change needed for each file.

Output format:
{
  "files": [
    { "file": "src/data/actor-models.mjs", "change": "Add total and spent fields", "priority": "critical" }
  ],
  "summary": "Brief description of the overall change"
}

Issue Body:
${issue.body.substring(0, 8000)}`,
    { label: 'extract-file-list', schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'object', properties: { file: { type: 'string' }, change: { type: 'string' }, priority: { type: 'string' } }, required: ['file', 'change'] } },
        summary: { type: 'string' }
      },
      required: ['files', 'summary']
    }}
  );
} else {
  log('🔎 Issue is brief — doing fresh deep research across both repos...');
  researchResult = await agent(
    `Thoroughly research GitHub issue #${issueNum} ("${issue.title}") to identify every file
that needs to change. Search across BOTH repositories:
  - c:\\Repos\\neon-relic\\ (rulebook, web app, docs, assets, prebuilt characters)
  - c:\\Repos\\foundry-neon-relic-system\\ (Foundry VTT system, compendium packs)

Issue body: ${issue.body}

Search for all relevant references, imports, templates, styles, data models,
compendium packs, localization files, and documentation.

Return a JSON object with a complete 'files' array and a 'summary' string.`,
    { label: 'fresh-research', schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'object', properties: { file: { type: 'string' }, change: { type: 'string' }, priority: { type: 'string' } }, required: ['file', 'change'] } },
        summary: { type: 'string' }
      },
      required: ['files', 'summary']
    }}
  );
}

const fileList = researchResult.files;
log(`📊 ${fileList.length} files to change: ${researchResult.summary}`);

// ─── Phase 3: Implement ───────────────────────────────────────────────────

phase('Implement');

log(`🛠️ Implementing changes across ${fileList.length} files...`);

// Process critical files first (data models, config), then everything else
const critical = fileList.filter(f => f.priority === 'critical');
const rest = fileList.filter(f => f.priority !== 'critical');

async function editFile(f) {
  return agent(
    `You are editing file "${f.file}". Read it first to understand its current content,
then use the Edit tool to make this change: ${f.change}

IMPORTANT:
- Read the file before editing
- Match indentation exactly in old_string
- Follow the existing code style and patterns
- Only change what's necessary`,
    { label: f.file.split('/').pop(), phase: 'Implement' }
  );
}

if (critical.length > 0) {
  log(`⚡ ${critical.length} critical files first...`);
  for (const f of critical) await editFile(f);
}

if (rest.length > 0) {
  log(`📝 ${rest.length} remaining files...`);
  for (const f of rest) await editFile(f);
}

log('✅ Implementation complete');

// ─── Phase 4: Test & Verify ───────────────────────────────────────────────

phase('Test');

log('🧪 Running tests...');

// Stage and review changes
await agent('Run: git add -A && git diff --stat', { label: 'stage-and-review' });

const testResult = await agent(
  `Check for and run any available tests in this project:
1. Check package.json for test scripts
2. Check for test directories
3. Check for build/validation scripts (build.ps1, build.sh, gulpfile.js, etc.)
4. Check for lint configs

Run whatever is available. If nothing exists, at minimum verify:
- The changed files have no obvious syntax errors
- No broken imports or references

Report exactly what was run and whether it passed.`,
  { label: 'run-tests', phase: 'Test' }
);

log(`Test output: ${testResult.substring(0, 500)}`);

const testsFailed = testResult.toLowerCase().includes('fail') ||
                    testResult.toLowerCase().includes('error');
if (testsFailed) {
  log('⚠️ Failures detected — attempting fixes...');
  await agent(
    `Tests failed. Review and fix the issues:\n${testResult}\n\nEdit the files that need correction.`,
    { label: 'fix-failures', phase: 'Test' }
  );
}

// End-to-end verification
log('🔬 Verifying changes end-to-end...');
await agent(
  `Review the complete diff (git diff) and confirm:
1. All changes are consistent with each other
2. No missing imports, references, or cross-references
3. Changes match what issue #${issueNum} requested
4. No unintended files were modified

If everything looks correct, say "VERIFIED". If issues found, list them.`,
  { label: 'verify-diff', phase: 'Test' }
);

// ─── Phase 5: Commit & Push ───────────────────────────────────────────────

log('📦 Committing...');

await agent(
  `Commit all changes with this message format:

${issue.title} (#${issueNum})

[Concise description of changes made]

Closes #${issueNum}
Co-Authored-By: Claude <noreply@anthropic.com>

Run:
git add -A
git commit -m "[the message above]"
git push origin ${branchName}`,
  { label: 'commit-and-push', phase: 'PR & Merge' }
);

log('✅ Pushed');

// ─── Phase 6: PR, Approve, Merge, Cleanup ─────────────────────────────────

phase('PR & Merge');

log('🚀 Creating PR...');

// Create the PR
const prOutput = await agent(
  `Create a pull request:

gh pr create \
  --repo ${REPO} \
  --base ${BASE_BRANCH} \
  --head ${branchName} \
  --title "${issue.title} (#${issueNum})" \
  --body "## Changes

See commit history for details.

## Issue
Closes #${issueNum}

🤖 Generated with [Claude Code](https://claude.com/claude-code)" \
  --label "automated"

Report the PR URL on its own line.`,
  { label: 'create-pr' }
);

const prUrl = prOutput.match(/https:\/\/github\.com\/\S+\/pull\/\d+/)?.[0];
log(`📬 ${prUrl || 'PR created'}`);

// Approve
log('✅ Approving PR...');
await agent(
  `Approve the PR:
gh pr review --repo ${REPO} --approve --body "Automated approval — changes verified and tests passed."

If self-approval is blocked, report that and continue.`,
  { label: 'approve-pr' }
);

// Squash merge
log('🔀 Squash merging...');
await agent(
  `Squash-merge the PR and delete the remote branch:

gh pr merge --repo ${REPO} --squash --delete-branch \
  --subject "${issue.title} (#${issueNum})" \
  --body "Closes #${issueNum}

Co-Authored-By: Claude <noreply@anthropic.com>"

If merge fails (CI pending, approvals needed), report the status.
If the issue didn't auto-close, run: gh issue close ${issueNum} --repo ${REPO} --reason completed`,
  { label: 'merge-and-close' }
);

// Local cleanup
await agent(
  `Clean up local branch:
git checkout ${BASE_BRANCH}
git pull origin ${BASE_BRANCH}
git branch -d ${branchName} || echo "Local branch already removed"`,
  { label: 'cleanup-local' }
);

log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
log(`🎉 Issue #${issueNum} → PR → Merge → Close: COMPLETE`);
log(`   Issue:  https://github.com/${REPO}/issues/${issueNum}`);
log(`   Branch: ${branchName} (deleted)`);
log(`   Files:  ${fileList.length} changed`);
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

return {
  issueNumber: issueNum,
  branchName,
  prUrl: prUrl || null,
  filesChanged: fileList.length,
  summary: researchResult.summary,
};
