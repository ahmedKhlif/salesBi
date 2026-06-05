export function buildMdxQuery(template: string, filterClauses: string[]) {
  return `${template}\n-- Filters\n${filterClauses.join('\n')}`;
}
