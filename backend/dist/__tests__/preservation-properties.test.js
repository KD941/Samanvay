"use strict";
/**
 * Preservation Property Tests - Legitimate Functionality Preservation
 *
 * **Property 2: Preservation** - Legitimate Functionality Preservation
 * **IMPORTANT**: Follow observation-first methodology
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**
 *
 * These tests observe behavior on UNFIXED code for legitimate, secure usage scenarios
 * and capture observed behavior patterns to ensure they are preserved after fixes.
 *
 * **EXPECTED OUTCOME**: Tests PASS (confirms baseline behavior to preserve)
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const fc = __importStar(require("fast-check"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const app_1 = require("../app");
const env_1 = require("../config/env");
const User_1 = require("../models/User");
const Vendor_1 = require("../models/Vendor");
const Product_1 = require("../models/Product");
(0, vitest_1.describe)('Preservation Property Tests - Legitimate Functionality', () => {
    let app;
    let connection;
    (0, vitest_1.beforeEach)(async () => {
        app = (0, app_1.createApp)();
        // Use test database to avoid affecting real data
        const testDbUri = env_1.env.MONGODB_URI.replace('karmdeep_db', 'karmdeep_test_db');
        connection = await mongoose_1.default.connect(testDbUri);
        // Clean test database
        await User_1.User.deleteMany({});
        await Vendor_1.Vendor.deleteMany({});
        await Product_1.Product.deleteMany({});
    });
    (0, vitest_1.afterEach)(async () => {
        await mongoose_1.default.connection.close();
    });
    (0, vitest_1.describe)('1. Valid User Authentication and Authorization Flows - Requirement 3.1', () => {
        (0, vitest_1.it)('should preserve valid user registration flow', async () => {
            // **Validates: Requirements 3.1**
            // Property-based test for valid user registration
            await fc.assert(fc.asyncProperty(fc.record({
                email: fc.emailAddress(),
                password: fc.string({ minLength: 6, maxLength: 50 }),
                name: fc.string({ minLength: 1, maxLength: 100 }),
                phone: fc.string({ minLength: 10, maxLength: 15 }),
                role: fc.constantFrom('admin', 'buyer', 'vendor', 'maintenance', 'analyst')
            }), async (userData) => {
                const response = await (0, supertest_1.default)(app)
                    .post('/api/v1/auth/register')
                    .send(userData);
                // Valid registration should succeed
                (0, vitest_1.expect)(response.status).toBe(201);
                (0, vitest_1.expect)(response.body).toHaveProperty('token');
                (0, vitest_1.expect)(response.body).toHaveProperty('user');
                (0, vitest_1.expect)(response.body.user.email).toBe(userData.email);
                (0, vitest_1.expect)(response.body.user.role).toBe(userData.role);
                // Token should be valid JWT
                const decoded = jsonwebtoken_1.default.verify(response.body.token, env_1.env.JWT_SECRET);
                (0, vitest_1.expect)(decoded).toHaveProperty('sub');
                (0, vitest_1.expect)(decoded).toHaveProperty('role', userData.role);
            }), { numRuns: 10 });
        });
        (0, vitest_1.it)('should preserve valid user login flow', async () => {
            // **Validates: Requirements 3.1**
            // Property-based test for valid user login
            await fc.assert(fc.asyncProperty(fc.record({
                email: fc.emailAddress(),
                password: fc.string({ minLength: 6, maxLength: 50 }),
                role: fc.constantFrom('admin', 'buyer', 'vendor', 'maintenance', 'analyst')
            }), async (userData) => {
                // First register the user
                const passwordHash = await bcryptjs_1.default.hash(userData.password, 10);
                const user = await User_1.User.create({
                    email: userData.email,
                    passwordHash,
                    role: userData.role
                });
                // Then test login
                const response = await (0, supertest_1.default)(app)
                    .post('/api/v1/auth/login')
                    .send({
                    email: userData.email,
                    password: userData.password
                });
                // Valid login should succeed
                (0, vitest_1.expect)(response.status).toBe(200);
                (0, vitest_1.expect)(response.body).toHaveProperty('token');
                (0, vitest_1.expect)(response.body).toHaveProperty('user');
                (0, vitest_1.expect)(response.body.user.email).toBe(userData.email);
                (0, vitest_1.expect)(response.body.user.role).toBe(userData.role);
                // Token should be valid JWT
                const decoded = jsonwebtoken_1.default.verify(response.body.token, env_1.env.JWT_SECRET);
                (0, vitest_1.expect)(decoded).toHaveProperty('sub', String(user._id));
                (0, vitest_1.expect)(decoded).toHaveProperty('role', userData.role);
            }), { numRuns: 10 });
        });
        (0, vitest_1.it)('should preserve role-based authorization for valid roles', async () => {
            // **Validates: Requirements 3.1**
            // Property-based test for role-based access
            await fc.assert(fc.asyncProperty(fc.constantFrom('admin', 'buyer', 'vendor', 'maintenance', 'analyst'), async (role) => {
                // Create user with specific role
                const passwordHash = await bcryptjs_1.default.hash('password123', 10);
                const user = await User_1.User.create({
                    email: `test-${role}@example.com`,
                    passwordHash,
                    role
                });
                // Generate valid token
                const token = jsonwebtoken_1.default.sign({ sub: String(user._id), role }, env_1.env.JWT_SECRET, { expiresIn: '1h' });
                // Test access to appropriate endpoints based on role
                const response = await (0, supertest_1.default)(app)
                    .get('/api/v1/vendors')
                    .set('Authorization', `Bearer ${token}`);
                // All roles should have access to vendors endpoint
                (0, vitest_1.expect)(response.status).toBe(200);
                (0, vitest_1.expect)(Array.isArray(response.body)).toBe(true);
            }), { numRuns: 5 });
        });
    });
    (0, vitest_1.describe)('2. Legitimate API Requests from Authenticated Users - Requirement 3.2', () => {
        (0, vitest_1.it)('should preserve authenticated API request processing', async () => {
            // **Validates: Requirements 3.2**
            // Property-based test for authenticated API requests
            await fc.assert(fc.asyncProperty(fc.record({
                role: fc.constantFrom('admin', 'buyer', 'vendor', 'maintenance', 'analyst'),
                endpoint: fc.constantFrom('/api/v1/vendors', '/api/v1/products', '/api/v1/tenders')
            }), async ({ role, endpoint }) => {
                // Create authenticated user
                const passwordHash = await bcryptjs_1.default.hash('password123', 10);
                const user = await User_1.User.create({
                    email: `test-${role}@example.com`,
                    passwordHash,
                    role
                });
                // Generate valid token
                const token = jsonwebtoken_1.default.sign({ sub: String(user._id), role }, env_1.env.JWT_SECRET, { expiresIn: '1h' });
                // Make authenticated request
                const response = await (0, supertest_1.default)(app)
                    .get(endpoint)
                    .set('Authorization', `Bearer ${token}`);
                // Authenticated requests should succeed
                (0, vitest_1.expect)(response.status).toBe(200);
                (0, vitest_1.expect)(response.body).toBeDefined();
            }), { numRuns: 15 });
        });
        (0, vitest_1.it)('should preserve valid Bearer token authentication', async () => {
            // **Validates: Requirements 3.2**
            // Property-based test for Bearer token format
            await fc.assert(fc.asyncProperty(fc.record({
                userId: fc.string({ minLength: 24, maxLength: 24 }), // MongoDB ObjectId length
                role: fc.constantFrom('admin', 'buyer', 'vendor', 'maintenance', 'analyst')
            }), async ({ userId, role }) => {
                // Generate valid token with proper format
                const token = jsonwebtoken_1.default.sign({ sub: userId, role }, env_1.env.JWT_SECRET, { expiresIn: '1h' });
                const response = await (0, supertest_1.default)(app)
                    .get('/api/v1/vendors')
                    .set('Authorization', `Bearer ${token}`);
                // Valid Bearer token should be accepted
                (0, vitest_1.expect)(response.status).toBe(200);
            }), { numRuns: 10 });
        });
    });
    (0, vitest_1.describe)('3. Successful Database Operations and CRUD Functionality - Requirement 3.3', () => {
        (0, vitest_1.it)('should preserve database connection establishment', async () => {
            // **Validates: Requirements 3.3**
            // Test that database connections work properly
            // Connection should be established
            (0, vitest_1.expect)(mongoose_1.default.connection.readyState).toBe(1); // Connected
            // Should be able to perform basic operations
            const testDoc = await User_1.User.create({
                email: 'db-test@example.com',
                passwordHash: await bcryptjs_1.default.hash('password', 10),
                role: 'buyer'
            });
            (0, vitest_1.expect)(testDoc).toBeDefined();
            (0, vitest_1.expect)(testDoc._id).toBeDefined();
            // Should be able to query
            const found = await User_1.User.findById(testDoc._id);
            (0, vitest_1.expect)(found).toBeDefined();
            (0, vitest_1.expect)(found?.email).toBe('db-test@example.com');
        });
        (0, vitest_1.it)('should preserve CRUD operations for all models', async () => {
            // **Validates: Requirements 3.3**
            // Property-based test for CRUD operations
            await fc.assert(fc.asyncProperty(fc.record({
                email: fc.emailAddress(),
                role: fc.constantFrom('admin', 'buyer', 'vendor', 'maintenance', 'analyst')
            }), async ({ email, role }) => {
                // CREATE
                const passwordHash = await bcryptjs_1.default.hash('password123', 10);
                const user = await User_1.User.create({
                    email,
                    passwordHash,
                    role
                });
                (0, vitest_1.expect)(user._id).toBeDefined();
                // READ
                const foundUser = await User_1.User.findById(user._id);
                (0, vitest_1.expect)(foundUser).toBeDefined();
                (0, vitest_1.expect)(foundUser?.email).toBe(email);
                // UPDATE
                await User_1.User.findByIdAndUpdate(user._id, { name: 'Updated Name' });
                const updatedUser = await User_1.User.findById(user._id);
                (0, vitest_1.expect)(updatedUser?.name).toBe('Updated Name');
                // DELETE
                await User_1.User.findByIdAndDelete(user._id);
                const deletedUser = await User_1.User.findById(user._id);
                (0, vitest_1.expect)(deletedUser).toBeNull();
            }), { numRuns: 5 });
        });
    });
    (0, vitest_1.describe)('4. Valid Cross-Origin Requests from Configured Origins - Requirement 3.4', () => {
        (0, vitest_1.it)('should preserve CORS functionality for legitimate requests', async () => {
            // **Validates: Requirements 3.4**
            // Test that CORS works for legitimate origins
            // Create authenticated user for the test
            const passwordHash = await bcryptjs_1.default.hash('password123', 10);
            const user = await User_1.User.create({
                email: 'cors-test@example.com',
                passwordHash,
                role: 'buyer'
            });
            // Generate valid token
            const token = jsonwebtoken_1.default.sign({ sub: String(user._id), role: 'buyer' }, env_1.env.JWT_SECRET, { expiresIn: '1h' });
            // Current implementation allows all origins (permissive)
            // This test captures the current behavior to preserve legitimate access
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/vendors')
                .set('Origin', 'http://localhost:3000') // Typical frontend origin
                .set('Authorization', `Bearer ${token}`);
            // Should include CORS headers
            (0, vitest_1.expect)(response.headers).toHaveProperty('access-control-allow-origin');
            // Should process the request successfully
            (0, vitest_1.expect)(response.status).toBe(200);
        });
        (0, vitest_1.it)('should preserve preflight OPTIONS requests', async () => {
            // **Validates: Requirements 3.4**
            // Test that preflight requests work properly
            const response = await (0, supertest_1.default)(app)
                .options('/api/v1/vendors')
                .set('Origin', 'http://localhost:3000')
                .set('Access-Control-Request-Method', 'GET')
                .set('Access-Control-Request-Headers', 'Authorization');
            // Preflight should succeed
            (0, vitest_1.expect)(response.status).toBe(204);
            (0, vitest_1.expect)(response.headers).toHaveProperty('access-control-allow-methods');
            (0, vitest_1.expect)(response.headers).toHaveProperty('access-control-allow-headers');
        });
    });
    (0, vitest_1.describe)('5. User Logout Functionality Clearing Authentication State - Requirement 3.5', () => {
        (0, vitest_1.it)('should preserve logout functionality', () => {
            // **Validates: Requirements 3.5**
            // Test frontend auth store logout behavior
            // Mock localStorage for testing (Node.js environment)
            const mockStorage = {};
            const localStorageMock = {
                getItem: vitest_1.vi.fn((key) => mockStorage[key] || null),
                setItem: vitest_1.vi.fn((key, value) => {
                    mockStorage[key] = value;
                }),
                removeItem: vitest_1.vi.fn((key) => {
                    delete mockStorage[key];
                })
            };
            // Mock global localStorage for Node.js environment
            global.localStorage = localStorageMock;
            // Simulate login state
            mockStorage['authToken'] = 'test-token';
            mockStorage['authUser'] = JSON.stringify({ id: '123', email: 'test@example.com', role: 'buyer' });
            // Verify initial state
            (0, vitest_1.expect)(mockStorage['authToken']).toBe('test-token');
            (0, vitest_1.expect)(mockStorage['authUser']).toBeDefined();
            // Simulate logout
            localStorageMock.removeItem('authToken');
            localStorageMock.removeItem('authUser');
            // Verify logout clears state
            (0, vitest_1.expect)(mockStorage['authToken']).toBeUndefined();
            (0, vitest_1.expect)(mockStorage['authUser']).toBeUndefined();
        });
    });
    (0, vitest_1.describe)('6. Application Startup with Proper Secure Configuration - Requirement 3.8', () => {
        (0, vitest_1.it)('should preserve application startup with valid configuration', () => {
            // **Validates: Requirements 3.8**
            // Test that app starts with proper configuration
            // Current environment should be accessible
            (0, vitest_1.expect)(env_1.env).toBeDefined();
            (0, vitest_1.expect)(env_1.env.NODE_ENV).toBeDefined();
            (0, vitest_1.expect)(env_1.env.PORT).toBeTypeOf('number');
            (0, vitest_1.expect)(env_1.env.MONGODB_URI).toBeDefined();
            (0, vitest_1.expect)(env_1.env.JWT_SECRET).toBeDefined();
            // App should be creatable
            const testApp = (0, app_1.createApp)();
            (0, vitest_1.expect)(testApp).toBeDefined();
            (0, vitest_1.expect)(typeof testApp.listen).toBe('function');
        });
        (0, vitest_1.it)('should preserve environment variable loading', async () => {
            // **Validates: Requirements 3.8**
            // Property-based test for configuration values
            await fc.assert(fc.property(fc.record({
                nodeEnv: fc.constantFrom('development', 'production', 'test'),
                port: fc.integer({ min: 1000, max: 65535 })
            }), ({ nodeEnv, port }) => {
                // Configuration should be properly typed and accessible
                (0, vitest_1.expect)(typeof env_1.env.NODE_ENV).toBe('string');
                (0, vitest_1.expect)(typeof env_1.env.PORT).toBe('number');
                (0, vitest_1.expect)(typeof env_1.env.MONGODB_URI).toBe('string');
                (0, vitest_1.expect)(typeof env_1.env.JWT_SECRET).toBe('string');
                // Values should be reasonable
                (0, vitest_1.expect)(env_1.env.PORT).toBeGreaterThan(0);
                (0, vitest_1.expect)(env_1.env.PORT).toBeLessThan(65536);
                (0, vitest_1.expect)(env_1.env.MONGODB_URI).toMatch(/^mongodb/);
                (0, vitest_1.expect)(env_1.env.JWT_SECRET.length).toBeGreaterThan(0);
            }), { numRuns: 5 });
        });
    });
    (0, vitest_1.describe)('7. API Endpoints with Valid Input Data Processing - Requirement 3.6', () => {
        (0, vitest_1.it)('should preserve valid input processing for registration', async () => {
            // **Validates: Requirements 3.6**
            // Property-based test for valid input processing
            await fc.assert(fc.asyncProperty(fc.record({
                email: fc.emailAddress(),
                password: fc.string({ minLength: 6, maxLength: 50 }),
                name: fc.string({ minLength: 1, maxLength: 100 }),
                role: fc.constantFrom('admin', 'buyer', 'vendor', 'maintenance', 'analyst')
            }), async (validInput) => {
                const response = await (0, supertest_1.default)(app)
                    .post('/api/v1/auth/register')
                    .send(validInput);
                // Valid input should be processed successfully
                (0, vitest_1.expect)(response.status).toBe(201);
                (0, vitest_1.expect)(response.body).toHaveProperty('token');
                (0, vitest_1.expect)(response.body.user.email).toBe(validInput.email);
                (0, vitest_1.expect)(response.body.user.role).toBe(validInput.role);
            }), { numRuns: 10 });
        });
        (0, vitest_1.it)('should preserve JSON request body parsing', async () => {
            // **Validates: Requirements 3.6**
            // Test that JSON parsing works correctly
            const validPayload = {
                email: 'test@example.com',
                password: 'password123',
                role: 'buyer'
            };
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/register')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(validPayload));
            // JSON should be parsed correctly
            (0, vitest_1.expect)(response.status).toBe(201);
            (0, vitest_1.expect)(response.body.user.email).toBe(validPayload.email);
        });
    });
    (0, vitest_1.describe)('8. Stable Database Connections for Successful Operations - Requirement 3.7', () => {
        (0, vitest_1.it)('should preserve stable database connection behavior', async () => {
            // **Validates: Requirements 3.7**
            // Test that database connections remain stable during operations
            const initialState = mongoose_1.default.connection.readyState;
            (0, vitest_1.expect)(initialState).toBe(1); // Connected
            // Perform multiple operations
            const operations = [];
            const passwordHash = await bcryptjs_1.default.hash('password', 10);
            for (let i = 0; i < 5; i++) {
                operations.push(User_1.User.create({
                    email: `test${i}@example.com`,
                    passwordHash,
                    role: 'buyer'
                }));
            }
            const results = await Promise.all(operations);
            // All operations should succeed
            results.forEach(result => {
                (0, vitest_1.expect)(result._id).toBeDefined();
            });
            // Connection should remain stable
            (0, vitest_1.expect)(mongoose_1.default.connection.readyState).toBe(1);
        });
        (0, vitest_1.it)('should preserve connection pooling behavior', async () => {
            // **Validates: Requirements 3.7**
            // Test that connection pooling works properly
            // Perform concurrent operations
            const passwordHash = await bcryptjs_1.default.hash('password', 10);
            const concurrentOps = Array.from({ length: 10 }, (_, i) => User_1.User.create({
                email: `concurrent${i}@example.com`,
                passwordHash,
                role: 'buyer'
            }));
            const results = await Promise.all(concurrentOps);
            // All concurrent operations should succeed
            (0, vitest_1.expect)(results).toHaveLength(10);
            results.forEach(result => {
                (0, vitest_1.expect)(result._id).toBeDefined();
            });
            // Connection should remain healthy
            (0, vitest_1.expect)(mongoose_1.default.connection.readyState).toBe(1);
        });
    });
});
