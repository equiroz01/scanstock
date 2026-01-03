import { create } from 'zustand';
import type { PlanType } from '@/types/settings';

interface PlanState {
  plan: PlanType;
  isProLocal: boolean;
  isProCloud: boolean;
  setPlan: (plan: PlanType) => void;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plan: 'free',

  get isProLocal() {
    const plan = get().plan;
    return plan === 'pro_local' || plan === 'pro_cloud';
  },

  get isProCloud() {
    return get().plan === 'pro_cloud';
  },

  setPlan: (plan: PlanType) => set({ plan }),
}));
