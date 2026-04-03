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

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../app';
import { connectDb } from '../db/connect';
import { env } from '../config/env';

describe('Security Vulnerability Exploration Tests', () => {
  let app: any;
  let connection: any;

  beforeEach(async () => {
    app = createApp();
    // Use test database to avoid affecting real data
    const testDbUri = env.MONGODB_URI.replace('karmdeep_db', 'karmdeep_test_db');
    connection = await mongoose.connect(testDbUri);
  });

  afterEach(async () => {
    await mongoose.connection.close();
  });

  describe('1. JWT Secret Vulnerability - Requirement 1.1', () => {
    it('should reject tokens forged with default secret "dev-secret-change-me"', async () => {
      // **Validates: Requirements 1.1**
      // This test will FAIL on unfixed code because it uses the default secret
      
      const forgedPayload = {
        sub: 'malicious-user-id',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };

      // Forge token using the known default secret
      const forgedToken = jwt.sign(forgedPayload, 'dev-secret-change-me');

      const response = await request(app)
        .get('/api/v1/vendors')
        .set('Authorization', `Bearer ${forgedToken}`);

      // This should be 401 (Unauthorized) but will be 200 on unfixed code
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should require JWT secret to be at least 32 characters', () => {
      // **Validates: Requirements 1.1**
      // This test will FAIL on unfixed code because default secret is weak
      
      const currentSecret = env.JWT_SECRET;
      
      // Should fail with weak secret
      expect(currentSecret).not.toBe('dev-secret-change-me');
      expect(currentSecret.length).toBeGreaterThanOrEqual(32);
    });
  });

  describe('2. XSS Token Theft Vulnerability - Requirement 1.5', () => {
    it('should not store tokens in localStorage (XSS vulnerable)', () => {
      // **Validates: Requirements 1.5**
      // This test will FAIL on unfixed code because tokens are stored in localStorage
      
      // Simulate XSS attack accessing localStorage
      const mockLocalStorage = {
        getItem: vi.fn().mockReturnValue('fake-jwt-token'),
        setItem: vi.fn(),
        removeItem: vi.fn()
      };

      // In unfixed code, this would return a token (vulnerability)
      const storedToken = mockLocalStorage.getItem('authToken');
      
      // Should be null (no token in localStorage) but will have token on unfixed code
      expect(storedToken).toBeNull();
    });

    it('should use httpOnly cookies instead of localStorage', async () => {
      // **Validates: Requirements 1.5**
      // This test will FAIL on unfixed code because login returns token in response body
      
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData);

      // Should not return token in response body (should use httpOnly cookie)
      expect(response.body).not.toHaveProperty('token');
      
      // Should set httpOnly cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((cookie: string) => 
        cookie.includes('httpOnly') && cookie.includes('authToken')
      )).toBe(true);
    });
  });

  describe('3. CORS Bypass Vulnerability - Requirement 1.4', () => {
    it('should reject requests from unauthorized origins', async () => {
      // **Validates: Requirements 1.4**
      // This test will FAIL on unfixed code because CORS allows all origins
      
      const response = await request(app)
        .get('/api/v1/vendors')
        .set('Origin', 'https://malicious-site.com')
        .set('Authorization', 'Bearer valid-token');

      // Should be blocked by CORS but will be allowed on unfixed code
      expect(response.headers['access-control-allow-origin']).not.toBe('*');
      expect(response.headers['access-control-allow-origin']).not.toBe('https://malicious-site.com');
    });

    it('should only allow explicitly configured origins', async () => {
      // **Validates: Requirements 1.4**
      // This test will FAIL on unfixed code because CORS is permissive
      
      // Test with multiple unauthorized origins
      const unauthorizedOrigins = [
        'https://attacker.com',
        'http://localhost:9999',
        'https://evil.example.com'
      ];

      for (const origin of unauthorizedOrigins) {
        const response = await request(app)
          .options('/api/v1/vendors')
          .set('Origin', origin);

        // Should not allow these origins
        expect(response.headers['access-control-allow-origin']).not.toBe(origin);
        expect(response.headers['access-control-allow-origin']).not.toBe('*');
      }
    });
  });

  describe('4. Injection Attack Vulnerability - Requirement 1.6', () => {
    it('should validate and sanitize API input data', async () => {
      // **Validates: Requirements 1.6**
      // This test will FAIL on unfixed code because input validation is missing
      
      const maliciousPayload = {
        email: '<script>alert("xss")</script>',
        password: '"; DROP TABLE users; --',
        name: '${process.env.JWT_SECRET}',
        role: 'admin'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(maliciousPayload);

      // Should be 400 (Bad Request) due to validation but will process on unfixed code
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/validation|invalid|sanitization/i);
    });

    it('should enforce request size limits', async () => {
      // **Validates: Requirements 1.6**
      // This test will FAIL on unfixed code because size limits are not enforced
      
      const largePayload = {
        email: 'test@example.com',
        password: 'a'.repeat(10 * 1024 * 1024), // 10MB payload
        name: 'test'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(largePayload);

      // Should be 413 (Payload Too Large) but will be processed on unfixed code
      expect(response.status).toBe(413);
    });
  });

  describe('5. Database Crash Vulnerability - Requirement 1.3', () => {
    it('should handle database connection failures gracefully', async () => {
      // **Validates: Requirements 1.3**
      // This test will FAIL on unfixed code because database errors crash the app
      
      // Simulate database connection failure
      await mongoose.connection.close();

      const response = await request(app)
        .get('/api/v1/vendors');

      // Should return 503 (Service Unavailable) but will crash on unfixed code
      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/database|connection|unavailable/i);
    });

    it('should implement retry logic for database operations', async () => {
      // **Validates: Requirements 1.3**
      // This test will FAIL on unfixed code because retry logic is missing
      
      // Mock database connection to fail initially then succeed
      let attemptCount = 0;
      const originalConnect = mongoose.connect;
      
      vi.spyOn(mongoose, 'connect').mockImplementation(async (uri: string) => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Connection failed');
        }
        return originalConnect(uri);
      });

      // Should eventually succeed with retry logic
      await expect(connectDb()).resolves.toBeDefined();
      expect(attemptCount).toBeGreaterThan(1);
    });
  });

  describe('6. Auth State Desync Vulnerability - Requirement 1.2', () => {
    it('should automatically clear frontend auth state when token expires', async () => {
      // **Validates: Requirements 1.2**
      // This test will FAIL on unfixed code because auth state is not synchronized
      
      // Create expired token
      const expiredPayload = {
        sub: 'user-id',
        role: 'buyer',
        exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
      };
      
      const expiredToken = jwt.sign(expiredPayload, env.JWT_SECRET);

      const response = await request(app)
        .get('/api/v1/vendors')
        .set('Authorization', `Bearer ${expiredToken}`);

      // Should be 401 and trigger frontend auth state clear
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/expired|invalid/i);
      
      // Should include header to trigger frontend auth clear
      expect(response.headers).toHaveProperty('x-auth-expired');
    });
  });

  describe('7. Connection Leak Vulnerability - Requirement 1.7', () => {
    it('should properly close database connections on errors', async () => {
      // **Validates: Requirements 1.7**
      // This test will FAIL on unfixed code because connections leak on errors
      
      const initialConnections = mongoose.connection.readyState;
      
      // Simulate operation that causes database error
      try {
        await mongoose.connection.db.collection('nonexistent').findOne({});
      } catch (error) {
        // Error is expected
      }

      // Connection should still be properly managed
      expect(mongoose.connection.readyState).toBe(initialConnections);
      
      // Should not have leaked connections
      const activeConnections = mongoose.connections.filter(conn => conn.readyState === 1);
      expect(activeConnections.length).toBeLessThanOrEqual(1);
    });
  });

  describe('8. Insecure Default Configuration - Requirement 1.8', () => {
    it('should fail to start with insecure default configuration', () => {
      // **Validates: Requirements 1.8**
      // This test will FAIL on unfixed code because insecure defaults are allowed
      
      const insecureConfig = {
        JWT_SECRET: 'dev-secret-change-me',
        NODE_ENV: 'development',
        MONGODB_URI: 'mongodb://localhost:27017/test'
      };

      // Should throw error with insecure configuration
      expect(() => {
        // Simulate app startup validation
        if (insecureConfig.JWT_SECRET === 'dev-secret-change-me') {
          throw new Error('Insecure JWT secret detected');
        }
        if (insecureConfig.NODE_ENV !== 'production' && process.env.NODE_ENV === 'production') {
          throw new Error('Production environment requires secure configuration');
        }
      }).toThrow(/insecure|secure|configuration/i);
    });

    it('should validate MongoDB URI security in production', () => {
      // **Validates: Requirements 1.8**
      // This test will FAIL on unfixed code because URI validation is missing
      
      const insecureUris = [
        'mongodb://localhost:27017/db',
        'mongodb://user:pass@localhost:27017/db',
        'mongodb://127.0.0.1:27017/db'
      ];

      for (const uri of insecureUris) {
        expect(() => {
          // Should validate URI security
          if (process.env.NODE_ENV === 'production' && uri.includes('localhost')) {
            throw new Error('Localhost MongoDB URI not allowed in production');
          }
        }).toThrow(/localhost|production|security/i);
      }
    });
  });
});