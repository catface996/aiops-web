---
inclusion: manual
---

# Task Planning Phase Best Practices

## Phase Goal

Break down the design solution into independently executable, verifiable specific tasks, ensuring each task has clear goals and acceptance criteria.

## Why Task Breakdown is So Important

Task breakdown is a critical step in transforming design into executable steps. Good task breakdown can:
- Improve development efficiency and quality
- Reduce coupling between tasks
- Support parallel development and incremental delivery
- Facilitate progress tracking and risk control
- Ensure deliverable verifiability

**Core Principles (NON-NEGOTIABLE)**:
1. Tasks MUST be both executable and verifiable
2. Each task MUST have clear acceptance criteria with verification method
3. Task descriptions MUST focus on "WHAT" not "HOW"
4. Task list MUST pass all verification gates before execution begins

## Phase 0: Pre-Planning Gates (MANDATORY)

**GATE: Must pass before creating task list**

### Simplicity Gate
- [ ] Is each task completable in 1-4 hours?
- [ ] Are there ≤20 tasks total? (If more, consider grouping or phasing)
- [ ] No over-engineering or premature optimization?

### Clarity Gate
- [ ] Have you fully understood the design document?
- [ ] Are all technical ambiguities resolved?
- [ ] Are dependency relationships clear?

**If any gate fails**: Stop and resolve issues before proceeding.

---

## Task Breakdown Workflow

### Step 1: Understand Design Solution

Before starting to break down tasks, fully understand the design document.

**Key Activities**:
- Read through design document, understand architecture and module division
- Identify core features and dependency relationships
- Mark technical difficulties and risk points
- List questions that need clarification

**Output**: Clear understanding of what needs to be built

---

### Step 2: Create Task List

Based on design document, transform design into executable task list.

**Task Breakdown Principles (NON-NEGOTIABLE)**:

#### 1. Single Responsibility (NON-NEGOTIABLE)
Each task MUST focus on only one clear goal.

**Examples**:
- ✅ CORRECT: "Create User authentication service"
- ❌ WRONG: "Create User service, add validation, setup database, configure logging" (multiple goals)

**Why Important**: Reduces complexity, enables independent verification, reduces coupling

---

#### 2. Independently Verifiable (MANDATORY)
Each task MUST be independently verifiable after completion.

**Examples**:
- ✅ CORRECT: "Implement login API - verify by calling endpoint and checking response"
- ❌ WRONG: "Add some login code" (no verification method)

**Why Important**: Discovers problems early, ensures quality, supports incremental delivery

---

#### 3. Clear Dependencies (REQUIRED)
Dependencies between tasks MUST be explicit. Circular dependencies are ABSOLUTELY PROHIBITED.

**Examples**:
- ✅ CORRECT: "Task 3 depends on Task 1 (database schema) and Task 2 (auth service)"
- ❌ WRONG: "Task 3 depends on Task 5, Task 5 depends on Task 3" (circular)

**Why Important**: Clarifies execution order, enables parallel development, facilitates progress tracking

---

#### 4. Incremental Delivery (REQUIRED)
Each completed task MUST move the project forward with visible results.

**Examples**:
- ✅ CORRECT: "Create login form - users can see and interact with form"
- ❌ WRONG: "Add variable declarations" (no visible progress)

**Why Important**: Continuously generates value, enables early feedback, reduces integration risk

---

### Step 3: Write Task Descriptions

Write clear descriptions and acceptance criteria for each task.

**Task Format (STRICTLY REQUIRED)**:

Every task MUST follow this exact format:

```markdown
- [ ] [TaskID] Task description focusing on WHAT not HOW
  - Key implementation points (optional, high-level only)
  - **Verification Method**: [Method] - Specific verification steps
  - _Requirements: [Requirement IDs]_
```

**Format Components**:
1. **Checkbox**: ALWAYS start with `- [ ]` (markdown checkbox)
2. **Task ID**: Simple numeric format (T001, T002, T003...) - NEVER use hierarchical (1.1, 2.1)
3. **Description**: Focus on WHAT to achieve, not HOW to implement
4. **Verification Method**: MUST specify method and concrete steps
5. **Requirements**: Link to requirement IDs for traceability

**Examples**:
- ✅ CORRECT: `- [ ] T001 Create user authentication service`
  - `Implement JWT-based authentication`
  - `**Verification Method**: 【Runtime】Start server, call /api/login endpoint, verify JWT token returned`
  - `_Requirements: FR-001, FR-002_`

- ❌ WRONG: `- [ ] 1.1 In src/services/auth.ts, add function authenticateUser(username, password) that calls bcrypt.compare()...` 
  - (Hierarchical ID, too detailed, reads like coding instructions)

