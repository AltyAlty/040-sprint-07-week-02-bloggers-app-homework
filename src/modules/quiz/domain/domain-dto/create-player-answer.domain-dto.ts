import { PlayerAnswerStatusDomainDTO } from './player-answer-status.domain-dto';

/*Domain DTO для создания ответа игрока.*/
export class CreatePlayerAnswerDomainDTO {
  public playerId: string;
  public gameQuestionId: number;
  public body: string;
  public status: PlayerAnswerStatusDomainDTO;
}
