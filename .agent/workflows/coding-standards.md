---
description: How to follow coding standards for Nebula Core
---

# Nebula Core Coding Standards

## JavaScript/Node.js

### File Structure
- Use lowercase with hyphens for filenames: `wallet-modal.js`
- Group related files in directories: `routes/`, `public/js/`, `config/`

### Code Style
// turbo-all
1. Use `const` by default, `let` when reassignment needed
2. Use arrow functions for callbacks
3. Use async/await over Promises
4. Add JSDoc comments for functions

### Example
```javascript
/**
 * Fetch balance for a given address on a chain
 * @param {string} address - Wallet address
 * @param {number} chainId - Chain ID
 * @returns {Promise<string>} Balance in native units
 */
async function getBalance(address, chainId) {
  const chain = CHAINS[chainId];
  if (!chain) throw new Error(`Unsupported chain: ${chainId}`);
  // implementation...
}
```

## HTML/CSS

### HTML
- Use semantic elements: `<main>`, `<section>`, `<article>`
- Add unique IDs for interactive elements
- Use lowercase with hyphens for classes: `wallet-modal-header`

### CSS
- Use CSS custom properties for theming
- Mobile-first responsive design
- Prefer flexbox/grid over floats
- Group styles by component

## Error Handling
- Always wrap async operations in try/catch
- Log errors with context
- Show user-friendly error messages
- Never expose stack traces to users

## Security
- Sanitize all user inputs
- Use parameterized queries (no string concatenation for SQL)
- Validate JWTs on every protected route
- Rate limit authentication endpoints
