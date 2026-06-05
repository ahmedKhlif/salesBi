import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

function asArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value
      .flatMap((item) =>
        typeof item === 'string' || typeof item === 'number'
          ? String(item).split(',')
          : [],
      )
      .filter(Boolean);
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return undefined;
}

function numberArrayTransform({ value }: { value: unknown }) {
  const items = asArray(value);
  return items
    ?.map((item) => Number(item))
    .filter((item) => !Number.isNaN(item));
}

function stringArrayTransform({ value }: { value: unknown }) {
  return asArray(value);
}

export class GlobalFiltersDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @Transform(numberArrayTransform)
  @IsArray()
  @IsInt({ each: true })
  year?: number[];

  @IsOptional()
  @Transform(numberArrayTransform)
  @IsArray()
  @IsInt({ each: true })
  quarter?: number[];

  @IsOptional()
  @Transform(numberArrayTransform)
  @IsArray()
  @IsInt({ each: true })
  month?: number[];

  @IsOptional()
  @Transform(numberArrayTransform)
  @IsArray()
  @IsInt({ each: true })
  productId?: number[];

  @IsOptional()
  @Transform(numberArrayTransform)
  @IsArray()
  @IsInt({ each: true })
  customerId?: number[];

  @IsOptional()
  @Transform(stringArrayTransform)
  @IsArray()
  @IsString({ each: true })
  city?: string[];

  @IsOptional()
  @Transform(stringArrayTransform)
  @IsArray()
  @IsString({ each: true })
  customerStatus?: string[];

  @IsOptional()
  @Transform(numberArrayTransform)
  @IsArray()
  @IsInt({ each: true })
  salesRepId?: number[];

  @IsOptional()
  @Transform(stringArrayTransform)
  @IsArray()
  @IsString({ each: true })
  orderStatus?: string[];

  @IsOptional()
  @Transform(stringArrayTransform)
  @IsArray()
  @IsString({ each: true })
  paymentStatus?: string[];

  @IsOptional()
  @IsIn([
    'today',
    'yesterday',
    'last7Days',
    'last30Days',
    'thisMonth',
    'lastMonth',
    'thisQuarter',
    'thisYear',
    'custom',
  ])
  preset?:
    | 'today'
    | 'yesterday'
    | 'last7Days'
    | 'last30Days'
    | 'thisMonth'
    | 'lastMonth'
    | 'thisQuarter'
    | 'thisYear'
    | 'custom';
}
