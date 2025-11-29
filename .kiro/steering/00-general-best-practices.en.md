---
inclusion: manual
---

# General Best Practices

This document defines universal principles and best practices that MUST be followed across all Spec development phases, applicable to any type of project.

## Language Usage Guidelines (NON-NEGOTIABLE)

**MANDATORY REQUIREMENT**: All conversations, documents, and communications MUST use Chinese unless explicitly exempted below.

**Scope of Application**:
- ✅ All conversations and communications with users
- ✅ Writing of requirement documents, design documents, and task documents
- ✅ Code comments and documentation
- ✅ Problem discussions and solution explanations
- ✅ Progress reports and summaries

**Exceptions** (ONLY these are allowed in English):
- ❌ Code itself (variable names, function names, class names, etc.)
- ❌ Technical terms (e.g., API, JSON, Maven, POM)
- ❌ EARS syntax keywords (THE, SHALL, WHEN, WHILE, IF, THEN, WHERE)
- ❌ Quoted content from referenced technical documentation and specifications

**Why It Matters**:
- Ensures clear and accurate communication, avoiding language barriers
- Improves document readability and comprehensibility
- Facilitates quick understanding and collaboration among team members
- Aligns with the language habits of the project team

## Why These Practices Are Needed

**CRITICAL CONCEPT**: LLMs are probabilistic models - single-pass generation WILL have biases. Through progressive development, multiple validations, and continuous feedback, output quality can be significantly improved and rework costs reduced.

## Three Core Principles (NON-NEGOTIABLE)

### 1. Progressive Development (MANDATORY)

**Key Concept**: Progress in phases, with each phase validated before moving to the next.

**Workflow** (STRICTLY FOLLOW THIS ORDER):
```
Requirements → Validation → Design → Validation → Task Breakdown → Validation → Execution
                    ↓              ↓                        ↓
              GATE: MUST PASS  GATE: MUST PASS      GATE: MUST PASS
```

**Why It Matters**:
- Discover issues early, reducing fix costs exponentially
- Avoid continuing development based on incorrect assumptions
- Ensure output quality at each phase

**Practice Points**:
- ✅ After completing requirements, self-check before entering design
- ✅ After completing design, validate before breaking down tasks
- ✅ After task breakdown, confirm before execution
- ❌ **NEVER** try to complete all phases at once
- ❌ **NEVER** skip validation gates

**Examples**:
- ✅ CORRECT: Complete requirements.md → Validate → Get user approval → Start design.md
- ❌ WRONG: Write requirements.md and design.md together (skips validation gate)
- ❌ WRONG: Start coding before tasks.md is validated

### 2. Continuous Validation (NON-NEGOTIABLE)

**Key Concept**: Multi-dimensional validation MUST be performed after completing each phase.

**Validation Dimensions** (CHECK ALL):
- [ ] **Consistency**: Is it consistent with the output of the previous phase?
- [ ] **Completeness**: Does it fully cover the requirements of the previous phase?
- [ ] **Accuracy**: Is the understanding and expression accurate?
- [ ] **Reasonableness**: Are there internal conflicts or over-engineering?

**Validation Methods** (EXECUTE IN ORDER):
1. **Self-check**: Review item by item against previous phase documents
2. **Cross-validation**: Check if internal parts are consistent
3. **User confirmation**: Critical decisions MUST be approved by users

**Validation Failure Handling**:
- **If minor issues found**: Fix immediately and re-validate
- **If major issues found**: STOP, report to user, get guidance before proceeding
- **If uncertain**: Mark with `[NEEDS CLARIFICATION: specific question]` and ask user

### 3. Proactive Communication (MANDATORY)

**Key Concept**: When encountering uncertainty, proactively communicate with users rather than making assumptions.

**ABSOLUTELY PROHIBITED**:
- ❌ Guessing user intent without confirmation
- ❌ Making critical technical decisions without user input
- ❌ Hiding problems or risks
- ❌ Proceeding with ambiguous requirements

