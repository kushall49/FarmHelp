# VS Code Configuration Files

This directory contains VS Code-specific configuration files, including TestSpirit automated debugging integration.

## Files Overview

### `tasks.json`
Defines VS Code tasks for the project.

**Tasks:**
- **Run TestSpirit** - Interactive TestSpirit analysis with full output
- **Run TestSpirit (Background)** - Silent execution for automation

**Usage:**
- `Ctrl+Shift+P` → `Tasks: Run Task` → `Run TestSpirit`

---

### `copilot-instructions.json`
Configures GitHub Copilot to recognize TestSpirit commands and triggers.

**Features:**
- Natural language command recognition
- Automatic workflow execution
- Integration with `.cursor/rules/testspirit.md`

**Recognized phrases:**
- "run testspirit"
- "execute testspirit"
- "fix all errors"
- "fix testspirit issues"

---

### `testspirit-copilot.json`
Registers a custom chat participant for TestSpirit in GitHub Copilot.

**Usage:**
```
@testspirit /run_testspirit_fix
```

**Features:**
- Sticky participant (remains active)
- Dedicated command: `/run_testspirit_fix`
- Seamless Copilot Chat integration

---

### `testspirit-copilot.README.md`
Documentation for the TestSpirit chat participant.

Contains:
- How the chat participant works
- Available commands
- Configuration details
- Rules integration

---

## TestSpirit Integration

All files in this directory work together to provide a fully automated debugging pipeline:

1. **User triggers** via Copilot Chat: "Run TestSpirit and fix all errors"
2. **copilot-instructions.json** recognizes the command
3. **tasks.json** defines the TestSpirit execution task
4. **testspirit-copilot.json** registers the chat participant
5. **Copilot follows rules** from `.cursor/rules/testspirit.md`
6. **Fixes are applied** automatically using real project code

---

## Additional Configuration

### Adding Custom Tasks

Edit `tasks.json` to add new tasks:

```json
{
  "label": "My Custom Task",
  "type": "shell",
  "command": "npm run my-script",
  "group": "build"
}
```

### Customizing Copilot Triggers

Edit `copilot-instructions.json` to add new trigger patterns:

```json
{
  "pattern": "my custom trigger",
  "instruction": "What Copilot should do"
}
```

---

## Related Files

- `../testspirit-run.sh` - Main TestSpirit execution script
- `../testspirit-fix-auto.sh` - Automation helper script
- `../.cursor/rules/testspirit.md` - Complete fix rules and guidelines
- `../TESTSPIRIT_SETUP_COMPLETE.md` - Full documentation

---

## Quick Reference

**Run TestSpirit manually:**
```bash
sh testspirit-run.sh
```

**Run via VS Code task:**
- `Ctrl+Shift+P` → `Tasks: Run Task` → `Run TestSpirit`

**Run via Copilot:**
```
Run TestSpirit and fix all errors
```

---

**Last Updated:** November 22, 2025
