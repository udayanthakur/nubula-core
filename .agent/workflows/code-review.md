---
description: Code review process before merging changes
---

# Code Review Process

## Before Submitting Code

### Self-Review Checklist
// turbo
1. [ ] Code compiles without errors
2. [ ] No console.log statements left (except intentional)
3. [ ] Error handling is comprehensive
4. [ ] Functions have clear names and purpose
5. [ ] No hardcoded secrets or credentials
6. [ ] Comments explain "why", not "what"

### Testing
// turbo
1. [ ] Manually test the happy path
2. [ ] Test edge cases (empty input, invalid data)
3. [ ] Test error scenarios
4. [ ] Verify UI looks correct on different screen sizes

## Review Criteria

### Code Quality
- **Readability**: Can another developer understand this easily?
- **Simplicity**: Is there a simpler way to achieve this?
- **DRY**: Is code duplicated unnecessarily?
- **Performance**: Any obvious performance issues?

### Security
- **Input Validation**: Are all inputs validated?
- **Authentication**: Protected routes require auth?
- **Data Exposure**: Sensitive data protected?

### UI/UX
- **Consistency**: Matches existing design patterns?
- **Responsiveness**: Works on mobile?
- **Feedback**: User gets feedback for actions?

## Review Commands

```bash
# Check for lint issues
npm run lint

# Check for security vulnerabilities
npm audit

# Run tests (when available)
npm test

# Build to verify no compilation errors
npm run build
```

## Commit Message Format

```
<type>: <short description>

Types:
- feat: New feature
- fix: Bug fix
- refactor: Code change with no new feature
- style: CSS/formatting changes
- docs: Documentation
- security: Security improvement
```
