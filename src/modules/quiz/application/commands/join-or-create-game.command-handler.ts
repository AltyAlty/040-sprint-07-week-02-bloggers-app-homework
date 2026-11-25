import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SETTINGS } from '../../../../core/settings/settings';
import { User } from '../../../user/domain/users/users.entity';
import { Game } from '../../domain/game.entity';
import { GameQuestion, GameQuestionList } from '../../domain/game-question.entity';
import { Player } from '../../domain/player.entity';
import { Question, QuestionList } from '../../domain/question.entity';
import { GameOutputDTO, GameStatusOutputDTO } from '../../api/output-dto/game.output-dto';
import { CreateQuestionDomainDTO } from '../../domain/domain-dto/create-question.domain-dto';
import { JoinOrCreateGameCommand } from './join-or-create-game.command';
import { UsersRepository } from '../../../user/infrastructure/users/users.repository';
import { QuizzesRepository } from '../../infrastructure/quizzes.repository';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';

/*Обработчик команды для подключения пользователя к игре или создания новой игры для него.*/
@CommandHandler(JoinOrCreateGameCommand)
export class JoinOrCreateGameCommandHandler implements ICommandHandler<JoinOrCreateGameCommand> {
  public constructor(
    private readonly quizzesRepository: QuizzesRepository,
    private readonly usersRepository: UsersRepository
  ) {}

  public async execute({ userId }: JoinOrCreateGameCommand): Promise<GameOutputDTO> {
    /*Просим репозиторий "QuizzesRepository" найти незавершенную игру по ID пользователя в БД.*/
    const unfinishedGame: Game | null = await this.quizzesRepository.findUnfinishedGameByUserId(userId);

    /*Если у пользователя уже есть незавершенная игра, то выбрасываем исключение с информацией об этом.*/
    if (unfinishedGame)
      throw new DomainException({
        code: DomainExceptionCode.CannotJoinOrCreateGameWhileUserHasUnfinishedExistingGame,
        message: 'Cannot join or create a game because the user has an unfinished existing game',
        field: 'userId',
      });

    /*Если у пользователя нет незавершенных игр, то просим репозиторий "QuizzesRepository" найти случайную игру, которая
    еще не началась, в БД.*/
    const randomPendingGame: Game | null = await this.quizzesRepository.findRandomPendingGame();

    /*Если случайная игра, которая еще не началась, не была найдена, то создаем новую игру, иначе подключаемся к
    существующей игре.*/
    if (!randomPendingGame) {
      /*Просим сущность "Game" создать игру.*/
      const game: Game = Game.create();
      /*Просим репозиторий "QuizzesRepository" сохранить игру в БД.*/
      await this.quizzesRepository.saveGame(game);

      /*Просим сущность "Player" создать первого игрока.*/
      const player: Player = Player.create({
        userId,
        gameId: game.id,
        position: SETTINGS.QUIZ_GAME_SETTINGS_HOST_PLAYER_POSITION,
      });

      /*Просим репозиторий "QuizzesRepository" сохранить первого игрока в БД.*/
      await this.quizzesRepository.savePlayer(player);
      /*Просим репозиторий "UsersRepository" найти пользователя по ID в БД.*/
      const user: User | null = await this.usersRepository.findById(userId);

      /*Возвращаем данные о созданной игре.*/
      return {
        id: game.id,
        firstPlayerProgress: { answers: [], player: { id: userId, login: user!.login }, score: 0 },
        secondPlayerProgress: null,
        questions: null,
        status: GameStatusOutputDTO.PendingSecondPlayer,
        pairCreatedDate: game.createdAt,
        startGameDate: null,
        finishGameDate: null,
      };
    } else {
      /*Просим репозиторий "QuizzesRepository" найти первого игрока по ID игры в БД.*/
      const firstPlayer: Player | null = await this.quizzesRepository.findFirstPlayerByGameId(randomPendingGame.id);
      /*Просим репозиторий "UsersRepository" найти пользователя, который является первым игроком, по ID в БД.*/
      const firstUser: User | null = await this.usersRepository.findById(firstPlayer!.userId);

      /*Просим сущность "Player" создать второго игрока.*/
      const secondPlayer: Player = Player.create({
        userId,
        gameId: randomPendingGame.id,
        position: SETTINGS.QUIZ_GAME_SETTINGS_JOINED_PLAYER_POSITION,
      });

      /*Просим репозиторий "QuizzesRepository" сохранить второго игрока в БД.*/
      await this.quizzesRepository.savePlayer(secondPlayer);
      /*Просим репозиторий "UsersRepository" найти пользователя, который является вторым игроком, по ID в БД.*/
      const secondUser: User | null = await this.usersRepository.findById(userId);

      /*Просим репозиторий "QuizzesRepository" найти случайные опубликованные вопросы в БД.*/
      let questionList: QuestionList = await this.quizzesRepository.findRandomPublishedQuestionList(
        SETTINGS.QUIZ_GAME_SETTINGS_QUESTIONS_PER_GAME
      );

      /*Если в БД меньше нужного количества вопросов, то сохраняем в БД вопросы по умолчанию и повторно ищем случайные
      вопросы.*/
      if (questionList.length < SETTINGS.QUIZ_GAME_SETTINGS_QUESTIONS_PER_GAME) {
        /*Просим сущность "Question" создать вопросы на основе вопросов по умолчанию.*/
        const defaultQuestionList: QuestionList = SETTINGS.QUIZ_GAME_SETTINGS_DEFAULT_QUESTIONS.map(
          (defaultQuestion: CreateQuestionDomainDTO): Question =>
            Question.create({ ...defaultQuestion, isPublished: true })
        );

        /*Просим репозиторий "QuizzesRepository" сохранить созданные вопросы в БД.*/
        await this.quizzesRepository.saveQuestionList(defaultQuestionList);

        /*Просим репозиторий "QuizzesRepository" найти случайные опубликованные вопросы в БД.*/
        questionList = await this.quizzesRepository.findRandomPublishedQuestionList(
          SETTINGS.QUIZ_GAME_SETTINGS_QUESTIONS_PER_GAME
        );
      }

      /*Просим сущность "GameQuestion" создать вопросы в игре.*/
      const gameQuestionList: GameQuestionList = questionList.map((question: Question, index: number): GameQuestion =>
        GameQuestion.create({ gameId: randomPendingGame.id, questionId: question.id, position: index + 1 })
      );

      /*Просим репозиторий "QuizzesRepository" сохранить созданные вопросы в игре в БД.*/
      await this.quizzesRepository.saveGameQuestionList(gameQuestionList);
      /*Начинаем игру.*/
      randomPendingGame.start();
      /*Просим репозиторий "QuizzesRepository" сохранить начатую игру в БД.*/
      await this.quizzesRepository.saveGame(randomPendingGame);

      /*Возвращаем данные об игре.*/
      return {
        id: randomPendingGame.id,
        firstPlayerProgress: { answers: [], player: { id: firstPlayer!.userId, login: firstUser!.login }, score: 0 },
        secondPlayerProgress: { answers: [], player: { id: userId, login: secondUser!.login }, score: 0 },
        questions: questionList.map((question: Question) => ({ id: question.id, body: question.body })),
        status: GameStatusOutputDTO.Active,
        pairCreatedDate: randomPendingGame.createdAt,
        startGameDate: randomPendingGame.startGameDate,
        finishGameDate: null,
      };
    }
  }
}
