You are helping the user mark a task as done.

## Instructions

1. **Scan for in-progress tasks**:
   - Use the Glob tool to find all `**/docs/TASKS.md` files
   - For each file, look for unchecked items (`- [ ]`) under the `## In Progress` section
   - If no in-progress tasks are found across any file, tell the user

2. **Display in-progress tasks**:
   - List all in-progress items grouped by package/app
   - Ask the user which task they want to mark as done

3. **When the user selects a task**:
   - Change the checkbox from `- [ ]` to `- [x]`
   - Move the item from `## In Progress` to `## Done`
   - Ask the user if they want to commit the related changes
