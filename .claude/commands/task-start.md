You are helping the user start working on a task from the task tracker.

## Instructions

1. **If `$ARGUMENTS` is provided** (a package or app name):
   - Read the file at `<package-or-app>/docs/TASKS.md` (try common locations: `packages/$ARGUMENTS/docs/TASKS.md`, `apps/$ARGUMENTS/docs/TASKS.md`, `playgrounds/$ARGUMENTS/docs/TASKS.md`)
   - If the file doesn't exist, tell the user and suggest creating one

2. **If `$ARGUMENTS` is empty**:
   - Scan all `**/docs/TASKS.md` files in the repository using the Glob tool with pattern `**/docs/TASKS.md`
   - For each file found, check if there are unchecked items (`- [ ]`)
   - List all packages/apps that have pending tasks, showing the count of items in each section
   - Ask the user which package they want to work on, then proceed as in step 1

3. **Show the `## Next` section**:
   - Display all unchecked items (`- [ ]`) from the `## Next` section
   - If there are dependency notes, highlight them
   - Ask the user which task they want to start

4. **When the user selects a task**:
   - Move the selected item from `## Next` to `## In Progress` in the TASKS.md file
   - Create a work branch from main (e.g., `feat/...`, `fix/...`, `chore/...` depending on the task type)
   - Read the package's CLAUDE.md (if it exists) to understand the package context
   - Read relevant source files to build context for the task
   - Begin working on the task
