import type { GlobalFiltersDto } from '../../../common/dto/global-filters.dto';
import { mdxMemberMap } from './mdx-member-map';

export interface MdxFilterBuildContext {
  availableYears?: number[];
}

export interface MdxFilterBuildResult {
  supported: boolean;
  filterSets: string[];
  unsupportedKeys: string[];
}

function escapeMdxKey(value: string | number) {
  return String(value).replace(/]/g, ']]');
}

function memberSet(members: string[]) {
  return `{ ${[...new Set(members)].join(', ')} }`;
}

function buildYearMembers(years: number[]) {
  return years.map((year) => `${mdxMemberMap.year}.&[${escapeMdxKey(year)}]`);
}

function buildQuarterMembers(quarters: number[], years: number[]) {
  return years.flatMap((year) =>
    quarters.map(
      (quarter) =>
        `${mdxMemberMap.quarter}.&[${escapeMdxKey(year)}]&[${escapeMdxKey(quarter)}]`,
    ),
  );
}

function buildMonthMembers(months: number[], years: number[]) {
  return years.flatMap((year) =>
    months.map(
      (month) =>
        `${mdxMemberMap.month}.&[${escapeMdxKey(year)}]&[${escapeMdxKey(month)}]`,
    ),
  );
}

export function buildMdxFilters(
  filters: GlobalFiltersDto,
  context: MdxFilterBuildContext = {},
): MdxFilterBuildResult {
  const filterSets: string[] = [];
  const unsupportedKeys = [
    filters.orderStatus ? 'orderStatus' : null,
    filters.paymentStatus ? 'paymentStatus' : null,
    filters.fromDate && !filters.toDate ? 'fromDate' : null,
    filters.toDate && !filters.fromDate ? 'toDate' : null,
  ].filter((value): value is string => value !== null);

  const availableYears =
    filters.year && filters.year.length > 0
      ? filters.year
      : (context.availableYears ?? []);

  if (filters.fromDate && filters.toDate) {
    const [fromDate, toDate] = [filters.fromDate, filters.toDate].sort(
      (left, right) => left.localeCompare(right),
    );

    filterSets.push(
      `{ [Dim Date].[Full Date].&[${escapeMdxKey(fromDate)}]:[Dim Date].[Full Date].&[${escapeMdxKey(toDate)}] }`,
    );
  }

  if (filters.year?.length) {
    filterSets.push(memberSet(buildYearMembers(filters.year)));
  }

  if (filters.quarter?.length) {
    if (!availableYears.length) {
      unsupportedKeys.push('quarter');
    } else {
      filterSets.push(
        memberSet(buildQuarterMembers(filters.quarter, availableYears)),
      );
    }
  }

  if (filters.month?.length) {
    if (!availableYears.length) {
      unsupportedKeys.push('month');
    } else {
      filterSets.push(
        memberSet(buildMonthMembers(filters.month, availableYears)),
      );
    }
  }

  if (filters.productId?.length) {
    filterSets.push(
      memberSet(
        filters.productId.map(
          (productId) =>
            `${mdxMemberMap.productId}.&[${escapeMdxKey(productId)}]`,
        ),
      ),
    );
  }

  if (filters.customerId?.length) {
    filterSets.push(
      memberSet(
        filters.customerId.map(
          (customerId) =>
            `${mdxMemberMap.customerId}.&[${escapeMdxKey(customerId)}]`,
        ),
      ),
    );
  }

  if (filters.city?.length) {
    filterSets.push(
      memberSet(
        filters.city.map(
          (city) => `${mdxMemberMap.city}.&[${escapeMdxKey(city)}]`,
        ),
      ),
    );
  }

  if (filters.customerStatus?.length) {
    filterSets.push(
      memberSet(
        filters.customerStatus.map(
          (status) =>
            `${mdxMemberMap.customerStatus}.&[${escapeMdxKey(status)}]`,
        ),
      ),
    );
  }

  if (filters.salesRepId?.length) {
    filterSets.push(
      memberSet(
        filters.salesRepId.map(
          (salesRepId) =>
            `${mdxMemberMap.salesRepId}.&[${escapeMdxKey(salesRepId)}]`,
        ),
      ),
    );
  }

  return {
    supported: unsupportedKeys.length === 0,
    filterSets,
    unsupportedKeys,
  };
}
