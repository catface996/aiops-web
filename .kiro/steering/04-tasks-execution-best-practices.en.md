---
inclusion: always
---

# Task Execution Phase Best Practices

## Phase Goal

Execute tasks sequentially according to task list, transform design into runnable code, ensure project remains in healthy state after each task completion.

## Why This Phase is Critical

Task execution is where design becomes reality. Following these practices ensures:
- ✅ Project always in buildable, deployable state
- ✅ Problems discovered and fixed immediately (not accumulated)
- ✅ Code quality maintained consistently
- ✅ Team can collaborate without integration conflicts
- ✅ Deployment risks minimized through continuous verification

## The Three Iron Rules (NON-NEGOTIABLE)

**RULE 1: Build Success is Mandatory**
- After EVERY task completion, project MUST build successfully
- No exceptions, no "I'll fix it later"
- Fix build errors immediately before proceeding

**RULE 2: Complete Workflow is Required**
- MUST follow: Implement → Test → Verify → Report → Commit → Push
- Skipping ANY step is prohibited
- Each step has specific gates that must pass

**RULE 3: Git Push Requires --no-verify**
- ALWAYS use `git push origin [branch] --no-verify`
- This bypasses pre-push hooks for automated workflows
- Non-negotiable for CI/CD compatibility

## Task Execution Workflow (MANDATORY SEQUENCE)

**CRITICAL**: Execute steps in EXACT order shown. No skipping, no reordering.

---

### Step 1: Understand Task Requirements

**GATE**: Must have clear understanding before writing any code.

**Required Activities**:
1. Read task description from `tasks.md` completely
2. Identify all acceptance criteria (AC) for this task
3. Locate related requirement in `requirements.md` (check `_Requirements:_` marker)
4. Review relevant design sections in `design.md`
5. Confirm all preconditions are met (previous tasks completed)

**Self-Check Questions**:
- [ ] What is the specific deliverable for this task?
- [ ] What are ALL acceptance criteria that must be satisfied?
- [ ] Which files will I need to create or modify?
- [ ] Are there any technical unknowns I need to research first?

**Output**: Clear mental model of what to implement and how to verify it

---

### Step 2: Implement Functionality

**GATE**: Implementation must follow project structure and coding standards.

#### Implementation Strategy: Progressive Development

**CRITICAL PRINCIPLE**: Never declare/import components that don't exist yet.

**Why This Matters**:
- ✅ Project remains buildable at every step
- ✅ Integration problems caught immediately
- ✅ No "I'll create that file later" technical debt

**How to Apply**:
```
❌ WRONG Order:
1. Add import for UserForm component
2. Use UserForm in parent component
3. (Later) Create UserForm.tsx

✅ CORRECT Order:
1. Create UserForm.tsx with basic structure
2. Export UserForm component
3. Import and use in parent component
4. Verify build succeeds
```

**Progressive Development Checklist**:
- [ ] Create files before importing them
- [ ] Export components before using them
- [ ] Update configuration files synchronously with file creation
- [ ] Run build after each significant change

#### Code Quality Standards (NON-NEGOTIABLE)

**Coding Standards**:
- ✅ Follow project's established code style (check existing files)
- ✅ Use meaningful names: `handleUserLogin` not `func1`
- ✅ Add JSDoc comments for complex functions
- ✅ Keep functions focused (single responsibility)

**Error Handling**:
- ✅ Use try-catch for async operations
- ✅ Provide user-friendly error messages
- ✅ Log errors for debugging (but never log sensitive data)
- ✅ Handle edge cases explicitly

**Examples**:
```typescript
// ❌ WRONG: Vague naming, no error handling
const f = async (d) => {
  const r = await api.get(d);
  return r;
}

// ✅ CORRECT: Clear naming, proper error handling
const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch user profile', { userId, error });
    throw new Error('Unable to load user profile. Please try again.');
  }
}
```

**Output**: Implemented code files that follow project standards

---

### Step 3: Write and Run Tests (NON-NEGOTIABLE)

**ABSOLUTE REQUIREMENT**: Tests MUST be written and ALL must pass before proceeding.

**GATE**: 100% test pass rate required. No exceptions.

#### Test Writing Requirements

**What to Test** (based on task type):
- ✅ **Unit Tests**: Core business logic, utility functions, data transformations
- ✅ **Property Tests**: Algorithms, validators, parsers (minimum 100 iterations)
- ✅ **Integration Tests**: Component interactions, API calls, state management
- ✅ **Component Tests**: UI rendering, user interactions, conditional display

**Test Quality Standards**:
```typescript
// ❌ WRONG: Vague test, no clear assertion
test('login works', () => {
  login();
  expect(true).toBe(true);
});

// ✅ CORRECT: Specific scenario, clear assertion
test('login with valid credentials sets auth token', async () => {
  const result = await login('user@example.com', 'password123');
  expect(result.token).toBeDefined();
  expect(localStorage.getItem('authToken')).toBe(result.token);
});
```

#### Test Execution Sequence (MANDATORY ORDER)

**Run these commands in exact order**:
```bash
# 1. Run all tests (MUST pass 100%)
npm test

# 2. Check type safety (MUST have zero errors)
npm run type-check

# 3. Check code quality (MUST have zero errors)
npm run lint

# 4. Check coverage (if project requires specific threshold)
npm run test:coverage
```

#### Test Success Criteria (ALL REQUIRED)

**GATE**: All criteria below must be met:
- ✅ All tests pass (100% pass rate, 0 failures)
- ✅ No TypeScript compilation errors
- ✅ No ESLint errors (warnings acceptable if documented)
- ✅ Coverage meets project threshold (if defined)

**Expected Output Format**:
```
✅ Unit Tests: 15/15 passed
✅ Property Tests: 3/3 passed (100 iterations each)
✅ Integration Tests: 5/5 passed
✅ Type Check: PASS (0 errors)
✅ Lint: PASS (0 errors, 2 warnings)
✅ Coverage: 87% (threshold: 80%)
```

#### Handling Test Failures (MANDATORY PROCESS)

**If ANY test fails, follow this process**:

1. **Read error messages carefully** - they usually point to exact issue
2. **Identify failure type**:
   - Logic error → Fix implementation
   - Test error → Fix test expectations
   - Setup error → Fix test configuration
3. **Fix the issue** (implementation or test)
4. **Re-run ALL tests** (not just the failing one)
5. **Repeat until 100% pass** (maximum 5 iterations)
6. **If still failing after 5 iterations**:
   - Document all remaining failures with error messages
   - Stop and consult user: "Tests failing after 5 fix attempts: [list failures]. Need guidance."

**ABSOLUTELY PROHIBITED**:
- ❌ Commenting out failing tests
- ❌ Skipping tests to "make progress"
- ❌ Proceeding with any test failures
- ❌ Lowering test standards to pass
- ❌ "I'll fix tests later"

**Output**: All tests passing with documented results (copy test output)

---

### Step 4: Verify Task Against Acceptance Criteria

**GATE**: All acceptance criteria must be verified and pass.

#### Verification Priority Hierarchy (STRICTLY FOLLOW)

**RULE**: Choose verification method by priority. Use highest applicable method.

```
Priority 1: Runtime Verification (if feature can be run)
    ↓ (if not applicable)
Priority 2: Build Verification (if structural change)
    ↓ (if not applicable)
Priority 3: Static File Check (last resort only)
```

---

#### Priority 1: Runtime Verification (PREFERRED)

**WHEN TO USE**: Feature can be tested by running the application.

**Applicable Scenarios**:
- ✅ UI components (forms, buttons, layouts, navigation)
- ✅ User interactions (clicks, form submissions, drag-drop)
- ✅ API endpoints (requests, responses, error handling)
- ✅ Authentication flows (login, logout, session management)
- ✅ Data display (lists, tables, charts, filters)
- ✅ Configuration behavior (environment variables, feature flags)
- ✅ Error handling (validation messages, error boundaries)

**Verification Process**:
```bash
# 1. Start development server
npm run dev

# 2. Open browser to http://localhost:5173

# 3. Navigate to relevant feature

# 4. Test each acceptance criterion manually:
#    - Perform user actions
#    - Verify expected behavior
#    - Check console for errors
#    - Test edge cases

# 5. Document results with screenshots if UI changed
```

**Runtime Verification Checklist**:
- [ ] Application starts without errors
- [ ] Can navigate to relevant page/component
- [ ] All acceptance criteria behaviors work correctly
- [ ] No console errors or warnings
- [ ] Error cases handled gracefully
- [ ] Performance acceptable (no lag, fast response)

**Documentation Format**:
```
Runtime Verification Results:
✅ AC1: User can submit login form - VERIFIED (form submits, shows loading state)
✅ AC2: Invalid credentials show error - VERIFIED (error message displays correctly)
✅ AC3: Successful login redirects to dashboard - VERIFIED (redirects to /dashboard)
❌ Console errors: None
❌ Warnings: None
```

---

#### Priority 2: Build Verification (SECONDARY)

**WHEN TO USE**: Structural changes that can't be runtime tested.

**Applicable Scenarios**:
- ✅ New file/directory structure
- ✅ Module exports/imports
- ✅ TypeScript type definitions
- ✅ Build configuration changes
- ✅ Dependency additions

**Verification Process**:
```bash
# 1. Clean previous build artifacts
rm -rf dist/

# 2. Run production build
npm run build

# 3. Verify build output
ls -la dist/

# 4. Check build log for warnings
```

**Build Success Criteria (ALL REQUIRED)**:
- ✅ Build completes without errors (exit code 0)
- ✅ No TypeScript compilation errors
- ✅ No module resolution errors
- ✅ All expected output files present in dist/
- ✅ File sizes reasonable (no unexpectedly large bundles)
- ✅ Build warnings addressed or documented

**If Build Fails**:
1. **Read error message completely** - it points to exact issue
2. **Common issues**:
   - Import path wrong → Check relative vs absolute paths
   - Module not found → Verify file exists and is exported
   - Type error → Check TypeScript types match
   - Dependency missing → Run `npm install`
3. **Fix issue and rebuild**
4. **NEVER proceed with failed build**

**Documentation Format**:
```
Build Verification Results:
✅ Build Status: SUCCESS (exit code 0)
✅ TypeScript: 0 errors
✅ Output Files: index.html, assets/index-[hash].js, assets/index-[hash].css
✅ Bundle Size: 245 KB (within acceptable range)
❌ Build Warnings: None
```

---

#### Priority 3: Static File Check (LAST RESORT)

**WHEN TO USE**: Only when runtime and build verification don't apply.

**Applicable Scenarios**:
- ✅ File existence verification
- ✅ Configuration file content
- ✅ Directory structure validation

**Verification Process**:
```bash
# Check file exists
ls -la src/components/UserForm/index.tsx

# Check file content
cat .env.development | grep VITE_API_BASE_URL

# Check directory structure
tree src/components/UserForm/
```

**Documentation Format**:
```
Static Check Results:
✅ File exists: src/components/UserForm/index.tsx
✅ File exports: UserForm component
✅ Configuration: VITE_API_BASE_URL set in .env.development
```

---

#### Acceptance Criteria Verification (MANDATORY)

**For EACH acceptance criterion in the task**:
1. Identify the AC from `tasks.md`
2. Choose appropriate verification method (runtime > build > static)
3. Execute verification
4. Document result (PASS/FAIL with evidence)

**Example**:
```
Task T005 Acceptance Criteria:
- AC1: Login form displays email and password fields
  → Verification: Runtime (opened /login, confirmed fields present) ✅ PASS
  
- AC2: Form validates email format
  → Verification: Runtime (entered invalid email, saw error message) ✅ PASS
  
- AC3: Successful login stores JWT token
  → Verification: Runtime (logged in, checked localStorage) ✅ PASS
```

**Output**: All acceptance criteria verified with documented results

### Step 5: Requirements and Design Consistency Check

**GATE**: Implementation must align with requirements and design. Major deviations block progress.

**CRITICAL**: Passing acceptance criteria ≠ meeting requirements. This step catches architectural drift.

#### Why This Check is Non-Negotiable

**Common Problems This Prevents**:
- ❌ Task passes AC but violates architecture principles
- ❌ Implementation adds features not in requirements (scope creep)
- ❌ Technical approach contradicts design decisions
- ❌ Accumulated deviations create technical debt

**Benefits**:
- ✅ Ensures implementation matches original intent
- ✅ Catches architectural violations early
- ✅ Maintains consistency across all tasks
- ✅ Prevents technical debt accumulation

