"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenderRouter = void 0;
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const Tender = __importStar(require("../controllers/tender.controller"));
exports.tenderRouter = (0, express_1.Router)();
exports.tenderRouter.post('/', auth_1.requireAuth, (0, auth_1.requireRole)('buyer', 'admin'), (0, asyncHandler_1.asyncHandler)(Tender.createTender));
exports.tenderRouter.get('/', auth_1.requireAuth, (0, asyncHandler_1.asyncHandler)(Tender.listTenders));
exports.tenderRouter.get('/:tenderId', auth_1.requireAuth, (0, asyncHandler_1.asyncHandler)(Tender.getTender));
exports.tenderRouter.put('/:tenderId', auth_1.requireAuth, (0, auth_1.requireRole)('buyer', 'admin'), (0, asyncHandler_1.asyncHandler)(Tender.updateTender));
exports.tenderRouter.delete('/:tenderId', auth_1.requireAuth, (0, auth_1.requireRole)('buyer', 'admin'), (0, asyncHandler_1.asyncHandler)(Tender.deleteTender));
// Vendors can bid (admins can bid too for testing)
exports.tenderRouter.post('/:tenderId/bids', auth_1.requireAuth, (0, auth_1.requireRole)('vendor', 'admin'), (0, asyncHandler_1.asyncHandler)(Tender.submitBid));
exports.tenderRouter.get('/:tenderId/bids', auth_1.requireAuth, (0, asyncHandler_1.asyncHandler)(Tender.getBids));
