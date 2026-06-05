import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { GlobalFiltersDto } from './global-filters.dto';

export class ExplorerQueryDto extends GlobalFiltersDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(100)
  pageSize = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir: 'asc' | 'desc' = 'desc';
}
