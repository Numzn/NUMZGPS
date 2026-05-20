import { listBySessionId } from '../repositories/operationSessionRefuelRepository.js';
import {
  summarizeTotalsFromRefuels,
  buildStatusCounts,
  uniqueVehicleCount,
} from '../intelligence/AggregationEngine.js';

export { summarizeTotalsFromRefuels } from '../intelligence/AggregationEngine.js';

export async function calculateSessionTotals(sessionId, options = {}) {
  const refuels = await listBySessionId(sessionId, options);
  return summarizeTotalsFromRefuels(refuels);
}

export async function buildSessionSummaryWithStatus(sessionId, options = {}) {
  const refuels = await listBySessionId(sessionId, options);
  const statusCounts = buildStatusCounts(refuels);
  return {
    vehicleCount: uniqueVehicleCount(refuels),
    statusCounts,
  };
}