---

**Task Content Requirements**:

#### 1. Task Description (REQUIRED)
- MUST clearly state what functionality to implement or what work to complete
- MUST describe "WHAT to do", NOT "HOW to do"
- MUST focus on goals and results, not implementation process

**Good vs Bad Examples**:
- ✅ GOOD: "Create user registration form with validation"
- ❌ BAD: "In src/pages/Register.tsx, add useState hooks for email and password, create handleSubmit function that calls axios.post()..."

---

#### 2. Preconditions (Optional)
- Conditions that must be met before task starts
- Which other tasks are depended upon
- What prerequisite resources or environment are needed

**Example**:
- "Depends on: T001 (Database schema), T002 (Auth service)"

---

#### 3. Acceptance Criteria (MANDATORY)
- MUST specify how to verify task is correctly completed
- MUST be specific, executable, testable
- MUST clearly specify verification method with 【Method】tag
- MUST sort by verification priority: 【Runtime】>【Unit Test】>【Build】>【Static】

**Verification Method Format (REQUIRED)**:
```
**Verification Method**: 【Method】Specific verification steps and expected results
```

---

### Step 4: Task List Verification (NON-NEGOTIABLE)

**CRITICAL**: After task list is created, NEVER start execution immediately. MUST conduct thorough verification.

**Verification Gates (ALL must pass)**:

#### Gate 1: Consistency with Requirements and Design
- [ ] Task list is consistent with requirements and design?
- [ ] NO tasks beyond design scope?
- [ ] Completely covers ALL content in design?
- [ ] NO missing features or modules?

**If fails**: Review design document, add missing tasks, remove out-of-scope tasks

---

#### Gate 2: Task Executability
- [ ] Each task's goal is clear and unambiguous?
- [ ] Task granularity appropriate (1-4 hours per task)?
- [ ] Dependency relationships between tasks are explicit?
- [ ] NO circular dependencies exist?
- [ ] Total task count ≤20? (If more, consider phasing)

**If fails**: Refine task descriptions, break down large tasks, resolve circular dependencies

---

#### Gate 3: Task Verifiability
- [ ] Each task has clear verification criteria?
- [ ] Verification criteria are specific and executable?
- [ ] Verification methods are operable?
- [ ] Verification priority clearly specified (【Runtime】>【Unit Test】>【Build】>【Static】)?
- [ ] Each verification method includes expected results?

**If fails**: Add specific verification steps, clarify expected outcomes

---

**Self-Check Prompt**:

Use this exact prompt for verification:

> "Please verify this task list against the following criteria:
> 1. Consistency: Does it match requirements and design? Any out-of-scope tasks?
> 2. Executability: Are goals clear? Is granularity 1-4 hours? Any circular dependencies?
> 3. Verifiability: Does each task have specific verification method with expected results?
> 
> For any failures, list specific issues and suggest corrections."

---

### Step 5: User Confirmation (MANDATORY)

**GATE: User MUST explicitly approve before execution begins**

Confirm task list with user, ensure consistent understanding.

**Must Confirm**:
- [ ] Task breakdown granularity is appropriate
- [ ] Task priority and order are reasonable
- [ ] NO missing or unnecessary tasks
- [ ] Acceptance criteria are clear and feasible
- [ ] Verification methods are practical

**Confirmation Format**:

Present task list summary to user:
```
## Task List Summary

**Total Tasks**: [N]
**Estimated Time**: [X] hours
**Key Milestones**: [List major deliverables]

**Task Breakdown**:
1. [Phase/Group 1]: Tasks T001-T005 (Foundation)
2. [Phase/Group 2]: Tasks T006-T010 (Core Features)
3. [Phase/Group 3]: Tasks T011-T015 (Integration)

**Dependencies**: [Highlight critical path]

**Ready to proceed?** (yes/no/revise)
```

**ONLY after user explicitly confirms with "yes" can task execution begin.**

---

## Acceptance Criteria Principles (NON-NEGOTIABLE)

**Core Requirement**: Each acceptance criterion MUST clearly mark verification method using 【Verification Method】tag.

**Verification Priority Hierarchy (STRICTLY FOLLOW)**:

