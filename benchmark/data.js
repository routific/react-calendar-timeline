// Deterministic routes shaped like planning-web's routes Gantt: per route a shift bar, two
// route-line segments, start/end depots, 34 delivery stops (tiny enough to cluster at a
// full-day zoom), one idle gap and one break. 67 routes => 2,747 items.
export const MINUTE = 60 * 1000;
export const HOUR = 60 * MINUTE;
export const DAY_START = Date.UTC(2026, 10, 17);
export const ROUTES_PER_DAY = 67;
export const ROUTES_PER_PAGE = 25;
const STOPS_PER_ROUTE = 34;
const COLORS = ['#e8590c', '#1c7ed6', '#2f9e44', '#ae3ec9', '#f08c00', '#0c8599', '#c2255c', '#5f3dc4'];

function seeded(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function route(index) {
  const random = seeded(index + 1);
  const id = `route-${index}`;
  const color = COLORS[index % COLORS.length];
  const shiftStart = DAY_START + 7 * HOUR + Math.round(random() * 90) * MINUTE;
  const departure = shiftStart + 15 * MINUTE;
  const items = [];
  const base = { group: id, color };

  let time = departure;
  items.push({ ...base, id: `${id}-depot-start`, eventType: 'DEPOT', start_time: time, end_time: time + MINUTE, canCluster: false });
  for (let s = 1; s <= STOPS_PER_ROUTE; s += 1) {
    time += (5 + Math.round(random() * 9)) * MINUTE;
    if (s === 17) {
      items.push({ ...base, id: `${id}-break`, eventType: 'PAUSED', start_time: time, end_time: time + 30 * MINUTE, canCluster: false });
      time += 30 * MINUTE;
    }
    if (s === 25) {
      items.push({ ...base, id: `${id}-idle`, eventType: 'IDLING', start_time: time, end_time: time + 25 * MINUTE, canCluster: false });
      time += 25 * MINUTE;
    }
    const service = (2 + Math.round(random() * 5)) * MINUTE;
    items.push({
      ...base,
      id: `${id}-stop-${s}`,
      eventType: 'DELIVERING_STOP',
      stopSequence: s,
      late: random() < 0.08,
      start_time: time,
      end_time: time + service,
      canCluster: true,
    });
    time += service;
  }
  time += 20 * MINUTE;
  items.push({ ...base, id: `${id}-depot-end`, eventType: 'DEPOT', start_time: time, end_time: time + MINUTE, canCluster: false });
  const middle = departure + Math.round((time - departure) / 2);
  items.push({ ...base, id: `${id}-line-1`, eventType: 'ROUTE_LINE', start_time: departure, end_time: middle, canCluster: false });
  items.push({ ...base, id: `${id}-line-2`, eventType: 'ROUTE_LINE', start_time: middle, end_time: time, canCluster: false });
  items.push({ ...base, id: `${id}-shift`, eventType: 'SHIFT_TIME', start_time: shiftStart, end_time: time + 30 * MINUTE, canCluster: false });

  const group = {
    id,
    title: `Route ${index + 1}`,
    driver: `Driver ${String.fromCharCode(65 + (index % 26))}. ${index}`,
    color,
    stops: STOPS_PER_ROUTE,
    distance: 40 + Math.round(random() * 80),
    duration: `${Math.round((time - departure) / HOUR)}h`,
  };
  return { group, items };
}

export function generateRoutes(firstIndex, count) {
  const groups = [];
  const items = [];
  for (let i = firstIndex; i < firstIndex + count; i += 1) {
    const r = route(i);
    groups.push(r.group);
    items.push(...r.items);
  }
  return { groups, items };
}
