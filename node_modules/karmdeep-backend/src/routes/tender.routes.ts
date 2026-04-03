import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth, requireRole } from '../middleware/auth';
import * as Tender from '../controllers/tender.controller';

export const tenderRouter = Router();

tenderRouter.post('/', requireAuth, requireRole('buyer', 'admin'), asyncHandler(Tender.createTender));
tenderRouter.get('/', requireAuth, asyncHandler(Tender.listTenders));
tenderRouter.get('/:tenderId', requireAuth, asyncHandler(Tender.getTender));
tenderRouter.put('/:tenderId', requireAuth, requireRole('buyer', 'admin'), asyncHandler(Tender.updateTender));
tenderRouter.delete('/:tenderId', requireAuth, requireRole('buyer', 'admin'), asyncHandler(Tender.deleteTender));

// Vendors can bid (admins can bid too for testing)
tenderRouter.post('/:tenderId/bids', requireAuth, requireRole('vendor', 'admin'), asyncHandler(Tender.submitBid));
tenderRouter.get('/:tenderId/bids', requireAuth, asyncHandler(Tender.getBids));
