"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
exports.requireVendorMatchParam = requireVendorMatchParam;
exports.setAuthCookie = setAuthCookie;
exports.clearAuthCookie = clearAuthCookie;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const httpError_1 = require("../utils/httpError");
function requireAuth(req, _res, next) {
    // Try to get token from httpOnly cookie first, then fallback to Authorization header
    let token = req.signedCookies?.authToken;
    if (!token) {
        const header = req.header('authorization') ?? '';
        token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
    }
    if (!token) {
        throw new httpError_1.HttpError(401, 'Missing authentication token');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        throw new httpError_1.HttpError(401, 'Invalid or expired token');
    }
}
function requireRole(...roles) {
    return (req, _res, next) => {
        const role = req.user?.role;
        if (!role)
            throw new httpError_1.HttpError(401, 'Unauthenticated');
        if (!roles.includes(role))
            throw new httpError_1.HttpError(403, 'Forbidden');
        next();
    };
}
/**
 * If the caller is a vendor user, enforce that the vendorId in the route param matches
 * the vendorId embedded in their JWT.
 */
function requireVendorMatchParam(paramName = 'vendorId') {
    return (req, _res, next) => {
        const role = req.user?.role;
        if (!role)
            throw new httpError_1.HttpError(401, 'Unauthenticated');
        if (role === 'vendor') {
            const tokenVendorId = req.user?.vendorId;
            const routeVendorId = req.params?.[paramName];
            if (!tokenVendorId)
                throw new httpError_1.HttpError(403, 'Vendor user is missing vendorId');
            if (!routeVendorId)
                throw new httpError_1.HttpError(400, `Missing route param: ${paramName}`);
            if (String(tokenVendorId) !== String(routeVendorId))
                throw new httpError_1.HttpError(403, 'Forbidden');
        }
        next();
    };
}
/**
 * Set secure httpOnly cookie with JWT token
 */
function setAuthCookie(res, token) {
    const isProduction = env_1.env.NODE_ENV === 'production';
    res.cookie('authToken', token, {
        httpOnly: true,
        secure: isProduction, // Only send over HTTPS in production
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        signed: true, // Sign the cookie to prevent tampering
    });
}
/**
 * Clear authentication cookie
 */
function clearAuthCookie(res) {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: env_1.env.NODE_ENV === 'production',
        sameSite: env_1.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        signed: true,
    });
}
