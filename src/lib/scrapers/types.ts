export interface MortgageRateData {
  rate: number;
  date: string;
  source: string;
  note?: string;
}

export interface ScraperResult {
  success: boolean;
  data?: MortgageRateData;
  error?: string;
} 