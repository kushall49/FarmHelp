# TestSpirit Automated Debugging Rules

## Overview
These rules govern how GitHub Copilot processes TestSpirit analysis results and applies fixes to the codebase.

---

## Core Principles

### 1. Source of Truth
- **TestSpirit output (`.testspirit_output.json`) is the ONLY source of truth** for errors, warnings, and code issues.
- Do NOT rely on assumptions, guesses, or general knowledge.
- Read the entire TestSpirit output file before making ANY changes.

### 2. Real Code Only
- **NEVER hard-code values, fake responses, or invent placeholder code**.
- Use ONLY real functions, classes, and modules that exist in the project.
- Verify file paths and imports before referencing them.
- Do NOT create temporary mock implementations.

### 3. Root Cause Fixes
- Fix the **underlying cause** of errors, not just symptoms.
- If TestSpirit reports a missing import, find where it should be imported from.
- If TestSpirit reports a type error, fix the type definition, not just add a cast.
- Trace dependencies to their actual source files.

### 4. Project Context
- Always analyze the **existing project architecture** before making changes.
- Respect naming conventions, file structure, and coding patterns.
- Check if similar problems have been solved elsewhere in the codebase.
- Maintain consistency with the rest of the project.

---

## TestSpirit Output Processing

### Step 1: Load and Parse
```
1. Read `.testspirit_output.json` from the project root
2. Parse the JSON structure
3. Identify all reported issues (errors, warnings, suggestions)
4. Group issues by:
   - Severity (critical, high, medium, low)
   - Category (syntax, type, import, logic, security, performance)
   - File location
```

### Step 2: Prioritize
```
Priority Order:
1. Critical errors that prevent compilation/execution
2. High-severity errors (security vulnerabilities, data loss risks)
3. Medium-severity errors (logic errors, type mismatches)
4. Low-severity warnings (code style, optimization opportunities)
```

### Step 3: Analyze Context
For each issue:
```
1. Read the affected file completely
2. Understand the function/class/module context
3. Check dependencies and imports
4. Identify the root cause (not just the symptom)
5. Search for similar patterns in the codebase
6. Verify the fix won't break other code
```

---

## Fix Application Rules

### DO:
✅ Read the full file before editing  
✅ Understand the function's purpose and dependencies  
✅ Use existing utilities and helper functions  
✅ Follow the project's error handling patterns  
✅ Add comments explaining complex fixes  
✅ Test fixes mentally by tracing execution flow  
✅ Preserve existing functionality  
✅ Use semantic search to find related code  

### DON'T:
❌ Hard-code values or create fake implementations  
❌ Add TODO comments without implementing  
❌ Create placeholder functions that don't work  
❌ Skip reading the file to "save time"  
❌ Assume how code works without checking  
❌ Invent new APIs or modules  
❌ Break existing working code  
❌ Add dependencies without verifying they exist  

---

## Fix Patterns by Issue Type

### Import Errors
```javascript
// WRONG: Inventing a path
import { SomeUtil } from './invented/path';

// RIGHT: Search codebase first
// 1. Use semantic_search to find where SomeUtil is defined
// 2. Verify the path exists using file_search
// 3. Use the REAL path from the project
import { SomeUtil } from '../utils/realPath';
```

### Type Errors
```typescript
// WRONG: Using 'any' to suppress
function process(data: any) { ... }

// RIGHT: Find the real type definition
// 1. Search for the type in the codebase
// 2. Import from the actual location
// 3. Use the precise type
import { DataType } from '../types/real';
function process(data: DataType) { ... }
```

### Missing Dependencies
```javascript
// WRONG: Creating fake implementations
const fakeLogger = { log: () => {} };

// RIGHT: Use the real logger
// 1. Find existing logger in the project
// 2. Import it properly
// 3. Use the real implementation
import logger from '../utils/logger';
logger.log('message');
```

### Logic Errors
```javascript
// WRONG: Quick patch that hides the issue
if (value) return fallback;

// RIGHT: Fix the root cause
// 1. Understand why value is null/undefined
// 2. Fix the source of the bad data
// 3. Add proper validation upstream
// 4. Handle the error case properly
if (!value) {
  throw new Error('Value is required');
}
```

---

## Automated Fix Workflow

When you receive the command: **"Run TestSpirit and fix all errors"**

Execute this sequence:

### Phase 1: Analysis (5-10 minutes)
```
1. Run the "Run TestSpirit" VS Code task
2. Wait for .testspirit_output.json to be created
3. Read the entire output file
4. Create a prioritized list of issues
5. Estimate complexity of each fix
```

### Phase 2: Planning (2-5 minutes)
```
1. Group related issues together
2. Identify dependencies between fixes
3. Determine the order of fixes (bottom-up)
4. Note any issues that need user clarification
```

### Phase 3: Implementation (10-30 minutes per issue)
```
For each issue in priority order:

1. Read affected file(s) completely
2. Use semantic_search to find related code
3. Understand the root cause
4. Design the fix (real code only)
5. Verify the fix won't break other code
6. Apply the fix using multi_replace_string_in_file when possible
7. Add comments explaining the change
8. Move to next issue
```

