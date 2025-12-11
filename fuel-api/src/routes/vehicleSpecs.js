import express from 'express';
import {
  listVehicleSpecs,
  getVehicleSpec,
  updateVehicleSpecification,
  syncFromTraccarAttributes,
  bulkUpdateSpecs
} from '../controllers/vehicleSpecController.js';
import { authenticate, requireManager } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// List all vehicle specifications (managers only)
router.get('/', requireManager, listVehicleSpecs);

// Get single vehicle specification
router.get('/:deviceId', getVehicleSpec);

// Update vehicle specification (managers only)
router.put('/:deviceId', requireManager, updateVehicleSpecification);

// Sync from Traccar attributes (managers only)
router.post('/:deviceId/sync', requireManager, syncFromTraccarAttributes);

// Bulk update specifications (managers only)
router.post('/bulk-update', requireManager, bulkUpdateSpecs);

export default router;



