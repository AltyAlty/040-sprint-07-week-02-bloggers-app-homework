import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { v7 } from 'uuid';
import { GameQuestion } from './game-question.entity';
import { Player } from './player.entity';
import { PLAYER_ANSWER_VALIDATION_CONSTRAINTS } from '../../../core/validation/constraints/player-answer.validation-constraints';
import { CreatePlayerAnswerDomainDTO } from './domain-dto/create-player-answer.domain-dto';
import { PlayerAnswerStatusDomainDTO } from './domain-dto/player-answer-status.domain-dto';

/*Класс для сущности ответа игрока.*/
@Entity({ name: 'player_answers', schema: 'public' })
@Unique('UQ_player_answers_player_id_game_question_id', ['playerId', 'gameQuestionId'])
@Check(
  'CHK_player_answers_status',
  `"status" IN (${Object.values(PlayerAnswerStatusDomainDTO)
    .map((value: string): string => `'${value}'`)
    .join(', ')})`
)
export class PlayerAnswer {
  @PrimaryColumn('uuid', { name: 'id' })
  public id: string;

  @Column({ name: 'player_id', type: 'uuid', nullable: false })
  public playerId: string;

  @Column({ name: 'game_question_id', type: 'integer', nullable: false })
  public gameQuestionId: number;

  @Column({ name: 'body', type: 'text', nullable: false })
  public body: string;

  @Column({
    name: 'status',
    type: 'varchar',
    length: PLAYER_ANSWER_VALIDATION_CONSTRAINTS.STATUS.MAX_LENGTH,
    nullable: false,
  })
  public status: PlayerAnswerStatusDomainDTO;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: (): string => 'CURRENT_TIMESTAMP',
  })
  public createdAt: Date;

  @ManyToOne((): typeof Player => Player, (player: Player): PlayerAnswerList => player.playerAnswerList)
  @JoinColumn({ name: 'player_id' })
  public player: Player;

  @ManyToOne(
    (): typeof GameQuestion => GameQuestion,
    (gameQuestion: GameQuestion): PlayerAnswerList => gameQuestion.playerAnswerList
  )
  @JoinColumn({ name: 'game_question_id' })
  public gameQuestion: GameQuestion;

  public static create(dto: CreatePlayerAnswerDomainDTO): PlayerAnswer {
    const answer: PlayerAnswer = new PlayerAnswer();
    answer.id = v7();
    answer.playerId = dto.playerId;
    answer.gameQuestionId = dto.gameQuestionId;
    answer.body = dto.body;
    answer.status = dto.status;
    return answer;
  }
}

/*Тип для списка сущностей ответов игроков.*/
export type PlayerAnswerList = PlayerAnswer[];
