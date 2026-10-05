/**
 * UrbanFlow Pedestrian Simulation Engine
 * Generates high-fidelity cyclical crowd density metrics based on diurnal rhythms,
 * weekend multipliers, zone characteristics, and active event surges.
 */

function gaussian(x, mean, sigma, amplitude) {
  const diff = x - mean;
  return amplitude * Math.exp(-(diff * diff) / (2 * sigma * sigma));
}

/**
 * Calculates pedestrian density for a given zone and timestamp.
 * @param {Object} zone - Zone object containing { _id, threshold, name }
 * @param {Date|number} timestamp - Target time
 * @param {Array} events - Optional list of events to evaluate surges
 * @returns {number} Calculated density (pedestrians per area unit)
 */
function calculateDensity(zone, timestamp, events = []) {
  const date = new Date(timestamp);
  const hour = date.getHours() + date.getMinutes() / 60;
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Base diurnal rhythm:
  // Base night minimum (~12) + morning peak (~50 at 08:45) + lunch peak (~58 at 13:00) + evening peak (~75 at 19:30)
  let density = 12
    + gaussian(hour, 8.75, 1.2, 42)   // Morning commute (07:30 - 10:00)
    + gaussian(hour, 13.0, 1.3, 46)   // Lunch break (11:45 - 14:15)
    + gaussian(hour, 16.0, 1.8, 30)   // Afternoon circulation
    + gaussian(hour, 19.5, 1.5, 62);  // Evening aperitivo & dinner (18:00 - 21:30)

  // Central zones (Duomo, Fiera, Centro) have a slightly higher baseline
  const isCenter = zone.name && /centro|duomo|fiera/i.test(zone.name);
  if (isCenter) {
    density *= 1.2;
  }

  // Weekend effect: higher afternoon/evening activity in city center
  if (isWeekend) {
    if (hour >= 11 && hour <= 23) {
      density *= 1.35;
    } else {
      density *= 0.85; // quieter weekend mornings
    }
  }

  // Check if an event is active in this zone at this timestamp
  const zoneIdStr = String(zone._id || zone);
  const activeEvent = events.find((ev) => {
    const start = new Date(ev.startDate).getTime();
    const end = new Date(ev.endDate).getTime();
    const time = date.getTime();
    const matchesZone = Array.isArray(ev.zones) && ev.zones.some((z) => z != null && String(z._id || z) === zoneIdStr);
    return matchesZone && time >= start && time <= end;
  });

  if (activeEvent) {
    // Event surge: boost density by +50% to +80%, ensuring it reaches/exceeds alert threshold
    const targetThreshold = zone.threshold || 75;
    density = Math.max(density * 1.65, targetThreshold * (1.1 + Math.random() * 0.25));
  }

  // Add realistic small natural jitter (+/- 5%)
  const jitter = 1 + (Math.sin(date.getTime() / 600000) * 0.04 + (Math.random() - 0.5) * 0.03);
  density *= jitter;

  return Math.max(5, Math.round(density));
}

/**
 * Generates continuous historical time-series for a zone over the past N days.
 * @param {Object} zone
 * @param {number} days
 * @param {number} intervalMinutes
 * @param {Array} events
 * @returns {Array<{ density: number, timestamp: number }>} Newest entries first
 */
function generateHistoricalSeries(zone, days = 14, intervalMinutes = 30, events = []) {
  const points = [];
  const now = Date.now();
  const stepMs = intervalMinutes * 60 * 1000;
  const totalPoints = Math.floor((days * 24 * 60) / intervalMinutes);

  for (let i = 0; i < totalPoints; i++) {
    const timestamp = now - i * stepMs;
    const density = calculateDensity(zone, timestamp, events);
    points.push({
      density,
      timestamp,
    });
  }

  return points; // Newest first (index 0 is closest to now)
}

module.exports = {
  calculateDensity,
  generateHistoricalSeries,
};
