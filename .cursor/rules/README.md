# Cursor Rules Directory

This directory contains rule files that govern GitHub Copilot's behavior when processing code and applying fixes.

## Files Overview

### `testspirit.md`
**Size:** 10,808 bytes  
**Purpose:** Comprehensive guidelines for TestSpirit automated debugging

**Contains:**
- ✅ Core Principles (real code only, root cause fixes)
- ✅ TestSpirit output processing workflow
- ✅ Fix application rules (DO's and DON'Ts)
- ✅ Fix patterns by issue type
- ✅ Automated fix workflow
- ✅ Communication guidelines
- ✅ Security and safety rules
- ✅ Error handling procedures
- ✅ Integration with Copilot Chat
- ✅ Project-specific context (FarmHelp)

**Key Rules:**
1. **Source of Truth:** TestSpirit output (`.testspirit_output.json`) is the ONLY source of truth
2. **Real Code Only:** NEVER hard-code values, fake responses, or invent placeholder code
3. **Root Cause Fixes:** Fix the underlying cause of errors, not just symptoms
4. **Project Context:** Always analyze existing project architecture before making changes

---

### `snyk_rules.mdc`
**Purpose:** Snyk Security Extension AI rules (auto-generated)

Contains security scanning and vulnerability detection rules for the Snyk extension.

---

## How Rules Work

### Copilot Integration

When you use commands like:
```
Run TestSpirit and fix all errors
```

GitHub Copilot:
1. Reads all rule files in this directory
2. Applies the guidelines from `testspirit.md`
3. Uses TestSpirit output as the source of truth
4. Applies fixes following the defined workflow
5. Reports changes according to communication guidelines

---

## TestSpirit Rules Highlights

### Core Principles

**1. Source of Truth**
- TestSpirit output is the ONLY source of truth
- Do NOT rely on assumptions or guesses
- Read the entire output file before making changes

**2. Real Code Only**
- Use ONLY real functions, classes, and modules
- Verify file paths and imports exist
- Do NOT create temporary mock implementations

**3. Root Cause Fixes**
- Fix underlying causes, not symptoms
- Trace dependencies to actual source files
- Ensure long-term stability

**4. Project Context**
- Analyze existing architecture first
- Respect naming conventions and patterns
- Maintain consistency with the codebase

---

### Fix Workflow

**Phase 1: Analysis**
1. Run TestSpirit
2. Read output file
3. Create prioritized list
4. Estimate complexity

**Phase 2: Planning**
1. Group related issues
2. Identify dependencies
3. Determine fix order
4. Note clarification needs

**Phase 3: Implementation**
1. Read affected files
2. Use semantic_search for context
3. Understand root cause
4. Design fix (real code only)
5. Apply fix
6. Add explanatory comments

**Phase 4: Verification**
1. Re-run TestSpirit
2. Compare results
3. Verify resolution
4. Report changes

---

### Fix Patterns

**Import Errors:**
```javascript
// WRONG: Inventing a path
import { SomeUtil } from './invented/path';

// RIGHT: Search codebase first
import { SomeUtil } from '../utils/realPath';
```

**Type Errors:**
```typescript
// WRONG: Using 'any' to suppress
function process(data: any) { ... }

// RIGHT: Find the real type
import { DataType } from '../types/real';
function process(data: DataType) { ... }
```

**Logic Errors:**
```javascript
// WRONG: Quick patch
if (value) return fallback;

// RIGHT: Fix root cause
if (!value) {
  throw new Error('Value is required');
}
```

---

## Project-Specific Context

### FarmHelp Structure

```
backend/
  src/
    routes/       → Express.js route handlers
    services/     → Business logic and APIs
    models/       → MongoDB schemas
    controllers/  → Request/response handling

frontend/
  src/
    screens/      → React Native screens
    components/   → Reusable UI components
    services/     → API clients

model-service/
  core/           → ML model core logic
  services/       → Recommendation engines
```

### Key Files (Never Break)
- `backend/src/routes/chatbot.js` - Working chatbot route
- `backend/src/services/ai.js` - Production AI service
- `backend/src/server-production.js` - Main server
- `frontend/src/services/api.ts` - API client

---

## Adding Custom Rules

### For General Coding

Create a new `.md` file in this directory:

```markdown
# My Custom Rules

## Purpose
[What these rules govern]

## Guidelines
- Rule 1: [Description]
- Rule 2: [Description]

## Examples
[Code examples showing correct patterns]
```

### For Specific Features

Add sections to `testspirit.md` under "Project-Specific Context":

```markdown
### Feature Name Rules

- Specific guideline 1
- Specific guideline 2
```

---

## Best Practices

### DO:
✅ Keep rules clear and specific  
✅ Provide code examples  
✅ Explain the reasoning  
✅ Update rules as project evolves  
✅ Use markdown formatting  

### DON'T:
❌ Make rules too generic  
❌ Create contradictory rules  
❌ Forget to document changes  
❌ Use unclear terminology  

---

## Related Files

- `../.vscode/copilot-instructions.json` - Copilot triggers
- `../.vscode/testspirit-copilot.json` - Chat participant config
- `../testspirit-run.sh` - TestSpirit execution script
- `../TESTSPIRIT_SETUP_COMPLETE.md` - Complete documentation

---

## Usage

Rules in this directory are automatically loaded by GitHub Copilot when:
- Processing natural language commands
- Applying code fixes
- Generating new code
- Refactoring existing code

**No manual activation required** - Copilot reads these files automatically.

---

## Verification

To verify Copilot is using these rules:

1. Ask Copilot: "What rules are you following for TestSpirit?"
2. Check responses mention `.cursor/rules/testspirit.md`
3. Verify fixes follow the guidelines (real code only, root causes, etc.)

---

**Last Updated:** November 22, 2025  
**Version:** 1.0.0
