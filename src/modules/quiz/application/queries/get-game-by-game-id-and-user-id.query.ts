import { Query } from '@nestjs/cqrs';
import { GameOutputDTO } from '../../api/output-dto/game.output-dto';
import { GetGameByGameIdAndUserIdDTO } from './dto/get-game-by-game-id-and-user-id.dto';

/*Запрос для поиска игры по ID игры и ID пользователя.*/
export class GetGameByGameIdAndUserIdQuery extends Query<GameOutputDTO> {
  public constructor(public readonly dto: GetGameByGameIdAndUserIdDTO) {
    super();
  }
}
