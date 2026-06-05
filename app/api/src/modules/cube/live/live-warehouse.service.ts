import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type {
  MockCustomer,
  MockProduct,
  MockSaleLine,
  MockSalesRep,
  WarehouseData,
} from '../../../common/types/domain';

interface WarehouseConnection {
  server: string;
  database: string;
}

const SQLCMD_MAX_BUFFER = 50 * 1024 * 1024;

const productsQuery = `
SELECT
  CAST(ProductID AS int) AS productId,
  ProductName AS productName,
  CAST(StandardCost AS float) AS standardCost,
  CAST(ListPrice AS float) AS listPrice
FROM dbo.DimProduct
ORDER BY ProductID
FOR JSON PATH;
`;

const customersQuery = `
SELECT
  CAST(CustomerID AS int) AS customerId,
  CustomerCode AS customerCode,
  CustomerType AS customerType,
  FirstName AS firstName,
  LastName AS lastName,
  City AS city,
  CustomerStatus AS customerStatus,
  CAST(PaymentTermsDays AS int) AS paymentTermsDays,
  CONVERT(varchar(10), TRY_CONVERT(date, RegistrationDate), 23) AS registrationDate
FROM dbo.DimCustomer
ORDER BY CustomerID
FOR JSON PATH;
`;

const salesRepsQuery = `
SELECT
  CAST(EmployeeID AS int) AS employeeId,
  EmployeeCode AS employeeCode,
  FirstName AS firstName,
  LastName AS lastName,
  Email AS email
FROM dbo.DimSalesRep
ORDER BY EmployeeID
FOR JSON PATH;
`;

const salesQuery = `
SELECT
  CAST(f.SalesOrderID AS int) AS salesOrderId,
  CAST(f.OrderDetailID AS int) AS orderDetailId,
  CAST(d.DateKey AS int) AS dateKey,
  CONVERT(varchar(10), TRY_CONVERT(date, d.FullDate), 23) AS fullDate,
  CAST(d.YearNumber AS int) AS [year],
  CAST(d.QuarterNumber AS int) AS quarter,
  CAST(d.MonthNumber AS int) AS monthNumber,
  d.MonthName AS monthName,
  CAST(d.DayNumber AS int) AS dayNumber,
  CAST(f.CustomerID AS int) AS customerId,
  CAST(f.ProductID AS int) AS productId,
  CAST(f.EmployeeID AS int) AS employeeId,
  CAST(f.Quantity AS float) AS quantity,
  CAST(f.UnitPrice AS float) AS unitPrice,
  CAST(f.DiscountAmount AS float) AS discountAmount,
  CAST(f.TaxAmount AS float) AS taxAmount,
  CAST(f.LineTotal AS float) AS lineTotal,
  CAST(f.LineTotal - f.TaxAmount AS float) AS netSalesWithoutTax,
  COALESCE(NULLIF(f.OrderStatus, ''), 'Unknown') AS orderStatus,
  COALESCE(NULLIF(f.PaymentStatus, ''), 'Unknown') AS paymentStatus
FROM dbo.FactSales f
INNER JOIN dbo.DimDate d
  ON d.DateKey = f.DateKey
ORDER BY d.DateKey, f.OrderDetailID
FOR JSON PATH;
`;

function parseConnectionString(connectionString: string): WarehouseConnection {
  const parts = connectionString
    .split(';')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, segment) => {
      const separatorIndex = segment.indexOf('=');
      if (separatorIndex < 1) {
        return accumulator;
      }

      const key = segment.slice(0, separatorIndex).trim().toLowerCase();
      const value = segment.slice(separatorIndex + 1).trim();
      accumulator[key] = value;
      return accumulator;
    }, {});

  const server = parts['data source'] ?? parts.server;
  const database = parts['initial catalog'] ?? parts.database;

  if (!server || !database) {
    throw new ServiceUnavailableException(
      'The SalesAnalysisCube data source file is missing SQL Server connection details.',
    );
  }

  return { server, database };
}

