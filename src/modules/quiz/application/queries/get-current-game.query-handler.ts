import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { User } from '../../../user/domain/users/users.entity';
import { Game } from '../../domain/game.entity';
import { GameQuestion, GameQuestionList } from '../../domain/game-question.entity';
import { Player } from '../../domain/player.entity';
import { PlayerAnswer, PlayerAnswerList } from '../../domain/player-answer.entity';
import { GameOutputDTO, GameQuestionOutputDTO, GameStatusOutputDTO } from '../../api/output-dto/game.output-dto';
import { PlayerAnswerOutputDTO, PlayerAnswerStatusOutputDTO } from '../../api/output-dto/player-answer.output-dto';
import { GetCurrentGameQuery } from './get-current-game.query';
import { UsersQueryRepository } from '../../../user/infrastructure/users/users.query-repository';
import { QuizzesQueryRepository } from '../../infrastructure/quizzes.query-repository';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';

/*Обработчик запроса для поиска текущей игры пользователя.*/
@QueryHandler(GetCurrentGameQuery)
export class GetCurrentGameQueryHandler implements IQueryHandler<GetCurrentGameQuery> {
  public constructor(
    private readonly quizzesQueryRepository: QuizzesQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository
  ) {}

  public async execute({ userId }: GetCurrentGameQuery): Promise<GameOutputDTO> {
    /*Просим репозиторий "QuizzesQueryRepository" найти незавершенную игру по ID пользователя в БД.*/
    const game: Game | null = await this.quizzesQueryRepository.findUnfinishedGameByUserId(userId);

    /*Если у пользователя нет незавершенных игр, то выбрасываем исключение с информацией об этом.*/
    if (!game)
      throw new DomainException({
        code: DomainExceptionCode.PlayerHasNoUnfinishedGames,
        message: 'The player has no unfinished games',
        field: 'userId',
      });

    /*Просим репозиторий "QuizzesQueryRepository" найти первого игрока по ID игры в БД.*/
    const firstPlayer: Player | null = await this.quizzesQueryRepository.findFirstPlayerByGameId(game.id);
    /*Просим репозиторий "UsersQueryRepository" найти пользователя, который является первым игроком, по ID в БД.*/
    const firstUser: User | null = await this.usersQueryRepository.findById(firstPlayer!.userId);

    /*Просим репозиторий "QuizzesQueryRepository" найти ответы первого игрока вместе с вопросами в игре по ID игрока в
    БД.*/
    const firstPlayerAnswerList: PlayerAnswerList = await this.quizzesQueryRepository.findPlayerAnswerListByPlayerId(
      firstPlayer!.id
    );

    /*Просим репозиторий "QuizzesQueryRepository" найти второго игрока по ID игры в БД.*/
    const secondPlayer: Player | null = await this.quizzesQueryRepository.findSecondPlayerByGameId(game.id);
    /*Создаем переменную для хранения прогресса второго игрока.*/
    let secondPlayerProgress: GameOutputDTO['secondPlayerProgress'] = null;

    /*Если второй игрок уже подключился, то собираем его прогресс.*/
    if (secondPlayer) {
      /*Просим репозиторий "UsersQueryRepository" найти пользователя, который является вторым игроком, по ID в БД.*/
      const secondUser: User | null = await this.usersQueryRepository.findById(secondPlayer.userId);

      /*Просим репозиторий "QuizzesQueryRepository" найти ответы второго игрока вместе с вопросами в игре по ID игрока в
      БД.*/
      const secondPlayerAnswerList: PlayerAnswerList = await this.quizzesQueryRepository.findPlayerAnswerListByPlayerId(
        secondPlayer.id
      );

      /*Собираем прогресс второго игрока.*/
      secondPlayerProgress = {
        answers: secondPlayerAnswerList.map((playerAnswer: PlayerAnswer): PlayerAnswerOutputDTO => ({
          questionId: playerAnswer.gameQuestion.questionId,
          answerStatus: playerAnswer.status as unknown as PlayerAnswerStatusOutputDTO,
          addedAt: playerAnswer.createdAt,
        })),
        player: { id: secondPlayer.userId, login: secondUser!.login },
        score: secondPlayer.score,
      };
    }

    /*Просим репозиторий "QuizzesQueryRepository" найти вопросы в игре вместе с вопросами по ID игры в БД.*/
    const gameQuestionList: GameQuestionList = await this.quizzesQueryRepository.findGameQuestionListByGameId(game.id);

    /*Возвращаем данные об игре.*/
    return {
      id: game.id,
      firstPlayerProgress: {
        answers: firstPlayerAnswerList.map((playerAnswer: PlayerAnswer): PlayerAnswerOutputDTO => ({
          questionId: playerAnswer.gameQuestion.questionId,
          answerStatus: playerAnswer.status as unknown as PlayerAnswerStatusOutputDTO,
          addedAt: playerAnswer.createdAt,
        })),
        player: { id: firstPlayer!.userId, login: firstUser!.login },
        score: firstPlayer!.score,
      },
      secondPlayerProgress,
      questions:
        gameQuestionList.length > 0
          ? gameQuestionList.map((gameQuestion: GameQuestion): GameQuestionOutputDTO => ({
              id: gameQuestion.questionId,
              body: gameQuestion.question.body,
            }))
          : null,
      status: game.status as unknown as GameStatusOutputDTO,
      pairCreatedDate: game.createdAt,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }
}
