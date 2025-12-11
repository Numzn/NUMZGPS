import { FuelRequest } from '../../models/index.js';
import { emitFuelRequestUpdated } from '../handlers/socketEvents.js';

/**
 * Mark fuel request as fulfilled
 */
export const fulfillFuelRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await FuelRequest.findByPk(id);

    if (!request) {
      console.error('❌ Fuel request not found:', id);
      return res.status(404).json({ error: 'Fuel request not found' });
    }

    if (request.status !== 'approved') {
      console.error('❌ Invalid status transition:', request.status, '→ fulfilled');
      return res.status(400).json({ error: 'Can only fulfill approved requests' });
    }

    const previousStatus = request.status;
    request.status = 'fulfilled';
    request.fulfillmentTime = new Date();
    
    await request.save();

    // Emit WebSocket event with enhanced feedback
    emitFuelRequestUpdated(req.io, request, 'fulfilled', previousStatus, req.user.id);

    res.json(request);
  } catch (error) {
    console.error('Fulfill fuel request error:', error);
    res.status(500).json({ error: 'Failed to fulfill fuel request' });
  }
};