**Situations REQUIRING Confirmation**:
- Requirements are unclear or ambiguous
- Multiple design options exist with different trade-offs
- Potential over-engineering is detected
- Task breakdown granularity is uncertain
- Technical implementation approaches require trade-offs
- Security or compliance implications exist

**Communication Format**:
```markdown
## Question: [Topic]

**Context**: [Quote relevant section]

**What we need to know**: [Specific question]

**Suggested Options**:
| Option | Description | Implications |
|--------|-------------|--------------|
| A      | [Option A]  | [Impact]     |
| B      | [Option B]  | [Impact]     |

**Recommended**: Option [X] - [Clear reasoning based on best practices]

**Your choice**: _[Wait for user response]_
```

**Communication Principles**:
- **Transparency**: Report progress and issues promptly
- **Specificity**: Clearly express questions with concrete options
- **Respect**: Take user feedback seriously, never argue
- **Efficiency**: Limit to 3 most critical questions per phase

## Quality Assurance Checklist (MANDATORY)

**GATE**: After completing each phase, ALL items below MUST pass before proceeding.

### Completeness Check (REQUIRED)
- [ ] Have all requirements been covered? (100% coverage required)
- [ ] Is there any missing content? (No gaps allowed)
- [ ] Have edge cases been considered? (List at least 3 edge cases)
- [ ] Are all user scenarios documented?

**If any item fails**: Document missing items with `[NEEDS CLARIFICATION: ...]` and ask user

### Consistency Check (REQUIRED)
- [ ] Is it consistent with previous phase outputs? (Cross-reference all sections)
- [ ] Are internal parts consistent with each other? (No contradictions)
- [ ] Is terminology and concept usage consistent? (Same term = same meaning throughout)
- [ ] Do all references point to existing sections?

**If terminology conflicts found**: Normalize term across document; add `(formerly referred to as "X")` if needed

### Accuracy Check (REQUIRED)
- [ ] Is the understanding of requirements accurate? (Verify against user input)
- [ ] Is the technical solution description accurate? (No vague terms like "properly", "efficiently")
- [ ] Are there any ambiguous or vague statements? (Mark with [NEEDS CLARIFICATION])
- [ ] Are all metrics quantified? (Use specific numbers, not "fast" or "many")

**Examples**:
- ✅ CORRECT: "System SHALL respond within 200ms for 95% of requests"
- ❌ WRONG: "System should be fast" (vague, not quantified)

### Feasibility Check (REQUIRED)
- [ ] Is the design implementable with available technology?
- [ ] Are the tasks executable within project constraints?
- [ ] Are validation criteria actionable and testable?
- [ ] Have dependencies been identified and documented?

**If feasibility uncertain**: List assumptions and get user confirmation

