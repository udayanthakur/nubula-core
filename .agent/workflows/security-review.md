---
description: Security review checklist for Nebula Core
---

# Security Review Checklist

Run this checklist before any major deployment or after adding new features.

## Authentication & Authorization
// turbo
- [ ] JWTs are validated on all protected routes
- [ ] Passwords are hashed with bcrypt (cost factor >= 10)
- [ ] Session tokens expire appropriately
- [ ] Logout properly invalidates sessions
- [ ] SIWE nonces are single-use and time-limited

## Input Validation
// turbo
- [ ] All user inputs are validated and sanitized
- [ ] SQL queries use parameterized statements
- [ ] File paths are validated (no path traversal)
- [ ] Request body size is limited

## Web Security
// turbo
- [ ] XSS protection (no innerHTML with user data)
- [ ] CSRF tokens for state-changing operations
- [ ] Content-Security-Policy headers
- [ ] CORS is configured correctly
- [ ] Sensitive data not logged

## Rate Limiting
// turbo
- [ ] Auth endpoints rate limited (login, signup)
- [ ] API endpoints rate limited
- [ ] IP-based blocking for suspicious activity

## Sensitive Data
// turbo
- [ ] No secrets in code/git
- [ ] Environment variables for sensitive config
- [ ] Database backups encrypted
- [ ] HTTPS enforced in production

## Web3 Specific
// turbo
- [ ] Wallet addresses validated (checksum)
- [ ] Chain IDs validated against allowed list
- [ ] RPC endpoints are trusted
- [ ] SIWE message verified server-side

## Run Security Scan
```bash
# Check for known vulnerabilities
npm audit

# Check for secrets in code
git log --all --full-history -- "*.env" "*.key" "*.pem"
```
