---
name: clickup-task-creator
description: Create ClickUp tasks using clickup-cli with file content as descriptions. Use when the user asks to create ClickUp tasks, tickets, or issues with content from files (markdown, text, or other document files).
---

# ClickUp Task Creator

## Overview

Create ClickUp tasks directly from the command line using the `clickup-cli` tool. The primary use case is creating tasks where the description content comes from a file, enabling rapid task creation from specifications, bug reports, feature requests, or any documented content.

## Prerequisites

Before using this skill, ensure:

1. **clickup-cli is installed**: Install via npm with `npm install -g clickup-cli`
2. **Configuration exists**: The CLI requires a config file at `~/.clickup` with:
   - API token from ClickUp account
   - Default list ID(s) where tasks should be created
3. **Verify installation**: Run `clickup help` to confirm the CLI is available

## Creating Tasks from Files

Use the `clickup create` command with the `-f, --file` option to create tasks with file content as the description:

```bash
clickup create "Task Name" -f /path/to/description.md -l <list_id>
```

### Basic Example

```bash
# Create a task with markdown description from file
clickup create "Implement user authentication" -f /path/to/auth-spec.md -l 123456789
```

### Complete Example with All Options

```bash
clickup create "Fix login bug" \
  -f /path/to/bug-report.md \
  -l 123456789 \
  -i 2 \
  -a "JD,MS" \
  -s "In Progress" \
  -p 5 \
  -t 987654321 \
  -e 7200000
```

## Command Options

The `clickup create` command supports these options:

- **`-f, --file <filePath>`**: **Path to file containing markdown description** (primary use case)
- **`-l, --list <list...>`**: Comma-separated list names or IDs (required if no default in config)
- **`-i, --priority <priority>`**: Task priority from 1 (urgent) to 5 (low)
- **`-a, --assignees <user...>`**: Comma-separated user initials or IDs
- **`-s, --status <status>`**: Task status (e.g., "Open", "In Progress", "Completed")
- **`-p, --points <points>`**: Sprint points for estimation
- **`-t, --parent <task_id>`**: Parent task ID to create as subtask
- **`-e, --time_estimate <estimate>`**: Time estimate in milliseconds
- **`-j, --json <json>`**: Custom fields as JSON string
- **`-m, --description <markdown>`**: Inline markdown description (alternative to `-f`)

## Workflow for File-Based Task Creation

When a user requests creating a ClickUp task from a file:

1. **Verify file exists**: Use `view` to check the file path and read content if needed
2. **Construct the command**: Build the `clickup create` command with appropriate options
3. **Execute**: Run the command using `bash_tool`
4. **Confirm**: Parse the output to verify task creation and provide task ID to user

### Example Workflow

```bash
# User asks: "Create a ClickUp task from the spec.md file with the bug details"

# Step 1: Verify file exists
view /path/to/spec.md

# Step 2: Create the task
clickup create "Bug: Login form validation" \
  -f /path/to/spec.md \
  -l 123456789 \
  -i 1 \
  -s "Open"

# Step 3: Output will include task ID for reference
```

## Common Patterns

### From Bug Report

```bash
clickup create "Bug: $(head -1 bug-report.md)" \
  -f bug-report.md \
  -l <list_id> \
  -i 1 \
  -s "Open"
```

### From Feature Spec

```bash
clickup create "Feature: New dashboard" \
  -f feature-spec.md \
  -l <list_id> \
  -p 8 \
  -a "PM,DEV"
```

### From Meeting Notes

```bash
clickup create "Action items from standup" \
  -f standup-notes.md \
  -l <list_id> \
  -s "To Do"
```

## File Format Considerations

- **Markdown files** (`.md`): Rendered with full markdown formatting in ClickUp
- **Text files** (`.txt`): Displayed as plain text
- **Other formats**: Content will be treated as plain text

The file content becomes the task description. The task name must be provided separately as the first argument.

## Error Handling

Common issues and solutions:

- **"clickup-cli: command not found"**: Install with `npm install -g clickup-cli`
- **"Authentication required"**: Configure `~/.clickup` with valid API token
- **"List not found"**: Verify list ID or set default list in config
- **File not found**: Check file path is absolute or relative to current directory

## Configuration File

The `~/.clickup` config file should contain:

```json
{
	"token": "your_clickup_api_token",
	"team_id": "your_team_id",
	"list_id": "default_list_id"
}
```

Get your API token from ClickUp: Settings → Apps → API Token