### Reasonableness Check (REQUIRED)
- [ ] Is there over-engineering? (Only implement what's needed NOW)
- [ ] Is there unnecessary complexity? (Simplest solution that works)
- [ ] Does it comply with project constraints and limitations?
- [ ] Are we using ≤3 frameworks/libraries? (Minimize dependencies)

**Anti-Over-Engineering Rules**:
- ❌ Don't build for "potential future needs"
- ❌ Don't add abstraction layers without concrete use cases
- ✅ Keep it simple, add complexity only when proven necessary

## Documentation Standards (STRICTLY ENFORCE)

**CRITICAL**: High-quality documentation is the foundation of success. ALL Spec documents MUST follow these standards.

### Clarity (MANDATORY)

**REQUIRED PATTERNS**:
- ✅ Use concise and clear language (prefer short sentences)
- ✅ Quantify all metrics (use numbers, not adjectives)
- ✅ Provide necessary context (quote relevant sections)
- ✅ Use concrete examples to illustrate abstract concepts

**ABSOLUTELY PROHIBITED**:
- ❌ Vague terms: "properly", "efficiently", "fast", "many", "some"
- ❌ Ambiguous expressions: "should work well", "might need", "possibly"
- ❌ Passive voice without actor: "will be handled" (by whom?)
- ❌ Undefined acronyms on first use

**Examples**:
- ✅ CORRECT: "System SHALL process 1000 requests/second with p95 latency <200ms"
- ❌ WRONG: "System should be fast and handle many requests efficiently"

### Structure (MANDATORY FORMAT)

**REQUIRED HIERARCHY**:
```markdown
# Document Title
## Major Section
### Subsection
#### Detail Level (max depth)

- Bullet points for lists
- [ ] Checkboxes for validation items
```

**Organization Rules**:
- ✅ Overview → Details (top-down structure)
- ✅ General → Specific (broad to narrow)
- ✅ Context → Requirements → Design → Tasks (phase order)
- ❌ **NEVER** mix abstraction levels in same section

**Format Consistency**:
- Use consistent heading styles
- Use consistent list formatting (all `-` or all `*`, not mixed)
- Use consistent terminology (same term throughout)
- Use consistent ID formats (FR-001, NFR-001, T001)

### Traceability (MANDATORY)

**REQUIRED LINKING**:
- Every design decision MUST reference requirement ID
- Every task MUST reference requirement ID and design section
- Every validation criterion MUST be testable

**Traceability Format**:
```markdown
**Related Requirements**: FR-001, FR-003
**Design Reference**: See "Architecture Overview" section
**Validation**: See acceptance criteria AC1-AC3
```

**Decision Recording**:
```markdown
## Decision: [Topic]
**Context**: [Why this decision was needed]
**Options Considered**: [List alternatives]
**Decision**: [What was chosen]
**Rationale**: [Why this option was selected]
**Implications**: [What this means for implementation]
```

## Common Pitfalls and Countermeasures

**CRITICAL**: Understanding common pitfalls can help you avoid repeating mistakes. These are REAL patterns that cause project failures.

### Pitfall 1: Premature Optimization (HIGH RISK)

**Manifestation**:
- ❌ Starting design when requirements are unclear
- ❌ Starting coding when design is incomplete
- ❌ Optimizing performance before functionality works

**Real Example**:
- ❌ WRONG: "Let's use microservices architecture for scalability" (when requirements show 100 users)
- ✅ CORRECT: "Let's use monolith first, split later if needed" (YAGNI principle)

**Consequences**:
- Developing based on incorrect assumptions → extensive rework
- Wasted effort on unused features
- Increased complexity without benefit

**Countermeasures** (MANDATORY):
1. **GATE CHECK**: Validate each phase before entering the next
2. **STOP SIGNAL**: If requirements unclear, mark `[NEEDS CLARIFICATION]` and ask user
3. **Priority**: Correctness → Functionality → Performance (in that order)

### Pitfall 2: Over-Engineering (CRITICAL)

**Manifestation**:
- ❌ Designing complex architectures for "potential future needs"
- ❌ Implementing features not in current requirements
- ❌ Adding abstraction layers without concrete use cases
- ❌ Using >3 frameworks/libraries when 1-2 would suffice

**Real Examples**:
- ❌ WRONG: "Let's add a plugin system for extensibility" (no plugins planned)
- ❌ WRONG: "Let's abstract the database layer for future NoSQL migration" (no migration planned)
- ✅ CORRECT: "Let's implement exactly what requirements specify, refactor later if needed"

**Consequences**:
- Increased complexity → harder to understand and maintain
- Extended development time → delayed delivery
- More bugs → more surface area for errors

**Countermeasures** (MANDATORY):
1. **YAGNI Rule**: You Aren't Gonna Need It - only implement what's needed NOW
2. **Simplicity Gate**: If design has >3 layers, justify each layer or simplify
3. **Feature Freeze**: Implement ONLY features in requirements.md, nothing extra

### Pitfall 3: Ignoring Validation (CRITICAL)

**Manifestation**:
- ❌ Skipping validation steps to "save time"
- ❌ Assuming everything is correct without checking
- ❌ Not running tests before marking task complete
- ❌ Not verifying against requirements

**Real Example**:
- ❌ WRONG: Complete 5 tasks → Push all at once → Discover integration issues
- ✅ CORRECT: Complete 1 task → Validate → Test → Push → Next task

**Consequences**:
- Problems accumulate to later stages
- Fix costs grow exponentially (10x more expensive to fix in production)
- Integration failures block entire team

**Countermeasures** (MANDATORY):
1. **Validation Gate**: ALL checklist items MUST pass before proceeding
2. **Test-First**: Write tests → Verify they fail → Implement → Verify they pass
3. **Build Verification**: Project MUST build successfully after each task
4. **Max 3 Iterations**: If validation fails 3 times, STOP and ask user

### Pitfall 4: Insufficient Communication (HIGH RISK)

**Manifestation**:
- ❌ Making assumptions about user intent without confirmation
- ❌ Hiding problems and risks to "avoid bothering user"
- ❌ Proceeding with ambiguous requirements
- ❌ Not reporting blockers promptly

**Real Examples**:
- ❌ WRONG: "User probably wants OAuth, I'll implement that" (user wanted simple login)
- ❌ WRONG: "This requirement is unclear, but I'll guess" (guess was wrong)
- ✅ CORRECT: "Requirement unclear, marking [NEEDS CLARIFICATION] and asking user"

**Consequences**:
- Understanding deviations → deliverables don't meet expectations
- Wasted effort implementing wrong features
- User frustration and loss of trust

**Countermeasures** (MANDATORY):
1. **Clarification Threshold**: If >20% uncertain, STOP and ask user
2. **Question Format**: Use structured format with options and recommendations
3. **Question Limit**: Max 3 questions per phase (prioritize by impact)
4. **Transparency**: Report progress and blockers in every phase

## Efficiency Improvement Strategies

### Strategy 1: Front-Load Investment to Avoid Rework

**Principle**: Spend 20% more time in requirements/design to save 80% rework time later.

**Concrete Actions**:
- ✅ Thoroughly validate requirements before design (use checklist)
- ✅ Get user approval on design before task breakdown
- ✅ Validate task breakdown before implementation
- ✅ Discover issues early when fix cost is 10x lower

**ROI Calculation**:
- Requirements phase bug: 1x cost to fix
- Design phase bug: 5x cost to fix
- Implementation phase bug: 10x cost to fix
- Production bug: 100x cost to fix

### Strategy 2: Reuse Experience and Patterns

**Principle**: Don't reinvent the wheel - use proven solutions.

**Concrete Actions**:
- ✅ Reference successful experiences from similar projects
- ✅ Use mature design patterns (MVC, Repository, Factory, etc.)
- ✅ Use established architectures (layered, microservices, etc.)
- ✅ Build reusable components and templates
- ❌ **NEVER** create custom solutions when standard ones exist

**Pattern Library**:
- Authentication: Use OAuth2/JWT (don't build custom)
- API Design: Use REST/GraphQL standards (don't invent protocol)
- Database: Use ORM patterns (don't write raw SQL everywhere)

### Strategy 3: Automate Validation

**Principle**: Automate repetitive checks to ensure consistency.

**Concrete Actions**:
- ✅ Use automated testing to validate functionality (unit, integration, e2e)
- ✅ Use continuous integration to discover issues early (build on every commit)
- ✅ Use code quality checking tools (linters, formatters, type checkers)
- ✅ Use property-based testing (minimum 100 iterations)

**Automation Checklist**:
- [ ] Unit tests run automatically on save
- [ ] Build runs automatically on commit
- [ ] Integration tests run automatically on PR
- [ ] Code quality checks block bad commits

## Risk Management (MANDATORY)

### Risk Identification (REQUIRED FOR EACH PHASE)

**Technical Risks** (Assess before design):
- [ ] Technology selection: Is this technology proven and stable?
- [ ] Implementation difficulty: Do we have expertise in this area?
- [ ] Performance bottlenecks: Have we identified potential bottlenecks?
- [ ] Integration complexity: How many external systems to integrate?

**Requirement Risks** (Assess during requirements):
- [ ] Requirement changes: How stable are requirements? (Mark volatile ones)
- [ ] Understanding deviations: Are there ambiguous requirements? (Use [NEEDS CLARIFICATION])
- [ ] Scope creep: Are we adding features not in original scope?
- [ ] Conflicting requirements: Do any requirements contradict each other?

**Schedule Risks** (Assess during task breakdown):
- [ ] Time estimation: Are estimates realistic? (Use historical data)
- [ ] Dependencies: Are there blocking dependencies? (Mark critical path)
- [ ] Resource constraints: Do we have necessary resources?
- [ ] External dependencies: Are we waiting on external teams/services?

### Risk Response Strategies (EXECUTE BASED ON SEVERITY)

**For HIGH-severity risks** (Could block project):
1. **STOP**: Don't proceed until risk is mitigated
2. **Escalate**: Report to user immediately
3. **Alternative Plan**: Develop backup approach
4. **Decision**: Get user approval on mitigation strategy

**For MEDIUM-severity risks** (Could delay project):
1. **Document**: Record risk in design document
2. **Monitor**: Set up early warning indicators
3. **Buffer**: Add 50% time buffer to affected tasks
4. **Contingency**: Prepare fallback options

**For LOW-severity risks** (Minor impact):
1. **Accept**: Document and proceed
2. **Monitor**: Check status in each phase
3. **Buffer**: Add 20% time buffer

**Risk Response Template**:
```markdown
## Risk: [Risk Description]
**Severity**: HIGH / MEDIUM / LOW
**Probability**: HIGH / MEDIUM / LOW
**Impact**: [What happens if risk materializes]
**Mitigation**: [How to prevent or reduce risk]
**Contingency**: [What to do if risk occurs]
**Owner**: [Who monitors this risk]
```

## Continuous Improvement

### Regular Reviews (AFTER EACH PHASE)

**Review Checklist**:
- [ ] What went well? (Document successful patterns)
- [ ] What went wrong? (Document failures and root causes)
- [ ] What took longer than expected? (Adjust future estimates)
- [ ] What was unclear? (Update documentation)
- [ ] What can be automated? (Identify automation opportunities)

**Review Output Format**:
```markdown
## Phase Review: [Phase Name]

**Successes**:
- [What worked well and why]

**Failures**:
- [What didn't work and root cause]

**Lessons Learned**:
- [Key takeaways for future phases]

**Action Items**:
- [ ] [Specific improvement to implement]
```

### Update Practices (CONTINUOUS)

**When to Update**:
- ✅ After discovering a better approach
- ✅ After encountering a new type of problem
- ✅ After user feedback on process
- ❌ **NEVER** change practices mid-phase (finish phase first)

**Update Process**:
1. Document current problem/limitation
2. Propose specific improvement
3. Get user approval for practice change
4. Update steering documents
5. Apply in next phase

### Cultivate Habits (DAILY PRACTICE)

**Validation Habit** (After every significant change):
- [ ] Did I check this against requirements?
- [ ] Did I run tests?
- [ ] Did I verify the build succeeds?
- [ ] Did I review my own work?

**Communication Habit** (When uncertain):
- [ ] Did I mark ambiguities with [NEEDS CLARIFICATION]?
- [ ] Did I ask user instead of guessing?
- [ ] Did I provide options with recommendations?
- [ ] Did I report blockers promptly?

**Documentation Habit** (Throughout development):
- [ ] Did I document key decisions?
- [ ] Did I update traceability links?
- [ ] Did I write clear commit messages?
- [ ] Did I generate verification reports?

## Uncertainty Handling (CRITICAL)

### When to Mark [NEEDS CLARIFICATION]

**MANDATORY MARKING** (Always mark these):
- ❌ Ambiguous requirements (multiple interpretations possible)
- ❌ Missing critical information (security, compliance, data handling)
- ❌ Conflicting requirements (contradictory statements)
- ❌ Undefined scope boundaries (what's in/out of scope)

**REASONABLE DEFAULTS** (Don't ask about these):
- ✅ Standard industry practices (e.g., HTTPS for web apps)
- ✅ Common patterns (e.g., REST API conventions)
- ✅ Technical implementation details (e.g., which library to use)
- ✅ Performance targets (e.g., <200ms response time for web)

**Clarification Format**:
```markdown
[NEEDS CLARIFICATION: Specific question with 2-3 options]

Example:
- Authentication method not specified
  [NEEDS CLARIFICATION: Use email/password, OAuth2 (Google/GitHub), or LDAP?]
```

**Clarification Limits**:
- **Maximum 3 clarifications per phase** (prioritize by impact)
- **Priority order**: Scope > Security > UX > Technical details
- **If >3 needed**: Keep top 3, make reasonable assumptions for rest

### Handling User Responses

**After user answers**:
1. ✅ Validate answer maps to one option
2. ✅ If ambiguous, ask for disambiguation (counts as same question)
3. ✅ Once clear, update document and remove [NEEDS CLARIFICATION] marker
4. ✅ Normalize terminology if user introduced new terms
5. ✅ Cross-check for consistency with other requirements

**Integration Pattern**:
- Replace ambiguous statement with clear answer
- Don't duplicate - remove old text when adding new
- Add `(formerly referred to as "X")` if terminology changed
- Update all related sections for consistency

## Quick Reference: Command Patterns

### Phase Transition Commands

**After Requirements Phase**:
```bash
# 1. Self-validate
- Run through Quality Assurance Checklist
- Mark [NEEDS CLARIFICATION] for ambiguities (max 3)

# 2. Get user approval
- Present requirements.md to user
- Ask clarification questions if any
- Get explicit "approved" or "proceed" signal

# 3. Proceed to design
- ONLY after user approval
- Reference requirements.md throughout design
```

**After Design Phase**:
```bash
# 1. Consistency check
- Verify all requirements covered in design
- Check no contradictions with requirements
- Validate technical feasibility

# 2. Get user approval
- Present design.md to user
- Explain key architectural decisions
- Get explicit approval

# 3. Proceed to tasks
- ONLY after user approval
- Break down design into executable tasks
```

**After Task Breakdown**:
```bash
# 1. Validate tasks
- Check all design elements have tasks
- Verify task order and dependencies
- Confirm tasks are executable

# 2. Get user approval
- Present tasks.md to user
- Explain task breakdown rationale
- Get explicit approval

# 3. Proceed to execution
- ONLY after user approval
- Follow task execution workflow strictly
```

## Summary

Following these general best practices can:
- ✅ Improve delivery quality (fewer bugs, better design)
- ✅ Reduce rework costs (10x savings by catching issues early)
- ✅ Enhance development efficiency (clear process, less confusion)
- ✅ Reduce communication costs (structured questions, clear answers)
- ✅ Accumulate reusable experience (documented patterns and lessons)

## The Three Pillars of Success (NON-NEGOTIABLE)

### Pillar 1: Progressive Development
**NEVER skip phases. NEVER skip validation gates.**
```
Requirements → GATE → Design → GATE → Tasks → GATE → Execution
```

### Pillar 2: Continuous Validation
**ALWAYS validate. ALWAYS use checklists. ALWAYS test.**
```
Implement → Test → Verify → Report → Commit → Push
```

### Pillar 3: Proactive Communication
**NEVER guess. ALWAYS ask. ALWAYS document.**
```
Uncertain? → Mark [NEEDS CLARIFICATION] → Ask user → Document answer
```

---

**Remember**: Quality over speed. A properly executed phase is better than a rushed incomplete one.

**Metaphor**: Think of Spec development as building a house:
- Requirements = Blueprint (get it right or rebuild everything)
- Design = Foundation (fix it now or pay 10x later)
- Tasks = Construction plan (clear steps prevent chaos)
- Execution = Building (follow the plan, validate each step)

**Final Rule**: When in doubt, STOP and ask the user. Never proceed with uncertainty.
