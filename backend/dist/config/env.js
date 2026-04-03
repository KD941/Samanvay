"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
dotenv_1.default.config();
function validateJwtSecret(secret) {
    // Fail if using insecure default
    if (secret === 'dev-secret-change-me') {
        throw new Error('SECURITY ERROR: Cannot use default JWT secret in production. Set JWT_SECRET environment variable.');
    }
    // Require minimum length for cryptographic security
    if (secret.length < 32) {
        throw new Error('SECURITY ERROR: JWT_SECRET must be at least 32 characters long for cryptographic security.');
    }
    // Check for basic entropy (not all same character)
    const uniqueChars = new Set(secret).size;
    if (uniqueChars < 8) {
        throw new Error('SECURITY ERROR: JWT_SECRET must have sufficient entropy (at least 8 unique characters).');
    }
    return secret;
}
function validateMongoUri(uri) {
    // Basic MongoDB URI validation
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
        throw new Error('CONFIGURATION ERROR: MONGODB_URI must be a valid MongoDB connection string.');
    }
    // Warn about localhost in production
    if (process.env.NODE_ENV === 'production' && uri.includes('127.0.0.1')) {
        throw new Error('CONFIGURATION ERROR: Cannot use localhost MongoDB URI in production.');
    }
    return uri;
}
function validateNodeEnv(nodeEnv) {
    const validEnvs = ['development', 'production', 'test'];
    if (!validEnvs.includes(nodeEnv)) {
        throw new Error(`CONFIGURATION ERROR: NODE_ENV must be one of: ${validEnvs.join(', ')}`);
    }
    return nodeEnv;
}
// Validate all security-critical configuration at startup
const jwtSecret = process.env.JWT_SECRET ?? 'dev-secret-change-me';
const mongoUri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/karmdeep_db';
const nodeEnv = process.env.NODE_ENV ?? 'development';
exports.env = {
    NODE_ENV: validateNodeEnv(nodeEnv),
    PORT: Number(process.env.PORT ?? 4000),
    MONGODB_URI: validateMongoUri(mongoUri),
    JWT_SECRET: validateJwtSecret(jwtSecret),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
    COOKIE_SECRET: process.env.COOKIE_SECRET ?? crypto_1.default.randomBytes(32).toString('hex')
};
