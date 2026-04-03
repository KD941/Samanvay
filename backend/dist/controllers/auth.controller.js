"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.me = me;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const User_1 = require("../models/User");
const httpError_1 = require("../utils/httpError");
const token_1 = require("../services/token");
const auth_1 = require("../middleware/auth");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    role: zod_1.z.enum(['admin', 'buyer', 'vendor', 'maintenance', 'analyst']),
    vendorId: zod_1.z.string().optional()
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1)
});
async function register(req, res) {
    const data = registerSchema.parse(req.body);
    const existing = await User_1.User.findOne({ email: data.email });
    if (existing)
        throw new httpError_1.HttpError(409, 'Email already registered');
    const passwordHash = await bcryptjs_1.default.hash(data.password, 10);
    const user = await User_1.User.create({
        email: data.email,
        passwordHash,
        name: data.name,
        phone: data.phone,
        role: data.role,
        vendorId: data.vendorId
    });
    const token = (0, token_1.signToken)({ sub: String(user._id), role: data.role, vendorId: data.vendorId });
    // Set secure httpOnly cookie instead of returning token in response
    (0, auth_1.setAuthCookie)(res, token);
    res.status(201).json({
        user: {
            id: user._id,
            email: user.email,
            role: user.role,
            vendorId: user.vendorId
        }
    });
}
async function login(req, res) {
    const data = loginSchema.parse(req.body);
    const user = await User_1.User.findOne({ email: data.email });
    if (!user)
        throw new httpError_1.HttpError(401, 'Invalid credentials');
    const ok = await bcryptjs_1.default.compare(data.password, user.passwordHash);
    if (!ok)
        throw new httpError_1.HttpError(401, 'Invalid credentials');
    const token = (0, token_1.signToken)({ sub: String(user._id), role: user.role, vendorId: user.vendorId ? String(user.vendorId) : undefined });
    // Set secure httpOnly cookie instead of returning token in response
    (0, auth_1.setAuthCookie)(res, token);
    res.json({
        user: {
            id: user._id,
            email: user.email,
            role: user.role,
            vendorId: user.vendorId
        }
    });
}
async function logout(req, res) {
    (0, auth_1.clearAuthCookie)(res);
    res.json({ message: 'Logged out successfully' });
}
async function me(req, res) {
    // This endpoint is protected by requireAuth middleware
    // which sets req.user from the JWT token
    if (!req.user) {
        throw new httpError_1.HttpError(401, 'Not authenticated');
    }
    // Fetch fresh user data from database
    const user = await User_1.User.findById(req.user.sub);
    if (!user) {
        throw new httpError_1.HttpError(404, 'User not found');
    }
    res.json({
        id: user._id,
        email: user.email,
        role: user.role,
        vendorId: user.vendorId,
        name: user.name,
        phone: user.phone
    });
}