```
┌─────────────────────────────────────────────────────────┐
│ 【Runtime Verification】 (Highest Priority)             │
│ If functionality can be tested by running the app       │
│ → MUST use runtime verification                         │
└────────────────────┬────────────────────────────────────┘
                     ↓ (If runtime not applicable)
┌─────────────────────────────────────────────────────────┐
│ 【Unit Test】 (Second Priority)                         │
│ If business logic or algorithms can be unit tested      │
│ → MUST write and run unit tests                         │
└────────────────────┬────────────────────────────────────┘
                     ↓ (If unit test not applicable)
┌─────────────────────────────────────────────────────────┐
│ 【Build Verification】 (Third Priority)                 │
│ If structural changes can be verified by building       │
│ → MUST verify through successful build                  │
└────────────────────┬────────────────────────────────────┘
                     ↓ (Last resort only)
┌─────────────────────────────────────────────────────────┐
│ 【Static Check】 (Last Resort)                          │
│ Only for file existence and configuration checks        │
│ → Use only when above methods don't apply               │
└─────────────────────────────────────────────────────────┘
```

---

### 1. 【Runtime Verification】(Highest Priority - PREFERRED)

**RULE**: Features that can be verified by actually running the application MUST be verified by running the application.

**Applicable Scenarios**:
- Configuration verification (multi-environment, feature toggles, etc.)
- API endpoint functionality verification
- Log output format verification
- Exception handling verification
- Integration functionality verification
- External service connection verification
- UI component rendering and interaction
- Authentication and authorization flows

**Verification Format (REQUIRED)**:
```
**Verification Method**: 【Runtime】
1. Start application: `npm run dev`
2. Navigate to [URL/page]
3. Perform [specific action]
4. Expected result: [specific observable outcome]
```

**Examples**:
- ✅ CORRECT: "【Runtime】Start dev server, navigate to /login, enter credentials, verify JWT token in response and redirect to dashboard"
- ❌ WRONG: "【Runtime】Check if login works" (not specific enough)

---

### 2. 【Unit Test】(Second Priority)

**RULE**: Business logic and algorithms MUST be verified through unit tests.

**Applicable Scenarios**:
- Service layer business logic
- Utility class methods
- Algorithm implementations
- Data transformation logic
- Validation functions

**Verification Format (REQUIRED)**:
```
**Verification Method**: 【Unit Test】
1. Run tests: `npm test [test-file]`
2. Verify all tests pass: [X/X tests]
3. Check coverage: ≥[Y]%
4. Expected: All assertions pass, no errors
```

**Examples**:
- ✅ CORRECT: "【Unit Test】Run `npm test auth.test.ts`, verify 8/8 tests pass, coverage ≥80%, all JWT validation assertions pass"
- ❌ WRONG: "【Unit Test】Test the auth function" (no specific test count or assertions)

---

### 3. 【Build Verification】(Third Priority)

**RULE**: For structural requirements that cannot be verified through runtime, verify through project build.

**Applicable Scenarios**:
- Module/component structure verification
- Dependency relationship verification
- Build configuration verification
- Code syntax correctness verification
- TypeScript type checking
- Import/export consistency

**Verification Format (REQUIRED)**:
```
**Verification Method**: 【Build】
1. Clean previous build: `rm -rf dist/`
2. Run build: `npm run build`
3. Expected: Build succeeds with no errors
4. Verify: [Specific build artifacts or outputs]
```

**Examples**:
- ✅ CORRECT: "【Build】Run `npm run build`, verify build succeeds with no TypeScript errors, check dist/ contains auth.js bundle"
- ❌ WRONG: "【Build】Make sure it builds" (no specific verification)

---

### 4. 【Static Check】(Last Resort - AVOID IF POSSIBLE)

**RULE**: Only use static file check when NONE of the above methods apply.

**Applicable Scenarios**:
- File existence check
- Configuration file content check
- Directory structure check

**Verification Format (REQUIRED)**:
```
**Verification Method**: 【Static】
1. Check file exists: `ls [file-path]`
2. Verify content contains: [specific content]
3. Expected: [specific file structure or content]
```

**Examples**:
- ✅ CORRECT: "【Static】Verify .env.development exists, contains VITE_API_BASE_URL=http://localhost:8080"
- ❌ WRONG: "【Static】Check if files are there" (not specific)

---

**Verification Method Selection Rules (MANDATORY)**:

1. **ALWAYS prefer higher-level verification methods**
2. **If can runtime verify → MUST use 【Runtime】**
3. **If can unit test → MUST use 【Unit Test】**
4. **If can build verify → MUST use 【Build】**
5. **Only use 【Static】as last resort**
6. **One task CAN include multiple verification methods** (e.g., 【Unit Test】+ 【Runtime】)

**ABSOLUTELY PROHIBITED**:
- ❌ Using 【Static】when 【Runtime】is possible
- ❌ Vague verification steps ("check if it works")
- ❌ Missing expected results
- ❌ No specific commands or actions

