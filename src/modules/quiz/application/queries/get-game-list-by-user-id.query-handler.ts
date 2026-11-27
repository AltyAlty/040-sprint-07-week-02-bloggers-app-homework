import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameList } from '../../domain/game.entity';
import { PaginationMetaDataOutputDTO } from '../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { GameListOutputDTO, GameOutputDTO } from '../../api/output-dto/game.output-dto';
import { GetGameListByUserIdQuery } from './get-game-list-by-user-id.query';
import { QuizzesQueryRepository } from '../../infrastructure/quizzes.query-repository';

/*Обработчик запроса для поиска игр по ID пользователя.*/
@QueryHandler(GetGameListByUserIdQuery)
export class GetGameListByUserIdQueryHandler implements IQueryHandler<GetGameListByUserIdQuery> {
  public constructor(private readonly quizzesQueryRepository: QuizzesQueryRepository) {}

  public async execute({
    userId,
    dto,
  }: GetGameListByUserIdQuery): Promise<PaginationMetaDataOutputDTO<GameListOutputDTO>> {
    /*Просим query-репозиторий "QuizzesQueryRepository" найти игры по ID пользователя в БД.*/
    const { items, totalCount }: { items: GameList; totalCount: number } =
      await this.quizzesQueryRepository.findGameList(userId, dto);

    /*Преобразовываем игры из БД в подготовленные для отправки клиенту игры.*/
    const gameListOutput: GameListOutputDTO = GameOutputDTO.mapFromGameListToGameListOutputDTO(items);

    /*Преобразовываем подготовленные для отправки клиенту игры в подготовленные для отправки клиенту с пагинацией игры и
    возвращаем их.*/
    return PaginationMetaDataOutputDTO.mapToOutputDTO({
      page: dto.pageNumber,
      pageSize: dto.pageSize,
      totalCount,
      items: gameListOutput,
    });
  }
}
