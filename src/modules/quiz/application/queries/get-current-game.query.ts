import { Query } from '@nestjs/cqrs';
import { GameOutputDTO } from '../../api/output-dto/game.output-dto';

/*Запрос для поиска текущей игры пользователя.*/
export class GetCurrentGameQuery extends Query<GameOutputDTO> {
  public constructor(public readonly userId: string) {
    super();
  }
}