---

## Three Levels of Task Description

**Core Principle (NON-NEGOTIABLE)**: Task description MUST be "WHAT to do", NOT "HOW to do"

The goal of task breakdown is to transform design into executable objectives, not to write detailed coding instructions. Tasks should describe the result to be achieved, not step-by-step implementation details.

### Level 1: Goal Level (RECOMMENDED - Use for 90% of tasks)

**Characteristics**: Describe result to be achieved, not specific implementation steps

**Format**: `[Action Verb] + [What] + [Purpose/Context]`

**Examples**:
- ✅ EXCELLENT: "Create user authentication service with JWT support"
- ✅ EXCELLENT: "Implement password validation with strength indicator"
- ✅ EXCELLENT: "Configure multi-environment settings for dev/prod"

**Advantages**:
- Gives executor implementation freedom
- Focuses on results not process
- Avoids excessive detail
- Enables creative solutions

---

### Level 2: Step Level (USE CAUTIOUSLY - Only for complex tasks)

**Characteristics**: List main steps, but don't involve specific code details

**When to use**: Complex tasks requiring clear sub-steps for clarity

**Format**: 
```
[Goal]
- [High-level step 1]
- [High-level step 2]
- [High-level step 3]
```

**Examples**:
- ✅ ACCEPTABLE: "Create graph builder core functionality"
  - "Implement team graph building method"
  - "Implement supervisor graph building method"
  - "Create node and edge definition logic"

**Rules**:
- Steps MUST be high-level
- NEVER involve specific configuration items or code lines
- Stay at "what to do" level, not "how to do"

---

### Level 3: Detail Level (ABSOLUTELY PROHIBITED)

**Characteristics**: Details every configuration item, every line of code

**Why PROHIBITED**: This is coding instruction, not task description. No different from direct coding.

**Examples of PROHIBITED descriptions**:
- ❌ FORBIDDEN: "In src/services/auth.ts, add function authenticateUser(username: string, password: string) that calls bcrypt.compare() with await, then generates JWT using jsonwebtoken.sign() with secret from process.env.JWT_SECRET..."
- ❌ FORBIDDEN: "Add line 45: const token = jwt.sign({userId: user.id}, SECRET, {expiresIn: '24h'})"
- ❌ FORBIDDEN: "In config/database.ts line 12, change pool size from 10 to 20"

**Why these are wrong**:
- Removes all implementation freedom
- Reads like coding tutorial
- Prevents creative solutions
- Makes task unmaintainable

---

### Writing Acceptance Criteria (CRITICAL DISTINCTION)

**Important**: Acceptance criteria SHOULD be detailed, but focus on "HOW TO VERIFY", not "HOW TO IMPLEMENT"

**Acceptance Criteria Characteristics**:
- ✅ Executable verification steps
- ✅ Clear checkpoints
- ✅ Specific expected results
- ✅ Concrete commands to run

**Examples**:
- ✅ CORRECT: "【Runtime】Start server with `npm run dev`, call POST /api/login with test credentials, verify response contains JWT token and status 200"
- ❌ WRONG: "【Runtime】Check if login works" (too vague)

---

### Practical Writing Tips

#### Tip 1: Use Strong Action Verbs (REQUIRED)

**Recommended verbs**: Create, Implement, Configure, Build, Setup, Design, Develop

**Examples**:
- ✅ GOOD: "Create authentication middleware"
- ✅ GOOD: "Implement session timeout handling"
- ✅ GOOD: "Configure CORS policies"

---

#### Tip 2: Avoid Detail Verbs (PROHIBITED)

**Prohibited verbs**: Add (to specific file), Modify (specific line), Insert, Change (specific value)

**Examples**:
- ❌ BAD: "Add validatePassword function to utils/validator.ts"
- ✅ GOOD: "Create password validation utility"

---

#### Tip 3: Focus on "WHAT" Not "WHERE" (MANDATORY)

**Rule**: Task description should focus on WHAT to create, not WHERE to create it.

**Examples**:
- ✅ GOOD: "Create user registration form with validation"
- ❌ BAD: "In src/pages/Register/index.tsx, create registration form"

**Why**: The executor knows project structure and can decide optimal location.

---

#### Tip 4: Abstraction vs Specificity Balance (CRITICAL)

**RULE**: Task description stays abstract, acceptance criteria provides specific verification.

**Example**:

**Task Description** (Abstract):
```
- [ ] T005 Implement user session management
```

