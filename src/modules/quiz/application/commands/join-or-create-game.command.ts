import { Command } from '@nestjs/cqrs';
import { GameOutputDTO } from '../../api/output-dto/game.output-dto';

/*Команда для подключения пользователя к игре или создания новой игры для него.*/
export class JoinOrCreateGameCommand extends Command<GameOutputDTO> {
  public constructor(public readonly userId: string) {
    super();
  }
}
