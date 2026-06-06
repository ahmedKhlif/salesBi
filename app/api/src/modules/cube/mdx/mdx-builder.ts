export function buildMdxQuery(template: string, filterClauses: string[]) {
  if (!filterClauses.length) {
    return template;
  }

  const cubeSource = filterClauses.reduceRight(
    (source, filterSet) => `(\nSELECT ${filterSet} ON 0 FROM ${source}\n)`,
    '[SalesAnalysisCube]',
  );

  return template.replace(/FROM\s+\[[^\]]+\]/i, `FROM ${cubeSource}`);
}
