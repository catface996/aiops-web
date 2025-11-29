---
inclusion: always
---

# Task Execution Phase Best Practices

## Phase Goal

Execute tasks one by one according to task list, transform design into runnable code, ensure project is in healthy state after each task completion.

## Why Task Execution Phase is So Important

Task execution is a critical phase for turning design into reality. Good execution practices can:
- Ensure project continuous healthy state
- Discover and solve problems early
- Improve code quality and maintainability
- Support team collaborative development
- Reduce integration and deployment risks

**Core Principles (NON-NEGOTIABLE)**:
1. After each task completion, project MUST successfully build
2. MUST follow the execution workflow: Implement → Test → Verify → Report → Commit → Push
3. Git push MUST use `--no-verify` flag to bypass pre-commit hooks

## Task Execution Workflow (STRICTLY FOLLOW THIS ORDER)

### Step 1: Understand Task

Before starting to execute task, fully understand task requirements.

**Key Activities**:
- Carefully read task description and acceptance criteria
- Understand task goal and expected output
- Confirm preconditions are met
- Identify possible technical difficulties

**Output**: Clear understanding of what needs to be done

---

### Step 2: Implement Functionality

Implement functionality according to task description.

**Implementation Principles**:

#### 1. Keep Project Continuously Buildable

**Key Requirement**: After each task completion, entire project must be successfully buildable.

**Why Important**:
- Project always in runnable state
- Discover integration problems timely
- Support continuous integration and continuous delivery
- Reduce later integration risk

**How to Achieve**:
- Run build command immediately after completing task
- Ensure build success before entering next task
- Fix immediately when encountering build failure

#### 2. Progressive Development

**Key Idea**: In multi-module or multi-component projects, adopt progressive development strategy, avoid declaring modules or components not yet created.

**Basic Principles**:
- Only declare already created components
- Update configuration synchronously when creating components
- Same principle applies to multi-level structures

**Why Important**:
- Avoid build errors
- Keep configuration synchronized with actual structure
- Support incremental development

#### 3. Follow Code Quality Standards

**Coding Standards**:
- Follow project unified code style
- Use meaningful variable and method naming
- Add necessary comments and documentation

**Error Handling**:
- Implement unified exception handling mechanism
- Provide clear error messages
- Avoid exception messages leaking sensitive data

**Output**: Implemented code files

---

### Step 3: Write and Run Tests (NON-NEGOTIABLE)

**CRITICAL**: Tests MUST be written and executed BEFORE verification.

**Testing Requirements**:
- Write unit tests for core business logic (if task requires)
- Write property-based tests with minimum 100 iterations (if applicable)
- Ensure test coverage reaches reasonable level
- Integration tests verify module collaboration

**Test Execution Order**:
```bash
# 1. Run all tests
npm test

# 2. Check coverage (if required)
npm run test:coverage

# 3. Run type checking
npm run type-check

# 4. Run linting
npm run lint
```

**Test Success Criteria**:
- ✅ All tests pass (100% pass rate)
- ✅ No test failures or errors
- ✅ Coverage meets project standards (if defined)
- ✅ No TypeScript errors
- ✅ No linting errors

**If tests fail**:
1. Review failure messages and stack traces
2. Fix implementation issues
3. Re-run tests until all pass (max 5 iterations)
4. If still failing after 5 iterations, document issues and consult user
5. **NEVER proceed to verification until tests pass**

**Test Output Format**:
```
✅ Unit Tests: 15/15 passed
✅ Property Tests: 3/3 passed (100 iterations each)
✅ Integration Tests: 5/5 passed
✅ Type Check: PASS
✅ Lint: PASS
```

**Output**: All tests passing with documented results

---

### Step 4: Verify Task

After tests pass, verify task according to acceptance criteria.

**Verification Priority**:

#### 1. Runtime Verification (Highest Priority)

**RULE**: Features that can be verified by actually running application MUST be verified by running application.

**Applicable Scenarios**:
- Configuration verification (multi-environment, feature toggles, etc.)
- API endpoint functionality verification
- Log output format verification
- Exception handling verification
- Integration functionality verification
- External service connection verification
- UI component rendering and interaction
- Authentication and authorization flows

**Verification Method**:
```bash
# 1. Start application
npm run dev

# 2. Access relevant functionality
# - Open browser to http://localhost:5173
# - Navigate to relevant pages
# - Test user interactions
# - Verify API responses
# - Check console for errors

# 3. Document results
# - Screenshot key functionality (if UI changes)
# - Record API responses (if backend changes)
# - Note any unexpected behavior
```

