export type DatePreset =
  | "today"
  | "yesterday"
  | "last7Days"
  | "last30Days"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "thisYear"
  | "custom";

export interface GlobalFilters {
  fromDate?: string;
  toDate?: string;
  year?: number[];
  quarter?: number[];
  month?: number[];
  productId?: number[];
  customerId?: number[];
  city?: string[];
  customerStatus?: string[];
  salesRepId?: number[];
  orderStatus?: string[];
  paymentStatus?: string[];
  preset?: DatePreset;
}

export interface FilterOption<T = string | number> {
  label: string;
  value: T;
}

export interface FilterOptionsPayload {
  years: FilterOption<number>[];
  quarters: FilterOption<number>[];
  months: FilterOption<number>[];
  products: FilterOption<number>[];
  customers: FilterOption<number>[];
  cities: FilterOption<string>[];
  customerStatuses: FilterOption<string>[];
  salesReps: FilterOption<number>[];
  orderStatuses: FilterOption<string>[];
  paymentStatuses: FilterOption<string>[];
  presets: FilterOption<DatePreset>[];
}

export interface SavedFilterPreset {
  id: string;
  name: string;
  filters: GlobalFilters;
}
