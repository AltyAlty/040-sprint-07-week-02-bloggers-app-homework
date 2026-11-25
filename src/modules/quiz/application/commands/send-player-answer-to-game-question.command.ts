import { Command } from '@nestjs/cqrs';
import { PlayerAnswerOutputDTO } from '../../api/output-dto/player-answer.output-dto';
import { SendPlayerAnswerToGameQuestionDTO } from './dto/send-player-answer-to-game-question.dto';

/*Команда для отправки ответа игрока на вопрос в игре.*/
export class SendPlayerAnswerToGameQuestionCommand extends Command<PlayerAnswerOutputDTO> {
  public constructor(public readonly dto: SendPlayerAnswerToGameQuestionDTO) {
    super();
  }
}
