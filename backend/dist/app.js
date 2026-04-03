"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_validator_1 = require("express-validator");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
require("express-async-errors");
const env_1 = require("./config/env");
const auth_routes_1 = require("./routes/auth.routes");
const vendor_routes_1 = require("./routes/vendor.routes");
const tender_routes_1 = require("./routes/tender.routes");
const order_routes_1 = require("./routes/order.routes");
const maintenance_routes_1 = require("./routes/maintenance.routes");
const maintenanceExtras_routes_1 = require("./routes/maintenanceExtras.routes");
const analytics_routes_1 = require("./routes/analytics.routes");
const product_routes_1 = require("./routes/product.routes");
const errorHandler_1 = require("./middleware/errorHandler");
const httpError_1 = require("./utils/httpError");
// Input sanitization middleware
function sanitizeInput(req, _res, next) {
    if (req.body && typeof req.body === 'object') {
        sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === 'object') {
        sanitizeObject(req.query);
    }
    if (req.params && typeof req.params === 'object') {
        sanitizeObject(req.params);
    }
    next();
}
function sanitizeObject(obj) {
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            // Basic XSS prevention - remove script tags and javascript: protocols
            obj[key] = obj[key]
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '')
                .trim();
        }
        else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
        }
    }
}
// Validation error handler
function handleValidationErrors(req, _res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new httpError_1.HttpError(400, 'Validation failed', errors.array());
    }
    next();
}
function createApp() {
    const app = (0, express_1.default)();
    // Security headers
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
    }));
    // CORS configuration with explicit origin allowlist
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin)
                return callback(null, true);
            if (env_1.env.ALLOWED_ORIGINS.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error(`Origin ${origin} not allowed by CORS policy`));
            }
        },
        credentials: true, // Allow cookies to be sent
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));
    // Rate limiting
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use(limiter);
    // Stricter rate limiting for auth endpoints
    const authLimiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // Limit each IP to 5 auth requests per windowMs
        message: 'Too many authentication attempts, please try again later.',
        skipSuccessfulRequests: true,
    });
    // Cookie parser for httpOnly cookies
    app.use((0, cookie_parser_1.default)(env_1.env.COOKIE_SECRET));
    // Body parsing with size limits
    app.use(express_1.default.json({
        limit: '2mb',
        verify: (req, res, buf) => {
            // Verify JSON is valid
            try {
                JSON.parse(buf.toString());
            }
            catch (e) {
                throw new httpError_1.HttpError(400, 'Invalid JSON');
            }
        }
    }));
    app.use(express_1.default.urlencoded({
        extended: true,
        limit: '2mb'
    }));
    // Input sanitization
    app.use(sanitizeInput);
    // Logging
    app.use((0, morgan_1.default)(env_1.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
    // Health check
    app.get('/health', (_req, res) => res.json({ ok: true }));
    // Routes with rate limiting for auth
    app.use('/api/v1/auth', authLimiter, auth_routes_1.authRouter);
    app.use('/api/v1/vendors', vendor_routes_1.vendorRouter);
    app.use('/api/v1/tenders', tender_routes_1.tenderRouter);
    app.use('/api/v1/orders', order_routes_1.orderRouter);
    app.use('/api/v1/products', product_routes_1.productRouter);
    app.use('/api/v1/maintenance', maintenance_routes_1.maintenanceRouter);
    app.use('/api/v1/maintenance', maintenanceExtras_routes_1.maintenanceExtrasRouter);
    app.use('/api/v1/analytics', analytics_routes_1.analyticsRouter);
    // Error handling
    app.use(errorHandler_1.errorHandler);
    return app;
}
