import mapboxgl from "mapbox-gl";
import { vehicleIcon } from "@/lib/mapIcons";

export interface DriverMarkerState {
  lngLat: [number, number];
  color: string;
  label: string;
  selected: boolean;
  heading?: number;
  vehicle?: string;
}

/**
 * Imperative mapbox marker wrapper. A plain class (not React) keeps marker
 * updates off the React render path so 2s GPS ticks stay cheap; the CSS
 * transition on the wrapper element is what makes movement glide instead of jump.
 */
export class DriverMarker {
  private marker: mapboxgl.Marker;
  private root: HTMLDivElement;
  private dot: HTMLDivElement;
  private label: HTMLDivElement;
  private lastVehicle: string | undefined;

  constructor(id: string, onClick: () => void) {
    this.root = document.createElement("div");
    this.root.className = "driver-marker";

    this.dot = document.createElement("div");
    this.dot.className = "driver-dot";
    this.dot.innerHTML = vehicleIcon(undefined);
    this.root.appendChild(this.dot);

    this.label = document.createElement("div");
    this.label.className = "driver-label";
    this.label.textContent = id;
    this.root.appendChild(this.label);

    this.root.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick();
    });

    this.marker = new mapboxgl.Marker({ element: this.root, anchor: "center" });
  }

  mount(map: mapboxgl.Map) {
    this.marker.addTo(map);
    // Mapbox positions the outer .mapboxgl-marker via CSS transform — animate that
    // so cars glide between ~5s location ticks instead of jumping.
    const el = this.marker.getElement();
    const wrapper = el.parentElement?.classList.contains("mapboxgl-marker")
      ? el.parentElement
      : el.classList.contains("mapboxgl-marker")
        ? el
        : el.closest(".mapboxgl-marker");
    wrapper?.classList.add("driver-marker-root");
  }

  update(state: DriverMarkerState) {
    this.marker.setLngLat(state.lngLat);
    this.dot.style.background = state.color;
    this.dot.style.boxShadow = `0 0 0 4px ${state.color}22, 0 0 12px 2px ${state.color}66`;
    this.root.classList.toggle("driver-marker-selected", state.selected);
    if (state.vehicle !== this.lastVehicle) {
      this.dot.innerHTML = vehicleIcon(state.vehicle);
      this.lastVehicle = state.vehicle;
    }
    if (state.heading !== undefined) {
      this.dot.style.transform = `rotate(${state.heading}deg)`;
    }
  }

  remove() {
    this.marker.remove();
  }
}
