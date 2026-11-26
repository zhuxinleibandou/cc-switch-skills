---
name: tdd-workflow
description: Use when implementing with TDD or converting a PRD, requirements document, user story, or plan into behavior-focused test cases. Covers requirement traceability, unit/integration/E2E design, boundaries, state transitions, failures, and connected-device scenarios.
license: MIT
metadata:
  origin: ECC
  source: https://github.com/affaan-m/ECC/tree/main/.agents/skills/tdd-workflow
---

# Test-Driven Development Workflow

Use this workflow to turn a PRD, requirements document, user story, or implementation plan into behavior-focused test cases and then implement the smallest change that makes those tests pass.

## When to activate

- New feature or API endpoint
- Bug fix or regression
- Refactoring
- New component or user journey
- A PRD, acceptance-criteria document, or `*.plan.md` is provided

## Core principles

1. Tests come before implementation.
2. Test observable behavior through public interfaces, not implementation details.
3. Expected values must come from the requirement or an independent known-good example; never recompute them with the same algorithm as the implementation.
4. Cover happy paths, validation, boundaries, empty/null inputs, permissions, failures, retries, and external-service degradation where applicable.
5. Keep tests isolated and descriptive. Prefer semantic selectors in E2E tests.
6. Work in vertical slices: one RED test, minimal GREEN implementation, then refactor while tests remain green.
7. Aim for at least 80% branch, function, line, and statement coverage, but prioritize business-critical behavior over a vanity percentage.

## PRD/requirements to test cases

When the primary request is to generate or review test cases from a PRD or requirements document, read and apply [references/requirements-test-design.md](references/requirements-test-design.md) completely before producing the test matrix. It adds source hierarchy, state/interruption/UI matrices, connected-device coverage, and a final quality gate learned from real test-suite comparison.

When the input is a PRD or requirements document, do not jump directly to code. Extract and normalize:

1. Actors, roles, permissions, and preconditions.
2. User journeys in the form: `As a [role], I want to [action], so that [benefit]`.
3. Acceptance criteria and explicit business rules.
4. Input fields, valid ranges, defaults, state transitions, and invariants.
5. External dependencies, observable failure behavior, and non-functional constraints.
6. Ambiguities and missing acceptance criteria; mark them as questions or assumptions rather than inventing behavior.

For each journey or acceptance criterion, produce a test-case matrix before writing test code:

| ID | Requirement / behavior | Type | Preconditions | Input / action | Expected observable result | Priority | Notes |
|---|---|---|---|---|---|---|---|

At minimum, consider these scenario classes:

- Valid primary flow
- Alternate valid flow
- Required-field and format validation
- Empty, null, zero, minimum, maximum, and just-outside-boundary values
- Duplicate, conflicting, expired, or unauthorized state
- Dependency timeout, error, unavailable, and fallback behavior
- Retry/idempotency behavior when the requirement implies it
- Accessibility and critical UI feedback for user-facing flows

Then map cases to test levels:

- Unit: pure logic, validation, transformations, and component behavior.
- Integration: API contracts, persistence, queues, and service boundaries.
- E2E: only the critical end-to-end user journeys.

Do not create tests for unspecified behavior without labeling the assumption. Ask for clarification when the ambiguity changes the expected product outcome.

## TDD cycle

### Step 0: Detect the project test runner

Inspect the project package manager, `package.json` test scripts, lockfile, test files, and test configuration. Do not assume `npm test`. Resolve the actual commands for `<test>`, `<test-watch>`, `<coverage>`, and `<lint>` before the RED gate.

### Step 1: Write the test plan

Present the extracted user journeys, the test-case matrix, assumptions/questions, and a proposed unit/integration/E2E split. Prioritize critical paths and risky rules. Do not write all implementation tests in bulk.

### Step 2: RED

Choose the highest-value first behavior and write one focused failing test through the public interface. Run `<test>` and confirm the failure is caused by missing behavior, not a broken test setup.

### Step 3: GREEN

Implement only enough code to make that test pass. Run `<test>` again.

### Step 4: Repeat vertically

Add the next behavior as one test, run it to RED, implement the smallest change, and return to GREEN. Add edge and error cases as the behavior becomes concrete.

### Step 5: Refactor

After the relevant tests are green, remove duplication, improve names, deepen modules, and simplify interfaces. Run the tests after each refactor step. Never refactor while RED.

### Step 6: Verify

Run the full suite, coverage, lint/type checks, and the critical E2E journeys. Report failures, coverage gaps, assumptions, and any behavior not covered by the requirements.

## Test patterns

### Unit / component

Use Arrange-Act-Assert and one logical behavior per test. Assert what callers or users can observe, not private state or internal call order.

```typescript
describe('searchMarkets', () => {
  it('returns relevant markets for a valid query', async () => {
    const result = await searchMarkets('election')

    expect(result).toEqual([
      { slug: 'national-election', score: 0.95 },
    ])
  })

  it('returns an empty list for an empty query', async () => {
    expect(await searchMarkets('')).toEqual([])
  })
})
```

### Integration

Verify the public API or service contract: status, response shape, validation, persistence through the public interface, and error mapping. Avoid querying internal tables directly to prove an implementation detail.

### E2E

Cover critical user journeys with accessible roles, labels, text, or stable test IDs. Avoid brittle CSS selectors and arbitrary sleeps; wait for observable state.

```typescript
test('user can search and filter markets', async ({ page }) => {
  await page.goto('/markets')
  await page.getByRole('textbox', { name: 'Search markets' }).fill('election')
  await expect(page.getByTestId('market-card').first()).toContainText('election')
  await page.getByRole('button', { name: 'Active' }).click()
  await expect(page.getByTestId('market-card')).toHaveCount(3)
})
```

## Mocking and isolation

Mock external services at the boundary only when needed to control failures, cost, or nondeterminism. Do not mock the module under test or its internal collaborators merely to assert calls. Each test creates its own data and cleans up side effects.

## Output format for a PRD request

When the user asks to “通过 PRD 输出测试用例”, return:

1. Requirements summary and traceability IDs.
2. Assumptions and clarification questions.
3. A test-case matrix with ID, preconditions, steps, expected result, priority, and test level.
4. Coverage of happy path, alternate path, validation, boundary, error, permission, dependency, and accessibility scenarios as applicable.
5. A recommended first RED test and the next RED→GREEN slices.
6. Optional skeletons in the project’s actual test framework only after the matrix is agreed or the requirement is unambiguous.

## Quality checklist

- [ ] Every test maps to a requirement or explicitly labeled assumption.
- [ ] Test names describe behavior, not implementation.
- [ ] Expected results are independently derived from the PRD or examples.
- [ ] Critical happy path, error path, boundaries, permissions, and dependencies are covered.
- [ ] Unit, integration, and E2E levels are intentionally assigned.
- [ ] Tests are isolated and use public interfaces.
- [ ] RED was observed before implementation and GREEN after it.
- [ ] Coverage and full-suite results were verified.
