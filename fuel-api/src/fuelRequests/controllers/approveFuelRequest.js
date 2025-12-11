import { FuelRequest } from '../../models/index.js';
import { emitFuelRequestUpdated } from '../handlers/socketEvents.js';

/**
 * Approve fuel request (Manager only)
 */
export const approveFuelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, approvedAmount } = req.body;

    const request = await FuelRequest.findByPk(id);

    if (!request) {
      console.error('❌ Fuel request not found:', id);
      return res.status(404).json({ error: 'Fuel request not found' });
    }

    if (request.status !== 'pending') {
      console.error('❌ Invalid status transition:', request.status, '→ approved');
      return res.status(400).json({ error: 'Can only approve pending requests' });
    }

    // Update request with approved amount (can differ from requested)
    const finalAmount = approvedAmount || request.requestedAmount;
    const previousStatus = request.status;
    
    request.status = 'approved';
    request.approvedAmount = finalAmount;
    request.reviewTime = new Date();
    request.reviewerId = req.user.id;
    request.notes = notes || `Approved ${finalAmount}L`;

    await request.save();

    // Emit WebSocket event with enhanced feedback
    const message = notes 
      ? `Your fuel request for ${finalAmount}L has been approved: ${notes}`
      : `Your fuel request for ${finalAmount}L has been approved`;
    
    if (!req.io) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [DEBUG] req.io is UNDEFINED - WebSocket events will not be sent!');
      }
    }
    
    emitFuelRequestUpdated(req.io, request, 'approved', previousStatus, req.user.id, message);

    res.json(request);
  } catch (error) {
    console.error('Approve fuel request error:', error);
    res.status(500).json({ error: 'Failed to approve fuel request' });
  }
};

