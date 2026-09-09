/**
 * Inline SVG marker glyphs (lucide path data, hand-embedded) for use in
 * vanilla-DOM Mapbox markers, which can't render React icon components.
 */
function icon(inner: string): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

export const CAR_ICON = icon(
  `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
   <circle cx="7" cy="17" r="2"></circle>
   <path d="M9 17h6"></path>
   <circle cx="17" cy="17" r="2"></circle>`
);

export const BIKE_ICON = icon(
  `<circle cx="18.5" cy="17.5" r="3.5"></circle>
   <circle cx="5.5" cy="17.5" r="3.5"></circle>
   <circle cx="15" cy="5" r="1"></circle>
   <path d="M12 17.5V14l-3-3 4-3 2 3h2"></path>`
);

export const PERSON_ICON = icon(
  `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
   <circle cx="12" cy="7" r="4"></circle>`
);

export const FLAG_ICON = icon(
  `<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"></path>`
);

/** Best-effort vehicle -> glyph mapping from the free-text `vehicle` field. */
export function vehicleIcon(vehicle: string | undefined): string {
  const v = (vehicle || "").toLowerCase();
  if (
    v.includes("bike") ||
    v.includes("moto") ||
    v.includes("scooter") ||
    v === "biketaxi"
  ) {
    return BIKE_ICON;
  }
  return CAR_ICON;
}
