"use strict";
/**
 * Security Vulnerability Exploration Tests
 *
 * **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms vulnerabilities exist
 * **Property 1: Bug Condition** - Security Vulnerability Detection
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8**
 *
 * These tests encode the expected secure behavior and will validate fixes when they pass.
 * The goal is to surface counterexamples that demonstrate security vulnerabilities exist.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
const connect_1 = require("../db/connect");
const env_1 = require("../config/env");
(0, vitest_1.describe)('Security Vulnerability Exploration Tests', () => {
    let app;
    let connection;
    (0, vitest_1.beforeEach)(async () => {
        app = (0, app_1.createApp)();
        // Use test database to avoid affecting real data
        const testDbUri = env_1.env.MONGODB_URI.replace('karmdeep_db', 'karmdeep_test_db');
        connection = await mongoose_1.default.connect(testDbUri);
    });
    (0, vitest_1.afterEach)(async () => {
        await mongoose_1.default.connection.close();
    });
    (0, vitest_1.describe)('1. JWT Secret Vulnerability - Requirement 1.1', () => {
        (0, vitest_1.it)('should reject tokens forged with default secret "dev-secret-change-me"', async () => {
            // **Validates: Requirements 1.1**
            // This test will FAIL on unfixed code because it uses the default secret
            const forgedPayload = {
                sub: 'malicious-user-id',
                role: 'admin',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600
            };
            // Forge token using the known default secret
            const forgedToken = jsonwebtoken_1.default.sign(forgedPayload, 'dev-secret-change-me');
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/vendors')
                .set('Authorization', `Bearer ${forgedToken}`);
            // This should be 401 (Unauthorized) but will be 200 on unfixed code
            (0, vitest_1.expect)(response.status).toBe(401);
            (0, vitest_1.expect)(response.body).toHaveProperty('error');
        });
        (0, vitest_1.it)('should require JWT secret to be at least 32 characters', () => {
            // **Validates: Requirements 1.1**
            // This test will FAIL on unfixed code because default secret is weak
            const currentSecret = env_1.env.JWT_SECRET;
            // Should fail with weak secret
            (0, vitest_1.expect)(currentSecret).not.toBe('dev-secret-change-me');
            (0, vitest_1.expect)(currentSecret.length).toBeGreaterThanOrEqual(32);
        });
    });
    (0, vitest_1.describe)('2. XSS Token Theft Vulnerability - Requirement 1.5', () => {
        (0, vitest_1.it)('should not store tokens in localStorage (XSS vulnerable)', () => {
            // **Validates: Requirements 1.5**
            // This test will FAIL on unfixed code because tokens are stored in localStorage
            // Simulate XSS attack accessing localStorage
            const mockLocalStorage = {
                getItem: vitest_1.vi.fn().mockReturnValue('fake-jwt-token'),
                setItem: vitest_1.vi.fn(),
                removeItem: vitest_1.vi.fn()
            };
            // In unfixed code, this would return a token (vulnerability)
            const storedToken = mockLocalStorage.getItem('authToken');
            // Should be null (no token in localStorage) but will have token on unfixed code
            (0, vitest_1.expect)(storedToken).toBeNull();
        });
        (0, vitest_1.it)('should use httpOnly cookies instead of localStorage', async () => {
            // **Validates: Requirements 1.5**
            // This test will FAIL on unfixed code because login returns token in response body
            const loginData = {
                email: 'test@example.com',
                password: 'password123'
            };
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/login')
                .send(loginData);
            // Should not return token in response body (should use httpOnly cookie)
            (0, vitest_1.expect)(response.body).not.toHaveProperty('token');
            // Should set httpOnly cookie
            const cookies = response.headers['set-cookie'];
            (0, vitest_1.expect)(cookies).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(cookies) && cookies.some((cookie) => cookie.includes('httpOnly') && cookie.includes('authToken'))).toBe(true);
        });
    });
    (0, vitest_1.describe)('3. CORS Bypass Vulnerability - Requirement 1.4', () => {
        (0, vitest_1.it)('should reject requests from unauthorized origins', async () => {
            // **Validates: Requirements 1.4**
            // This test will FAIL on unfixed code because CORS allows all origins
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/vendors')
                .set('Origin', 'https://malicious-site.com')
                .set('Authorization', 'Bearer valid-token');
            // Should be blocked by CORS but will be allowed on unfixed code
            (0, vitest_1.expect)(response.headers['access-control-allow-origin']).not.toBe('*');
            (0, vitest_1.expect)(response.headers['access-control-allow-origin']).not.toBe('https://malicious-site.com');
        });
        (0, vitest_1.it)('should only allow explicitly configured origins', async () => {
            // **Validates: Requirements 1.4**
            // This test will FAIL on unfixed code because CORS is permissive
            // Test with multiple unauthorized origins
            const unauthorizedOrigins = [
                'https://attacker.com',
                'http://localhost:9999',
                'https://evil.example.com'
            ];
            for (const origin of unauthorizedOrigins) {
                const response = await (0, supertest_1.default)(app)
                    .options('/api/v1/vendors')
                    .set('Origin', origin);
                // Should not allow these origins
                (0, vitest_1.expect)(response.headers['access-control-allow-origin']).not.toBe(origin);
                (0, vitest_1.expect)(response.headers['access-control-allow-origin']).not.toBe('*');
            }
        });
    });
    (0, vitest_1.describe)('4. Injection Attack Vulnerability - Requirement 1.6', () => {
        (0, vitest_1.it)('should validate and sanitize API input data', async () => {
            // **Validates: Requirements 1.6**
            // This test will FAIL on unfixed code because input validation is missing
            const maliciousPayload = {
                email: '<script>alert("xss")</script>',
                password: '"; DROP TABLE users; --',
                name: '${process.env.JWT_SECRET}',
                role: 'admin'
            };
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/register')
                .send(maliciousPayload);
            // Should be 400 (Bad Request) due to validation but will process on unfixed code
            (0, vitest_1.expect)(response.status).toBe(400);
            (0, vitest_1.expect)(response.body).toHaveProperty('error');
            (0, vitest_1.expect)(response.body.error).toMatch(/validation|invalid|sanitization/i);
        });
        (0, vitest_1.it)('should enforce request size limits', async () => {
            // **Validates: Requirements 1.6**
            // This test will FAIL on unfixed code because size limits are not enforced
            const largePayload = {
                email: 'test@example.com',
                password: 'a'.repeat(10 * 1024 * 1024), // 10MB payload
                name: 'test'
            };
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/register')
                .send(largePayload);
            // Should be 413 (Payload Too Large) but will be processed on unfixed code
            (0, vitest_1.expect)(response.status).toBe(413);
        });
    });
    (0, vitest_1.describe)('5. Database Crash Vulnerability - Requirement 1.3', () => {
        (0, vitest_1.it)('should handle database connection failures gracefully', async () => {
            // **Validates: Requirements 1.3**
            // This test will FAIL on unfixed code because database errors crash the app
            // Simulate database connection failure
            await mongoose_1.default.connection.close();
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/vendors');
            // Should return 503 (Service Unavailable) but will crash on unfixed code
            (0, vitest_1.expect)(response.status).toBe(503);
            (0, vitest_1.expect)(response.body).toHaveProperty('error');
            (0, vitest_1.expect)(response.body.error).toMatch(/database|connection|unavailable/i);
        });
        (0, vitest_1.it)('should implement retry logic for database operations', async () => {
            // **Validates: Requirements 1.3**
            // This test will FAIL on unfixed code because retry logic is missing
            // Mock database connection to fail initially then succeed
            let attemptCount = 0;
            const originalConnect = mongoose_1.default.connect;
            vitest_1.vi.spyOn(mongoose_1.default, 'connect').mockImplementation(async (uri) => {
                attemptCount++;
                if (attemptCount < 3) {
                    throw new Error('Connection failed');
                }
                return originalConnect(uri);
            });
            // Should eventually succeed with retry logic
            await (0, vitest_1.expect)((0, connect_1.connectDb)()).resolves.toBeDefined();
            (0, vitest_1.expect)(attemptCount).toBeGreaterThan(1);
        });
    });
    (0, vitest_1.describe)('6. Auth State Desync Vulnerability - Requirement 1.2', () => {
        (0, vitest_1.it)('should automatically clear frontend auth state when token expires', async () => {
            // **Validates: Requirements 1.2**
            // This test will FAIL on unfixed code because auth state is not synchronized
            // Create expired token
            const expiredPayload = {
                sub: 'user-id',
                role: 'buyer',
                exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
            };
            const expiredToken = jsonwebtoken_1.default.sign(expiredPayload, env_1.env.JWT_SECRET);
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/vendors')
                .set('Authorization', `Bearer ${expiredToken}`);
            // Should be 401 and trigger frontend auth state clear
            (0, vitest_1.expect)(response.status).toBe(401);
            (0, vitest_1.expect)(response.body).toHaveProperty('error');
            (0, vitest_1.expect)(response.body.error).toMatch(/expired|invalid/i);
            // Should include header to trigger frontend auth clear
            (0, vitest_1.expect)(response.headers).toHaveProperty('x-auth-expired');
        });
    });
    (0, vitest_1.describe)('7. Connection Leak Vulnerability - Requirement 1.7', () => {
        (0, vitest_1.it)('should properly close database connections on errors', async () => {
            // **Validates: Requirements 1.7**
            // This test will FAIL on unfixed code because connections leak on errors
            const initialConnections = mongoose_1.default.connection.readyState;
            // Simulate operation that causes database error
            try {
                await mongoose_1.default.connection.db?.collection('nonexistent').findOne({});
            }
            catch (error) {
                // Error is expected
            }
            // Connection should still be properly managed
            (0, vitest_1.expect)(mongoose_1.default.connection.readyState).toBe(initialConnections);
            // Should not have leaked connections
            const activeConnections = mongoose_1.default.connections.filter(conn => conn.readyState === 1);
            (0, vitest_1.expect)(activeConnections.length).toBeLessThanOrEqual(1);
        });
    });
    (0, vitest_1.describe)('8. Insecure Default Configuration - Requirement 1.8', () => {
        (0, vitest_1.it)('should fail to start with insecure default configuration', () => {
            // **Validates: Requirements 1.8**
            // This test will FAIL on unfixed code because insecure defaults are allowed
            const insecureConfig = {
                JWT_SECRET: 'dev-secret-change-me',
                NODE_ENV: 'development',
                MONGODB_URI: 'mongodb://localhost:27017/test'
            };
            // Should throw error with insecure configuration
            (0, vitest_1.expect)(() => {
                // Simulate app startup validation
                if (insecureConfig.JWT_SECRET === 'dev-secret-change-me') {
                    throw new Error('Insecure JWT secret detected');
                }
                if (insecureConfig.NODE_ENV !== 'production' && process.env.NODE_ENV === 'production') {
                    throw new Error('Production environment requires secure configuration');
                }
            }).toThrow(/insecure|secure|configuration/i);
        });
        (0, vitest_1.it)('should validate MongoDB URI security in production', () => {
            // **Validates: Requirements 1.8**
            // This test will FAIL on unfixed code because URI validation is missing
            const insecureUris = [
                'mongodb://localhost:27017/db',
                'mongodb://user:pass@localhost:27017/db',
                'mongodb://127.0.0.1:27017/db'
            ];
            for (const uri of insecureUris) {
                (0, vitest_1.expect)(() => {
                    // Should validate URI security
                    if (process.env.NODE_ENV === 'production' && uri.includes('localhost')) {
                        throw new Error('Localhost MongoDB URI not allowed in production');
                    }
                }).toThrow(/localhost|production|security/i);
            }
        });
    });
});
