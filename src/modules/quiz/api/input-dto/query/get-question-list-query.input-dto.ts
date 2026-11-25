import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DefaultPaginationSettingsInputDTO } from '../../../../../core/pagination/input-dto/default-pagination-settings.input-dto';
import { PublishedStatusQueryInputDTO } from './published-status-query.input-dto';
import { QuestionSortFieldQueryInputDTO } from './question-sort-field-query.input-dto';
import { Trim } from '../../../../../core/decorators/transformation/trim.transformation-decorator';

/*Input DTO для query-параметров при поиске вопросов. Наследуется от класса "DefaultPaginationSettingsInputDTO", где
уже есть поля пагинации по умолчанию.*/
export class GetQuestionListQueryInputDTO extends DefaultPaginationSettingsInputDTO {
  @ApiPropertyOptional({
    enum: QuestionSortFieldQueryInputDTO,
    default: QuestionSortFieldQueryInputDTO.CreatedAt,
    description: 'Term to sort by',
  })
  @IsEnum(QuestionSortFieldQueryInputDTO, { message: 'Field "$property" must be one of the allowed values' })
  @IsOptional()
  public sortBy: QuestionSortFieldQueryInputDTO = QuestionSortFieldQueryInputDTO.CreatedAt;

  @ApiPropertyOptional({ default: null, description: 'Term to search by' })
  @IsString({ message: 'Field "$property" must be a string' })
  @Trim()
  @IsOptional()
  public bodySearchTerm: string | null = null;

  @ApiPropertyOptional({
    enum: PublishedStatusQueryInputDTO,
    default: PublishedStatusQueryInputDTO.All,
    description: 'Filter by publication status',
  })
  @IsEnum(PublishedStatusQueryInputDTO, { message: 'Field "$property" must be one of the allowed values' })
  @IsOptional()
  public publishedStatus: PublishedStatusQueryInputDTO = PublishedStatusQueryInputDTO.All;
}