---

#### Check 1: Requirements Consistency (MANDATORY)

**Process**:
1. **Find related requirement**: Check `_Requirements:_` marker in task
2. **Open requirements.md**: Locate the requirement section
3. **Compare implementation**: Does it satisfy ALL requirement acceptance criteria?
4. **Check scope**: Is implementation within requirement boundaries?

**Requirements Consistency Checklist**:
- [ ] Found task's related requirement ID (e.g., FR-003)
- [ ] Opened requirements.md and located requirement section
- [ ] Verified implementation covers ALL requirement acceptance criteria
- [ ] Confirmed no features added beyond requirement scope
- [ ] Checked requirement intent is correctly understood

**Example Check**:
```
Task: T005 - Implement login form
Related Requirement: FR-001 (User Authentication)

Requirement AC from requirements.md:
- AC1: Users can log in with email and password ✅ Implemented
- AC2: Invalid credentials show error message ✅ Implemented
- AC3: Successful login redirects to dashboard ✅ Implemented

Scope Check:
- ❌ Did NOT add "remember me" feature (not in FR-001)
- ❌ Did NOT add social login (not in FR-001)
- ✅ Implementation within requirement boundaries

Result: ✅ CONSISTENT with requirements
```

---

#### Check 2: Design Consistency (MANDATORY)

**Process**:
1. **Open design.md**: Find sections related to this task
2. **Check architecture**: Does implementation follow architectural patterns?
3. **Check technical decisions**: Are technology choices consistent?
4. **Check interfaces**: Do APIs/components match design specifications?

**Design Consistency Checklist**:
- [ ] Implementation follows architecture pattern (e.g., Context + Hooks)
- [ ] Module boundaries match design (correct file locations)
- [ ] Component interfaces match design specifications
- [ ] Data models consistent with design
- [ ] Technology choices align with design (no unauthorized libraries)
- [ ] Non-functional requirements followed (performance, security)

**Example Check**:
```
Task: T005 - Implement login form
Related Design Sections: Authentication Architecture, State Management

Design Specifications:
- Architecture: Use AuthContext for state management ✅ Used AuthContext
- API: POST /api/v1/auth/login ✅ Correct endpoint
- State: Store JWT in localStorage ✅ Implemented correctly
- Error Handling: Use unified error boundary ✅ Errors caught properly

Technology Check:
- ✅ Used Ant Design components (per design)
- ✅ Used Axios for HTTP (per design)
- ❌ Did NOT add Redux (not in design)

Result: ✅ CONSISTENT with design
```

---

#### Deviation Classification and Handling