### Phase 4: Verification (5 minutes)
```
1. Re-run "Run TestSpirit" task
2. Compare new output with old output
3. Verify all critical/high issues are resolved
4. Report any remaining issues to user
5. Explain all changes made
```

---

## Communication Guidelines

### After Each Fix:
```markdown
✅ Fixed: [Brief description]
📁 File: path/to/file.ts
🔧 Change: [What was changed]
💡 Reason: [Why this fixes the root cause]
```

### Summary Format:
```markdown
## TestSpirit Fix Summary

### Issues Resolved: X/Y
- ✅ Critical: X fixed
- ✅ High: X fixed
- ✅ Medium: X fixed
- ⚠️ Low: X remaining

### Changes Made:
1. [File path] - [Description]
2. [File path] - [Description]

### Verification:
- Re-ran TestSpirit: [Pass/Fail]
- New issue count: X (was Y)
- All critical issues: ✅ Resolved

### Remaining Work:
- [Any issues that need user input]
```

---

## Security and Safety Rules

### Always:
- ✅ Preserve existing security measures (authentication, validation, sanitization)
- ✅ Use parameterized queries (never string concatenation for SQL)
- ✅ Validate all user inputs
- ✅ Handle errors gracefully
- ✅ Log security-relevant events

### Never:
- ❌ Remove error handling to "simplify"
- ❌ Disable security checks to make code work
- ❌ Hard-code credentials or API keys
- ❌ Expose sensitive data in logs or errors
- ❌ Trust user input without validation

---

## Error Handling

If you encounter an issue that blocks automated fixing:

### 1. Ambiguous Fix
```markdown
⚠️ **Issue Requires Clarification**

TestSpirit Report:
- File: path/to/file.ts
- Issue: [Description]

Question:
[What information do you need from the user?]

Options:
A) [Option 1]
B) [Option 2]

Please advise which approach to take.
```

### 2. Missing Information
```markdown
⚠️ **Incomplete Context**

I need to understand:
- [What information is missing]
- [Where it should come from]

Please provide:
- [Specific information needed]
```

### 3. Breaking Change Required
```markdown
⚠️ **Breaking Change Detected**

Fix requires:
- [What needs to change]
- [Impact on other code]

This will affect:
- [List affected files/modules]

Confirm before proceeding: Yes/No?
```

---

## Integration with Copilot Chat

### Custom Command: `/run_testspirit_fix`

**Trigger**: User types `/run_testspirit_fix` in Copilot Chat

**Behavior**:
1. Execute VS Code task "Run TestSpirit"
2. Wait for task completion (poll for .testspirit_output.json)
3. Load and parse .testspirit_output.json
4. Follow the Automated Fix Workflow above
5. Apply fixes automatically
6. Report progress after each fix
7. Provide final summary

**Example Usage**:
```
User: /run_testspirit_fix

Copilot: 
🔄 Running TestSpirit analysis...
✅ Analysis complete. Found 12 issues.

📋 Priority List:
- 3 Critical errors
- 5 High-priority errors  
- 4 Medium warnings

🔧 Fixing critical errors first...

[Applies fixes automatically]

✅ All critical and high-priority issues resolved!
📊 Summary: [detailed summary]
```

---

## Project-Specific Context

### FarmHelp Project Structure:
```
backend/
  src/
    routes/       → Express.js route handlers
    services/     → Business logic and external APIs
    models/       → MongoDB schemas
    controllers/  → Request/response handling
    middleware/   → Authentication, validation
    utils/        → Helper functions
    
frontend/
  src/
    screens/      → React Native screens
    components/   → Reusable UI components
    services/     → API clients
    navigation/   → Navigation configuration
    
model-service/
  core/           → ML model core logic
  services/       → Recommendation engines
  models/         → Trained model files
```

### Key Files to Never Break:
- `backend/src/routes/chatbot.js` - Working chatbot route
- `backend/src/services/ai.js` - Production AI service
- `backend/src/server-production.js` - Main server file
- `frontend/src/services/api.ts` - API client

### Common Patterns in This Project:
- Express routes use async/await
- Error responses: `res.status(code).json({ error: message })`
- Success responses: `res.json({ data, success: true })`
- MongoDB models use Mongoose
- Frontend uses Axios for API calls

---

## Final Checklist

Before completing any TestSpirit fix session:

- [ ] All critical errors resolved
- [ ] All high-priority errors resolved
- [ ] No new errors introduced
- [ ] No hard-coded or fake code added
- [ ] All imports are real and verified
- [ ] All file paths exist
- [ ] Code follows project conventions
- [ ] Error handling preserved
- [ ] Security measures intact
- [ ] TestSpirit re-run shows improvement
- [ ] Summary provided to user

---

## Remember:

> **"Fix the root cause, not the symptom."**  
> **"Use real code, never fake implementations."**  
> **"TestSpirit output is the source of truth."**

When in doubt, ask the user for clarification rather than making assumptions.
