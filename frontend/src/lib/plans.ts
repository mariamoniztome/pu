export type PlanId = 'free' | 'basic' | 'professional' | 'enterprise';

export interface PlanDef {
  id: PlanId;
  maxDoctors: number;
  maxPatients: number;
  priceEUR: number | null;
}

export const PLANS: PlanDef[] = [
  { id: 'free', maxDoctors: 1, maxPatients: 50, priceEUR: 0 },
  { id: 'basic', maxDoctors: 3, maxPatients: 200, priceEUR: 29 },
  { id: 'professional', maxDoctors: 10, maxPatients: 1000, priceEUR: 79 },
  { id: 'enterprise', maxDoctors: 0, maxPatients: 0, priceEUR: null },
];
