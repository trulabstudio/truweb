export type LeadFormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  budget: string;
  message: string;
};

export type LeadInput = {
  name?: unknown;
  company?: unknown;
  email?: unknown;
  phone?: unknown;
  budget?: unknown;
  message?: unknown;
  turnstileToken?: unknown;
  website?: unknown;
};

export const leadBudgetOptions = [
  "Below RM5,000",
  "RM5,000 - RM15,000",
  "RM15,000 - RM30,000",
  "RM30,000+",
] as const;
