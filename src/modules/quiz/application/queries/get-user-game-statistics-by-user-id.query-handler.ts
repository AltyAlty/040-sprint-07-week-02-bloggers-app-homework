import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserGameStatisticsOutputDTO } from '../../api/output-dto/user-game-statistics.output-dto';
import { GetUserGameStatisticsByUserIdQuery } from './get-user-game-statistics-by-user-id.query';
import { QuizzesQueryRepository } from '../../infrastructure/quizzes.query-repository';

/*Обработчик запроса для поиска игровой статистики пользователя по ID пользователя.*/
@QueryHandler(GetUserGameStatisticsByUserIdQuery)
export class GetUserGameStatisticsByUserIdQueryHandler implements IQueryHandler<GetUserGameStatisticsByUserIdQuery> {
  public constructor(private readonly quizzesQueryRepository: QuizzesQueryRepository) {}

  public async execute({ userId }: GetUserGameStatisticsByUserIdQuery): Promise<UserGameStatisticsOutputDTO> {
    /*Просим query-репозиторий "QuizzesQueryRepository" найти игровую статистику пользователя по ID пользователя в БД
    и возвращаем ее.*/
    return this.quizzesQueryRepository.findUserGameStatistics(userId);
  }
}
