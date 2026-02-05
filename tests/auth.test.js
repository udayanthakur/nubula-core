/**
 * Nebula Core - Authentication Tests
 * Run with: npm test
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
let testToken = null;
const testEmail = `test_${Date.now()}@example.com`;

// Test utilities
function test(name, fn) {
    return { name, fn };
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function httpRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const reqOptions = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        const req = http.request(reqOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(data),
                    });
                } catch {
                    resolve({ status: res.statusCode, data });
                }
            });
        });

        req.on('error', reject);

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        req.end();
    });
}

// Test cases
const tests = [
    test('Signup - should create new user', async () => {
        const res = await httpRequest('/api/auth/signup', {
            method: 'POST',
            body: {
                name: 'Test User',
                email: testEmail,
                password: 'TestPassword123!',
            },
        });
        assert(res.status === 201, `Expected 201, got ${res.status}`);
        assert(res.data.token, 'Should return token');
        testToken = res.data.token;
    }),

    test('Signup - should reject duplicate email', async () => {
        const res = await httpRequest('/api/auth/signup', {
            method: 'POST',
            body: {
                name: 'Test User',
                email: testEmail,
                password: 'TestPassword123!',
            },
        });
        assert(res.status === 409, `Expected 409, got ${res.status}`);
    }),

    test('Signup - should reject short password', async () => {
        const res = await httpRequest('/api/auth/signup', {
            method: 'POST',
            body: {
                name: 'Test',
                email: 'short@test.com',
                password: 'short',
            },
        });
        assert(res.status === 400, `Expected 400, got ${res.status}`);
    }),

    test('Login - should authenticate valid user', async () => {
        const res = await httpRequest('/api/auth/login', {
            method: 'POST',
            body: {
                email: testEmail,
                password: 'TestPassword123!',
            },
        });
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        assert(res.data.token, 'Should return token');
    }),

    test('Login - should reject wrong password', async () => {
        const res = await httpRequest('/api/auth/login', {
            method: 'POST',
            body: {
                email: testEmail,
                password: 'WrongPassword123!',
            },
        });
        assert(res.status === 401, `Expected 401, got ${res.status}`);
    }),

    test('Login - should reject non-existent user', async () => {
        const res = await httpRequest('/api/auth/login', {
            method: 'POST',
            body: {
                email: 'nonexistent@test.com',
                password: 'TestPassword123!',
            },
        });
        assert(res.status === 401, `Expected 401, got ${res.status}`);
    }),

    test('Token Verify - should validate valid token', async () => {
        const res = await httpRequest(`/api/auth/verify?token=${testToken}`);
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        assert(res.data.valid === true, 'Token should be valid');
    }),

    test('Token Verify - should reject invalid token', async () => {
        const res = await httpRequest('/api/auth/verify?token=invalid-token');
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        assert(res.data.valid === false, 'Token should be invalid');
    }),

    test('SIWE Nonce - should return nonce', async () => {
        const res = await httpRequest('/api/auth/siwe/nonce');
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        assert(res.data.nonce, 'Should return nonce');
    }),

    test('Dashboard - should load', async () => {
        const res = await httpRequest('/dashboard');
        assert(res.status === 200, `Expected 200, got ${res.status}`);
    }),
];

// Run tests
async function runTests() {
    console.log('\n🧪 Running Nebula Core Auth Tests\n');
    console.log('='.repeat(50) + '\n');

    let passed = 0;
    let failed = 0;

    for (const { name, fn } of tests) {
        try {
            await fn();
            console.log(`  ✅ ${name}`);
            passed++;
        } catch (error) {
            console.log(`  ❌ ${name}`);
            console.log(`     Error: ${error.message}`);
            failed++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
    console.error('Test runner error:', err);
    process.exit(1);
});
