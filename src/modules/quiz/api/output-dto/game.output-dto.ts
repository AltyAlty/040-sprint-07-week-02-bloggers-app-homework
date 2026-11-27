import { ApiProperty } from '@nestjs/swagger';
import { SETTINGS } from '../../../../core/settings/settings';
import { Game, GameList } from '../../domain/game.entity';
import { GameQuestion, GameQuestionList } from '../../domain/game-question.entity';
import { Player } from '../../domain/player.entity';
import { PlayerAnswer, PlayerAnswerList } from '../../domain/player-answer.entity';
import { PlayerAnswerOutputDTO, PlayerAnswerStatusOutputDTO } from './player-answer.output-dto';

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

  /*Маппер для преобразования игрока из БД в подготовленный для отправки клиенту прогресс игрока.*/
  public static mapFromPlayerToPlayerProgressOutputDTO(player: Player): PlayerProgressOutputDTO {
    /*Сортируем ответы по позиции вопроса в игре.*/
    const sortedPlayerAnswerList: PlayerAnswerList = [...player.playerAnswerList].sort(
      (a: PlayerAnswer, b: PlayerAnswer): number => a.gameQuestion.position - b.gameQuestion.position
    );

    const playerProgressOutputDTO: PlayerProgressOutputDTO = new PlayerProgressOutputDTO();

    playerProgressOutputDTO.answers = sortedPlayerAnswerList.map(
      (playerAnswer: PlayerAnswer): PlayerAnswerOutputDTO => ({
        questionId: playerAnswer.gameQuestion.questionId,
        answerStatus: playerAnswer.status as unknown as PlayerAnswerStatusOutputDTO,
        addedAt: playerAnswer.createdAt,
      })
    );

    playerProgressOutputDTO.player = { id: player.userId, login: player.user.login };
    playerProgressOutputDTO.score = player.score;
    return playerProgressOutputDTO;
  }
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

  /*Маппер для преобразования игры из БД в подготовленную для отправки клиенту игру.*/
  public static mapFromGameToGameOutputDTO(game: Game): GameOutputDTO {
    const firstPlayer: Player | undefined = game.playerList.find(
      (player: Player): boolean => player.position === SETTINGS.QUIZ_GAME_SETTINGS_HOST_PLAYER_POSITION
    );

    const secondPlayer: Player | undefined = game.playerList.find(
      (player: Player): boolean => player.position === SETTINGS.QUIZ_GAME_SETTINGS_JOINED_PLAYER_POSITION
    );

    /*Сортируем вопросы по позиции в игре.*/
    const sortedGameQuestionList: GameQuestionList = [...game.gameQuestionList].sort(
      (a: GameQuestion, b: GameQuestion): number => a.position - b.position
    );

    const gameOutputDTO: GameOutputDTO = new GameOutputDTO();
    gameOutputDTO.id = game.id;
    gameOutputDTO.firstPlayerProgress = PlayerProgressOutputDTO.mapFromPlayerToPlayerProgressOutputDTO(firstPlayer!);
    gameOutputDTO.secondPlayerProgress = null;
    gameOutputDTO.questions = null;

    if (secondPlayer) {
      gameOutputDTO.secondPlayerProgress = PlayerProgressOutputDTO.mapFromPlayerToPlayerProgressOutputDTO(secondPlayer);
    }

    if (sortedGameQuestionList.length > 0) {
      gameOutputDTO.questions = sortedGameQuestionList.map((gameQuestion: GameQuestion): GameQuestionOutputDTO => ({
        id: gameQuestion.questionId,
        body: gameQuestion.question.body,
      }));
    }

    gameOutputDTO.status = game.status as unknown as GameStatusOutputDTO;
    gameOutputDTO.pairCreatedDate = game.createdAt;
    gameOutputDTO.startGameDate = game.startGameDate;
    gameOutputDTO.finishGameDate = game.finishGameDate;
    return gameOutputDTO;
  }

  /*Маппер для преобразования игр из БД в подготовленные для отправки клиенту игры.*/
  public static mapFromGameListToGameListOutputDTO(gameList: GameList): GameListOutputDTO {
    return gameList.map((game: Game): GameOutputDTO => this.mapFromGameToGameOutputDTO(game));
  }
}

/*Output DTO для списка игр.*/
export type GameListOutputDTO = GameOutputDTO[];
