import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { User } from '../../../user/domain/users/users.entity';
import { Game } from '../../domain/game.entity';
import { GameQuestionList } from '../../domain/game-question.entity';
import { Player } from '../../domain/player.entity';
import { PlayerAnswerList } from '../../domain/player-answer.entity';
import { GameOutputDTO } from '../../api/output-dto/game.output-dto';
import { GetGameByGameIdAndUserIdQuery } from './get-game-by-game-id-and-user-id.query';
import { UsersQueryRepository } from '../../../user/infrastructure/users/users.query-repository';
import { QuizzesQueryRepository } from '../../infrastructure/quizzes.query-repository';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';

/*Обработчик запроса для поиска игры по ID игры и ID пользователя.*/
@QueryHandler(GetGameByGameIdAndUserIdQuery)
export class GetGameByGameIdAndUserIdQueryHandler implements IQueryHandler<GetGameByGameIdAndUserIdQuery> {
  public constructor(
    private readonly quizzesQueryRepository: QuizzesQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository
  ) {}

  public async execute({ dto }: GetGameByGameIdAndUserIdQuery): Promise<GameOutputDTO> {
    /*Просим репозиторий "QuizzesQueryRepository" найти игру по ID в БД.*/
    const game: Game | null = await this.quizzesQueryRepository.findGameById(dto.gameId);

    /*Если игра не была найдена, то выбрасываем исключение с информацией об этом.*/
    if (!game)
      throw new DomainException({
        code: DomainExceptionCode.GameNotFoundById,
        message: 'The game was not found',
        field: 'id',
      });

    /*Просим репозиторий "QuizzesQueryRepository" найти первого игрока по ID игры в БД.*/
    const firstPlayer: Player | null = await this.quizzesQueryRepository.findFirstPlayerByGameId(game.id);
    /*Просим репозиторий "QuizzesQueryRepository" найти второго игрока по ID игры в БД.*/
    const secondPlayer: Player | null = await this.quizzesQueryRepository.findSecondPlayerByGameId(game.id);
    /*Проверяем, что пользователь, который делает запрос, является игроком найденной игры.*/
    const isParticipant: boolean = firstPlayer!.userId === dto.userId || secondPlayer?.userId === dto.userId;

    /*Если пользователь пытается получить игру, в которой не участвует, то выбрасываем исключение с информацией об
    этом.*/
    if (!isParticipant)
      throw new DomainException({
        code: DomainExceptionCode.CannotGetGameBecauseUserIsNotParticipant,
        message: 'Cannot get the game because the user is not a participant of the game',
        field: 'userId',
      });

    /*Если пользователь не пытается получить игру, в которой не участвует, то просим репозиторий "UsersQueryRepository"
    найти пользователя, являющегося первым игроком, по ID в БД.*/
    const firstUser: User | null = await this.usersQueryRepository.findById(firstPlayer!.userId);

    /*Просим репозиторий "QuizzesQueryRepository" найти ответы первого игрока вместе с вопросами в игре по ID игрока в
    БД.*/
    const firstPlayerAnswerList: PlayerAnswerList = await this.quizzesQueryRepository.findPlayerAnswerListByPlayerId(
      firstPlayer!.id
    );

    /*Если второй игрок уже подключился, то собираем его прогресс.*/
    if (secondPlayer) {
      /*Просим репозиторий "UsersQueryRepository" найти пользователя, который является вторым игроком, по ID в БД.*/
      const secondUser: User | null = await this.usersQueryRepository.findById(secondPlayer.userId);

      /*Просим репозиторий "QuizzesQueryRepository" найти ответы второго игрока вместе с вопросами в игре по ID игрока в
      БД.*/
      const secondPlayerAnswerList: PlayerAnswerList = await this.quizzesQueryRepository.findPlayerAnswerListByPlayerId(
        secondPlayer.id
      );

      /*Кладем пользователя второго игрока в объект второго игрока, чтобы маппер мог прочитать эти данные.*/
      secondPlayer.user = secondUser!;
      /*Кладем ответы второго игрока в объект второго игрока, чтобы маппер мог прочитать эти данные.*/
      secondPlayer.playerAnswerList = secondPlayerAnswerList;
    }

    /*Просим репозиторий "QuizzesQueryRepository" найти вопросы в игре вместе с вопросами по ID игры в БД.*/
    const gameQuestionList: GameQuestionList = await this.quizzesQueryRepository.findGameQuestionListByGameId(game.id);
    /*Кладем пользователя первого игрока в объект первого игрока, чтобы маппер мог прочитать эти данные.*/
    firstPlayer!.user = firstUser!;
    /*Кладем ответы первого игрока в объект первого игрока, чтобы маппер мог прочитать эти данные.*/
    firstPlayer!.playerAnswerList = firstPlayerAnswerList;
    /*Кладем игроков в объект игры, чтобы маппер мог прочитать эти данные.*/
    game.playerList = secondPlayer ? [firstPlayer!, secondPlayer] : [firstPlayer!];
    /*Кладем вопросы в игре в объект игры, чтобы маппер мог прочитать эти данные.*/
    game.gameQuestionList = gameQuestionList;
    /*Возвращаем данные об игре.*/
    return GameOutputDTO.mapFromGameToGameOutputDTO(game);
  }
}