**MINOR DEVIATION** (doesn't affect core functionality or architecture):
- **Examples**: Variable naming differences, minor UI adjustments, code organization
- **Action**:
  1. Document deviation and reason
  2. Assess if adjustment needed
  3. If yes, create follow-up task
  4. **Proceed with current task**

**MAJOR DEVIATION** (affects core functionality or architecture):
- **Examples**: Different architecture pattern, unauthorized technology, missing core features
- **Action**:
  1. **STOP immediately** - do not proceed to next step
  2. Document deviation clearly with examples
  3. Consult user: "Implementation deviates from [requirement/design]: [specific deviation]. Options: A) Fix implementation, B) Update requirement/design, C) Discuss alternatives"
  4. **Wait for user decision**
  5. Re-verify after correction

**REASONABLE IMPROVEMENT** (deviation with good justification):
- **Examples**: Better error handling, improved UX, performance optimization
- **Action**:
  1. Document improvement and benefits
  2. Confirm with user: "I improved [aspect] by [change] because [reason]. This deviates from design but provides [benefits]. Proceed?"
  3. Update design.md if approved
  4. Assess impact on subsequent tasks

---

#### Consistency Check Output Format

**REQUIRED**: Document check results in this format:

```markdown
## Requirements & Design Consistency Check

### Requirements Consistency
- **Related Requirement**: FR-001 (User Authentication)
- **Status**: ✅ CONSISTENT / ⚠️ MINOR DEVIATION / ❌ MAJOR DEVIATION
- **Verification**:
  - AC1: Users can log in with email/password ✅
  - AC2: Invalid credentials show error ✅
  - AC3: Successful login redirects to dashboard ✅
- **Scope Check**: No features added beyond requirement ✅
- **Notes**: Implementation fully aligns with FR-001

### Design Consistency
- **Architecture Compliance**: ✅ YES (uses AuthContext as designed)
- **Technology Compliance**: ✅ YES (Ant Design + Axios)
- **Interface Compliance**: ✅ YES (POST /api/v1/auth/login)
- **Data Model Compliance**: ✅ YES (JWT in localStorage)
- **Notes**: No deviations from design specifications

### Overall Consistency Status
**RESULT**: ✅ CONSISTENT - Ready to proceed
```

**Output**: Consistency check results documented (copy format above)

---

### Step 6: Generate Verification Report

**ABSOLUTE REQUIREMENT**: MUST generate structured report before committing.

**GATE**: Report must show OVERALL: ✅ PASS status to proceed.

#### Report Template (USE EXACTLY THIS FORMAT)

```markdown
## Task Verification Report

**Task ID**: [Task ID from tasks.md, e.g., T005]
**Task Description**: [One-line description from tasks.md]
**Verification Date**: [Current date in YYYY-MM-DD format]
**Verification Time**: [Approximate time spent on task]

---

### Implementation Summary

**Files Created**:
- [List new files with paths, e.g., src/pages/Login/index.tsx]

**Files Modified**:
- [List modified files with paths, e.g., src/router/index.tsx]

**Key Changes**:
- [Bullet point summary of main changes]
- [Focus on what was implemented, not how]

---

### Test Results

**Test Execution**:
- ✅ Unit tests: [X/Y passed] (e.g., 12/12 passed)
- ✅ Property tests: [X/Y passed, N iterations] (e.g., 2/2 passed, 100 iterations each)
- ✅ Integration tests: [X/Y passed] (e.g., 3/3 passed)
- ✅ Component tests: [X/Y passed] (if applicable)

**Code Quality**:
- ✅ TypeScript: [PASS/FAIL] ([N errors])
- ✅ ESLint: [PASS/FAIL] ([N errors, M warnings])
- ✅ Build: [SUCCESS/FAIL]

**Coverage** (if checked):
- Coverage: [X%] (threshold: [Y%])

---

### Acceptance Criteria Verification

**Verification Method**: [Runtime / Build / Static]

[For each AC from tasks.md:]
- [x] **AC1**: [Description from tasks.md]
  - Verification: [How you verified it]
  - Result: ✅ PASS / ❌ FAIL
  - Evidence: [Screenshot, console output, or observation]

- [x] **AC2**: [Description]
  - Verification: [How you verified it]
  - Result: ✅ PASS / ❌ FAIL
  - Evidence: [Evidence]

[Repeat for all ACs]

---

### Requirements Consistency

**Related Requirement**: [Requirement ID from tasks.md, e.g., FR-001]
**Consistency Status**: ✅ CONSISTENT / ⚠️ MINOR DEVIATION / ❌ MAJOR DEVIATION

**Verification Details**:
- [List each requirement AC and whether implementation satisfies it]
- [Note any scope deviations]

**Notes**: [Any clarifications or deviations explained]

---

### Design Consistency

**Architecture Compliance**: ✅ YES / ❌ NO
**Technology Compliance**: ✅ YES / ❌ NO
**Interface Compliance**: ✅ YES / ❌ NO

**Verification Details**:
- Architecture: [Which pattern used, e.g., Context + Hooks]
- Technology: [Which libraries used, e.g., Ant Design, Axios]
- Interfaces: [API endpoints, component props]

**Notes**: [Any deviations or improvements explained]

---

### Verification Status

**OVERALL**: ✅ PASS / ❌ FAIL

[If FAIL, explain what needs to be fixed before proceeding]

---

### Next Steps

[One of the following:]
- Ready to proceed to [Next Task ID]
- Need to fix [specific issues] before proceeding
- Waiting for user confirmation on [specific decision]
```

---

#### Report Quality Standards

**REQUIRED Elements** (report incomplete without these):
- ✅ All test results with pass/fail counts
- ✅ Every acceptance criterion verified individually
- ✅ Requirements consistency check completed
- ✅ Design consistency check completed
- ✅ Overall PASS/FAIL status clearly stated

**PROHIBITED Elements**:
- ❌ Vague statements like "everything works"
- ❌ Missing AC verifications
- ❌ Skipped consistency checks
- ❌ No evidence for verifications
- ❌ PASS status with failing tests

---

#### Example: Complete Verification Report

```markdown
## Task Verification Report

**Task ID**: T005
**Task Description**: Implement user login form with validation
**Verification Date**: 2025-11-29
**Verification Time**: ~45 minutes

---

### Implementation Summary

**Files Created**:
- src/pages/Login/index.tsx
- src/pages/Login/LoginForm.tsx
- src/pages/Login/index.test.tsx

**Files Modified**:
- src/router/index.tsx (added /login route)
- src/contexts/AuthContext/index.tsx (added login method)

**Key Changes**:
- Created login page with email/password form
- Added form validation (email format, password length)
- Integrated with AuthContext for authentication
- Added error handling for invalid credentials

---

### Test Results

**Test Execution**:
- ✅ Unit tests: 8/8 passed
- ✅ Property tests: 1/1 passed (100 iterations - email validation)
- ✅ Integration tests: 2/2 passed

**Code Quality**:
- ✅ TypeScript: PASS (0 errors)
- ✅ ESLint: PASS (0 errors, 1 warning - console.log in dev code)
- ✅ Build: SUCCESS

---

### Acceptance Criteria Verification

**Verification Method**: Runtime (tested in browser at http://localhost:5173/login)

- [x] **AC1**: Login form displays email and password input fields
  - Verification: Opened /login page, confirmed both fields visible
  - Result: ✅ PASS
  - Evidence: Form renders with labeled email and password fields

- [x] **AC2**: Form validates email format before submission
  - Verification: Entered invalid email "test", saw error message
  - Result: ✅ PASS
  - Evidence: Error message "Please enter a valid email" displayed

- [x] **AC3**: Invalid credentials show error message
  - Verification: Submitted wrong password, saw error from API
  - Result: ✅ PASS
  - Evidence: Error message "Invalid credentials" displayed below form

- [x] **AC4**: Successful login redirects to dashboard
  - Verification: Logged in with valid credentials, redirected to /dashboard
  - Result: ✅ PASS
  - Evidence: URL changed to /dashboard, user menu shows logged-in state

---

### Requirements Consistency

**Related Requirement**: FR-001 (User Authentication)
**Consistency Status**: ✅ CONSISTENT

**Verification Details**:
- FR-001 AC1: Users can log in with email/password ✅ Implemented
- FR-001 AC2: Invalid credentials show error ✅ Implemented
- FR-001 AC3: Successful login grants access ✅ Implemented (redirects to dashboard)

**Scope Check**: No features added beyond FR-001 requirements

**Notes**: Implementation fully aligns with FR-001 specifications

---

### Design Consistency

**Architecture Compliance**: ✅ YES
**Technology Compliance**: ✅ YES
**Interface Compliance**: ✅ YES

**Verification Details**:
- Architecture: Uses AuthContext for state management (as designed)
- Technology: Ant Design Form components, Axios for API calls (as designed)
- Interfaces: POST /api/v1/auth/login endpoint (matches design spec)
- Data Model: Stores JWT in localStorage (as designed)

**Notes**: No deviations from design document

---

### Verification Status

**OVERALL**: ✅ PASS

All acceptance criteria verified, tests passing, consistent with requirements and design.

---

### Next Steps

Ready to proceed to T006 - Implement session timeout handling
```

---

**Output**: Verification report generated and presented in chat

---

### Step 7: Commit Changes to Local Repository

**GATE**: Verification report must show OVERALL: ✅ PASS status.

**ABSOLUTE REQUIREMENT**: Use structured commit message format with Task ID.

#### Commit Message Format (MANDATORY STRUCTURE)

**Template** (use exactly this format):
```
[TaskID] Brief description (max 50 chars)

- Implemented: [Key functionality in one line]
- Files: [Main files created/modified]
- Tests: [X/Y passed, test types]
- Verified: [Verification method and result]

Related: [Requirement ID]
```

**Format Rules**:
1. **First line**: `[TaskID] Description` (e.g., `[T005] Implement user login form`)
2. **Blank line**: Required separator
3. **Body**: Bullet points with specific details
4. **Related**: Link to requirement (helps traceability)

#### Commit Message Examples

**✅ CORRECT Examples**:

```bash
# Example 1: Feature implementation
git commit -m "[T005] Implement user login form

- Implemented: Login form with email/password validation
- Files: src/pages/Login/index.tsx, LoginForm.tsx, index.test.tsx
- Tests: 11/11 passed (8 unit, 1 property, 2 integration)
- Verified: Runtime tested, all AC passed

Related: FR-001"

# Example 2: Bug fix
git commit -m "[T012] Fix session timeout not triggering logout

- Implemented: Corrected timer logic in useSessionTimeout hook
- Files: src/hooks/useSessionTimeout.ts, useSessionTimeout.test.ts
- Tests: 5/5 passed (added 2 new edge case tests)
- Verified: Runtime tested, timeout works correctly

Related: FR-004"

# Example 3: Refactoring
git commit -m "[T018] Refactor AuthContext to use reducer pattern

- Implemented: Migrated from useState to useReducer for state management
- Files: src/contexts/AuthContext/index.tsx, reducer.ts, actions.ts
- Tests: 15/15 passed (all existing tests still pass)
- Verified: Build successful, runtime tested

Related: Design-Architecture"
```

**❌ WRONG Examples** (with explanations):

```bash
# ❌ Too vague, no task ID, no details
git commit -m "update code"
# Problem: No traceability, unclear what changed

# ❌ No task ID, missing test info
git commit -m "fix bug"
# Problem: Which bug? Which task? Were tests added?

# ❌ Has task ID but no details
git commit -m "[T005] login"
# Problem: What about login? No verification info

# ❌ Implementation details only, no verification
git commit -m "Added LoginForm component with Ant Design"
# Problem: No task ID, no test results, no verification status

# ❌ Multi-line but wrong format
git commit -m "[T005] Implement login
Added form
Added validation
Fixed styling"
# Problem: Not using bullet point format, no test/verification info
```

#### Commit Execution Process

**Step-by-step commands**:

```bash
# 1. Stage all changes
git add .

# 2. Verify what will be committed (optional but recommended)
git status

# 3. Commit with structured message
git commit -m "[TaskID] Description

- Implemented: [details]
- Files: [files]
- Tests: [results]
- Verified: [method and result]

Related: [requirement]"

# 4. Verify commit was created
git log -1 --oneline
```

#### Commit Quality Checklist

**Before committing, verify**:
- [ ] Verification report shows OVERALL: ✅ PASS
- [ ] All tests passing (no failures)
- [ ] Build successful
- [ ] Commit message includes Task ID in format `[T###]`
- [ ] Commit message includes test results
- [ ] Commit message includes verification status
- [ ] Commit message links to requirement ID

**ABSOLUTELY PROHIBITED**:
- ❌ Committing with failing tests
- ❌ Committing with failed build
- ❌ Committing without verification report
- ❌ Vague commit messages without task ID
- ❌ Commit messages missing test/verification info

**Output**: Changes committed to local repository with structured message

---

### Step 8: Push Changes to Remote Repository

**ABSOLUTE REQUIREMENT**: MUST use `--no-verify` flag. No exceptions.

**GATE**: Local commit must exist before pushing.

#### Push Command Format (USE EXACTLY)

**Standard Push Command**:
```bash
git push origin [branch-name] --no-verify
```

**Why `--no-verify` is NON-NEGOTIABLE**:
- ✅ Bypasses pre-push hooks that may block automated workflows
- ✅ Ensures consistent behavior in CI/CD pipelines
- ✅ Prevents interactive prompts that would block execution
- ✅ Required for automation compatibility

**CRITICAL**: The `--no-verify` flag MUST be at the end of the command.

#### Push Command Examples

**✅ CORRECT Examples**:
```bash
# Feature branch push
git push origin feature/user-login --no-verify

# Main branch push
git push origin main --no-verify

# Development branch push
git push origin develop --no-verify

# With upstream tracking (first push)
git push -u origin feature/user-login --no-verify
```

**❌ WRONG Examples**:
```bash
# ❌ Missing --no-verify flag (WILL CAUSE ISSUES)
git push origin feature/user-login

# ❌ Missing --no-verify flag (WILL CAUSE ISSUES)
git push

# ❌ Wrong flag position
git push --no-verify origin feature/user-login

# ❌ Using wrong flag
git push origin feature/user-login --force
```

#### Push Execution Process

**Step-by-step**:
```bash
# 1. Verify you're on correct branch
git branch --show-current

# 2. Verify commit exists
git log -1 --oneline

# 3. Push with --no-verify flag
git push origin [branch-name] --no-verify

# 4. Verify push succeeded (check output)
# Should see: "Branch '[branch-name]' set up to track remote branch..."
```

#### Handling Push Failures

**If push fails, follow this troubleshooting sequence**:

**Error 1: Network/Connection Issues**
```bash
# Symptom: "Failed to connect" or timeout errors
# Solution: Check network, retry
git push origin [branch-name] --no-verify
```

**Error 2: Branch Diverged (non-fast-forward)**
```bash
# Symptom: "Updates were rejected because the tip of your current branch is behind"
# Solution: Pull with rebase, then push
git pull origin [branch-name] --rebase
git push origin [branch-name] --no-verify
```

**Error 3: Permission Denied**
```bash
# Symptom: "Permission denied" or "403 Forbidden"
# Solution: Check repository access permissions
# Verify: Do you have write access to this repository?
# Contact: Repository administrator if access needed
```

**Error 4: Branch Protection Rules**
```bash
# Symptom: "Protected branch hook declined"
# Solution: This is expected for protected branches
# Action: Create pull request instead of direct push
# Note: --no-verify doesn't bypass server-side protection
```

**Error 5: Pre-push Hook Failed (despite --no-verify)**
```bash
# Symptom: Hook still runs and fails
# Cause: --no-verify flag missing or in wrong position
# Solution: Ensure exact command format:
git push origin [branch-name] --no-verify
```

#### Push Verification Checklist

**Before pushing, confirm**:
- [ ] Verification report shows PASS
- [ ] All tests passing
- [ ] Changes committed locally
- [ ] On correct branch
- [ ] Using `--no-verify` flag

**After pushing, verify**:
- [ ] Push command completed without errors
- [ ] Remote branch updated (check GitHub/GitLab)
- [ ] Commit visible in remote repository

#### Maximum Retry Policy

**If push fails**:
1. **First attempt**: Retry with same command
2. **Second attempt**: Pull with rebase, then retry push
3. **Third attempt**: Check permissions and network
4. **After 3 failures**: Stop and consult user with error details

**NEVER**:
- ❌ Use `--force` flag without explicit user approval
- ❌ Push without `--no-verify` flag
- ❌ Continue to next task if push failed
- ❌ Retry indefinitely (max 3 attempts)

#### Common Push Scenarios

**Scenario 1: First push of new branch**
```bash
# Create and push new branch
git checkout -b feature/new-feature
# ... make changes, commit ...
git push -u origin feature/new-feature --no-verify
```

**Scenario 2: Subsequent pushes to existing branch**
```bash
# Push to already-tracked branch
git push origin feature/existing-feature --no-verify
# Or simply (if upstream is set):
git push --no-verify
```

**Scenario 3: Push after rebasing**
```bash
# After pulling with rebase
git pull origin feature/my-feature --rebase
git push origin feature/my-feature --no-verify
```

**Output**: Changes successfully pushed to remote repository

---

**TASK COMPLETE**: After successful push, task is fully complete. Ready for next task.

---

### Workflow Summary: The 8-Step Process

**MANDATORY EXECUTION ORDER** (NON-NEGOTIABLE):

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Understand Task Requirements                       │
│ GATE: Clear understanding required                          │
│ Output: Mental model of what to implement                   │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Implement Functionality                             │
│ GATE: Follow progressive development + code standards       │
│ Output: Code files created/modified                         │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Write and Run Tests (NON-NEGOTIABLE)               │
│ ⚠️  GATE: 100% test pass rate REQUIRED                     │
│ Output: All tests passing with documented results           │
│ STOP HERE if tests fail - fix before proceeding             │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Verify Task Against Acceptance Criteria            │
│ GATE: All AC must pass verification                         │
│ Priority: Runtime > Build > Static                          │
│ Output: Each AC verified with evidence                      │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Requirements & Design Consistency Check             │
│ ⚠️  GATE: Major deviations BLOCK progress                  │
│ Output: Consistency check results (CONSISTENT/DEVIATION)    │
│ STOP HERE if major deviation - consult user                 │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 6: Generate Verification Report                        │
│ ⚠️  GATE: Report MUST show OVERALL: ✅ PASS                │
│ Output: Structured report with all sections                 │
│ STOP HERE if FAIL status - fix issues first                 │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 7: Commit Changes to Local Repository                 │
│ GATE: Verification report shows PASS                        │
│ Format: [TaskID] Description + details                      │
│ Output: Changes committed with structured message           │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 8: Push to Remote Repository                          │
│ ⚠️  MANDATORY: Use --no-verify flag                        │
│ Command: git push origin [branch] --no-verify              │
│ Output: Changes pushed to remote                            │
│ ✅ TASK COMPLETE - Ready for next task                     │
└─────────────────────────────────────────────────────────────┘
```

#### Critical Gates (MUST PASS)

**Gate 1 (Step 3)**: All tests pass
- **Trigger**: Any test failure
- **Action**: STOP, fix tests, re-run until 100% pass
- **Max retries**: 5 attempts, then consult user

**Gate 2 (Step 5)**: No major deviations
- **Trigger**: Major deviation from requirements or design
- **Action**: STOP, consult user for decision
- **Cannot proceed**: Until deviation resolved

**Gate 3 (Step 6)**: Verification report shows PASS
- **Trigger**: Report shows FAIL status
- **Action**: STOP, fix issues, regenerate report
- **Cannot proceed**: Until PASS status achieved

#### Absolutely Prohibited Actions

**NEVER do these** (violations block task completion):
- ❌ Skip any step in the 8-step workflow
- ❌ Change the order of steps
- ❌ Proceed with ANY failing tests
- ❌ Commit without verification report
- ❌ Push without `--no-verify` flag
- ❌ Mark task complete with FAIL status
- ❌ Ignore major deviations from requirements/design
- ❌ Generate incomplete verification report

#### Quick Reference: Commands for Each Step

```bash
# Step 1: Understand (no commands, read documents)

# Step 2: Implement (create/edit files)

# Step 3: Test
npm test                    # Run all tests
npm run type-check          # Check TypeScript
npm run lint                # Check code quality

# Step 4: Verify
npm run dev                 # Runtime verification
npm run build               # Build verification

# Step 5: Consistency Check (read requirements.md and design.md)

# Step 6: Generate Report (output in chat)

# Step 7: Commit
git add .
git commit -m "[TaskID] Description

- Implemented: [details]
- Files: [files]
- Tests: [results]
- Verified: [status]

Related: [requirement]"

# Step 8: Push
git push origin [branch-name] --no-verify
```

## Progressive Development: Step-by-Step Implementation

**PRINCIPLE**: Create before you reference. Build incrementally.

### Implementation Sequence (MANDATORY ORDER)

**Step 1: Confirm Current State**
```bash
# Verify project builds successfully before starting
npm run build

# Check what components/modules currently exist
ls -la src/components/
```

**Step 2: Create New Component/Module**
```bash
# Create directory structure
mkdir -p src/components/UserForm

# Create component file with basic structure
# File: src/components/UserForm/index.tsx
```

**Step 3: Implement Component**
```typescript
// Implement component with exports
export const UserForm = () => {
  return <div>User Form</div>;
};

export default UserForm;
```

**Step 4: Update Configuration (if needed)**
```typescript
// Only NOW add to route configuration, imports, etc.
import UserForm from '@/components/UserForm';
```

**Step 5: Verify Build After Each Addition**
```bash
# Verify build still succeeds
npm run build

# If build fails, fix immediately before proceeding
```

### Progressive Development Checklist

**For each new component/module**:
- [ ] Create file/directory first
- [ ] Implement basic structure
- [ ] Export component/module
- [ ] Verify build succeeds
- [ ] THEN add imports/references in other files
- [ ] Verify build succeeds again

**Example: Adding UserForm Component**

```
✅ CORRECT Order:
1. Create src/components/UserForm/index.tsx
2. Implement UserForm component with export
3. Run npm run build (verify success)
4. Import UserForm in src/pages/Users/index.tsx
5. Run npm run build (verify success)

❌ WRONG Order:
1. Import UserForm in src/pages/Users/index.tsx
2. Run npm run build (FAILS - module not found)
3. Create src/components/UserForm/index.tsx
4. Run npm run build (now succeeds, but had broken state)
```

## Common Problems and Solutions

### Problem 1: Build Failures

**Symptoms**: Build command fails with errors, project won't compile.

**Common Error Types and Solutions**:

#### Error Type 1: Module Not Found
```bash
❌ Error: Cannot find module './components/UserForm'
❌ Error: Module not found: Can't resolve '@/components/UserForm'
```

**Root Causes**:
- File doesn't exist at specified path
- Import path is incorrect (typo, wrong relative path)
- File exists but has no export statement

**Solution Steps**:
1. Verify file exists: `ls -la src/components/UserForm/index.tsx`
2. Check import path matches file location
3. Verify file has export statement: `export default UserForm;`
4. Check path alias configuration in `vite.config.ts` (for @ imports)

**Example Fix**:
```typescript
// ❌ WRONG: File doesn't exist yet
import UserForm from './components/UserForm';

// ✅ CORRECT: Create file first, then import
// 1. Create src/components/UserForm/index.tsx
// 2. Add export: export default UserForm;
// 3. Then import: import UserForm from './components/UserForm';
```

---

#### Error Type 2: TypeScript Type Errors
```bash
❌ Error: Property 'username' does not exist on type 'User'
❌ Error: Type 'string | undefined' is not assignable to type 'string'
```

**Root Causes**:
- Using properties not defined in type/interface
- Missing null/undefined checks
- Type mismatch between function parameters and arguments

**Solution Steps**:
1. Run `npm run type-check` to see all type errors
2. Check type definition in `src/types/` directory
3. Add missing properties to interface or fix usage
4. Add null checks where needed: `user?.username` or `username ?? ''`

**Example Fix**:
```typescript
// ❌ WRONG: Property not in type
interface User {
  id: string;
  email: string;
}
const name = user.username; // Error!

// ✅ CORRECT: Add property to type
interface User {
  id: string;
  email: string;
  username: string; // Added
}
const name = user.username; // OK
```

---

#### Error Type 3: Dependency Issues
```bash
❌ Error: Cannot find module 'axios'
❌ Error: Module '"react"' has no exported member 'useEffect'
```

**Root Causes**:
- Package not installed
- Wrong package version
- Typo in import statement

**Solution Steps**:
1. Check if package is in `package.json`: `cat package.json | grep axios`
2. Install if missing: `npm install axios`
3. Verify import statement spelling
4. Check package version compatibility

---

#### Error Type 4: Syntax Errors
```bash
❌ Error: Unexpected token '}'
❌ Error: Expression expected
```

**Root Causes**:
- Missing brackets, parentheses, or semicolons
- Unclosed JSX tags
- Invalid JavaScript/TypeScript syntax

**Solution Steps**:
1. Read error message for line number
2. Check for matching brackets: `{`, `}`, `(`, `)`, `[`, `]`
3. Verify JSX tags are properly closed: `<Component />`
4. Use editor's syntax highlighting to spot issues

---

#### Build Failure Resolution Process

**Follow this sequence** (max 3 attempts):

**Attempt 1: Read and Understand Error**
```bash
# Run build and read error carefully
npm run build

# Error message usually points to exact issue
# Example: "Cannot find module './UserForm'" → File missing or path wrong
```

**Attempt 2: Isolate Error Type**
```bash
# Check TypeScript errors separately
npm run type-check

# Check linting errors separately
npm run lint

# This helps identify if it's a type issue, syntax issue, or module issue
```

**Attempt 3: Fix and Verify**
```bash
# Fix the identified issue
# Then rebuild
npm run build

# If successful, proceed
# If still failing, document error and consult user
```

**If Still Failing After 3 Attempts**:
```
STOP and report to user:
"Build failing after 3 fix attempts. Error: [paste full error message].
Attempted fixes: [list what you tried].
Need guidance on how to proceed."
```

---

### Problem 2: Test Failures

**Symptoms**: Tests fail during execution, blocking progress.

**Common Test Failure Types and Solutions**:

#### Failure Type 1: Assertion Failures
```bash
❌ Expected: "Login successful"
   Received: "Invalid credentials"

❌ Expected: true
   Received: false
```

**Root Causes**:
- Implementation logic incorrect
- Test expectations wrong
- Test data doesn't match implementation

**Solution Steps**:
1. Read assertion message carefully - shows expected vs actual
2. Determine which is correct: implementation or test expectation
3. If implementation wrong: Fix the code logic
4. If test wrong: Update test expectations
5. Re-run tests to verify fix

**Example Fix**:
```typescript
// ❌ Test failing because implementation returns wrong message
test('successful login shows success message', () => {
  const result = login('user@test.com', 'password');
  expect(result.message).toBe('Login successful'); // Fails
});

// ✅ Fix implementation to return correct message
const login = (email, password) => {
  // ... authentication logic ...
  return { message: 'Login successful' }; // Fixed
};
```

---

#### Failure Type 2: Async/Timing Issues
```bash
❌ Error: Timeout - Async callback was not invoked within timeout
❌ Error: Cannot read property 'data' of undefined
```

**Root Causes**:
- Missing `await` keyword
- Promise not resolved before assertion
- Async operation takes longer than timeout

**Solution Steps**:
1. Add `async/await` to test function
2. Ensure all promises are awaited
3. Increase timeout if operation legitimately slow: `test('name', async () => {...}, 10000)`

**Example Fix**:
```typescript
// ❌ WRONG: Not awaiting async operation
test('fetches user data', () => {
  const data = fetchUser('123'); // Returns promise
  expect(data.name).toBe('John'); // Fails - data is Promise, not resolved value
});

// ✅ CORRECT: Await async operation
test('fetches user data', async () => {
  const data = await fetchUser('123'); // Wait for promise
  expect(data.name).toBe('John'); // Now data is resolved
});
```

---

#### Failure Type 3: Mock/Stub Issues
```bash
❌ Error: Cannot spy on property 'get' because it is not a function
❌ Error: Mock function not called
```

**Root Causes**:
- Mock not set up correctly
- Mock not matching actual API
- Mock not being called due to logic error

**Solution Steps**:
1. Verify mock setup matches actual function signature
2. Check mock is imported before the code under test
3. Verify code path actually calls the mocked function
4. Use `jest.fn()` or `vi.fn()` correctly

**Example Fix**:
```typescript
// ❌ WRONG: Mock not matching actual API
const mockApi = {
  get: jest.fn().mockResolvedValue({ data: 'test' })
};
// But actual code calls: api.get('/users', { params: {...} })

// ✅ CORRECT: Mock matches actual usage
const mockApi = {
  get: jest.fn((url, config) => Promise.resolve({ data: 'test' }))
};
```

---

#### Failure Type 4: Environment/Setup Issues
```bash
❌ Error: localStorage is not defined
❌ Error: document is not defined
```

**Root Causes**:
- Test environment missing browser APIs
- Test setup/teardown not cleaning state
- Global mocks not configured

**Solution Steps**:
1. Check test setup file (e.g., `vitest.config.ts`)
2. Add necessary polyfills or mocks
3. Ensure cleanup in `afterEach` hooks
4. Use `jsdom` environment for browser APIs

**Example Fix**:
```typescript
// ❌ WRONG: No environment setup
test('saves token to localStorage', () => {
  saveToken('abc123'); // Fails - localStorage not defined in Node
});

// ✅ CORRECT: Configure test environment
// In vitest.config.ts:
export default defineConfig({
  test: {
    environment: 'jsdom', // Provides browser APIs
  },
});
```

---

#### Test Failure Resolution Process

**Follow this sequence** (max 5 attempts):

**Step 1: Identify Failing Tests**
```bash
# Run tests and note which ones fail
npm test

# Output shows:
# ✅ login form renders (PASS)
# ❌ login with valid credentials (FAIL)
# ✅ login with invalid credentials (PASS)
```

**Step 2: Run Failing Test in Isolation**
```bash
# Focus on single failing test
npm test -- -t "login with valid credentials"

# Easier to debug without noise from other tests
```

**Step 3: Read Error Message Completely**
```bash
# Error message contains:
# - What was expected
# - What was received
# - Stack trace showing where it failed
# - Line numbers

# Example:
# Expected: "Login successful"
# Received: "Invalid credentials"
# at line 45 in login.test.tsx
```

**Step 4: Determine Root Cause**
```
Ask yourself:
- Is the implementation logic wrong?
- Are the test expectations wrong?
- Is it an async timing issue?
- Is a mock not set up correctly?
```

**Step 5: Fix and Re-run ALL Tests**
```bash
# After fixing, run ALL tests (not just the one that failed)
npm test

# Ensure fix didn't break other tests
```

**If Still Failing After 5 Attempts**:
```
STOP and report to user:
"Tests failing after 5 fix attempts:
- Failing test: [test name]
- Error: [error message]
- Attempted fixes: [list what you tried]
Need guidance on how to proceed."
```

---

#### Absolutely Prohibited Test Actions

**NEVER do these**:
- ❌ Comment out failing tests
- ❌ Skip tests with `.skip()` to make them pass
- ❌ Lower test expectations to make them pass
- ❌ Proceed to verification with ANY failing tests
- ❌ Blame "flaky tests" without investigating
- ❌ Disable test coverage requirements

---

### Problem 3: Runtime Errors

**Symptoms**: Build succeeds but application crashes or errors when running.

**Common Runtime Error Types and Solutions**:

#### Error Type 1: Console Errors (Browser)
```bash
❌ Uncaught TypeError: Cannot read property 'map' of undefined
❌ Error: Invalid hook call
❌ Warning: Each child in a list should have a unique "key" prop
```

**Root Causes**:
- Accessing properties on undefined/null values
- React hooks used incorrectly
- Missing keys in list rendering

**Solution Steps**:
1. Open browser DevTools (F12) and check Console tab
2. Click on error to see stack trace and line number
3. Add null checks or optional chaining
4. Fix hook usage (only call at top level of component)
5. Add unique keys to list items

**Example Fix**:
```typescript
// ❌ WRONG: No null check
const UserList = ({ users }) => {
  return users.map(user => <div>{user.name}</div>); // Crashes if users is undefined
};

// ✅ CORRECT: Add null check and keys
const UserList = ({ users }) => {
  if (!users) return <div>Loading...</div>;
  return users.map(user => <div key={user.id}>{user.name}</div>);
};
```

---

#### Error Type 2: API/Network Errors
```bash
❌ Error: Network Error
❌ Error: Request failed with status code 404
❌ Error: CORS policy blocked
```

**Root Causes**:
- API endpoint URL incorrect
- Backend server not running
- CORS not configured
- Environment variables not set

**Solution Steps**:
1. Check browser Network tab to see failed requests
2. Verify API endpoint URL is correct
3. Confirm backend server is running
4. Check environment variables: `printenv | grep VITE_`
5. Test endpoint with curl: `curl http://localhost:8080/api/v1/health`

**Debugging Commands**:
```bash
# Check environment variables
printenv | grep VITE_
# Should show: VITE_API_BASE_URL=http://localhost:8080/api/v1

# Test API endpoint directly
curl http://localhost:8080/api/v1/users
# Should return JSON response

# Check if backend is running
lsof -i :8080
# Should show process listening on port 8080
```

**Example Fix**:
```typescript
// ❌ WRONG: Hardcoded URL, no error handling
const fetchUsers = async () => {
  const response = await axios.get('http://localhost:8080/users');
  return response.data;
};

// ✅ CORRECT: Use environment variable, add error handling
const fetchUsers = async () => {
  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const response = await axios.get(`${baseURL}/users`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('Unable to load users. Please try again.');
  }
};
```

---

#### Error Type 3: Port Already in Use
```bash
❌ Error: Port 5173 is already in use
❌ Error: EADDRINUSE: address already in use :::5173
```

**Root Causes**:
- Dev server already running in another terminal
- Another application using the same port
- Previous dev server didn't shut down properly

**Solution Steps**:
```bash
# 1. Check what's using the port
lsof -i :5173

# 2. Kill the process (replace PID with actual process ID)
kill -9 [PID]

# 3. Or use different port
npm run dev -- --port 5174

# 4. Restart dev server
npm run dev
```

---

#### Error Type 4: Missing Environment Variables
```bash
❌ Error: VITE_API_BASE_URL is not defined
❌ API calls failing with undefined URL
```

**Root Causes**:
- `.env.development` file missing
- Environment variables not prefixed with `VITE_`
- Dev server not restarted after adding variables

**Solution Steps**:
```bash
# 1. Check if .env.development exists
ls -la .env.development

# 2. Verify variable is prefixed with VITE_
cat .env.development
# Should contain: VITE_API_BASE_URL=http://localhost:8080/api/v1

# 3. Restart dev server (required after env changes)
# Stop server (Ctrl+C)
npm run dev

# 4. Verify variable is loaded
# In browser console:
console.log(import.meta.env.VITE_API_BASE_URL);
```

---

#### Error Type 5: Resource Files Missing
```bash
❌ Error: Failed to load resource: 404 (Not Found)
❌ GET http://localhost:5173/assets/logo.png 404
```

**Root Causes**:
- File doesn't exist at specified path
- File in wrong directory (should be in `public/`)
- Incorrect file path in code

**Solution Steps**:
```bash
# 1. Check if file exists
ls -la public/assets/logo.png

# 2. If missing, add file to public/ directory
cp /path/to/logo.png public/assets/

# 3. Verify path in code
# ✅ CORRECT: /assets/logo.png (relative to public/)
<img src="/assets/logo.png" alt="Logo" />
```

---

#### Runtime Error Resolution Process

**Step 1: Identify Error Source**
```bash
# Start dev server
npm run dev

# Open browser to http://localhost:5173
# Open DevTools (F12)
# Check Console tab for errors
# Check Network tab for failed requests
```

**Step 2: Locate Error in Code**
```
# Error message shows:
# - Error type (TypeError, Network Error, etc.)
# - Stack trace with file names and line numbers
# - Component where error occurred

# Click on stack trace to jump to source code
```

**Step 3: Fix and Verify**
```bash
# Make fix in code
# Save file (HMR will reload automatically)
# Check browser console - error should be gone
# Test functionality manually
```

**Step 4: Document Fix**
```
# Note what was wrong and how you fixed it
# Include in verification report
# Example: "Fixed undefined users array by adding null check"
```

---

### Problem 4: Integration Issues

**Symptoms**: Individual components work, but fail when integrated together.

**Common Integration Problems**:

#### Issue 1: Props Not Passed Correctly
```typescript
// ❌ WRONG: Parent passes wrong prop name
<UserForm userName="John" /> // Component expects 'username' not 'userName'

// ✅ CORRECT: Match prop names exactly
<UserForm username="John" />
```

**Solution**: Use React DevTools to inspect props being passed to components.

---

#### Issue 2: Data Format Mismatch
```typescript
// ❌ WRONG: Parent passes string, child expects object
<UserProfile userId="123" /> // Child expects { id: string, name: string }

// ✅ CORRECT: Pass correct data structure
<UserProfile user={{ id: "123", name: "John" }} />
```

**Solution**: Add TypeScript interfaces to enforce prop types.

---

#### Issue 3: State Management Confusion
```typescript
// ❌ WRONG: Multiple components managing same state independently
// Component A has its own user state
// Component B has its own user state
// They get out of sync

// ✅ CORRECT: Lift state to common parent or use Context
<AuthContext.Provider value={{ user, setUser }}>
  <ComponentA />
  <ComponentB />
</AuthContext.Provider>
```

**Solution**: Use Context or lift state to common ancestor.

---

**Debugging Integration Issues**:
```bash
# 1. Use React DevTools
# - Install React DevTools browser extension
# - Inspect component tree
# - Check props being passed
# - Verify state values

# 2. Add console.log to trace data flow
console.log('Parent sending:', props);
console.log('Child received:', props);

# 3. Write integration test
test('UserForm integrates with UserList', () => {
  render(<UserList />);
  // Test interaction between components
});
```

---

### Problem 5: Unclear Verification Criteria

**Symptoms**: Unsure how to verify task is complete.

**Solution Process**:

**Step 1: Review Task Acceptance Criteria**
```bash
# Open tasks.md and find your task
# Look for acceptance criteria section
# Example:
# - AC1: User can submit login form
# - AC2: Invalid credentials show error
# - AC3: Successful login redirects to dashboard
```

**Step 2: Choose Verification Method**
```
For each AC, ask:
1. Can I test this by running the app? → Use Runtime Verification
2. Is this a structural change? → Use Build Verification
3. Neither? → Use Static File Check

Most ACs should use Runtime Verification.
```

**Step 3: If Still Unclear, Ask User**
```
Template: "I need clarification on how to verify [specific AC].
Should I verify by:
A) Running the app and testing [specific action]
B) Checking build output
C) Other method?
```

---

### Problem 6: Git Push Failures

**Symptoms**: Push command fails or is blocked.

**Common Push Errors and Solutions**:

#### Error 1: Missing --no-verify Flag
```bash
❌ Error: pre-push hook failed
❌ Error: husky - pre-push hook failed

✅ Solution: Add --no-verify flag
git push origin feature/my-branch --no-verify
```

---

#### Error 2: Branch Diverged
```bash
❌ Error: Updates were rejected because the remote contains work that you do not have locally
❌ Error: failed to push some refs

✅ Solution: Pull with rebase, then push
git pull origin feature/my-branch --rebase
git push origin feature/my-branch --no-verify
```

---

#### Error 3: Network/Authentication Issues
```bash
❌ Error: Failed to connect to github.com
❌ Error: Permission denied (publickey)
❌ Error: 403 Forbidden

✅ Solution: Check network and credentials
# Test connection
ping github.com

# Check git remote
git remote -v

# Verify credentials (if using HTTPS)
git config --list | grep user
```

---

#### Error 4: Branch Protection
```bash
❌ Error: Protected branch hook declined
❌ Error: Required status checks must pass

✅ Solution: This is expected for protected branches
# Cannot push directly to protected branches
# Create pull request instead
```

---

**Push Failure Resolution Process**:
```bash
# Attempt 1: Verify command is correct
git push origin [branch-name] --no-verify

# Attempt 2: Pull and rebase if diverged
git pull origin [branch-name] --rebase
git push origin [branch-name] --no-verify

# Attempt 3: Check permissions and network
git remote -v  # Verify remote URL
ping github.com  # Test connectivity

# If still failing after 3 attempts, report to user
```

---

### Problem 7: Consistency Check Failures

**Symptoms**: Implementation doesn't match requirements or design.

**Deviation Handling Matrix**:

| Deviation Type | Impact | Action Required |
|----------------|--------|-----------------|
| **Minor** | Low - doesn't affect core functionality | Document, assess, optionally create follow-up task, PROCEED |
| **Major** | High - affects core functionality or architecture | STOP immediately, consult user, WAIT for decision |
| **Improvement** | Positive - better than original design | Document benefits, confirm with user, update design if approved |

---

#### Handling Minor Deviations

**Examples**: Variable naming differences, minor UI tweaks, code organization

**Process**:
1. Document deviation: "Used `handleSubmit` instead of `onSubmit` for consistency with other forms"
2. Assess impact: "No functional impact, naming convention only"
3. Decision: Proceed with task, optionally create follow-up task to standardize
4. **Continue to next step**

---

#### Handling Major Deviations

**Examples**: Different architecture pattern, unauthorized technology, missing core features

**Process**:
1. **STOP immediately** - do not proceed to next step
2. Document deviation clearly:
   ```
   "Implementation deviates from design:
   - Design specifies: Context + Hooks for state management
   - Implementation uses: Redux
   - Reason: [explain why deviation occurred]"
   ```
3. Consult user with options:
   ```
   "Major deviation detected. Options:
   A) Revert to Context + Hooks (as designed)
   B) Update design document to approve Redux
   C) Discuss alternative approaches"
   ```
4. **WAIT for user decision** - do not proceed
5. After user decides, implement decision and re-verify

---

#### Handling Reasonable Improvements

**Examples**: Better error handling, improved UX, performance optimization

**Process**:
1. Document improvement:
   ```
   "Improvement made:
   - Original design: Show generic error message
   - Implementation: Show specific error with retry button
   - Reason: Better user experience, helps debugging
   - Benefits: Users understand what went wrong, can retry easily"
   ```
2. Confirm with user:
   ```
   "I improved error handling beyond design spec because [reason].
   This provides [benefits]. Should I:
   A) Keep improvement and update design doc
   B) Revert to original design
   C) Discuss further"
   ```
3. If approved: Update design.md, assess impact on subsequent tasks
4. **Proceed after confirmation**

## Task Completion Checklist

**CRITICAL**: Before marking task as complete, verify ALL items below.

**Usage**: Go through this checklist after completing Step 8 (Push to Remote).

---

### Phase 1: Implementation ✅

**Code Quality**:
- [ ] Fully understood task requirements and acceptance criteria
- [ ] Code implemented in correct location per project structure
- [ ] Followed progressive development (created files before importing)
- [ ] Used meaningful variable and function names
- [ ] Added necessary comments for complex logic
- [ ] Implemented proper error handling

**Project Structure**:
- [ ] Related configuration files updated (routes, exports, etc.)
- [ ] Component declarations match actual directory structure
- [ ] Dependency relationships configured correctly
- [ ] No broken imports or missing exports

---

### Phase 2: Testing ✅ (NON-NEGOTIABLE)

**Test Execution** (ALL REQUIRED):
- [ ] Unit tests written for core business logic
- [ ] Property-based tests written with ≥100 iterations (if applicable)
- [ ] ALL tests executed: `npm test`
- [ ] 100% test pass rate (0 failures, 0 errors)
- [ ] TypeScript check passed: `npm run type-check` (0 errors)
- [ ] Linting passed: `npm run lint` (0 errors)
- [ ] Test coverage meets project standards (if defined)

**Test Quality**:
- [ ] Tests verify actual functionality (not just "it works")
- [ ] Tests cover edge cases and error scenarios
- [ ] No tests skipped or commented out
- [ ] Test names clearly describe what they test

---

### Phase 3: Verification ✅

**Build Verification** (MANDATORY):
- [ ] Project builds successfully: `npm run build`
- [ ] No build errors
- [ ] No TypeScript compilation errors
- [ ] Build warnings addressed or documented

**Acceptance Criteria Verification**:
- [ ] All acceptance criteria identified from tasks.md
- [ ] Each AC verified using appropriate method (Runtime > Build > Static)
- [ ] Runtime verification performed if applicable (tested in browser)
- [ ] All ACs passed verification
- [ ] Evidence documented for each AC (screenshots, console output, observations)

---

### Phase 4: Consistency Check ✅ (CRITICAL)

**Requirements Consistency**:
- [ ] Found task-related requirement ID (from `_Requirements:_` marker)
- [ ] Opened requirements.md and located requirement section
- [ ] Confirmed implementation meets ALL requirement acceptance criteria
- [ ] Verified no features added beyond requirement scope
- [ ] Documented any deviations with justification

**Design Consistency**:
- [ ] Opened design.md and found related sections
- [ ] Confirmed implementation follows architecture pattern
- [ ] Verified technology choices align with design
- [ ] Checked interface definitions match design specifications
- [ ] Confirmed data models consistent with design
- [ ] Documented any deviations with justification

**Deviation Handling**:
- [ ] If minor deviation: Documented reason and impact
- [ ] If major deviation: STOPPED and consulted user (got approval)
- [ ] If improvement: Documented benefits and got user confirmation

---

### Phase 5: Documentation ✅

**Verification Report**:
- [ ] Verification report generated using required template
- [ ] Report shows OVERALL: ✅ PASS status
- [ ] Report includes Implementation Summary section
- [ ] Report includes Test Results section (with pass/fail counts)
- [ ] Report includes Acceptance Criteria Verification (each AC individually)
- [ ] Report includes Requirements Consistency Check
- [ ] Report includes Design Consistency Check
- [ ] Report includes Next Steps

**Report Quality**:
- [ ] All sections complete (no "TODO" or missing sections)
- [ ] Specific evidence provided for verifications
- [ ] No vague statements like "everything works"
- [ ] Clear PASS/FAIL status for each item

---

### Phase 6: Version Control ✅ (MANDATORY)

**Commit**:
- [ ] Changes staged: `git add .`
- [ ] Commit message follows required format: `[TaskID] Description\n\n- Implemented:...\n- Files:...\n- Tests:...\n- Verified:...\n\nRelated: [ReqID]`
- [ ] Commit message includes Task ID in format `[T###]`
- [ ] Commit message includes test results
- [ ] Commit message includes verification status
- [ ] Commit message links to requirement ID
- [ ] Changes committed successfully: `git commit -m "..."`

**Push**:
- [ ] Push command uses `--no-verify` flag
- [ ] Push command format: `git push origin [branch-name] --no-verify`
- [ ] Push completed without errors
- [ ] Verified commit visible in remote repository

---

### Final Verification ✅

**Overall Status**:
- [ ] All 6 phases above completed
- [ ] No failing tests
- [ ] No build errors
- [ ] No major unresolved deviations
- [ ] Verification report shows PASS
- [ ] Changes committed and pushed

**Ready for Next Task**:
- [ ] Current task fully complete
- [ ] Project in healthy state (builds, tests pass)
- [ ] No blocking issues
- [ ] Can proceed to next task in tasks.md

---

### Quick Self-Check Questions

Before marking complete, ask yourself:

1. **Tests**: Did ALL tests pass? (Not "most" - ALL)
2. **Build**: Does project build successfully right now?
3. **Verification**: Did I actually test the functionality (runtime verification)?
4. **Consistency**: Did I check against requirements.md and design.md?
5. **Report**: Did I generate a complete verification report with PASS status?
6. **Commit**: Does my commit message include Task ID and details?
7. **Push**: Did I use `--no-verify` flag when pushing?

**If answer to ANY question is "No"**: Task is NOT complete. Go back and complete that step.

**If answer to ALL questions is "Yes"**: Task is complete. Proceed to next task.

## Why These Practices Matter

**Following this workflow ensures**:

| Benefit | How It Helps |
|---------|--------------|
| ✅ **Continuous Healthy State** | Project always builds and runs, never broken |
| ✅ **Early Problem Detection** | Issues caught immediately, not accumulated |
| ✅ **High Code Quality** | Standards enforced through testing and review |
| ✅ **Team Collaboration** | Clear audit trail, no integration conflicts |
| ✅ **Low Deployment Risk** | Continuous verification prevents surprises |
| ✅ **Requirements Alignment** | Implementation matches original intent |
| ✅ **No Technical Debt** | Deviations caught and addressed immediately |
| ✅ **Clear Audit Trail** | Structured reports document all decisions |
| ✅ **Reliable Deployments** | Consistent process, predictable outcomes |

**Cost of NOT following these practices**:
- ❌ Broken builds block entire team
- ❌ Bugs discovered late are expensive to fix
- ❌ Technical debt accumulates silently
- ❌ Integration conflicts waste time
- ❌ Deployment failures cause downtime
- ❌ Implementation drifts from requirements
- ❌ No traceability when issues arise

---

## The Three Iron Rules (MEMORIZE THESE)

### RULE 1: Build Success is Mandatory

**Statement**: After EVERY task completion, project MUST build successfully.

**Why**: Broken builds block everyone. Fix immediately.

**Enforcement**:
- Run `npm run build` after every task
- If build fails, STOP and fix before proceeding
- Never commit broken code
- Never push broken code

**Example**:
```bash
# After completing task
npm run build

# ✅ If succeeds: Proceed to next step
# ❌ If fails: STOP, fix build, verify again
```

---

### RULE 2: Consistency Check is Required

**Statement**: After verification passes, MUST check consistency with requirements and design.

**Why**: Passing tests ≠ meeting requirements. Prevents architectural drift.

**Enforcement**:
- Open requirements.md and find related requirement
- Open design.md and find related design sections
- Compare implementation against both documents
- Document any deviations with justification
- Major deviations require user approval

**Example**:
```
Task passes all tests ✅
But uses Redux instead of Context (design specifies Context) ❌
→ STOP, consult user, get approval or fix
```

---

### RULE 3: Complete Workflow is Non-Negotiable

**Statement**: MUST follow all 8 steps: Understand → Implement → Test → Verify → Consistency → Report → Commit → Push

**Why**: Each step catches different types of issues. Skipping steps = hidden problems.

**Enforcement**:
- Execute steps in exact order
- Complete each step fully before proceeding
- Never skip testing (catches logic errors)
- Never skip verification report (documents what was done)
- Never skip consistency check (prevents drift)
- Always use `--no-verify` when pushing (automation compatibility)

**Example**:
```
❌ WRONG: Implement → Commit → Push (skipped testing, verification, report)
✅ CORRECT: Implement → Test → Verify → Consistency → Report → Commit → Push
```

---

## Quick Reference: Command Sequence

**Copy and execute these commands for EVERY task**:

### Step 1-2: Understand and Implement
```bash
# No commands - read tasks.md, requirements.md, design.md
# Then create/modify files
```

### Step 3: Test (MANDATORY)
```bash
# Run all tests - MUST pass 100%
npm test

# Check TypeScript - MUST have 0 errors
npm run type-check

# Check linting - MUST have 0 errors
npm run lint

# Optional: Check coverage
npm run test:coverage
```

**GATE**: All tests must pass before proceeding. If any fail, fix and re-run.

### Step 4: Verify
```bash
# Option A: Runtime Verification (PREFERRED)
npm run dev
# Then open http://localhost:5173 and test manually

# Option B: Build Verification (if structural change)
rm -rf dist/
npm run build
ls -la dist/
```

**GATE**: All acceptance criteria must pass verification.

### Step 5: Consistency Check
```bash
# No commands - open and read:
# - requirements.md (find related requirement)
# - design.md (find related design sections)
# Compare implementation against both documents
```

**GATE**: No major deviations. If major deviation found, STOP and consult user.

### Step 6: Generate Report
```bash
# No commands - output verification report in chat
# Use the required template format
# Report MUST show OVERALL: ✅ PASS
```

**GATE**: Report must show PASS status before proceeding.

### Step 7: Commit
```bash
# Stage all changes
git add .

# Commit with structured message (replace placeholders)
git commit -m "[T###] Brief description

- Implemented: [key functionality]
- Files: [main files changed]
- Tests: [X/Y passed, types]
- Verified: [method and result]

Related: [FR-###]"

# Verify commit created
git log -1 --oneline
```

**GATE**: Commit message must include Task ID and all required sections.

### Step 8: Push
```bash
# Push with --no-verify flag (MANDATORY)
git push origin [branch-name] --no-verify

# Example:
git push origin feature/user-login --no-verify
```

**GATE**: Push must complete successfully.

---

## One-Page Command Cheat Sheet

**Print this and keep it visible while working**:

```bash
# ============================================
# TASK EXECUTION COMMAND SEQUENCE
# ============================================

# STEP 3: TEST (ALL MUST PASS)
npm test                    # ✅ 100% pass required
npm run type-check          # ✅ 0 errors required
npm run lint                # ✅ 0 errors required

# STEP 4: VERIFY
npm run dev                 # Runtime verification (preferred)
# OR
npm run build               # Build verification

# STEP 7: COMMIT
git add .
git commit -m "[T###] Description

- Implemented: [details]
- Files: [files]
- Tests: [results]
- Verified: [status]

Related: [FR-###]"

# STEP 8: PUSH (NEVER FORGET --no-verify)
git push origin [branch] --no-verify

# ============================================
# TROUBLESHOOTING COMMANDS
# ============================================

# Check what's using a port
lsof -i :5173

# Kill process by PID
kill -9 [PID]

# Check environment variables
printenv | grep VITE_

# Test API endpoint
curl http://localhost:8080/api/v1/health

# Pull with rebase (if push fails)
git pull origin [branch] --rebase

# Check current branch
git branch --show-current

# View recent commits
git log -3 --oneline
```

---

## Complete Examples: Good vs Bad Execution

### Example 1: Perfect Task Execution (✅ CORRECT)

**Task**: T005 - Implement user login form

**Execution Trace**:
```
Step 1: Understand Task
✅ Read task T005 in tasks.md
✅ Identified 4 acceptance criteria
✅ Found related requirement: FR-001 (User Authentication)
✅ Reviewed design: AuthContext + Ant Design Form

Step 2: Implement Functionality
✅ Created src/pages/Login/index.tsx
✅ Created src/pages/Login/LoginForm.tsx
✅ Used progressive development (created files before importing)
✅ Followed code quality standards (meaningful names, error handling)
✅ Updated src/router/index.tsx to add /login route

Step 3: Write and Run Tests
✅ Wrote 8 unit tests for form validation
✅ Wrote 1 property test for email validation (100 iterations)
✅ Wrote 2 integration tests for login flow
✅ Ran npm test → 11/11 passed ✅
✅ Ran npm run type-check → 0 errors ✅
✅ Ran npm run lint → 0 errors ✅

Step 4: Verify Task
✅ Ran npm run dev
✅ Opened http://localhost:5173/login
✅ Tested AC1: Form displays email/password fields → PASS
✅ Tested AC2: Invalid email shows error → PASS
✅ Tested AC3: Invalid credentials show error → PASS
✅ Tested AC4: Successful login redirects to dashboard → PASS
✅ No console errors

Step 5: Consistency Check
✅ Opened requirements.md, found FR-001
✅ Verified all FR-001 acceptance criteria met
✅ Opened design.md, found Authentication section
✅ Confirmed uses AuthContext (as designed)
✅ Confirmed uses Ant Design Form (as designed)
✅ No deviations from requirements or design

Step 6: Generate Verification Report
✅ Generated complete report with all sections
✅ Report shows OVERALL: ✅ PASS
✅ Included test results: 11/11 passed
✅ Included AC verification with evidence
✅ Included consistency check results

Step 7: Commit Changes
✅ git add .
✅ git commit -m "[T005] Implement user login form

- Implemented: Login form with email/password validation
- Files: src/pages/Login/index.tsx, LoginForm.tsx, index.test.tsx
- Tests: 11/11 passed (8 unit, 1 property, 2 integration)
- Verified: Runtime tested, all AC passed

Related: FR-001"

Step 8: Push to Remote
✅ git push origin feature/user-login --no-verify
✅ Push succeeded

Result: ✅ Task complete, project healthy, ready for T006
```

---

### Example 2: Incomplete Execution (❌ WRONG)

**Task**: T005 - Implement user login form

**Execution Trace**:
```
Step 1: Understand Task
⚠️  Skimmed task description (didn't read requirements.md or design.md)

Step 2: Implement Functionality
✅ Created LoginForm component
❌ Imported UserForm before creating it (build broke temporarily)
❌ Used generic variable names (data, result, func)
❌ No error handling

Step 3: Write and Run Tests
❌ SKIPPED - thought tests were optional
❌ Never ran npm test
❌ Never ran npm run type-check
❌ Never ran npm run lint

Step 4: Verify Task
❌ SKIPPED - assumed it works because code compiles
❌ Never ran npm run dev
❌ Never tested in browser
❌ Never verified acceptance criteria

Step 5: Consistency Check
❌ SKIPPED - didn't check requirements.md or design.md
❌ Unknown if implementation matches requirements
❌ Unknown if implementation follows design

Step 6: Generate Verification Report
❌ SKIPPED - no report generated
❌ No documentation of what was done

Step 7: Commit Changes
❌ git commit -m "update code"
   (vague message, no task ID, no details)

Step 8: Push to Remote
❌ git push origin feature/user-login
   (forgot --no-verify flag)

Result: ❌ Task incomplete, untested code, no audit trail, may have bugs
```

**Problems with this execution**:
- No tests → bugs not caught
- No verification → don't know if it works
- No consistency check → may violate requirements/design
- No report → no documentation
- Poor commit message → no traceability
- Missing --no-verify → may block automation

---

### Example 3: Handling Test Failures Correctly (✅ CORRECT)

**Task**: T008 - Add password strength validation

**Execution Trace**:
```
Step 1-2: Understand and Implement
✅ Implemented password strength checker
✅ Added visual strength indicator

Step 3: Write and Run Tests
✅ Wrote 6 unit tests
✅ Ran npm test
❌ Result: 4/6 passed, 2 failed

Failure Analysis:
Test: "rejects password shorter than 8 characters"
Expected: false
Received: true
→ Bug found: validation logic has off-by-one error

Test: "accepts password with all requirements"
Expected: true
Received: false
→ Bug found: special character regex incorrect

Fix Attempt 1:
✅ Fixed off-by-one error (changed < 8 to <= 7)
✅ Fixed regex pattern for special characters
✅ Re-ran npm test
✅ Result: 6/6 passed ✅

Step 4-8: Continue with workflow
✅ Verified in browser (tested various passwords)
✅ Checked consistency (matches requirements)
✅ Generated report (noted test failures and fixes)
✅ Committed with details about bug fixes
✅ Pushed with --no-verify

Result: ✅ Tests caught bugs before deployment, fixed immediately
```

**Key Success Factors**:
- Tests caught bugs early (before manual testing)
- Read error messages carefully to understand issues
- Fixed bugs immediately (didn't defer)
- Re-ran ALL tests after fix (not just failing ones)
- Documented fixes in verification report

---

### Example 4: Handling Test Failures Incorrectly (❌ WRONG)

**Task**: T008 - Add password strength validation

**Execution Trace**:
```
Step 1-2: Understand and Implement
✅ Implemented password strength checker

Step 3: Write and Run Tests
✅ Wrote 6 unit tests
✅ Ran npm test
❌ Result: 4/6 passed, 2 failed

Bad Response to Failures:
❌ Thought: "Tests are probably wrong, my code is fine"
❌ Commented out 2 failing tests
❌ Re-ran npm test
✅ Result: 4/4 passed (but 2 tests hidden!)

Step 4-8: Continue with broken code
❌ Verified in browser (only tested happy path)
❌ Generated report claiming "6/6 tests passed" (lie)
❌ Committed broken code
❌ Pushed to remote

Result: ❌ Bugs shipped to production, users can set weak passwords
```

**Problems with this execution**:
- Commented out failing tests instead of fixing bugs
- Lied in verification report (claimed 6/6 passed)
- Only tested happy path (didn't test edge cases)
- Shipped broken code to production
- Users can now bypass password requirements

---

### Example 5: Handling Major Deviation (✅ CORRECT)

**Task**: T012 - Implement session management

**Execution Trace**:
```
Step 1-2: Understand and Implement
✅ Read task and requirements
✅ Implemented session timeout logic
⚠️  Used Redux for state management (design specifies Context)

Step 3-4: Test and Verify
✅ All tests pass
✅ Functionality works correctly

Step 5: Consistency Check
✅ Opened requirements.md → Implementation meets all requirements ✅
✅ Opened design.md → Found Architecture section
❌ Design specifies: "Use Context + Hooks for state management"
❌ Implementation uses: Redux
→ MAJOR DEVIATION DETECTED

Correct Response:
🛑 STOPPED immediately (did not proceed to Step 6)
✅ Documented deviation clearly:
   "Implementation uses Redux instead of Context + Hooks.
    Reason: Accidentally used Redux out of habit.
    Impact: Violates architecture decision, adds unnecessary dependency."

✅ Consulted user:
   "Major deviation detected. Design specifies Context + Hooks,
    but I implemented with Redux. Should I:
    A) Revert to Context + Hooks (as designed)
    B) Update design to approve Redux
    C) Discuss alternatives"

✅ User chose: A) Revert to Context + Hooks
✅ Refactored to use Context + Hooks
✅ Re-ran tests → all pass
✅ Re-verified consistency → now consistent ✅
✅ Generated report noting deviation and correction
✅ Committed and pushed

Result: ✅ Deviation caught and corrected, architecture preserved
```

**Key Success Factors**:
- Consistency check caught deviation
- Stopped immediately (didn't proceed)
- Consulted user for decision
- Corrected implementation
- Re-verified after correction

---

### Example 6: Handling Major Deviation Incorrectly (❌ WRONG)

**Task**: T012 - Implement session management

**Execution Trace**:
```
Step 1-2: Understand and Implement
✅ Implemented with Redux (design specifies Context)

Step 3-4: Test and Verify
✅ Tests pass, functionality works

Step 5: Consistency Check
❌ SKIPPED - didn't check design.md
❌ Didn't notice deviation from architecture

Step 6-8: Continue with deviated code
❌ Generated report (didn't mention deviation)
❌ Committed and pushed

Result: ❌ Architecture violated, technical debt created
```

**Long-term consequences**:
- Project now has mixed state management (Context + Redux)
- Future developers confused about which to use
- Unnecessary Redux dependency added
- Architecture document no longer accurate
- Technical debt accumulates

---

### Example 7: Complete Verification Report (✅ CORRECT)

```markdown
## Task Verification Report

**Task ID**: T005
**Task Description**: Implement user login form with validation
**Verification Date**: 2025-11-29
**Verification Time**: ~45 minutes

---

### Implementation Summary

**Files Created**:
- src/pages/Login/index.tsx
- src/pages/Login/LoginForm.tsx
- src/pages/Login/index.test.tsx

**Files Modified**:
- src/router/index.tsx (added /login route)
- src/contexts/AuthContext/index.tsx (added login method)

**Key Changes**:
- Created login page with email/password form
- Added form validation (email format, password length)
- Integrated with AuthContext for authentication
- Added error handling for invalid credentials

---

### Test Results

**Test Execution**:
- ✅ Unit tests: 8/8 passed
- ✅ Property tests: 1/1 passed (100 iterations - email validation)
- ✅ Integration tests: 2/2 passed

**Code Quality**:
- ✅ TypeScript: PASS (0 errors)
- ✅ ESLint: PASS (0 errors, 1 warning - console.log in dev code)
- ✅ Build: SUCCESS

---

### Acceptance Criteria Verification

**Verification Method**: Runtime (tested in browser at http://localhost:5173/login)

- [x] **AC1**: Login form displays email and password input fields
  - Verification: Opened /login page, confirmed both fields visible
  - Result: ✅ PASS
  - Evidence: Form renders with labeled email and password fields

- [x] **AC2**: Form validates email format before submission
  - Verification: Entered invalid email "test", saw error message
  - Result: ✅ PASS
  - Evidence: Error message "Please enter a valid email" displayed

- [x] **AC3**: Invalid credentials show error message
  - Verification: Submitted wrong password, saw error from API
  - Result: ✅ PASS
  - Evidence: Error message "Invalid credentials" displayed below form

- [x] **AC4**: Successful login redirects to dashboard
  - Verification: Logged in with valid credentials, redirected to /dashboard
  - Result: ✅ PASS
  - Evidence: URL changed to /dashboard, user menu shows logged-in state

---

### Requirements Consistency

**Related Requirement**: FR-001 (User Authentication)
**Consistency Status**: ✅ CONSISTENT

**Verification Details**:
- FR-001 AC1: Users can log in with email/password ✅ Implemented
- FR-001 AC2: Invalid credentials show error ✅ Implemented
- FR-001 AC3: Successful login grants access ✅ Implemented (redirects to dashboard)

**Scope Check**: No features added beyond FR-001 requirements

**Notes**: Implementation fully aligns with FR-001 specifications

---

### Design Consistency

**Architecture Compliance**: ✅ YES
**Technology Compliance**: ✅ YES
**Interface Compliance**: ✅ YES

**Verification Details**:
- Architecture: Uses AuthContext for state management (as designed)
- Technology: Ant Design Form components, Axios for API calls (as designed)
- Interfaces: POST /api/v1/auth/login endpoint (matches design spec)
- Data Model: Stores JWT in localStorage (as designed)

**Notes**: No deviations from design document

---

### Verification Status

**OVERALL**: ✅ PASS

All acceptance criteria verified, tests passing, consistent with requirements and design.

---

### Next Steps

Ready to proceed to T006 - Implement session timeout handling
```

---

### Example 8: Incomplete Verification Report (❌ WRONG)

```markdown
## Task Verification Report

**Task ID**: T005
**Task Description**: Login form

### Implementation Summary
- Created login form

### Test Results
- Tests passed

### Acceptance Criteria Verification
- Everything works

### Verification Status
**OVERALL**: ✅ PASS
```

**Problems with this report**:
- ❌ Missing verification date
- ❌ No file list (which files were created/modified?)
- ❌ Vague test results (how many tests? which types?)
- ❌ No specific AC verification (which ACs? how verified?)
- ❌ Missing requirements consistency check
- ❌ Missing design consistency check
- ❌ No evidence provided
- ❌ "Everything works" is not verification

---

### Example 9: Perfect Commit Messages (✅ CORRECT)

```bash
# Example 1: Feature implementation
git commit -m "[T005] Implement user login form

- Implemented: Login form with email/password validation
- Files: src/pages/Login/index.tsx, LoginForm.tsx, index.test.tsx
- Tests: 11/11 passed (8 unit, 1 property, 2 integration)
- Verified: Runtime tested, all AC passed

Related: FR-001"

# Example 2: Bug fix
git commit -m "[T012] Fix session timeout not triggering logout

- Implemented: Corrected timer logic in useSessionTimeout hook
- Files: src/hooks/useSessionTimeout.ts, useSessionTimeout.test.ts
- Tests: 5/5 passed (added 2 new edge case tests)
- Verified: Runtime tested, timeout works correctly

Related: FR-004"

# Example 3: Refactoring
git commit -m "[T018] Refactor AuthContext to use reducer pattern

- Implemented: Migrated from useState to useReducer for state management
- Files: src/contexts/AuthContext/index.tsx, reducer.ts, actions.ts
- Tests: 15/15 passed (all existing tests still pass)
- Verified: Build successful, runtime tested

Related: Design-Architecture"
```

**What makes these good**:
- ✅ Task ID in format `[T###]`
- ✅ Clear one-line description
- ✅ Structured body with bullet points
- ✅ Specific file list
- ✅ Detailed test results
- ✅ Verification method stated
- ✅ Links to requirement

---

### Example 10: Bad Commit Messages (❌ WRONG)

```bash
# ❌ Example 1: Too vague, no task ID
git commit -m "update code"
# Problems: No task ID, no details, no traceability

# ❌ Example 2: Has task ID but no details
git commit -m "[T005] login"
# Problems: No test info, no verification info, unclear what was done

# ❌ Example 3: No task ID, unclear what changed
git commit -m "fix bug in auth"
# Problems: Which bug? Which task? Were tests added?

# ❌ Example 4: Implementation details only
git commit -m "Added LoginForm component with Ant Design Form and validation"
# Problems: No task ID, no test results, no verification status

# ❌ Example 5: Multi-line but wrong format
git commit -m "[T005] Implement login
Added form
Added validation
Fixed styling"
# Problems: Not using bullet point format, no test/verification info

# ❌ Example 6: Missing verification info
git commit -m "[T005] Implement login form

- Files: LoginForm.tsx
- Tests: passed"
# Problems: No "Implemented:" line, vague test results, no verification method
```

**What makes these bad**:
- ❌ Missing task ID (no traceability)
- ❌ Vague descriptions ("update code", "fix bug")
- ❌ No test results or vague results ("passed")
- ❌ No verification information
- ❌ No requirement linkage
- ❌ Wrong format (not using bullet points)

---

## Anti-Patterns: What NOT to Do

**These behaviors lead to project failure. Avoid at all costs.**

### Anti-Pattern 1: "I'll test it later"

**Behavior**: Skip writing tests, plan to add them later.

**Why it fails**:
- "Later" never comes
- Bugs accumulate and compound
- Harder to write tests after implementation
- No safety net when refactoring

**Real consequence**: Bug ships to production, causes data loss, costs $50K to fix.

**Correct approach**: Write tests immediately after implementation. Tests are NOT optional.

---

### Anti-Pattern 2: "Build probably works"

**Behavior**: Don't run build command, assume it will work.

**Why it fails**:
- Integration issues discovered late (during deployment)
- Blocks entire team when build breaks
- Wastes time debugging in production

**Real consequence**: Deployment fails at 2 AM, team scrambles to fix, customers affected.

**Correct approach**: Run `npm run build` after EVERY task. Fix immediately if fails.

---

### Anti-Pattern 3: "Close enough"

**Behavior**: Mark task complete with "minor" issues, plan to fix later.

**Why it fails**:
- "Minor" issues compound into major problems
- Technical debt accumulates silently
- Future tasks built on broken foundation

**Real consequence**: 6 months later, codebase unmaintainable, requires rewrite.

**Correct approach**: Fix ALL issues before marking complete. No exceptions.

---

### Anti-Pattern 4: "Quick commit"

**Behavior**: Use vague commit messages like "update code" or "fix bug".

**Why it fails**:
- No traceability (can't find what changed when)
- Can't understand why change was made
- Impossible to revert specific changes
- Audit trail useless

**Real consequence**: Bug introduced 3 months ago, can't find which commit caused it.

**Correct approach**: Use structured commit messages with Task ID and details.

---

### Anti-Pattern 5: "Just push it"

**Behavior**: Forget `--no-verify` flag when pushing.

**Why it fails**:
- Pre-push hooks block automated workflows
- CI/CD pipelines fail
- Deployment automation breaks

**Real consequence**: Automated deployment fails, manual intervention required.

**Correct approach**: ALWAYS use `git push origin [branch] --no-verify`.

---

### Anti-Pattern 6: "I know what it means"

**Behavior**: Don't check requirements.md or design.md, implement based on task description only.

**Why it fails**:
- Implementation deviates from requirements
- Violates architecture decisions
- Doesn't meet actual user needs
- Rework required later

**Real consequence**: Feature implemented wrong, must be completely redone.

**Correct approach**: Always check requirements.md and design.md for context.

---

### Anti-Pattern 7: "No need for report"

**Behavior**: Skip verification report, just commit and push.

**Why it fails**:
- No documentation of what was verified
- Can't prove task was completed correctly
- No audit trail for compliance
- Can't review what was done

**Real consequence**: Audit fails, can't prove compliance, legal issues.

**Correct approach**: Always generate structured verification report with PASS status.

---

### Anti-Pattern 8: "Tests are flaky"

**Behavior**: Blame failing tests on "flakiness", skip or disable them.

**Why it fails**:
- "Flaky" tests usually indicate real bugs
- Disabling tests removes safety net
- Bugs slip through to production

**Real consequence**: Race condition in production causes data corruption.

**Correct approach**: Investigate and fix "flaky" tests. They're telling you something.

---

### Anti-Pattern 9: "It works on my machine"

**Behavior**: Only test locally, don't verify build or deployment.

**Why it fails**:
- Environment differences cause production failures
- Missing dependencies not caught
- Configuration issues not detected

**Real consequence**: Works locally, fails in production, emergency rollback required.

**Correct approach**: Always run production build and verify it works.

---

### Anti-Pattern 10: "I'll document it later"

**Behavior**: Skip verification report, plan to document later.

**Why it fails**:
- Forget details by the time you document
- "Later" never comes
- No record of decisions made

**Real consequence**: 6 months later, no one knows why code was written this way.

**Correct approach**: Document immediately while details are fresh.

---

## Success Patterns: What TO Do

**These behaviors lead to project success. Practice consistently.**

### Pattern 1: Test-First Mindset

**Behavior**: Write tests immediately after (or even before) implementation.

**Why it succeeds**:
- Bugs caught immediately (cheap to fix)
- Tests document expected behavior
- Refactoring is safe (tests catch regressions)
- Code quality improves (testable code is better code)

**How to practice**:
```
1. Implement feature
2. Immediately write tests (don't wait)
3. Run tests (must pass 100%)
4. Only then proceed to verification
```

**Result**: High-quality, well-tested code with few production bugs.

---

### Pattern 2: Continuous Verification

**Behavior**: Verify frequently, not just at the end.

**Why it succeeds**:
- Issues caught early (easy to fix)
- Always know project state (builds, runs)
- No surprises at deployment time

**How to practice**:
```
After each significant change:
1. Run npm run build (verify still builds)
2. Run npm test (verify tests still pass)
3. Run npm run dev (verify still runs)
4. Test in browser (verify behavior correct)
```

**Result**: Project always in healthy, deployable state.

---

### Pattern 3: Documentation Discipline

**Behavior**: Document everything immediately while details are fresh.

**Why it succeeds**:
- Clear audit trail (know what changed and why)
- Easy to review (understand what was done)
- Compliance ready (have proof of verification)
- Knowledge preserved (don't forget details)

**How to practice**:
```
For every task:
1. Generate verification report (document what was verified)
2. Use structured commit messages (document what changed)
3. Note any deviations (document why)
4. Link to requirements (document traceability)
```

**Result**: Complete documentation, easy audits, clear history.

---

### Pattern 4: Consistency Checking

**Behavior**: Always verify implementation matches requirements and design.

**Why it succeeds**:
- Prevents architectural drift
- Ensures requirements met
- Catches deviations early
- Maintains design integrity

**How to practice**:
```
After verification passes:
1. Open requirements.md (find related requirement)
2. Check each requirement AC (does implementation satisfy?)
3. Open design.md (find related design sections)
4. Check architecture compliance (does implementation follow design?)
5. Document any deviations (with justification)
```

**Result**: Implementation aligns with requirements and design, no drift.

---

### Pattern 5: Automation-Friendly Practices

**Behavior**: Follow patterns that enable automation and CI/CD.

**Why it succeeds**:
- Enables automated testing
- Enables automated deployment
- Reduces manual errors
- Increases deployment frequency

**How to practice**:
```
1. Always use --no-verify flag (automation compatible)
2. Follow consistent command patterns (scriptable)
3. Use structured formats (parseable)
4. Maintain clean build (always passes)
```

**Result**: Smooth CI/CD pipeline, frequent deployments, high confidence.

---

### Pattern 6: Progressive Development

**Behavior**: Build incrementally, verify at each step.

**Why it succeeds**:
- Never break the build
- Always have working version
- Easy to identify what broke (last change)

**How to practice**:
```
1. Create file
2. Verify build (still works)
3. Add basic structure
4. Verify build (still works)
5. Add functionality
6. Verify build (still works)
7. Add tests
8. Verify tests pass
```

**Result**: Project never broken, always deployable.

---

### Pattern 7: Evidence-Based Verification

**Behavior**: Provide concrete evidence for all verifications.

**Why it succeeds**:
- Proof that verification was done
- Can review evidence later
- Builds confidence in quality

**How to practice**:
```
For each acceptance criterion:
1. Verify by running/testing
2. Document HOW you verified (specific steps)
3. Document WHAT you observed (specific results)
4. Provide evidence (screenshots, console output, test results)
```

**Result**: Verifiable quality, clear proof of completion.

---

### Pattern 8: Fail-Fast Philosophy

**Behavior**: Catch and fix issues immediately, don't defer.

**Why it succeeds**:
- Issues easier to fix when fresh
- Don't compound problems
- Maintain momentum

**How to practice**:
```
When issue found:
1. STOP immediately (don't proceed)
2. Fix issue right away (don't defer)
3. Verify fix works (re-run tests/build)
4. Document fix (in report)
5. Then proceed
```

**Result**: Issues resolved quickly, no accumulation.

---

### Pattern 9: Structured Communication

**Behavior**: Use consistent formats for all communication (reports, commits, etc.).

**Why it succeeds**:
- Easy to parse and understand
- Consistent across team
- Enables automation
- Professional appearance

**How to practice**:
```
Use templates for:
- Verification reports (structured format)
- Commit messages ([TaskID] format)
- Deviation documentation (clear format)
- User consultations (options format)
```

**Result**: Clear communication, professional documentation.

---

### Pattern 10: User Collaboration

**Behavior**: Consult user when uncertain, don't guess.

**Why it succeeds**:
- Correct decisions made
- User expectations managed
- No wasted rework

**How to practice**:
```
When uncertain:
1. STOP (don't guess)
2. Document the uncertainty (what's unclear)
3. Present options (A, B, C)
4. Ask user (clear question)
5. Wait for response
6. Proceed with user's decision
```

**Result**: Correct implementation, no surprises, happy users.

---

## Final Reminders: The Essentials

### Before Starting ANY Task

**Preparation Checklist**:
- [ ] Read complete workflow (all 8 steps)
- [ ] Open tasks.md (find your task)
- [ ] Open requirements.md (for context)
- [ ] Open design.md (for architecture)
- [ ] Understand what "done" means for this task

**Mental Preparation**:
- Quality over speed (done right > done fast)
- Tests are mandatory (not optional)
- Verification is required (not suggested)
- Documentation is essential (not nice-to-have)

---

### During Task Execution

**Non-Negotiable Rules**:
- ✅ Follow all 8 steps in exact order
- ✅ Complete each step fully before proceeding
- ✅ Stop immediately if tests fail (fix before proceeding)
- ✅ Stop immediately if major deviation found (consult user)
- ✅ Generate verification report before committing
- ✅ Use structured commit message with Task ID
- ✅ Always use `--no-verify` flag when pushing

**Prohibited Actions**:
- ❌ Never skip any step
- ❌ Never proceed with failing tests
- ❌ Never commit without verification report
- ❌ Never push without `--no-verify` flag
- ❌ Never ignore major deviations
- ❌ Never use vague commit messages

---

### After Task Completion

**Completion Verification**:
- [ ] Verification report generated and shows OVERALL: ✅ PASS
- [ ] All tests passing (100% pass rate, 0 failures)
- [ ] Build successful (npm run build completes without errors)
- [ ] All acceptance criteria verified with evidence
- [ ] Requirements consistency checked (matches requirements.md)
- [ ] Design consistency checked (matches design.md)
- [ ] Changes committed with structured message including Task ID
- [ ] Changes pushed to remote with `--no-verify` flag
- [ ] Push completed successfully (visible in remote repository)

**Ready for Next Task**:
- [ ] Current task fully complete (all items above checked)
- [ ] Project in healthy state (builds, tests pass, runs)
- [ ] No blocking issues or unresolved deviations
- [ ] Can confidently proceed to next task

---

### The Golden Rule

**Quality over speed. Always.**

A properly executed task that takes 2 hours is better than a rushed incomplete task that takes 30 minutes.

**Why?**
- Rushed task: Bugs, rework, technical debt, team blocked
- Proper task: Quality code, no rework, team unblocked, project healthy

**Time investment**:
- Proper execution: 2 hours now
- Rushed execution: 30 min now + 4 hours fixing later = 4.5 hours total

**Proper execution is faster in the long run.**

---

### Quick Decision Tree

**Use this when uncertain**:

```
Question: Should I skip [step/test/verification]?
Answer: NO. Never skip anything.

Question: Can I proceed with failing tests?
Answer: NO. Fix tests first.

Question: Is verification report optional?
Answer: NO. Always required.

Question: Can I use vague commit message?
Answer: NO. Use structured format with Task ID.

Question: Can I skip --no-verify flag?
Answer: NO. Always required.

Question: Should I check requirements.md and design.md?
Answer: YES. Always check both.

Question: What if I'm unsure how to verify?
Answer: Ask user. Don't guess.

Question: What if I find a major deviation?
Answer: STOP. Consult user. Wait for decision.
```

---

### Success Mantra

**Repeat before each task**:

```
I will:
✅ Follow all 8 steps in order
✅ Write and run tests (100% pass required)
✅ Verify all acceptance criteria
✅ Check requirements and design consistency
✅ Generate verification report (PASS status)
✅ Use structured commit message with Task ID
✅ Push with --no-verify flag

I will NOT:
❌ Skip any steps
❌ Proceed with failing tests
❌ Ignore deviations
❌ Skip documentation
❌ Use vague commit messages
❌ Forget --no-verify flag
```

---

### When in Doubt

**Remember these principles**:

1. **Test everything**: If it can be tested, test it.
2. **Verify everything**: If it can be verified, verify it.
3. **Document everything**: If it was done, document it.
4. **Check everything**: If it should match something, check it.
5. **Ask when uncertain**: If you don't know, ask.

**The workflow exists for a reason**: It catches bugs, ensures quality, maintains consistency, and enables collaboration.

**Follow it religiously**: Your future self (and your team) will thank you.

---

## Document Summary

**This document defines**:
- ✅ The 8-step task execution workflow (mandatory sequence)
- ✅ The 3 iron rules (non-negotiable principles)
- ✅ Testing requirements (100% pass rate required)
- ✅ Verification methods (runtime > build > static)
- ✅ Consistency checking (requirements + design)
- ✅ Verification report format (structured template)
- ✅ Commit message format ([TaskID] + details)
- ✅ Push requirements (--no-verify flag mandatory)
- ✅ Common problems and solutions
- ✅ Anti-patterns to avoid
- ✅ Success patterns to follow

**Use this document as**:
- Reference guide during task execution
- Checklist for task completion
- Troubleshooting guide for common problems
- Training material for new team members

**Remember**: This workflow ensures quality, consistency, and maintainability. Follow it for every task, every time.

---

*Last updated: 2025-11-29*
*Version: 2.0 (Optimized with Spec-Kit patterns)*
