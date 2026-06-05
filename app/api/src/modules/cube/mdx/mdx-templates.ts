export const mdxTemplates = {
  overviewKpis:
    'SELECT { [Measures].[Total Sales], [Measures].[Total Discount] } ON COLUMNS FROM [SalesAnalysisCube]',
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
  averageSalesAmountByCustomer:
    'SELECT NON EMPTY [Dim Customer].[Customer Code].[Customer Code].Members ON ROWS, { [Measures].[Average Sales Amount] } ON COLUMNS FROM [SalesAnalysisCube]',
  explorer:
    'SELECT NON EMPTY [Dim Date].[Full Date].[Full Date].Members ON ROWS FROM [SalesAnalysisCube]',
};
