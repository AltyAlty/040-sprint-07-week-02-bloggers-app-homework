import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { DefaultPaginationSettingsInputDTO } from '../../../../../core/pagination/input-dto/default-pagination-settings.input-dto';
import { GameSortFieldQueryInputDTO } from './game-sort-field-query.input-dto';

/*Input DTO для query-параметров при поиске игр. Наследуется от класса "DefaultPaginationSettingsInputDTO", где уже есть
поля пагинации по умолчанию.*/
export class GetGameListQueryInputDTO extends DefaultPaginationSettingsInputDTO {
  @ApiPropertyOptional({
    enum: GameSortFieldQueryInputDTO,
    default: GameSortFieldQueryInputDTO.PairCreatedDate,
    description: 'Term to sort by',
  })
  @IsEnum(GameSortFieldQueryInputDTO, { message: 'Field "$property" must be one of the allowed values' })
  @IsOptional()
  public sortBy: GameSortFieldQueryInputDTO = GameSortFieldQueryInputDTO.PairCreatedDate;
}
