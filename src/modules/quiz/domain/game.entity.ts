import { Check, Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryColumn } from 'typeorm';
import { v7 } from 'uuid';
import { GameQuestion, type GameQuestionList } from './game-question.entity';
import { Player, type PlayerList } from './player.entity';
import { GAME_VALIDATION_CONSTRAINTS } from '../../../core/validation/constraints/game.validation-constraints';
import { GameStatusDomainDTO } from './domain-dto/game-status.domain-dto';

/*Класс для сущности игры.*/
@Entity({ name: 'games', schema: 'public' })
@Index('IDX_games_pending_second_player', ['status'], {
  where: `"status" = '${GameStatusDomainDTO.PendingSecondPlayer}'`,
})
@Check(
  'CHK_games_status',
  `"status" IN (${Object.values(GameStatusDomainDTO)
    .map((value: string): string => `'${value}'`)
    .join(', ')})`
)
@Check(
  'CHK_games_status_matches_dates',
  `("status" = '${GameStatusDomainDTO.PendingSecondPlayer}' AND "start_game_date" IS NULL AND "finish_game_date" IS NULL)
   OR ("status" = '${GameStatusDomainDTO.Active}' AND "start_game_date" IS NOT NULL AND "finish_game_date" IS NULL)
   OR ("status" = '${GameStatusDomainDTO.Finished}' AND "start_game_date" IS NOT NULL AND "finish_game_date" IS NOT NULL)`
)
export class Game {
  @PrimaryColumn('uuid', { name: 'id' })
  public id: string;

  @Column({
    name: 'status',
    type: 'varchar',
    length: GAME_VALIDATION_CONSTRAINTS.STATUS.MAX_LENGTH,
    nullable: false,
    default: GameStatusDomainDTO.PendingSecondPlayer,
  })
  public status: GameStatusDomainDTO;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: (): string => 'CURRENT_TIMESTAMP',
  })
  public createdAt: Date;

  @Column({ name: 'start_game_date', type: 'timestamp', nullable: true, default: null })
  public startGameDate: Date | null;

  @Column({ name: 'finish_game_date', type: 'timestamp', nullable: true, default: null })
  public finishGameDate: Date | null;

  @OneToMany((): typeof Player => Player, (player: Player): Game => player.game)
  public playerList: PlayerList;

  @OneToMany((): typeof GameQuestion => GameQuestion, (gameQuestion: GameQuestion): Game => gameQuestion.game)
  public gameQuestionList: GameQuestionList;

  public static create(): Game {
    const game: Game = new Game();
    game.id = v7();
    return game;
  }

  public start(): void {
    this.status = GameStatusDomainDTO.Active;
    this.startGameDate = new Date();
  }

  public finish(): void {
    this.status = GameStatusDomainDTO.Finished;
    this.finishGameDate = new Date();
  }
}

/*Domain DTO для списка сущностей игр.*/
export type GameList = Game[];
