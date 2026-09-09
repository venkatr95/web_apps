export interface CoinData {
  name: string;
  country: string;
  year: string;
  value_estimate: string;
  composition: string;
  history: string;
  fun_fact?: string;
}

export interface AnalysisResponse {
  data?: CoinData;
  error?: string;
}

export interface AnalysisState {
  isLoading: boolean;
  data: CoinData | null;
  error: string | null;
}
