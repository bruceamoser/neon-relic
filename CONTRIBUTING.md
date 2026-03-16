# Neon Relic — Issue Workflow SOP

This document defines the standard process for picking up, working on, and closing design issues in this repository. Follow it consistently so that work history, decisions, and references are preserved in the issue tracker for both Bruce and Stu.

---

## Table of Contents

1. [Overview](#overview)
2. [Branch Naming Conventions](#branch-naming-conventions)
3. [Commit Message Conventions](#commit-message-conventions)
4. [Step-by-Step Workflow](#step-by-step-workflow)
   - [Step 1 — Pick an Issue](#step-1--pick-an-issue)
   - [Step 2 — Assign and Mark In-Progress](#step-2--assign-and-mark-in-progress)
   - [Step 3 — Create a Working Branch](#step-3--create-a-working-branch)
   - [Step 4 — Do the Work](#step-4--do-the-work)
   - [Step 5 — Comment as You Go](#step-5--comment-as-you-go)
   - [Step 6 — Commit and Push](#step-6--commit-and-push)
   - [Step 7 — Open a Pull Request](#step-7--open-a-pull-request)
   - [Step 8 — Review and Merge](#step-8--review-and-merge)
   - [Step 9 — Delete the Branch](#step-9--delete-the-branch)
   - [Step 10 — Move to the Next Issue](#step-10--move-to-the-next-issue)
5. [Quick Reference — gh CLI Cheat Sheet](#quick-reference--gh-cli-cheat-sheet)
6. [Issue Commenting Guidelines](#issue-commenting-guidelines)
7. [Design Decision Issues](#design-decision-issues)
8. [Release Process (vX.Y.Z)](#release-process-vxyz)

---

## Overview

Each issue in this repo represents a discrete piece of design work, a design decision, or a specific section of the core rules that needs to be written. Issues are tiered by priority:

| Tier | Label | When to Work On |
|---|---|---|
| 1 — Critical | `tier: 1-critical` | First — required before any playtesting |
| 2 — Major | `tier: 2-major` | Second — required for complete core rules |
| 3 — Polish | `tier: 3-polish` | Third — required for publication quality |
| 4 — Expansion | `tier: 4-expansion` | Last — stretch content and GM tools |

Work issues in tier order. Within a tier, pick the issue that unblocks the most other work (e.g., Character Creation unblocks Dark Secrets and Relationships).

> **⚠️ AGENT INSTRUCTION — NO STOPPING BETWEEN ISSUES**
> Do **NOT** pause between issues to ask "ready to proceed?", "shall I continue?", or "want me to start the next issue?".
> Do **NOT** wait for approval after merging a PR before starting the next issue.
> The correct behavior is: merge → assign next issue → branch → work → merge → repeat, with no interruptions.
> The only valid reason to stop is if you hit a genuine blocker that requires a design decision from Bruce or Stu that cannot be inferred. In that case, leave a comment on the issue and move to the next one — do not stop the loop.

---

## Branch Naming Conventions

Branch names should follow this pattern:

```
issue/<number>-<short-slug>
```

Examples:
```
issue/1-character-creation
issue/3-combat-rules
issue/6-fear-mechanics
issue/15-expanded-hq-upgrades
```

Keep slugs lowercase, hyphenated, and short (3–5 words max).

---

## Commit Message Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/) format, with the issue number in parentheses:

```
<type>(#<issue-number>): <short description>
```

Types:
- `feat` — new rules content added
- `fix` — correcting existing content
- `chore` — housekeeping (restructuring, renaming, cleanup)
- `docs` — updates to process docs like this one

Examples:
```
feat(#1): add step-by-step character creation procedure
feat(#3): draft initiative and action economy rules
feat(#3): add zone definitions and range categories
feat(#6): add fear check mechanic and Resonance integration
fix(#4): correct critical injury severity thresholds
chore: remove temp issue body files
```

For in-progress work where a section is incomplete, prefix the description with `WIP`:
```
feat(#3): WIP draft melee combat actions — chase rules TBD
```

---

## Step-by-Step Workflow

### Step 1 — Pick an Issue

Start by reviewing open issues in priority order.

```sh
# List all open issues sorted by label
gh issue list --repo bruceamoser/neon-relic --label "tier: 1-critical"
gh issue list --repo bruceamoser/neon-relic --label "tier: 2-major"

# View a specific issue in detail
gh issue view <number> --repo bruceamoser/neon-relic
```

Pick the highest-tier open issue that is not already assigned. **Do not start reading reference docs yet — assign first.**

---

### Step 2 — Assign and Mark In-Progress

> **⚠️ Do this FIRST — before reading reference docs, before creating a branch, before any research.**
> This makes the in-progress state visible to Bruce and Stu immediately.

Assign the issue to yourself and add a starting comment so the history is clear.

```sh
# Assign to yourself
gh issue edit <number> \
  --repo bruceamoser/neon-relic \
  --add-assignee "@me"

# Leave a starting comment
gh issue comment <number> \
  --repo bruceamoser/neon-relic \
  --body "Starting work on this. Creating branch \`issue/<number>-<slug>\`."
```

> **Note:** GitHub does not have a native "In Progress" state for issues. The combination of an assignee + an active branch makes the in-progress state visible.

Only after the issue is assigned should you proceed to Step 3.

---

### Step 3 — Create a Working Branch

Always branch off `main`. Never work directly on `main`.

```sh
# Make sure main is up to date
git checkout main
git pull origin main

# Create and switch to the issue branch
git checkout -b issue/<number>-<short-slug>
```

Example:
```sh
git checkout -b issue/1-character-creation
```

---

### Step 4 — Do the Work

Open the target chapter file (specified in the issue body) and write the content. Each issue identifies its target file as `docs/chapters/XX-name.adoc`. Consult the YZE reference documents in `docs/references/` as directed in the issue body.

**Key reference files:**
| File | Use For |
|---|---|
| `docs/references/Vaesen.md` | Primary comparison — investigation structure, HQ, archetypes, mystery creation |
| `docs/references/MutantYearZero-Corebook-20220605.md` | Character creation, mutations, Ark management |
| `docs/references/Forbidden_Lands_Players_Handbook_5th_printing.md` | Combat, skills, journey, equipment |
| `docs/references/Forbidden_Lands_Gamemasters_Guide_5th_printing.md` | GM tools, bestiary, adventure sites, faction NPCs |
| `tools/core-rules-gap-analysis.md` | Cross-reference: confirms what was missing and why |

Work through the checklist in the issue body, checking off sub-tasks as you complete them. If you discover something that changes the scope or approach, document it in an issue comment before changing direction.

---

### Step 5 — Comment as You Go

Leave comments on the issue during the work — not just at the start and end. This creates a design journal and preserves the reasoning behind decisions.

**When to leave a comment:**
- When you make a significant design decision (and why)
- When you deviate from what the issue originally specified
- When you encounter a dependency on another issue
- When you need input from Stu
- When you finish a major sub-task group

**Comment format for design decisions:**
```
**Design Decision:** [What you decided]

**Rationale:** [Why — reference the YZE precedent, the NR tone, or the specific design constraint]

**Alternatives considered:** [What you didn't choose and why]
```

**Comment format for blockers:**
```
**Blocked:** This section depends on the outcome of #<issue-number> ([issue title]).
Pausing this sub-task until that is resolved.
```

---

### Step 6 — Commit and Push

Commit regularly — at minimum after completing each logical chunk (e.g., finishing a full section, completing a set of related sub-tasks).

```sh
# Stage the changed file(s)
git add docs/chapters/<XX>-<chapter>.adoc

# Commit with conventional commit message referencing the issue
git commit -m "feat(#<number>): <short description>"

# Push to remote
git push origin issue/<number>-<short-slug>
```

If this is your first push to the branch:
```sh
git push --set-upstream origin issue/<number>-<short-slug>
```

---

### Step 7 — Open a Pull Request

When all sub-tasks in the issue are checked off and the work is complete, open a PR.

```sh
gh pr create \
  --repo bruceamoser/neon-relic \
  --base main \
  --head issue/<number>-<short-slug> \
  --title "Issue #<number>: <issue title>" \
  --body "Closes #<number>

## Summary
[1–3 sentences describing what was written or decided]

## Changes
- [Bullet list of the sections added or modified in neon-relic-core-rules.md]

## Design Notes
[Any key decisions made during the work that reviewers should know]

## References Consulted
- \`docs/Vaesen.md\` — [specific chapter or section]
- [other references used]"
```

Example:
```sh
gh pr create \
  --repo bruceamoser/neon-relic \
  --base main \
  --head issue/1-character-creation \
  --title "Issue #1: Character Creation Process" \
  --body "Closes #1

## Summary
Adds a complete step-by-step character creation procedure to the core rules, including attribute/skill point distribution, starting gear by Division, and a worked example.

## Changes
- Added Section: Character Creation (12-step procedure)
- Added: attribute point pool rules (14 points, min 1 / max 4)
- Added: skill point pool rules (10 points)
- Added: starting gear tables per Division
- Added: worked example character

## Design Notes
Followed Vaesen's attribute/skill distribution model as the closest parallel to NR's investigation structure. Attribute total (14) and skill total (10) feel right for a gritty horror game — slightly below the heroic end of the YZE spectrum.

## References Consulted
- \`docs/Vaesen.md\` — Ch. 2 (Character Creation)
- \`docs/Forbidden_Lands_Players_Handbook_5th_printing.md\` — Character Creation chapter"
```

---

### Step 8 — Merge and Move On

**Do not wait for review.** Merge the PR immediately after opening it and proceed to the next issue. Bruce will review the accumulated content in the chapter files after all issues are closed — not issue by issue.

```sh
# Merge the PR (squash to keep main history clean) and delete the branch
gh pr merge <pr-number> \
  --repo bruceamoser/neon-relic \
  --squash \
  --delete-branch
```

The `--delete-branch` flag handles remote cleanup automatically.

**Minimum check before merging:**
- [ ] All sub-tasks in the issue are checked off (or explicitly noted as placeholder/deferred)
- [ ] New content is consistent with the YZE dice-pool framework
- [ ] Cross-references to dependent issues are noted (not necessarily resolved)

---

### Step 9 — Delete the Branch

If you did not use `--delete-branch` during merge:

```sh
# Delete the remote branch
git push origin --delete issue/<number>-<short-slug>

# Delete the local branch
git checkout main
git branch -d issue/<number>-<short-slug>

# Pull the merged changes to local main
git pull origin main
```

---

### Step 10 — Move to the Next Issue

The PR merge via `Closes #<number>` will automatically close the issue. Verify it is closed:

```sh
gh issue view <number> --repo bruceamoser/neon-relic
```

Then return to Step 1 and pick the next issue.

---

## Quick Reference — gh CLI Cheat Sheet

```sh
# List issues by tier
gh issue list --repo bruceamoser/neon-relic --label "tier: 1-critical"
gh issue list --repo bruceamoser/neon-relic --label "tier: 2-major"
gh issue list --repo bruceamoser/neon-relic --label "area: combat"

# View an issue
gh issue view <number> --repo bruceamoser/neon-relic

# Assign to self
gh issue edit <number> --repo bruceamoser/neon-relic --add-assignee "@me"

# Comment on an issue
gh issue comment <number> --repo bruceamoser/neon-relic --body "Your comment here"

# Create a branch (git — not gh)
git checkout main && git pull origin main
git checkout -b issue/<number>-<slug>

# Push branch
git push --set-upstream origin issue/<number>-<slug>

# Open a PR
gh pr create --repo bruceamoser/neon-relic --base main --head issue/<number>-<slug> --title "..." --body "..."

# List open PRs
gh pr list --repo bruceamoser/neon-relic

# Merge and delete branch
gh pr merge <pr-number> --repo bruceamoser/neon-relic --squash --delete-branch

# Verify issue closed
gh issue view <number> --repo bruceamoser/neon-relic
```

---

## Issue Commenting Guidelines

| Situation | What to Comment |
|---|---|
| Starting work | "Starting work on this. Branch: `issue/<n>-<slug>`" |
| Design decision made | Decision + rationale + alternatives considered (see format above) |
| Deviating from issue scope | What changed and why |
| Blocked by another issue | Which issue, what is needed, link it |
| Asking Stu for input | Tag with `@stucodesomeday` (or Stu's GitHub handle) + clear question |
| Sub-section complete | "Completed: [sub-task group]. Remaining: [what's left]" |
| PR opened | "PR opened: #<pr-number>" |

Keep comments factual and design-focused. This tracker is the design journal for Neon Relic — future you will thank present you for the documentation.

---

## Design Decision Issues

Some issues (e.g., `#18 — Willpower / Activation Resource`) are **decision issues** — the output is a documented design choice, not written rules content. These follow a slightly different flow:

1. Assign and branch as normal
2. In the issue comments, lay out the options clearly (the issue body already does this)
3. Discuss with Stu asynchronously via issue comments
4. When a decision is reached, post a final comment:
   ```
   **DECISION:** [Option chosen]
   **Rationale:** [Why]
   **Impact:** [What other issues this affects]
   ```
5. Update the relevant issues that depend on this decision (add a comment linking back)
6. Make any necessary changes to `docs/neon-relic-core-rules.md` on the branch
7. PR, merge, and close as normal

---

*This SOP is for the Neon Relic design project. Both Bruce and Stu should follow it to maintain a clean, legible design history.*

---

## Release Process (vX.Y.Z)

Use this process when publishing an official repo release with the generated documentation artifact.

### 1. Prepare Main

```sh
git checkout main
git pull origin main
git status
```

Ensure the working tree is clean before release packaging.

### 1a. Validate AsciiDoc Cross-References

Before building, verify that no chapter file contains raw file-path references that render as broken links in the PDF. Run from the repo root — the command should return **no output**:

```powershell
Select-String -Path docs/chapters/*.adoc -Pattern '`docs/chapters/'
```

If any lines are returned, convert each match from:

```adoc
`docs/chapters/XX-name.adoc`
```

to the proper AsciiDoc cross-reference format:

```adoc
xref:XX-name.adoc[Chapter Title]
```

Fix all hits before proceeding with the build.

### 2. Build PDF Output

Generate the PDF from the master AsciiDoc document. Run from the repo root:

```powershell
# Ensure output directory exists
New-Item -ItemType Directory -Force -Path docs/output | Out-Null

# Build PDF from master document
asciidoctor-pdf docs/neon-relic.adoc -D docs/output -o neon-relic.pdf
```

This produces `docs/output/neon-relic.pdf`. The `docs/output/` directory is gitignored — the PDF is generated fresh each release and attached as a release artifact.

Verify the build succeeded:

```powershell
Test-Path docs/output/neon-relic.pdf
```

Expected output: `True`

> **Note:** Cross-references between chapters (`xref:XX-name.adoc[Title]`) produce working internal hyperlinks in the PDF because all chapters are included via `include::` directives in `docs/neon-relic.adoc`. Compiling individual chapter files will NOT produce working links.

### 3. Create Release Zip

PowerShell example:

```powershell
$version = "1.0.0"
$zipPath = "docs/output/neon-relic-$version.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath }
Compress-Archive -Path docs/output/neon-relic.pdf -DestinationPath $zipPath
```

### 4. Commit Release Metadata/Docs Changes

```sh
git add .
git commit -m "docs: add release process and prepare vX.Y.Z artifacts"
git push origin main
```

### 5. Update GitHub Repository Description (Optional but Recommended)

```sh
gh repo edit bruceamoser/neon-relic --description "Neon Relic: Year Zero Engine occult investigation RPG set in an alternate 1980s."
```

### 6. Create GitHub Release

```sh
gh release create vX.Y.Z docs/output/neon-relic-X.Y.Z.zip \
  --repo bruceamoser/neon-relic \
  --title "X.Y.Z" \
  --notes "Release X.Y.Z: updated core rules and generated book artifact."
```

Notes:
- Use semantic version tags (`v1.0.0`, `v1.0.1`, etc.).
- Keep release title numeric (`1.0.0`) and tag prefixed (`v1.0.0`).
- Attach only generated artifacts intended for consumers.
- Do **not** pass literal `\n` escape sequences in release notes. Use an actual multiline body.

### 6a. Release Notes Template

PowerShell example using a multiline variable:

```powershell
$notes = @"
Neon Relic X.Y.Z

- Summary item one
- Summary item two
- Summary item three
"@

gh release create vX.Y.Z docs/output/neon-relic-X.Y.Z.zip `
  --repo bruceamoser/neon-relic `
  --title "X.Y.Z" `
  --notes $notes
```

Suggested release note structure:

```text
Neon Relic X.Y.Z

- Rules changes
- Documentation/process changes
- Release artifact notes
```

### 7. Validate Published Release

```sh
gh release view vX.Y.Z --repo bruceamoser/neon-relic
```

Confirm:
- tag exists
- release is published
- zip asset is attached and downloadable