**Verification Checklist**:
- [ ] Application starts without errors
- [ ] Relevant pages/components render correctly
- [ ] User interactions work as expected
- [ ] API calls return correct responses
- [ ] No console errors or warnings
- [ ] Performance is acceptable (no obvious lag)

**Output**: Runtime verification results documented

#### 2. Build Verification (Second Priority)

**RULE**: For structural requirements that cannot be verified through runtime, verify through project build.

**Applicable Scenarios**:
- Module/component structure verification
- Dependency relationship verification
- Build configuration verification
- Code syntax correctness verification
- TypeScript type checking
- Import/export consistency

**Verification Method**:
```bash
# 1. Clean previous build
rm -rf dist/

# 2. Run production build
npm run build

# 3. Check build output
ls -la dist/

# 4. Verify build artifacts
# - Check file sizes are reasonable
# - Verify all expected files are present
# - Check for any warnings in build log
```

**Build Success Criteria**:
- ✅ Build completes without errors
- ✅ No TypeScript compilation errors
- ✅ No module resolution errors
- ✅ All expected output files generated
- ✅ Build warnings addressed or documented

**If build fails**:
1. Read error messages carefully
2. Check import paths and module names
3. Verify TypeScript types are correct
4. Ensure all dependencies are installed
5. Fix issues and rebuild
6. **NEVER proceed with failed build**

**Output**: Build verification results documented

#### 3. Static Check (Last Resort)

Only use static file check when cannot verify through above two methods.

**Applicable Scenarios**:
- File existence check
- Configuration file content check
- Directory structure check

### Step 4: Task Completion Confirmation

Confirm task is completely done, meets all acceptance criteria.

**Check Points**:
- All acceptance criteria passed
- Project can build successfully
- Code quality meets standards
- Related documentation updated (if needed)

### Step 5: Requirements and Design Consistency Check

**Key**: After task verification passes, must conduct requirements and design consistency check to ensure implementation conforms to original intent.

**Why Important**:
- Task may pass acceptance criteria but deviate from requirement intent
- Implementation may violate design's architecture principles
- Discover deviations early, avoid accumulating technical debt
- Ensure overall solution consistency and completeness

**Check Dimensions**:

#### 1. Requirements Consistency Check

Verify whether task implementation truly meets corresponding requirements.

**Check Points**:
- [ ] What are task-related requirements? (Check `_Requirements:_` marking in task)
- [ ] Does implementation completely cover all acceptance criteria of requirements?
- [ ] Does implementation accurately understand requirement intent?
- [ ] Is there implementation beyond requirement scope (over-design)?
- [ ] Are there missing requirement points?

**Verification Method**:
- Open requirements document, find corresponding requirement item
- Check each requirement acceptance criterion
- Confirm implementation meets every acceptance criterion
- If deviation exists, record reason and assess impact

**Output**: Verification results documented

---

#### 2. Design Consistency Check

Verify whether task implementation follows architecture and technical solution in design document.

**Check Points**:
- [ ] Does implementation follow architecture pattern in design document?
- [ ] Do module division and responsibility boundaries conform to design?
- [ ] Are interface definitions consistent with design?
- [ ] Does data model conform to design specification?
- [ ] Is technology selection consistent with design?
- [ ] Does it follow non-functional requirements in design (performance, security, etc.)?

**Verification Method**:
- Open design document, find related design chapter
- Compare with architecture diagrams, module division, interface definitions in design
- Confirm implementation conforms to design specifications
- If deviation exists, assess whether there's reasonable reason

#### 3. Deviation Handling

If implementation deviates from requirements or design:

