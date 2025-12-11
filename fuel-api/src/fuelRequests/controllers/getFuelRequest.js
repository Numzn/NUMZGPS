import { FuelRequest } from '../../models/index.js';

/**
 * Get single fuel request by ID
 */
export const getFuelRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await FuelRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({ error: 'Fuel request not found' });
    }

    // Drivers can only view their own requests
    if (req.user.isDriver && request.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(request);
  } catch (error) {
    console.error('Get fuel request error:', error);
    res.status(500).json({ error: 'Failed to fetch fuel request' });
  }
};

