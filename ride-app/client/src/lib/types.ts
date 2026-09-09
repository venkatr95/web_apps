export type DriverStatus =
  | "offline"
  | "available"
  | "reserved"
  | "accepted"
  | "en_route"
  | "on_trip"
  | "busy";

export interface Driver {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating: number;
  acceptance_rate: number;
  cancellation_rate: number;
  idle_minutes: number;
  status: DriverStatus;
  vehicle: string;
  vehicle_number?: string;
  heading?: number;
  speed?: number;
  last_update?: number;
  reserved_until?: number | null;
  current_ride_id?: string | null;
}

export interface ScoreBreakdown {
  eta_score: number;
  distance_score: number;
  rating_score: number;
  acceptance_score: number;
  cancellation_score: number;
  idle_score: number;
}

export interface RankedCandidate {
  id: string;
  name?: string;
  distance_km?: number;
  eta_minutes?: number;
  final_score?: number;
  score_breakdown?: ScoreBreakdown;
  rating?: number;
  vehicle?: string;
  status?: string;
}

export interface NearbyDriver {
  driver: string;
  name?: string;
  eta?: number;
  distance_km?: number;
  rating?: number;
  score?: number;
  vehicle?: string;
  breakdown?: ScoreBreakdown;
}

export interface FareBreakdown {
  ride_type: string;
  total: number;
  surge_multiplier: number;
  base?: number;
  base_fare?: number;
  distance_fare?: number;
  time_fare?: number;
  min_fare?: number;
  currency?: string;
}

export interface FareEstimate {
  distance_km: number;
  eta_minutes: number;
  surge: number;
  fare: FareBreakdown;
}

export interface OfferAttempt {
  driver_id: string;
  result: string;
  score?: number;
  ts: number;
}

export interface TimelineEvent {
  ts: number;
  event: string;
  message: string;
}

export type RideStatus =
  | "searching"
  | "offered"
  | "allocated"
  | "en_route"
  | "on_trip"
  | "completed"
  | "cancelled"
  | "no_drivers";

export interface RouteInfo {
  id?: string;
  rank?: number;
  label?: string;
  tags?: string[];
  summary?: string;
  coordinates: [number, number][]; // [lon, lat]
  distance_km: number;
  duration_min: number;
  duration_adj_min?: number;
  source?: string;
  cost?: number;
  traffic?: string;
  alternatives_considered?: number;
  blocker_hits?: { id?: string; type?: string; depth?: number }[];
  blockers_avoided?: string[];
  events_accounted?: { id?: string; name?: string; type?: string; active?: boolean }[];
  optimized?: boolean;
  hard_hit?: boolean;
  follows_roads?: boolean;
  profile?: "driving" | "cycling" | string;
  vru_care_hits?: { id?: string; name?: string; depth?: number }[];
}

export interface RouteBundle {
  routes: RouteInfo[];
  selected: RouteInfo | null;
  conditions?: {
    traffic?: string;
    active_blockers?: { id: string; name?: string; type?: string }[];
    events?: Blocker[];
  };
  alternatives_considered?: number;
}

export interface Blocker {
  id: string;
  name: string;
  type: "closure" | "congestion" | "event" | string;
  lat: number;
  lon: number;
  radius_km: number;
  severity: number;
  active: boolean;
  auto?: boolean;
  description?: string;
}

export interface Ride {
  id: string;
  tracking_token?: string;
  passenger: string;
  pickup_lat: number;
  pickup_lon: number;
  destination_lat: number;
  destination_lon: number;
  /** Intermediate stops (max 2), each { lat, lon, address? }. */
  stops?: { lat: number; lon: number; address?: string | null }[];
  ride_type: string;
  status: RideStatus;
  driver_id?: string | null;
  driver_name?: string | null;
  eta_minutes?: number | null;
  distance_km?: number | null;
  fare?: FareBreakdown;
  ranked_candidates?: RankedCandidate[];
  offer_attempts?: OfferAttempt[];
  retry_count?: number;
  max_retries?: number;
  timeline?: TimelineEvent[];
  match_latency_ms?: number | null;
  offer_expires_at?: number | null;
  offer_timeout_sec?: number;
  /** Matching window (finding a driver). */
  match_min_sec?: number;
  match_max_sec?: number;
  match_deadline_at?: number | null;
  /** Set when driver accepts (allocation confirmed). */
  confirmed_at?: number | null;
  cancel_reason?: string | null;
  cancel_penalty_eur?: number | null;
  created_at?: number;
  route_to_pickup?: RouteInfo | null;
  route_to_destination?: RouteInfo | null;
  route_options_pickup?: RouteInfo[];
  route_options_destination?: RouteInfo[];
  selected_route_id?: string | null;
  route_conditions?: RouteBundle["conditions"] | null;
  active_route?: "to_pickup" | "to_destination" | null;
  route_progress_index?: number;
}

