# TestSpirit Chat Participant for GitHub Copilot

This configuration file registers a custom chat participant that integrates TestSpirit debugging into GitHub Copilot.

## Usage

In GitHub Copilot Chat, type:

```
@testspirit /run_testspirit_fix
```

OR simply:

```
Run TestSpirit and fix all errors
```

## How It Works

1. The chat participant triggers the "Run TestSpirit" VS Code task
2. Waits for `.testspirit_output.json` to be generated
3. Loads and analyzes all detected issues
4. Automatically applies fixes based on TestSpirit findings
5. Reports progress and provides a comprehensive summary

## Configuration

This file registers the TestSpirit Fixer as a sticky chat participant, meaning it will remain active throughout your Copilot session.

## Commands

- `/run_testspirit_fix` - Main command to trigger the full automated debugging pipeline

## Rules

All fix behaviors are governed by `.cursor/rules/testspirit.md`, which ensures:
- Only real code is used (no placeholders)
- Root causes are fixed (not symptoms)
- TestSpirit output is the source of truth
- Project architecture is respected
