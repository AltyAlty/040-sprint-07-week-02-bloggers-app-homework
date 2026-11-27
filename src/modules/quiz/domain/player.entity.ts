import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { v7 } from 'uuid';
import { User } from '../../user/domain/users/users.entity';
import { Game } from './game.entity';
import { PlayerAnswer, type PlayerAnswerList } from './player-answer.entity';
import { CreatePlayerDomainDTO } from './domain-dto/create-player.domain-dto';
import { PlayerWinStatusDomainDTO } from './domain-dto/player-win-status.domain-dto';

/*Класс для сущности игрока.*/
@Entity({ name: 'players', schema: 'public' })
@Unique('UQ_players_game_id_user_id', ['gameId', 'userId'])
@Unique('UQ_players_game_id_position', ['gameId', 'position'])
@Index('UQ_players_user_id_unfinished_game', ['userId'], { unique: true, where: '"win_status" IS NULL' })
@Check('CHK_players_position_positive', '"position" > 0')
@Check('CHK_players_score_non_negative', '"score" >= 0')
@Check(
  'CHK_players_win_status',
  `"win_status" IS NULL OR "win_status" IN (${Object.values(PlayerWinStatusDomainDTO)
    .map((value: string): string => `'${value}'`)
    .join(', ')})`
)
export class Player {
  @PrimaryColumn('uuid', { name: 'id' })
  public id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  public userId: string;

  @Column({ name: 'game_id', type: 'uuid', nullable: false })
  public gameId: string;

  @Column({ name: 'position', type: 'integer', nullable: false })
  public position: number;

  @Column({ name: 'score', type: 'integer', nullable: false, default: 0 })
  public score: number;

  @Column({ name: 'win_status', type: 'varchar', nullable: true, default: null })
  public winStatus: PlayerWinStatusDomainDTO | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: (): string => 'CURRENT_TIMESTAMP',
  })
  public createdAt: Date;

  @OneToMany((): typeof PlayerAnswer => PlayerAnswer, (playerAnswer: PlayerAnswer): Player => playerAnswer.player)
  public playerAnswerList: PlayerAnswerList;

  @ManyToOne((): typeof User => User, (user: User): PlayerList => user.playerList)
  @JoinColumn({ name: 'user_id' })
  public user: User;

  @ManyToOne((): typeof Game => Game, (game: Game): PlayerList => game.playerList)
  @JoinColumn({ name: 'game_id' })
  public game: Game;

  public static create(dto: CreatePlayerDomainDTO): Player {
    const player: Player = new Player();
    player.id = v7();
    player.userId = dto.userId;
    player.gameId = dto.gameId;
    player.position = dto.position;
    return player;
  }

  public addScore(points: number): void {
    this.score += points;
  }

  public setWinStatus(winStatus: PlayerWinStatusDomainDTO): void {
    this.winStatus = winStatus;
  }
}

/*Тип для списка сущностей игроков.*/
export type PlayerList = Player[];
