import { FuelRequest } from '../../models/index.js';
import { emitDomainEvent } from '../../events/eventBus.js';
import { EVENT_NAMES } from '../../events/eventNames.js';
import { canFulfillFuelRequest } from '../authorization.js';

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

    if (!canFulfillFuelRequest(req.user, request)) {
      console.error('❌ Forbidden - User', req.user?.id, 'cannot fulfill request owned by', request.userId);
      return res.status(403).json({ error: 'Forbidden - Can only fulfill your own requests' });
    }

    if (request.status !== 'approved') {
      console.error('❌ Invalid status transition:', request.status, '→ fulfilled');
      return res.status(400).json({ error: 'Can only fulfill approved requests' });
    }

    const previousStatus = request.status;
    const { actualFulfilledAmount } = req.body || {};

    request.status = 'fulfilled';
    request.fulfillmentTime = new Date();

    // ── Reconciliation: record actual quantity dispensed if provided ──
    if (actualFulfilledAmount !== undefined && Number.isFinite(Number(actualFulfilledAmount))) {
      const actual = Number(actualFulfilledAmount);
      request.actualFulfilledAmount = actual;
      // Derive actual cost from the locked rate so comparison is apples-to-apples
      if (request.lockedPricePerUnit) {
        request.actualFulfilledCost = Number((actual * request.lockedPricePerUnit).toFixed(2));
      }
    }

    await request.save();

    emitDomainEvent(EVENT_NAMES.FUEL_REQUEST_FULFILLED, {
      request,
      previousStatus,
      actorUserId: req.user.id,
    });

    res.json(request);
  } catch (error) {
    console.error('Fulfill fuel request error:', error);
    res.status(500).json({ error: 'Failed to fulfill fuel request' });
  }
};

