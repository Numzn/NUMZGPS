import express from 'express';
import {
  createFuelRequest,
  listFuelRequests,
  getFuelRequest,
  approveFuelRequest,
  rejectFuelRequest,
  cancelFuelRequest,
  fulfillFuelRequest,
  getValidationDetails
} from '../controllers/index.js';
import { authenticate, requireManager } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// List fuel requests (filtered by role automatically)
router.get('/', listFuelRequests);

// Get single fuel request
router.get('/:id', getFuelRequest);

// Get validation details for fuel request
router.get('/:id/validation', getValidationDetails);

// Create fuel request (drivers)
router.post('/', createFuelRequest);

// Approve fuel request (managers only)
router.put('/:id/approve', requireManager, approveFuelRequest);

// Reject fuel request (managers only)
router.put('/:id/reject', requireManager, rejectFuelRequest);

// Cancel fuel request (driver - own requests only)
router.delete('/:id', cancelFuelRequest);

// Mark as fulfilled
router.put('/:id/fulfill', fulfillFuelRequest);

export default router;