**Acceptance Criteria** (Specific):
```
**Verification Method**: 【Runtime】
1. Start server: `npm run dev`
2. Login with test user
3. Verify session cookie set with 30min expiry
4. Wait 30 minutes or manually expire session
5. Verify user redirected to login page
6. Expected: Session expires correctly, no errors in console
```

**See the difference?**
- Description: WHAT (session management)
- Criteria: HOW TO VERIFY (specific steps and expected results)

---

## Task Granularity Rules (MANDATORY)

### The Golden Rule: 1-4 Hours Per Task

**RULE**: Each task MUST be completable in 1-4 hours by a competent developer.

**Appropriate Task Granularity Checklist**:
- [ ] Can be completed in 1-4 hours?
- [ ] Has clear start and end points?
- [ ] Can be independently verified?
- [ ] Produces visible, demonstrable results?

**If all checked → Task granularity is appropriate**

---

### Task Too Large (PROHIBITED)

**Warning Signs**:
- ❌ Needs more than 4 hours to complete
- ❌ Contains multiple unrelated features
- ❌ Difficult to define acceptance criteria
- ❌ Description uses "and" multiple times
- ❌ Requires changes across many unrelated files

**Examples of TOO LARGE tasks**:
- ❌ BAD: "Implement complete user management system with authentication, authorization, profile management, and admin dashboard"
- ❌ BAD: "Create all API endpoints for the application"

**Solution (MANDATORY)**: Break into sub-tasks

**How to break down**:
1. Identify distinct features or components
2. Create separate task for each feature
3. Establish clear dependencies
4. Ensure each sub-task is independently verifiable

**Example breakdown**:
```
❌ Original (too large): "Implement user management system"

✅ Broken down:
- [ ] T001 Create user authentication service
- [ ] T002 Implement user authorization middleware  
- [ ] T003 Create user profile management API
- [ ] T004 Build admin user management UI
```

---

### Task Too Small (PROHIBITED)

**Warning Signs**:
- ❌ Only needs few minutes to complete
- ❌ Just one configuration item or line of code
- ❌ Cannot be independently verified
- ❌ No visible progress or deliverable
- ❌ Reads like a code snippet

**Examples of TOO SMALL tasks**:
- ❌ BAD: "Add import statement for axios"
- ❌ BAD: "Change port number to 3000"
- ❌ BAD: "Add console.log for debugging"

**Solution (MANDATORY)**: Merge into related tasks

**How to merge**:
1. Group related small changes together
2. Combine into a cohesive feature or component
3. Ensure merged task still meets 1-4 hour guideline
4. Maintain independent verifiability

**Example merging**:
```
❌ Original (too small):
- [ ] T001 Create .env file
- [ ] T002 Add API_URL to .env
- [ ] T003 Add PORT to .env
- [ ] T004 Load .env in main.ts

✅ Merged:
- [ ] T001 Configure environment variables for dev/prod
  - **Verification Method**: 【Runtime】Start app with different .env files, verify correct API URLs loaded
```

---

### Granularity Self-Check Questions

Before finalizing each task, ask:

1. **Time Check**: Can this be completed in 1-4 hours?
   - If <1 hour → Too small, merge with related tasks
   - If >4 hours → Too large, break into sub-tasks

2. **Clarity Check**: Can I explain this task in one sentence?
   - If yes → Good granularity
   - If need multiple sentences → Might be too large

3. **Verification Check**: Can I verify this independently?
   - If yes → Good granularity
   - If no → Too small or poorly defined

4. **Value Check**: Does this produce visible progress?
   - If yes → Good granularity
   - If no → Too small or wrong focus

---

## Common Problems and Solutions

### Problem 1: Task Granularity Issues

**Symptom**: Tasks are either too large (>4 hours) or too small (<1 hour)

**Root Cause**: Lack of clear understanding of task scope or over/under-decomposition

**Solution Steps**:
1. Review the 1-4 hour guideline
2. For large tasks: Identify distinct sub-features and break down
3. For small tasks: Group related changes into cohesive units
4. Verify each task produces visible, verifiable results

**Prevention**: Use the granularity self-check questions before finalizing tasks

---

### Problem 2: Task Description Too Detailed (Coding Instructions)

**Symptom**: Task reads like step-by-step coding tutorial with file paths, function names, specific code

**Examples**:
- ❌ "In src/services/auth.ts, add function authenticateUser(username, password) that calls bcrypt.compare()..."
- ❌ "On line 45 of config.ts, change timeout from 3000 to 5000"

**Root Cause**: Confusing task planning with implementation instructions

**Solution Steps**:
1. Remove all file paths and line numbers from description
2. Remove specific function names and code snippets
3. Focus on WHAT to achieve, not HOW to implement
4. Move specific details to acceptance criteria (for verification only)

