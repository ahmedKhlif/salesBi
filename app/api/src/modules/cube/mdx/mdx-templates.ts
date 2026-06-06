export const mdxTemplates = {
  overviewKpis:
    'SELECT NON EMPTY { [Measures].[Total Sales], [Measures].[Net Sales Without Tax], [Measures].[Total Quantity Sold], [Measures].[Number of Sales Lines], [Measures].[Average Unit Price], [Measures].[Average Sales Amount], [Measures].[Total Discount], [Measures].[Discount Rate], [Measures].[Total Tax], [Measures].[Average Tax Per Sales Line] } ON ROWS, { [Dim Date].[Year Number].[All] } ON COLUMNS FROM [SalesAnalysisCube]',
  salesTrendByMonth:
    'SELECT NON EMPTY [Dim Date].[Month Name].[Month Name].Members ON ROWS, { [Measures].[Total Sales] } ON COLUMNS FROM [SalesAnalysisCube]',
  quantityTrendByMonth:
    'SELECT NON EMPTY [Dim Date].[Month Name].[Month Name].Members ON ROWS, { [Measures].[Total Quantity Sold] } ON COLUMNS FROM [SalesAnalysisCube]',
  topProductsBySales:
    'SELECT TOPCOUNT([Dim Product].[Product Name].[Product Name].Members, 10, [Measures].[Total Sales]) ON ROWS, { [Measures].[Total Sales] } ON COLUMNS FROM [SalesAnalysisCube]',
  topProductsByQuantity:
    'SELECT TOPCOUNT([Dim Product].[Product Name].[Product Name].Members, 10, [Measures].[Total Quantity Sold]) ON ROWS, { [Measures].[Total Quantity Sold] } ON COLUMNS FROM [SalesAnalysisCube]',
  salesByCity:
    'SELECT NON EMPTY [Dim Customer].[City].[City].Members ON ROWS, { [Measures].[Total Sales] } ON COLUMNS FROM [SalesAnalysisCube]',
  salesByCustomerStatus:
    'SELECT NON EMPTY [Dim Customer].[Customer Status].[Customer Status].Members ON ROWS, { [Measures].[Total Sales] } ON COLUMNS FROM [SalesAnalysisCube]',
  salesBySalesRep:
    'SELECT NON EMPTY [Dim Sales Rep].[Employee Code].[Employee Code].Members ON ROWS, { [Measures].[Total Sales] } ON COLUMNS FROM [SalesAnalysisCube]',
  productPerformance:
    'SELECT NON EMPTY [Dim Product].[Product Name].[Product Name].Members ON ROWS, { [Measures].[Total Sales], [Measures].[Net Sales Without Tax], [Measures].[Total Quantity Sold] } ON COLUMNS FROM [SalesAnalysisCube]',
  customerPerformance:
    'SELECT NON EMPTY [Dim Customer].[Customer Code].[Customer Code].Members ON ROWS, { [Measures].[Total Sales], [Measures].[Average Sales Amount], [Measures].[Discount Rate] } ON COLUMNS FROM [SalesAnalysisCube]',
  salesRepPerformance:
    'SELECT NON EMPTY [Dim Sales Rep].[Employee Code].[Employee Code].Members ON ROWS, { [Measures].[Total Sales], [Measures].[Average Sales Amount], [Measures].[Total Quantity Sold] } ON COLUMNS FROM [SalesAnalysisCube]',
  timeHierarchyAnalysis:
    'SELECT NON EMPTY DESCENDANTS([Dim Date].[Calendar].[All], [Dim Date].[Full Date].[Full Date]) ON ROWS, { [Measures].[Total Sales] } ON COLUMNS FROM [SalesAnalysisCube]',
  calendarDailySales:
    'SELECT NON EMPTY [Dim Date].[Full Date].[Full Date].Members ON ROWS, { [Measures].[Total Sales], [Measures].[Total Discount], [Measures].[Total Tax] } ON COLUMNS FROM [SalesAnalysisCube]',
  salesByQuarter:
    'SELECT NON EMPTY [Dim Date].[Quarter Number].[Quarter Number].Members ON ROWS, { [Measures].[Total Sales] } ON COLUMNS FROM [SalesAnalysisCube]',
  salesHeatmapData:
    'SELECT NON EMPTY [Dim Date].[Day Number].[Day Number].Members ON ROWS, { [Measures].[Total Sales] } ON COLUMNS FROM [SalesAnalysisCube]',
  discountRateByProduct:
    'SELECT NON EMPTY [Dim Product].[Product Name].[Product Name].Members ON ROWS, { [Measures].[Discount Rate] } ON COLUMNS FROM [SalesAnalysisCube]',
  discountByProduct:
    'SELECT TOPCOUNT([Dim Product].[Product Name].[Product Name].Members, 10, [Measures].[Total Discount]) ON ROWS, { [Measures].[Total Discount] } ON COLUMNS FROM [SalesAnalysisCube]',
  averageSalesAmountByCustomer:
    'SELECT NON EMPTY [Dim Customer].[Customer Code].[Customer Code].Members ON ROWS, { [Measures].[Average Sales Amount] } ON COLUMNS FROM [SalesAnalysisCube]',
  explorer:
    'SELECT NON EMPTY [Dim Date].[Full Date].[Full Date].Members ON ROWS FROM [SalesAnalysisCube]',
};

export const mdxMeasureMap = {
  totalSales: '[Measures].[Total Sales]',
  totalQuantitySold: '[Measures].[Total Quantity Sold]',
  totalDiscount: '[Measures].[Total Discount]',
  totalTax: '[Measures].[Total Tax]',
  numberOfSalesLines: '[Measures].[Number of Sales Lines]',
  averageUnitPrice: '[Measures].[Average Unit Price]',
  averageSalesAmount: '[Measures].[Average Sales Amount]',
  netSalesWithoutTax: '[Measures].[Net Sales Without Tax]',
  discountRate: '[Measures].[Discount Rate]',
  averageTaxPerSalesLine: '[Measures].[Average Tax Per Sales Line]',
} as const;

const mdxTrendRowSets = {
  year: '[Dim Date].[Year Number].[Year Number].Members',
  quarter: '[Dim Date].[Quarter Number].[Quarter Number].Members',
  month: '[Dim Date].[Month Number].[Month Number].Members',
  day: '[Dim Date].[Full Date].[Full Date].Members',
} as const;

export function buildTrendTemplate(
  grain: keyof typeof mdxTrendRowSets,
  measure: string,
  cubeName = 'SalesAnalysisCube',
) {
  return `SELECT NON EMPTY ${mdxTrendRowSets[grain]} ON ROWS, { ${measure} } ON COLUMNS FROM [${cubeName}]`;
}
