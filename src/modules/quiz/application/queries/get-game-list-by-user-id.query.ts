import { Query } from '@nestjs/cqrs';
import { GetGameListQueryInputDTO } from '../../api/input-dto/query/get-game-list-query.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { GameListOutputDTO } from '../../api/output-dto/game.output-dto';

/*Запрос для поиска игр по ID пользователя.*/
export class GetGameListByUserIdQuery extends Query<PaginationMetaDataOutputDTO<GameListOutputDTO>> {
  public constructor(
    public readonly userId: string,
    public readonly dto: GetGameListQueryInputDTO
  ) {
    super();
  }
}