**Correct Approach**:
- ✅ "Create user authentication service with password validation"
- ✅ "Configure request timeout settings"

**Prevention**: Ask "Am I describing a goal or writing code?" If writing code, you're too detailed.

---

### Problem 3: Vague Acceptance Criteria

**Symptom**: Cannot determine if task is complete, verification steps unclear

**Examples**:
- ❌ "Make sure login works"
- ❌ "Check if everything is correct"
- ❌ "Test the feature"

**Root Cause**: Lack of specific, executable verification steps

**Solution Steps**:
1. Add 【Verification Method】tag (Runtime/Unit Test/Build/Static)
2. List specific commands to run
3. Define expected observable results
4. Include pass/fail criteria

**Correct Approach**:
```
**Verification Method**: 【Runtime】
1. Start server: `npm run dev`
2. Navigate to http://localhost:5173/login
3. Enter test credentials (user: test@example.com, pass: Test123!)
4. Expected: JWT token in response, redirect to /dashboard, no console errors
```

**Prevention**: Every acceptance criterion must answer "How do I verify this works?"

---

### Problem 4: Circular Dependencies

**Symptom**: Task A depends on Task B, Task B depends on Task A (or longer cycles)

**Examples**:
- ❌ "T003 depends on T005, T005 depends on T003"
- ❌ "T001 → T002 → T003 → T001"

**Root Cause**: Poor task decomposition or unclear dependency analysis

**Solution Steps**:
1. Draw dependency graph to visualize relationships
2. Identify circular dependencies
3. Break circular tasks into smaller, independent units
4. Reorder tasks to establish clear execution sequence

**Prevention**: After creating task list, explicitly map dependencies and check for cycles

---

### Problem 5: Missing Verification Methods

**Symptom**: Tasks lack 【Verification Method】tags or have no verification steps

**Root Cause**: Focusing only on implementation, ignoring verification

**Solution Steps**:
1. Review each task's acceptance criteria
2. Add 【Verification Method】tag to every task
3. Choose appropriate method: Runtime > Unit Test > Build > Static
4. Provide specific verification commands and expected results

**Prevention**: Make verification method a required field in task template

---

### Problem 6: Tasks Beyond Design Scope

**Symptom**: Task list includes features not mentioned in design document

**Root Cause**: Scope creep during task breakdown

**Solution Steps**:
1. Compare task list against design document section by section
2. Mark tasks that don't map to design requirements
3. Either remove out-of-scope tasks or update design document first
4. Get user confirmation before adding new scope

**Prevention**: Use Gate 1 verification (Consistency with Requirements and Design)

---

### Problem 7: Inconsistent Task Numbering

**Symptom**: Mix of simple (T001) and hierarchical (T1.1, T2.3) numbering

**Examples**:
- ❌ "T1.1 Create service" (hierarchical - breaks Kiro execution)
- ❌ "Task-001" (wrong format)

**Root Cause**: Not following task ID format standard

**Solution Steps**:
1. Use ONLY simple numeric format: T001, T002, T003...
2. Never use hierarchical: T1.1, T2.1, etc.
3. Sequential numbering in execution order
4. Verify all task IDs follow format

**Correct Format**:
- ✅ `- [ ] T001 Create authentication service`
- ✅ `- [ ] T002 Implement authorization middleware`

**Prevention**: Use task format template and verify before finalization

---

## Task Planning Completion Checklist (MANDATORY)

**CRITICAL**: Before starting task execution, ALL items below MUST be checked and confirmed.

### Phase 0: Pre-Planning Gates
- [ ] **Simplicity Gate**: Each task completable in 1-4 hours?
- [ ] **Simplicity Gate**: Total tasks ≤20? (If more, phased approach planned?)
- [ ] **Simplicity Gate**: No over-engineering or premature optimization?
- [ ] **Clarity Gate**: Fully understood design document?
- [ ] **Clarity Gate**: All technical ambiguities resolved?
- [ ] **Clarity Gate**: Dependency relationships clear?

### Phase 1: Task Creation
- [ ] **Task Format**: Every task uses required format with checkbox, ID, description?
- [ ] **Task ID**: All IDs use simple numeric format (T001, T002...), NO hierarchical (1.1, 2.1)?
- [ ] **Task Description**: Each task describes "WHAT to do", NOT "HOW to do"?
- [ ] **Task Description**: No file paths, line numbers, or code snippets in descriptions?
- [ ] **Task Granularity**: Each task completable in 1-4 hours?
- [ ] **Single Responsibility**: Each task focuses on ONE clear goal?
- [ ] **Incremental Value**: Each task produces visible, demonstrable results?