/** Public shareable tracking snapshot from GET /api/track/{token} */
export interface TrackSnapshot {
  ride_id: string;
  tracking_token?: string;
  status: RideStatus | string;
  passenger?: string;
  ride_type?: string;
  pickup: { lat: number; lon: number };
  destination: { lat: number; lon: number };
  eta_minutes?: number | null;
  distance_km?: number | null;
  fare?: FareBreakdown;
  driver?: {
    id?: string;
    name?: string;
    latitude?: number | null;
    longitude?: number | null;
    heading?: number | null;
    vehicle?: string;
    vehicle_number?: string;
    status?: string;
  } | null;
  routing_profile?: string;
  route?: {
    id?: string;
    label?: string;
    summary?: string;
    distance_km?: number;
    duration_adj_min?: number;
    coordinates?: [number, number][] | number[][];
    remaining_coordinates?: [number, number][] | number[][];
    source?: string;
    follows_roads?: boolean;
    profile?: string;
  } | null;
  timeline?: TimelineEvent[];
  updated_at?: number;
  created_at?: number;
  is_active?: boolean;
  share_message?: string;
}

export interface AllocationLogCandidate {
  driver_id: string;
  final_score?: number;
  eta_minutes?: number;
}

export interface AllocationLog {
  ride_id: string;
  phase: string;
  selected_driver?: string | null;
  candidates?: AllocationLogCandidate[];
  timestamp: number;
}

export interface AdminStats {
  drivers_by_status: Record<string, number>;
  rides_by_status: Record<string, number>;
  total_rides: number;
  completed_rides: number;
  avg_match_latency_ms: number | null;
  surge: number;
  traffic: string;
  zone: string;
  weights: Record<string, number>;
}

export type WsEventType =
  | "snapshot"
  | "driver_location"
  | "driver_status"
  | "ride_created"
  | "ride_updated"
  | "ride_allocated"
  | "ride_completed"
  | "ride_offer"
  | "traffic_updated"
  | "blockers_updated"
  | "conditions_updated"
  | "system"
  | "pong";

export interface WsMessage<T = unknown> {
  type: WsEventType;
  payload: T;
  ts?: number;
}

export interface SnapshotPayload {
  drivers: Driver[];
  rides: Ride[];
  blockers?: Blocker[];
  stats?: { traffic: string; available: number };
}

export interface BlockersPayload {
  blockers: Blocker[];
}

export interface DriverLocationPayload {
  driver_id: string;
  latitude: number;
  longitude: number;
  status?: string;
  heading?: number;
  ride_id?: string;
  route_progress_index?: number;
  remaining_km?: number;
}

export interface DriverStatusPayload {
  driver_id: string;
  status: string;
  ride_id?: string;
}

export interface RidePayload {
  ride: Ride;
}

export interface RideOfferPayload {
  ride: Ride;
  driver_id: string;
  timeout_sec: number;
  score?: number;
  breakdown?: ScoreBreakdown;
}

export interface TrafficPayload {
  traffic: string;
}

export type RideType = "rideGo" | "rideX" | "ridePremier" | "bikeTaxi";

export interface LatLon {
  lat: number;
  lon: number;
  /** Human-readable address / place name (autocomplete or reverse geocode). */
  address?: string;
}

/** Intermediate stop on a multi-stop trip (max 2 per product rule). */
export interface TripStop extends LatLon {
  id: string;
}

export interface PlaceSuggestion {
  id: string;
  primary: string;
  secondary: string;
  full: string;
  lat: number;
  lon: number;
  source: "mapbox" | "preset";
}