@Injectable()
export class LiveWarehouseService {
  private cache?: {
    warehouse: WarehouseData;
    loadedAt: number;
  };

  getWarehouse(): WarehouseData {
    const cacheTtlMs = Number(process.env.WAREHOUSE_CACHE_MS ?? 60_000);
    const now = Date.now();

    if (this.cache && now - this.cache.loadedAt < cacheTtlMs) {
      return this.cache.warehouse;
    }

    try {
      const connection = this.resolveWarehouseConnection();
      const sales = this.runJsonQuery<MockSaleLine>(connection, salesQuery);
      const warehouse: WarehouseData = {
        products: this.runJsonQuery<MockProduct>(connection, productsQuery),
        customers: this.runJsonQuery<MockCustomer>(connection, customersQuery),
        salesReps: this.runJsonQuery<MockSalesRep>(connection, salesRepsQuery),
        sales,
        dates: [...new Set(sales.map((line) => line.fullDate))],
      };

      this.cache = { warehouse, loadedAt: now };
      return warehouse;
    } catch (error) {
      if (this.cache) {
        return this.cache.warehouse;
      }

      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      throw new ServiceUnavailableException(
        'Unable to load the live BI warehouse. Check sqlcmd access and the SalesAnalysisCube data source settings.',
      );
    }
  }

  private resolveWarehouseConnection(): WarehouseConnection {
    const envServer =
      process.env.WAREHOUSE_SQL_SERVER ??
      process.env.DW_SERVER ??
      process.env.SQL_SERVER;
    const envDatabase =
      process.env.WAREHOUSE_SQL_DATABASE ??
      process.env.DW_DATABASE ??
      process.env.SQL_DATABASE;

    if (envServer && envDatabase) {
      return {
        server: envServer,
        database: envDatabase,
      };
    }

    const dataSourcePath = this.findCubeDataSourcePath();
    if (!dataSourcePath) {
      throw new ServiceUnavailableException(
        'Could not find SalesAnalysisCube/Bi.ds. Set WAREHOUSE_SQL_SERVER and WAREHOUSE_SQL_DATABASE in .env.',
      );
    }

    const fileContent = readFileSync(dataSourcePath, 'utf8');
    const match = fileContent.match(
      /<ConnectionString>([\s\S]*?)<\/ConnectionString>/i,
    );

    if (!match) {
      throw new ServiceUnavailableException(
        'Could not read the SQL connection string from SalesAnalysisCube/Bi.ds.',
      );
    }

    return parseConnectionString(match[1]);
  }

  private findCubeDataSourcePath() {
    const candidates = [
      path.resolve(process.cwd(), 'SalesAnalysisCube/Bi.ds'),
      path.resolve(process.cwd(), '../SalesAnalysisCube/Bi.ds'),
      path.resolve(process.cwd(), '../../SalesAnalysisCube/Bi.ds'),
      path.resolve(__dirname, '../../../../../SalesAnalysisCube/Bi.ds'),
    ];

    return candidates.find((candidate) => existsSync(candidate));
  }

  private runJsonQuery<T>(connection: WarehouseConnection, query: string): T[] {
    try {
      const output = execFileSync(
        'sqlcmd',
        [
          '-S',
          connection.server,
          '-d',
          connection.database,
          '-E',
          '-b',
          '-w',
          '65535',
          '-y',
          '0',
          '-Y',
          '0',
          '-Q',
          `SET NOCOUNT ON; ${query}`,
        ],
        {
          encoding: 'utf8',
          windowsHide: true,
          maxBuffer: SQLCMD_MAX_BUFFER,
        },
      );

      const jsonPayload = output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .join('')
        .replace(/^\uFEFF/, '');

      if (!jsonPayload) {
        return [];
      }

      return JSON.parse(jsonPayload) as T[];
    } catch (error) {
      const reason =
        error instanceof Error && error.message ? ` ${error.message}` : '';
      throw new ServiceUnavailableException(
        `Live warehouse query failed against ${connection.server}/${connection.database}.${reason}`,
      );
    }
  }
}