### Phase 2: Acceptance Criteria
- [ ] **Verification Method**: Every task has 【Verification Method】tag?
- [ ] **Verification Priority**: Methods follow priority (Runtime > Unit Test > Build > Static)?
- [ ] **Verification Steps**: Each method includes specific commands to run?
- [ ] **Expected Results**: Each method defines observable expected outcomes?
- [ ] **Verification Completeness**: Can someone else verify the task using only the criteria?

### Phase 3: Dependencies
- [ ] **Explicit Dependencies**: All task dependencies clearly stated?
- [ ] **No Circular Dependencies**: Verified no circular dependency chains exist?
- [ ] **Execution Order**: Tasks numbered in logical execution sequence?
- [ ] **Parallel Opportunities**: Identified tasks that can run in parallel?

### Phase 4: Verification Gates
- [ ] **Gate 1 - Consistency**: Task list matches requirements and design?
- [ ] **Gate 1 - Consistency**: NO tasks beyond design scope?
- [ ] **Gate 1 - Consistency**: ALL design content covered?
- [ ] **Gate 2 - Executability**: Each task goal clear and unambiguous?
- [ ] **Gate 2 - Executability**: Task granularity appropriate (1-4 hours)?
- [ ] **Gate 2 - Executability**: NO circular dependencies?
- [ ] **Gate 3 - Verifiability**: Each task has clear verification criteria?
- [ ] **Gate 3 - Verifiability**: Verification methods are operable?
- [ ] **Gate 3 - Verifiability**: Expected results clearly defined?

### Phase 5: Requirements Traceability
- [ ] **Traceability**: Each task linked to requirement IDs using `_Requirements:_`?
- [ ] **Coverage**: All requirements have corresponding tasks?
- [ ] **No Orphans**: No tasks without requirement linkage?

### Phase 6: User Confirmation
- [ ] **Summary Presented**: Task list summary shown to user?
- [ ] **User Review**: User has reviewed task breakdown?
- [ ] **User Approval**: User explicitly confirmed with "yes"?
- [ ] **Concerns Addressed**: All user concerns or questions resolved?

---

**GATE CHECK**: If ANY item above is unchecked, DO NOT proceed to execution. Resolve issues first.

**ONLY after ALL items are checked can task execution begin.**

## Excellent Task Example

Below is a task example that conforms to best practices, demonstrating standard task format:

### Example: Create Graph Builder Core Functionality

**Task Description**:
- [x] 4. Create Graph Builder Core Functionality
  - Write GraphBuilder class using LangGraph technology to build collaboration graph
  - Implement team graph and supervisor graph building methods
  - Create node and edge definition logic
  - **Verification Method**: Test graph building success, verify node and edge correctness, check LangGraph compilation no errors
  - _Requirements: 1.1, 4.3_

**Example Analysis**:

1. **Task ID Clear**: Use simple numeric numbering (4.) for easy reference and tracking
2. **Goal Clear**: Create graph builder core functionality
3. **Key Points Listed**:
   - Use LangGraph technology to build collaboration graph
   - Implement team graph and supervisor graph building methods
   - Create node and edge definition logic
4. **Verification Method Clear**:
   - Test graph building success
   - Verify node and edge correctness
   - Check LangGraph compilation no errors
5. **Requirement Traceability**: Clearly associated with requirements 1.1 and 4.3

**Format Key Points**:
- Use `- [x]` or `- [ ]` to mark task status
- **Task numbering must use simple numeric format (like 1., 2., 3.), prohibited to use hierarchical format (like 1.1, 2.1, 3.1)**
- Key implementation points listed as sub-items
- **Verification Method** marked in bold, clearly explain how to verify
- Use `_Requirements:_` to mark requirement traceability relationship

**Task Numbering Standard**:
- ✅ **Correct Format**: `- [ ] 1. Create Maven Parent Project`
- ❌ **Wrong Format**: `- [ ] 1.1 Create Maven Parent Project`
- **Reason**: Kiro's task execution function requires simple numeric numbering, hierarchical numbering will cause execute button not to display

**Why This is Good Task**:
- ✅ Describes "what to do" not "how to do"
- ✅ Goal clear, scope explicit
- ✅ Verification criteria specific and executable
- ✅ Granularity appropriate (estimated 2-3 hours)
- ✅ Can be independently verified
- ✅ Traceable to requirements

---

## The Five Golden Rules (NON-NEGOTIABLE)

