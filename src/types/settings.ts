export type PlanType = 'free' | 'pro_local' | 'pro_cloud';

export interface Settings {
  currency: string;
  currencySymbol: string;
  plan: PlanType;
  lastBackup: string | null;
}

export const DEFAULT_SETTINGS: Settings = {
  currency: 'USD',
  currencySymbol: '$',
  plan: 'free',
  lastBackup: null,
};
