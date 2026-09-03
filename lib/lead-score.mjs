export function calculateLeadScore({ fit = 0, need = 0, location = 0, size = 0, contactability = 0, intent = 0 }) {
  const raw = fit * 0.3 + need * 0.25 + location * 0.15 + size * 0.1 + contactability * 0.1 + intent * 0.1;
  return Math.max(0, Math.min(100, Math.round(raw)));
}