**Minor Deviation** (doesn't affect core functionality and architecture):
- Record deviation reason and impact
- Assess whether adjustment needed
- If adjustment needed, create follow-up task

**Major Deviation** (affects core functionality or architecture):
- Immediately stop subsequent tasks
- Communicate deviation situation with user
- Determine whether to correct implementation or update requirements/design
- Re-verify after correction

**Reasonable Deviation** (improvement with sufficient reason):
- Record deviation reason and benefits
- Update design document (if needed)
- Confirm changes with user
- Assess impact on subsequent tasks

#### 4. Self-check Prompt

Use following prompt for self-check:

> "Please check whether just completed task implementation meets corresponding requirement (requirement number: X.X), whether it follows architecture and technical solution in design document. If deviation exists, please explain reason."

**Check Process**:
1. Find task-related requirement number
2. Open requirements document, locate corresponding requirement
3. Check each requirement acceptance criterion is met
4. Open design document, find related design chapter
5. Check whether implementation conforms to design specification
6. Record check results and found problems

**Output**: Consistency check results

---

### Step 6: Generate Verification Report

**REQUIRED**: After verification passes, MUST generate a structured verification report.

**Report Format** (use this exact structure):

```markdown
## Task Verification Report

**Task ID**: [Task ID from tasks.md]
**Task Description**: [Brief description]
**Verification Date**: [Current date]

### Implementation Summary
- Files created/modified: [List files]
- Key changes: [Brief summary]

### Test Results
- ✅ Unit tests: [X/Y passed]
- ✅ Property tests: [X/Y passed] 
- ✅ Integration tests: [X/Y passed]
- ✅ Build status: SUCCESS

### Acceptance Criteria Verification
- [ ] AC1: [Description] - ✅ PASS / ❌ FAIL
- [ ] AC2: [Description] - ✅ PASS / ❌ FAIL
- [ ] AC3: [Description] - ✅ PASS / ❌ FAIL

### Requirements Consistency
- Related requirement: [Requirement ID]
- Consistency status: ✅ CONSISTENT / ⚠️ MINOR DEVIATION / ❌ MAJOR DEVIATION
- Notes: [Any deviations or clarifications]

### Design Consistency
- Architecture compliance: ✅ YES / ❌ NO
- Design pattern compliance: ✅ YES / ❌ NO
- Notes: [Any deviations or clarifications]

### Verification Status
**OVERALL**: ✅ PASS / ❌ FAIL

### Next Steps
[What needs to be done next, if anything]
```

**Report Location**: 
- Output the report in chat for user review
- Optionally save to `.kiro/reports/task-[TaskID]-verification.md` if requested

**Output**: Verification report generated and presented

---

### Step 7: Commit Changes

**CRITICAL**: Only commit after verification report shows PASS status.

**Commit Message Format** (STRICTLY FOLLOW):

```
[TaskID] Brief description of what was implemented

- Implemented: [Key functionality]
- Files: [Main files changed]
- Tests: [Test status]
- Verified: [Verification status]

Related: [Requirement ID if applicable]
```

**Commit Command**:
```bash
git add .
git commit -m "[TaskID] Your commit message here"
```

**Examples**:
- ✅ CORRECT: `git commit -m "T001 Implement user login form\n\n- Implemented: Login form with validation\n- Files: src/pages/Login/index.tsx\n- Tests: 5/5 passed\n- Verified: All AC passed"`
- ❌ WRONG: `git commit -m "update code"` (too vague, missing task ID)
- ❌ WRONG: `git commit -m "fix bug"` (no context, missing task ID)

**Output**: Changes committed to local repository

---

### Step 8: Push to Remote

**ABSOLUTELY REQUIRED**: MUST use `--no-verify` flag when pushing.

**Push Command** (EXACTLY AS SHOWN):
```bash
git push origin [branch-name] --no-verify
```

**Why `--no-verify` is Required**:
- Bypasses pre-push hooks that may block automated workflows
- Ensures consistent behavior in CI/CD pipelines
- Prevents interactive prompts that block execution

**Examples**:
```bash
# ✅ CORRECT
git push origin feature/user-login --no-verify
git push origin main --no-verify

# ❌ WRONG - Missing --no-verify flag
git push origin feature/user-login
git push
```

**If push fails**:
1. Check network connectivity
2. Verify branch name is correct
3. Ensure you have push permissions
4. Pull latest changes if needed: `git pull origin [branch-name] --rebase`
5. Retry push with `--no-verify`

**Output**: Changes pushed to remote repository

---

### Workflow Summary

**MANDATORY EXECUTION ORDER** (NON-NEGOTIABLE):

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Understand Task                                     │
│ Output: Clear understanding of requirements                 │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Implement Functionality                             │
│ Output: Code files created/modified                         │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Write and Run Tests (NON-NEGOTIABLE)               │
│ ⚠️  GATE: ALL tests MUST PASS before proceeding            │
│ Output: All tests passing with documented results           │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Verify Task                                         │
│ Priority: Runtime > Build > Static                          │
│ Output: Verification results documented                     │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Requirements & Design Consistency Check             │
│ ⚠️  GATE: Major deviations MUST be resolved                │
│ Output: Consistency check results                           │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 6: Generate Verification Report                        │
│ ⚠️  GATE: Report MUST show PASS status                     │
│ Output: Structured verification report                      │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 7: Commit Changes                                      │
│ Format: [TaskID] Description + details                      │
│ Output: Changes committed to local repository               │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 8: Push to Remote (MANDATORY --no-verify)             │
│ Command: git push origin [branch] --no-verify              │
│ Output: Changes pushed to remote repository                 │
└─────────────────────────────────────────────────────────────┘
```

**ABSOLUTELY PROHIBITED**:
- ❌ Skipping any step in the workflow
- ❌ Changing the order of steps
- ❌ Proceeding with failed tests
- ❌ Committing without verification report
- ❌ Pushing without `--no-verify` flag
- ❌ Marking task complete with failed verification

## Progressive Development Implementation Steps

### 1. Confirm Current State
Check configuration file only contains already created components

### 2. Create New Component
Create component directory and necessary configuration files

### 3. Update Configuration
Add new component declaration in related configuration files

### 4. Verify Build
Run project's build command to ensure build success

## Common Problems and Mitigations

### Problem 1: Build Failure

**Manifestation**: Errors appear after executing build command, project cannot build successfully.

**Common Causes**:
- Component declaration inconsistent with actual structure
- Dependency relationship configuration error
- Language/framework version incompatible
- Code syntax error
- Missing imports or exports
- TypeScript type errors

**Mitigation Steps** (follow in order):
1. Read error message carefully - it usually points to the exact issue
2. Check whether component declaration matches actual file structure
3. Verify all imports use correct paths (relative vs absolute)
4. Confirm dependency versions are compatible
5. Run `npm run type-check` to isolate TypeScript errors
6. Review build logs to locate specific problem
7. If still failing after 3 attempts, document error and consult user

**Example Error Resolution**:
```
❌ Error: Cannot find module './components/UserForm'
✅ Fix: Check file exists at correct path, verify export statement
```

---

### Problem 2: Test Failures

**Manifestation**: Tests fail during execution, blocking progress to verification.

**Common Causes**:
- Implementation doesn't match test expectations
- Test setup/teardown issues
- Async timing problems
- Mock/stub configuration errors
- Environment-specific issues

**Mitigation Steps**:
1. Read test failure message and stack trace
2. Identify which test(s) are failing
3. Review test expectations vs actual implementation
4. Check test data and fixtures
5. Verify async operations are properly awaited
6. Run single failing test in isolation: `npm test -- -t "test name"`
7. Fix implementation or test (whichever is incorrect)
8. Re-run all tests to ensure no regressions

**NEVER**:
- ❌ Skip tests to "make progress"
- ❌ Comment out failing tests
- ❌ Proceed with failing tests

---

### Problem 3: Runtime Error

**Manifestation**: Build succeeds but runtime errors occur.

**Common Causes**:
- Configuration file format error
- External service connection configuration error
- Port occupied
- Resource files missing
- Environment variables not set
- API endpoint misconfigured

**Mitigation Steps**:
1. Check browser console for error messages
2. Verify configuration file format and content
3. Confirm environment variables are set correctly
4. Check external service connection configuration
5. Verify port is not occupied: `lsof -i :5173`
6. Ensure resource files exist in correct locations
7. Test API endpoints independently (e.g., with curl or Postman)

**Debugging Commands**:
```bash
# Check if port is in use
lsof -i :5173

# View environment variables
printenv | grep VITE_

# Test API endpoint
curl http://localhost:8080/api/v1/health
```

---

### Problem 4: Integration Issues

**Manifestation**: Individual components normal, but component collaboration has problems.

**Common Causes**:
- Component interface inconsistent
- Data format incompatible
- Boundary and responsibility division unclear
- Props/events not properly passed
- State management issues

**Mitigation Steps**:
1. Verify component interface consistency (props, events, return types)
2. Check data format compatibility between components
3. Review component boundaries and responsibilities
4. Add console.log to trace data flow
5. Write integration tests to verify collaboration
6. Use React DevTools to inspect component tree and props

---

### Problem 5: Verification Criteria Not Clear

**Manifestation**: Uncertain how to verify task completion.

**Mitigation Steps**:
1. Review task's acceptance criteria in tasks.md
2. Check related requirement in requirements.md
3. Choose verification method according to priority:
   - **First**: Can it be verified by running the app? → Runtime verification
   - **Second**: Is it a structural change? → Build verification
   - **Last**: Neither of above? → Static file check
4. If still uncertain, ask user: "How should I verify that [specific functionality] works correctly?"

---

### Problem 6: Git Push Failures

**Manifestation**: Push command fails or is blocked.

**Common Causes**:
- Network connectivity issues
- Authentication problems
- Branch protection rules
- Pre-push hooks blocking (if `--no-verify` not used)
- Diverged branches

**Mitigation Steps**:
1. Verify you're using `--no-verify` flag
2. Check network connectivity
3. Verify branch name is correct
4. Ensure you have push permissions
5. If branch diverged, pull and rebase:
   ```bash
   git pull origin [branch-name] --rebase
   git push origin [branch-name] --no-verify
   ```
6. If authentication fails, check credentials/tokens

**Common Push Errors**:
```bash
# ❌ Error: pre-push hook failed
# ✅ Fix: Use --no-verify flag

# ❌ Error: Updates were rejected (non-fast-forward)
# ✅ Fix: git pull --rebase then push again

# ❌ Error: Permission denied
# ✅ Fix: Check repository access permissions
```

---

### Problem 7: Consistency Check Failures

**Manifestation**: Implementation deviates from requirements or design.

**Deviation Types and Actions**:

**Minor Deviation** (doesn't affect core functionality):
- Document deviation reason and impact
- Assess whether adjustment needed
- If adjustment needed, create follow-up task
- Proceed with current task

**Major Deviation** (affects core functionality or architecture):
- **STOP immediately** - do not proceed
- Document deviation clearly
- Communicate with user: "Implementation deviates from [requirement/design] because [reason]. Should I: A) Correct implementation, B) Update requirement/design, C) Other?"
- Wait for user decision
- Re-verify after correction

**Reasonable Improvement** (deviation with good justification):
- Document deviation reason and benefits
- Update design document if needed
- Confirm with user: "I improved [aspect] by [change] because [reason]. This deviates from original design but provides [benefits]. Proceed?"
- Assess impact on subsequent tasks

## Task Completion Checklist

**CRITICAL**: Before marking task as complete, confirm ALL items below:

### Phase 1: Implementation Check
- [ ] Have fully understood task requirements and acceptance criteria
- [ ] Code implemented to correct location following project structure
- [ ] Related configuration files updated
- [ ] Component declarations consistent with actual directory structure
- [ ] Dependency relationships configured correctly
- [ ] Code meets quality standards (coding standards, error handling)

### Phase 2: Testing Check (NON-NEGOTIABLE)
- [ ] **Unit tests written for core business logic**
- [ ] **Property-based tests written with ≥100 iterations (if applicable)**
- [ ] **ALL tests executed and PASSED**
- [ ] **Test coverage meets project standards**
- [ ] **No test failures or errors**

### Phase 3: Verification Check
- [ ] **Project can build successfully (MANDATORY)**
- [ ] **No build errors or warnings**
- [ ] **If functionality can runtime verify, verified by running application**
- [ ] **If structural change, verified through build**
- [ ] **All acceptance criteria passed**

### Phase 4: Consistency Check (CRITICAL)
- [ ] **Found task-related requirement number**
- [ ] **Checked against requirements document, confirmed implementation meets all requirement acceptance criteria**
- [ ] **Checked against design document, confirmed implementation follows architecture and technical solution**
- [ ] **If deviation exists, recorded reason and assessed impact**
- [ ] **Major deviations communicated and confirmed with user**

### Phase 5: Documentation Check
- [ ] **Verification report generated with PASS status**
- [ ] **Report includes all required sections (Implementation, Tests, AC, Consistency)**
- [ ] Related documentation updated (if needed)

### Phase 6: Version Control Check (MANDATORY)
- [ ] **Changes committed with structured commit message including Task ID**
- [ ] **Commit message follows format: [TaskID] Description + details**
- [ ] **Changes pushed to remote repository**
- [ ] **Push command used `--no-verify` flag**
- [ ] **Push completed successfully**

## Key Benefits

Following task execution phase best practices can:

- ✅ Ensure project continuous healthy state
- ✅ Discover and solve problems early
- ✅ Improve code quality and maintainability
- ✅ Support team collaborative development
- ✅ Reduce integration and deployment risks
- ✅ Facilitate continuous integration and automated testing
- ✅ **Ensure implementation consistent with requirements and design**
- ✅ **Avoid accumulating technical debt and architecture deviation**
- ✅ **Maintain clear audit trail through structured reports**
- ✅ **Enable reliable version control and deployment**

---

## The Three Iron Rules (NON-NEGOTIABLE)

**RULE 1**: After each task completion, project MUST successfully build
- No exceptions
- Fix build errors immediately
- Never proceed to next task with broken build

**RULE 2**: After each task verification passes, MUST check consistency with requirements and design
- Compare implementation against requirements document
- Verify architecture compliance with design document
- Document any deviations with justification

**RULE 3**: MUST follow the complete workflow: Implement → Test → Verify → Report → Commit → Push
- Never skip testing phase
- Never skip verification report
- Never skip version control steps
- Always use `--no-verify` flag when pushing

---

## Quick Reference: Command Checklist

**For every task, execute these commands in order**:

```bash
# 1. After implementation
npm run build              # Verify build succeeds

# 2. Run tests
npm test                   # All tests must pass
npm run test:coverage      # Check coverage

# 3. Runtime verification (if applicable)
npm run dev                # Start dev server and test manually

# 4. After verification report shows PASS
git add .
git commit -m "[TaskID] Description\n\n- Implemented: ...\n- Files: ...\n- Tests: X/Y passed\n- Verified: All AC passed"

# 5. Push to remote (MUST use --no-verify)
git push origin [branch-name] --no-verify
```

**NEVER forget the `--no-verify` flag on push!**

---

## Examples: Good vs Bad Task Execution

### Example 1: Complete Task Execution (✅ CORRECT)

```
Task: T001 - Implement user login form

1. ✅ Understood requirements from requirements.md
2. ✅ Implemented LoginForm component in src/pages/Login/
3. ✅ Wrote 8 unit tests, all passing
4. ✅ Ran npm run build - SUCCESS
5. ✅ Started dev server, tested login flow manually - WORKS
6. ✅ Checked against requirements - all AC met
7. ✅ Generated verification report - PASS status
8. ✅ Committed: "T001 Implement user login form..."
9. ✅ Pushed: git push origin feature/login --no-verify

Result: Task complete, ready for next task
```

---

### Example 2: Incomplete Task Execution (❌ WRONG)

```
Task: T001 - Implement user login form

1. ✅ Implemented LoginForm component
2. ❌ Skipped writing tests (thought it was optional)
3. ❌ Didn't run build (assumed it would work)
4. ❌ Didn't verify manually (no time)
5. ❌ Didn't check requirements consistency
6. ❌ No verification report generated
7. ❌ Committed: "update code" (vague message, no task ID)
8. ❌ Pushed: git push (forgot --no-verify flag)

Result: Task incomplete, may have hidden bugs, poor audit trail
```

---

### Example 3: Handling Test Failures (✅ CORRECT)

```
Task: T002 - Add password validation

1. ✅ Implemented validation logic
2. ✅ Wrote tests
3. ❌ Tests failed: 3/5 passing
4. ✅ Read error messages carefully
5. ✅ Fixed validation logic bugs
6. ✅ Re-ran tests: 5/5 passing
7. ✅ Continued with verification
8. ✅ Generated report showing test fixes
9. ✅ Committed and pushed with --no-verify

Result: Tests caught bugs early, fixed before deployment
```

---

### Example 4: Handling Test Failures (❌ WRONG)

```
Task: T002 - Add password validation

1. ✅ Implemented validation logic
2. ✅ Wrote tests
3. ❌ Tests failed: 3/5 passing
4. ❌ Commented out failing tests
5. ❌ Proceeded with "passing" tests
6. ❌ Generated report claiming all tests pass
7. ❌ Committed broken code
8. ❌ Pushed to remote

Result: Bugs shipped to production, technical debt accumulated
```

---

### Example 5: Verification Report (✅ CORRECT FORMAT)

```markdown
## Task Verification Report

**Task ID**: T003
**Task Description**: Implement session timeout handling
**Verification Date**: 2025-11-29

### Implementation Summary
- Files created/modified:
  - src/contexts/AuthContext/index.tsx
  - src/utils/session.ts
  - src/hooks/useSessionTimeout.ts
- Key changes: Added automatic logout after 30 minutes of inactivity

### Test Results
- ✅ Unit tests: 12/12 passed
- ✅ Property tests: 2/2 passed (100 iterations each)
- ✅ Integration tests: 3/3 passed
- ✅ Build status: SUCCESS

### Acceptance Criteria Verification
- [x] AC1: User logged out after 30 min inactivity - ✅ PASS
- [x] AC2: Warning shown 5 min before timeout - ✅ PASS
- [x] AC3: User can extend session - ✅ PASS

### Requirements Consistency
- Related requirement: FR-004 (Session Management)
- Consistency status: ✅ CONSISTENT
- Notes: Implementation matches all requirement criteria

### Design Consistency
- Architecture compliance: ✅ YES (uses Context pattern as designed)
- Design pattern compliance: ✅ YES (follows session management design)
- Notes: No deviations from design document

### Verification Status
**OVERALL**: ✅ PASS

### Next Steps
Ready to proceed to T004 - Implement remember me functionality
```

---

### Example 6: Commit Message (✅ CORRECT FORMAT)

```bash
git commit -m "T003 Implement session timeout handling

- Implemented: Automatic logout after 30 min inactivity
- Files: AuthContext, session.ts, useSessionTimeout hook
- Tests: 17/17 passed (12 unit + 2 property + 3 integration)
- Verified: All AC passed, runtime tested

Related: FR-004"
```

---

### Example 7: Commit Message (❌ WRONG FORMATS)

```bash
# ❌ Too vague, no task ID
git commit -m "update code"

# ❌ No details, missing test info
git commit -m "T003 session timeout"

# ❌ No task ID, unclear what changed
git commit -m "fix bug in auth"

# ❌ Implementation details only, no verification info
git commit -m "Added useSessionTimeout hook with 30 min timer"
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: "I'll test it later"
**Problem**: Skipping tests to move faster
**Why it's bad**: Bugs accumulate, harder to debug later
**Correct approach**: Write and run tests immediately after implementation

### Anti-Pattern 2: "Build probably works"
**Problem**: Not running build command
**Why it's bad**: Integration issues discovered late
**Correct approach**: Run build after every task completion

### Anti-Pattern 3: "Close enough"
**Problem**: Marking task complete with minor issues
**Why it's bad**: Technical debt accumulates
**Correct approach**: Fix all issues before marking complete

### Anti-Pattern 4: "Quick commit"
**Problem**: Vague commit messages without task ID
**Why it's bad**: Poor audit trail, hard to track changes
**Correct approach**: Use structured commit message format

### Anti-Pattern 5: "Just push it"
**Problem**: Forgetting `--no-verify` flag
**Why it's bad**: Pre-push hooks may block automated workflows
**Correct approach**: Always use `--no-verify` flag

### Anti-Pattern 6: "I know what it means"
**Problem**: Not checking requirements/design documents
**Why it's bad**: Implementation may deviate from intent
**Correct approach**: Always verify against requirements and design

### Anti-Pattern 7: "No need for report"
**Problem**: Skipping verification report
**Why it's bad**: No documentation of what was verified
**Correct approach**: Always generate structured verification report

---

## Success Patterns

### Pattern 1: Test-Driven Mindset
- Write tests immediately after implementation
- Run tests frequently during development
- Fix failures immediately, never defer

### Pattern 2: Continuous Verification
- Build after every significant change
- Test runtime behavior frequently
- Catch issues early when they're easy to fix

### Pattern 3: Documentation Discipline
- Generate verification report for every task
- Use structured commit messages
- Maintain clear audit trail

### Pattern 4: Consistency Checking
- Always compare against requirements
- Verify design compliance
- Document any deviations with justification

### Pattern 5: Automation Friendly
- Always use `--no-verify` for pushes
- Follow consistent command patterns
- Enable CI/CD integration

---

## Final Reminders

**Before starting ANY task**:
- [ ] Read and understand the complete workflow
- [ ] Have requirements.md and design.md open for reference
- [ ] Prepare to follow all 8 steps in order

**During task execution**:
- [ ] Never skip steps
- [ ] Never proceed with failed tests
- [ ] Never commit without verification report
- [ ] Never push without `--no-verify`

**After task completion**:
- [ ] Verification report shows PASS
- [ ] All tests passing
- [ ] Build successful
- [ ] Changes committed with structured message
- [ ] Changes pushed to remote with `--no-verify`
- [ ] Ready to start next task

**Remember**: Quality over speed. A properly executed task is better than a rushed incomplete one.
