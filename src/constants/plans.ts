import type { PlanType } from '@/types/settings';

export interface PlanInfo {
  id: PlanType;
  name: string;
  price: string;
  features: string[];
}

export const PLANS: Record<PlanType, PlanInfo> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 'Free',
    features: [
      'Unlimited products',
      'Barcode scanner',
      'Stock management',
      'Product photos',
    ],
  },
  pro_local: {
    id: 'pro_local',
    name: 'Pro Local',
    price: '$1.99',
    features: [
      'Everything in Free',
      'Backup to file',
      'Restore from backup',
      'Export to CSV',
      'Export to PDF',
    ],
  },
  pro_cloud: {
    id: 'pro_cloud',
    name: 'Pro Cloud',
    price: '$0.99/month',
    features: [
      'Everything in Pro Local',
      'Automatic cloud backup',
      'Restore on new device',
      'Backup history',
    ],
  },
};
