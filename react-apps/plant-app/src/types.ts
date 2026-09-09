export interface PlantData {
  common_name: string;
  scientific_name: string;
  plant_type: string;
  origin_country: string;
  history: string;
  growth_suitability: string;
  water_needs: string;
  nourishment_needs: string;
  estimated_value: string;
  fun_fact?: string;
}

export interface AnalysisResult {
  data: PlantData | null;
  error: string | null;
  loading: boolean;
}

export interface UserProfile {
  id: string;
  pin: string | null;
}
