import type { ApiResponse } from '@saleslens/contracts';
import type { GlobalFiltersDto } from '../dto/global-filters.dto';

export function buildApiResponse<T>(
  data: T,
  filters: GlobalFiltersDto,
  source: 'mock' | 'ssas',
  summary?: Record<string, string | number | boolean | null>,
  meta?: Partial<ApiResponse<T>['meta']>,
): ApiResponse<T> {
  const timestamp = new Date().toISOString();
  return {
    data,
    summary,
    appliedFilters: {
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      year: filters.year,
      quarter: filters.quarter,
      month: filters.month,
      productId: filters.productId,
      customerId: filters.customerId,
      city: filters.city,
      customerStatus: filters.customerStatus,
      salesRepId: filters.salesRepId,
      orderStatus: filters.orderStatus,
      paymentStatus: filters.paymentStatus,
      preset: filters.preset,
    },
    meta: {
      source,
      generatedAt: timestamp,
      lastRefresh: timestamp,
      ...meta,
    },
  };
}
