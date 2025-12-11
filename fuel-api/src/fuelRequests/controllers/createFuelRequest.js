import { FuelRequest } from '../../models/index.js';
import { getTraccarDevice, getTraccarPosition } from '../../config/traccar.js';
import { getVehicleSpec } from '../../services/vehicleSpecService.js';
import { validateFuelRequest } from '../services/fuelValidationService.js';
import { emitFuelRequestCreated } from '../handlers/socketEvents.js';

/**
 * Create a new fuel request (Driver)
 */
export const createFuelRequest = async (req, res) => {
  try {
    const {
      deviceId,
      requestedAmount,
      reason,
      urgency = 'normal'
    } = req.body;

    // Validate required fields
    if (!deviceId || !requestedAmount) {
      console.error('❌ Missing required fields:', { deviceId, requestedAmount });
      return res.status(400).json({ error: 'Missing required fields: deviceId, requestedAmount' });
    }

    // Get current device position from Traccar
    const position = await getTraccarPosition(deviceId);
    const device = await getTraccarDevice(deviceId);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Extract fuel level from position attributes if available
    const currentFuelLevel = position?.attributes?.fuel || position?.attributes?.fuelLevel || 0;

    // Get vehicle specifications
    const vehicleSpec = await getVehicleSpec(deviceId);

    // Run validation
    const validation = await validateFuelRequest(
      vehicleSpec,
      currentFuelLevel,
      requestedAmount,
      null // No trip data for now
    );

    // Block if hard validation fails
    if (!validation.valid && validation.severity === 'critical') {
      return res.status(400).json({
        error: 'Request exceeds vehicle capacity',
        message: validation.warnings[0]?.message || 'Invalid fuel request',
        ...validation
      });
    }

    // Create fuel request with validation results
    const fuelRequest = await FuelRequest.create({
      deviceId,
      userId: req.user.id,
      currentFuelLevel,
      requestedAmount,
      reason,
      urgency,
      latitude: position?.latitude || null,
      longitude: position?.longitude || null,
      status: 'pending',
      validationWarnings: validation.warnings,
      managerSuggestion: validation.suggestedAmount
    });

    if (!req.io) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [DEBUG CREATE] req.io is UNDEFINED - WebSocket events will not be sent!');
      }
    }
    
    // Emit WebSocket event to managers
    emitFuelRequestCreated(req.io, fuelRequest, req.user.id);

    res.status(201).json(fuelRequest);
  } catch (error) {
    console.error('Create fuel request error:', error);
    res.status(500).json({ error: 'Failed to create fuel request' });
  }
};

