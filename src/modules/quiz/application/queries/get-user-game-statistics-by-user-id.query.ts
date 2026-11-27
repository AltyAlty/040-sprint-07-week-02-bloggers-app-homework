import { Query } from '@nestjs/cqrs';
import { UserGameStatisticsOutputDTO } from '../../api/output-dto/user-game-statistics.output-dto';

/*Запрос для поиска игровой статистики пользователя по ID пользователя.*/
export class GetUserGameStatisticsByUserIdQuery extends Query<UserGameStatisticsOutputDTO> {
  public constructor(public readonly userId: string) {
    super();
  }
}
