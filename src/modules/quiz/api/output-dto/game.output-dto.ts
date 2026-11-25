import { ApiProperty } from '@nestjs/swagger';
import { PlayerAnswerOutputDTO } from './player-answer.output-dto';

/*Output DTO статуса игры.*/
export enum GameStatusOutputDTO {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}

/*Output DTO для игрока.*/
export class PlayerOutputDTO {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Player user ID' })
  public id: string;

  @ApiProperty({ example: 'userLogin', description: 'Player user login' })
  public login: string;
}

/*Output DTO для прогресса игрока.*/
export class PlayerProgressOutputDTO {
  @ApiProperty({
    type: () => [PlayerAnswerOutputDTO],
    description: 'Player answers',
  })
  public answers: PlayerAnswerOutputDTO[];

  @ApiProperty({ type: () => PlayerOutputDTO, description: 'Player information' })
  public player: PlayerOutputDTO;

  @ApiProperty({ example: 1, description: 'Player score' })
  public score: number;
}

/*Output DTO для вопроса в игре.*/
export class GameQuestionOutputDTO {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Question ID' })
  public id: string;

  @ApiProperty({ example: 'body', description: 'Question body' })
  public body: string;
}

/*Output DTO для игры.*/
export class GameOutputDTO {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Game ID' })
  public id: string;

  @ApiProperty({ type: () => PlayerProgressOutputDTO, description: 'First player (host) progress' })
  public firstPlayerProgress: PlayerProgressOutputDTO;

  @ApiProperty({
    type: () => PlayerProgressOutputDTO,
    nullable: true,
    description: 'Second player progress, null if there is no second player',
  })
  public secondPlayerProgress: PlayerProgressOutputDTO | null;

  @ApiProperty({
    type: () => [GameQuestionOutputDTO],
    nullable: true,
    description: 'Game questions, null if game has not started',
  })
  public questions: GameQuestionOutputDTO[] | null;

  @ApiProperty({
    enum: GameStatusOutputDTO,
    enumName: 'GameStatus',
    example: GameStatusOutputDTO.PendingSecondPlayer,
    description: 'Game status',
  })
  public status: GameStatusOutputDTO;

  @ApiProperty({ example: '2026-08-28T04:16:49.315Z', description: 'Game creation date' })
  public pairCreatedDate: Date;

  @ApiProperty({ type: Date, nullable: true, example: '2026-08-28T04:16:49.315Z', description: 'Game start date' })
  public startGameDate: Date | null;

  @ApiProperty({ type: Date, nullable: true, example: '2026-08-28T04:16:49.315Z', description: 'Game finish date' })
  public finishGameDate: Date | null;
}

/*Output DTO для списка игр.*/
export type GameListOutputDTO = GameOutputDTO[];