**RULE 1: Abstract Descriptions, Specific Verification**
- Task descriptions MUST be abstract (WHAT to achieve)
- Acceptance criteria MUST be specific (HOW to verify)
- Never confuse the two

**RULE 2: No Coding Instructions**
- Tasks are goals, not implementation tutorials
- No file paths, line numbers, or code snippets in descriptions
- If it reads like code, it's too detailed

**RULE 3: 1-4 Hour Granularity**
- Every task MUST be completable in 1-4 hours
- Too large → Break down
- Too small → Merge
- No exceptions

**RULE 4: Verification Method Required**
- Every task MUST have 【Verification Method】tag
- Follow priority: Runtime > Unit Test > Build > Static
- Include specific commands and expected results
- No vague criteria like "check if it works"

**RULE 5: User Approval Required**
- Task list MUST pass all verification gates
- User MUST explicitly approve with "yes"
- No execution without approval
- No exceptions

---

## Quick Reference: Task Format Template

Use this template for every task:

```markdown
- [ ] T[###] [Action Verb] [What to achieve] [Purpose/Context]
  - [Optional: High-level implementation point 1]
  - [Optional: High-level implementation point 2]
  - **Verification Method**: 【Method】
    1. [Specific command or action]
    2. [Specific command or action]
    3. Expected: [Observable result]
  - _Requirements: [Requirement IDs]_
```

**Example**:
```markdown
- [ ] T001 Create user authentication service with JWT support
  - Implement login and logout functionality
  - Handle token generation and validation
  - **Verification Method**: 【Runtime】
    1. Start server: `npm run dev`
    2. POST to /api/login with test credentials
    3. Expected: JWT token in response, status 200, no errors
  - _Requirements: FR-001, FR-002_
```

---

## Anti-Patterns to Avoid (ABSOLUTELY PROHIBITED)

### Anti-Pattern 1: "Coding Tutorial Tasks"
❌ **WRONG**: "In src/services/auth.ts, create function authenticateUser(username: string, password: string) that uses bcrypt.compare() to validate password, then calls jwt.sign() with process.env.JWT_SECRET..."

✅ **CORRECT**: "Create user authentication service with password validation and JWT token generation"

---

### Anti-Pattern 2: "Vague Verification"
❌ **WRONG**: "Make sure login works properly"

✅ **CORRECT**: "【Runtime】Start dev server, call POST /api/login with test credentials, verify JWT token returned and status 200"

---

### Anti-Pattern 3: "Mega Tasks"
❌ **WRONG**: "Implement complete user management system with authentication, authorization, profile management, admin dashboard, and audit logging"

✅ **CORRECT**: Break into 5-6 separate tasks, each 1-4 hours

---

### Anti-Pattern 4: "Micro Tasks"
❌ **WRONG**: "Add import statement for axios"

✅ **CORRECT**: Merge into larger task like "Configure HTTP client with interceptors"

---

### Anti-Pattern 5: "Missing Verification Method"
❌ **WRONG**: Task with no 【Verification Method】tag

✅ **CORRECT**: Every task has specific verification method with commands and expected results

---

## Success Metrics

A well-planned task list demonstrates:

✅ **Clarity**: Anyone can understand what needs to be done
✅ **Executability**: Each task has clear start and end points
✅ **Verifiability**: Each task can be independently verified
✅ **Traceability**: Each task links to requirements
✅ **Completeness**: All design content covered, no scope gaps
✅ **Consistency**: No tasks beyond design scope
✅ **Granularity**: All tasks 1-4 hours, no exceptions
✅ **Dependencies**: Clear execution order, no circular dependencies

---

## Key Benefits

Following task planning best practices delivers:

- ✅ **Reduced Risk**: Clear verification catches issues early
- ✅ **Improved Efficiency**: Proper granularity enables steady progress
- ✅ **Better Quality**: Independent verification ensures each task works
- ✅ **Easier Tracking**: Clear tasks enable accurate progress monitoring
- ✅ **Parallel Development**: Explicit dependencies enable concurrent work
- ✅ **Incremental Delivery**: Each task produces visible value
- ✅ **Clear Communication**: Standardized format reduces misunderstandings
- ✅ **Maintainability**: Abstract descriptions remain valid as implementation evolves

---

## Final Reminder

**Remember**: Tasks are goal guidance for developers, not coding instructions for AI.

**The Test**: If your task description reads like you're writing code, it's too detailed. Step back and focus on WHAT, not HOW.

**The Goal**: Enable competent developers to implement creatively while ensuring verifiable, consistent results.

**The Standard**: Every task passes all gates, has clear verification, and receives user approval before execution begins.
