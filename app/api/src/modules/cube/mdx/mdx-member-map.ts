export const mdxMemberMap: Record<string, string> = {
  year: '[Dim Date].[Year Number]',
  quarter: '[Dim Date].[Quarter Number]',
  month: '[Dim Date].[Month Number]',
  productId: '[Dim Product].[Product ID]',
  customerId: '[Dim Customer].[Customer ID]',
  city: '[Dim Customer].[City]',
  customerStatus: '[Dim Customer].[Customer Status]',
  salesRepId: '[Dim Sales Rep].[Employee ID]',
  orderStatus: '[Fact Sales].[Order Status]',
  paymentStatus: '[Fact Sales].[Payment Status]',
};
