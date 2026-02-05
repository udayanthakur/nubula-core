---
description: Testing requirements and procedures for Nebula Core
---

# Testing Requirements

## Test Types

### 1. Manual Testing Checklist

#### Authentication Flow
// turbo
- [ ] Sign up with new account
- [ ] Log in with existing account
- [ ] Log out clears session
- [ ] Protected routes redirect when not logged in
- [ ] Wallet connection works (MetaMask)
- [ ] SIWE authentication works

#### Dashboard
// turbo
- [ ] Profile displays correctly
- [ ] All 9 chain cards visible
- [ ] Wallet connect button works
- [ ] Balance loading works
- [ ] Chain switching works
- [ ] Quick actions show appropriate feedback

#### Security
// turbo
- [ ] Rate limiting blocks repeated requests
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] Invalid tokens rejected

### 2. Browser Testing
// turbo
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

### 3. Responsive Testing
// turbo
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1280px)
- [ ] Large Desktop (1920px)

## API Testing

### Auth Endpoints
```bash
# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test1234!"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234!"}'

# Test SIWE nonce
curl http://localhost:3000/api/auth/siwe/nonce
```

## Pre-Deployment Checklist
// turbo
- [ ] All manual tests pass
- [ ] No console errors in browser
- [ ] Server starts without errors
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] npm audit shows no critical issues
