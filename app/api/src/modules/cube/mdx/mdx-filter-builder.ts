import type { GlobalFiltersDto } from '../../../common/dto/global-filters.dto';
import { mdxMemberMap } from './mdx-member-map';

export function buildMdxFilters(filters: GlobalFiltersDto) {
  return Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `-- ${key}: ${JSON.stringify(value)} mapped via ${mdxMemberMap[key] ?? 'custom logic'}`,
    );
}
