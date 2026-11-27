import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, IsNull, Repository, SelectQueryBuilder } from 'typeorm';
import { SETTINGS } from '../../../core/settings/settings';
import { Game, GameList } from '../domain/game.entity';
import { GameQuestion, GameQuestionList } from '../domain/game-question.entity';
import { Player } from '../domain/player.entity';
import { PlayerAnswer, PlayerAnswerList } from '../domain/player-answer.entity';
import { Question, QuestionList } from '../domain/question.entity';
import { SortDirectionInputDTO } from '../../../core/pagination/input-dto/sort-direction.input-dto';
import { GetGameListQueryInputDTO } from '../api/input-dto/query/get-game-list-query.input-dto';
import { GetQuestionListQueryInputDTO } from '../api/input-dto/query/get-question-list-query.input-dto';
import { PublishedStatusQueryInputDTO } from '../api/input-dto/query/published-status-query.input-dto';
import { UserGameStatisticsOutputDTO } from '../api/output-dto/user-game-statistics.output-dto';
import { PlayerWinStatusDomainDTO } from '../domain/domain-dto/player-win-status.domain-dto';

/*Query-репозиторий для квизов.*/
@Injectable()
export class QuizzesQueryRepository {
  public constructor(
    @InjectRepository(Question) private questionsRepository: Repository<Question>,
    @InjectRepository(Game) private gamesRepository: Repository<Game>,
    @InjectRepository(Player) private playersRepository: Repository<Player>,
    @InjectRepository(GameQuestion) private gameQuestionsRepository: Repository<GameQuestion>,
    @InjectRepository(PlayerAnswer) private playerAnswersRepository: Repository<PlayerAnswer>
  ) {}

  /*Метод для поиска игры по ID в БД.*/
  public async findGameById(gameId: string): Promise<Game | null> {
    return await this.gamesRepository.findOneBy({ id: gameId });
  }

  /*Метод для поиска незавершенной игры по ID пользователя в БД.*/
  public async findUnfinishedGameByUserId(userId: string): Promise<Game | null> {
    return await this.gamesRepository.findOne({ where: { playerList: { userId, winStatus: IsNull() } } });
  }

  /*Метод для поиска первого игрока по ID игры в БД.*/
  public async findFirstPlayerByGameId(gameId: string): Promise<Player | null> {
    return await this.playersRepository.findOneBy({
      gameId,
      position: SETTINGS.QUIZ_GAME_SETTINGS_HOST_PLAYER_POSITION,
    });
  }

  /*Метод для поиска второго игрока по ID игры в БД.*/
  public async findSecondPlayerByGameId(gameId: string): Promise<Player | null> {
    return await this.playersRepository.findOneBy({
      gameId,
      position: SETTINGS.QUIZ_GAME_SETTINGS_HOST_PLAYER_POSITION + 1,
    });
  }

  /*Метод для поиска вопросов в игре вместе с вопросами по ID игры в БД.*/
  public async findGameQuestionListByGameId(gameId: string): Promise<GameQuestionList> {
    return await this.gameQuestionsRepository.find({
      where: { gameId },
      relations: { question: true },
      order: { position: 'ASC' },
      withDeleted: true,
    });
  }

  /*Метод для поиска ответов игрока вместе с вопросами в игре по ID игрока в БД.*/
  public async findPlayerAnswerListByPlayerId(playerId: string): Promise<PlayerAnswerList> {
    return await this.playerAnswersRepository.find({
      where: { playerId },
      relations: { gameQuestion: true },
      order: { gameQuestion: { position: 'ASC' } },
    });
  }

  /*Метод для поиска вопросов в БД.*/
  public async findQuestionList(
    dto: GetQuestionListQueryInputDTO
  ): Promise<{ items: QuestionList; totalCount: number }> {
    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip: number = dto.calculateSkip();

    /*Создаем список допустимых полей для сортировки в целях защиты от SQL-инъекций.*/
    const allowedSortFields: Record<string, keyof Question> = {
      body: 'body',
      published: 'isPublished',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    };

    /*Если пришедшее значение "dto.sortBy" нет в ключах словаря, то выбирается безопасный вариант "createdAt".*/
    const sortField: keyof Question = allowedSortFields[dto.sortBy] ?? 'createdAt';
    /*Маппим направления сортировки в ключевые слова PostgreSQL.*/
    const sortDirection: 'ASC' | 'DESC' = dto.sortDirection === SortDirectionInputDTO.Asc ? 'ASC' : 'DESC';
    /*Динамически собираем условие для клаузы "WHERE". Если было передано свойство "dto.bodySearchTerm", то добавляем
    условие для оператора "ILIKE" по полю "body". Если свойство "dto.publishedStatus" равно "published" или
    "notPublished", то добавляем условие по полю "isPublished" со значением "true" или "false" соответственно, а при
    значении "all" условие по статусу не добавляется. Если ни одно условие не было добавлено, то клауза "WHERE" остается
    пустым объектом и TypeORM вернет все записи с проверкой на soft удаление.*/
    const where: FindOptionsWhere<Question> = {};
    if (dto.bodySearchTerm) where.body = ILike(`%${this._escapeLike(dto.bodySearchTerm)}%`);
    if (dto.publishedStatus === PublishedStatusQueryInputDTO.Published) where.isPublished = true;
    if (dto.publishedStatus === PublishedStatusQueryInputDTO.NotPublished) where.isPublished = false;

    /*Последовательно выполняем запрос данных и подсчет общего количества элементов.*/
    const [items, totalCount]: [QuestionList, number] = await this.questionsRepository.findAndCount({
      where,
      order: { [sortField]: sortDirection, id: 'ASC' },
      skip,
      take: dto.pageSize,
    });

    /*Возвращаем данные по вопросам.*/
    return { items, totalCount };
  }

  /*Метод для поиска игр по ID пользователя в БД.*/
  public async findGameList(
    userId: string,
    dto: GetGameListQueryInputDTO
  ): Promise<{ items: GameList; totalCount: number }> {
    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip: number = dto.calculateSkip();

    /*Создаем список допустимых полей для сортировки в целях защиты от SQL-инъекций.*/
    const allowedSortFields: Record<string, keyof Game> = {
      status: 'status',
      pairCreatedDate: 'createdAt',
      startGameDate: 'startGameDate',
      finishGameDate: 'finishGameDate',
    };

    /*Если пришедшее значение "dto.sortBy" нет в ключах словаря, то выбирается безопасный вариант "createdAt".*/
    const sortField: keyof Game = allowedSortFields[dto.sortBy] ?? 'createdAt';
    /*Маппим направления сортировки в ключевые слова PostgreSQL.*/
    const sortDirection: 'ASC' | 'DESC' = dto.sortDirection === SortDirectionInputDTO.Asc ? 'ASC' : 'DESC';

    /*Создаем запрос.*/
    const queryBuilder: SelectQueryBuilder<Game> = this.gamesRepository
      /*В качестве основной таблицы берем таблицу "games" с псевдонимом "game".*/
      .createQueryBuilder('game')
      /*К таблице "games" присоединяем таблицу "players" при помощи клаузы "LEFT JOIN" и для каждой игры кладем ее
      игроков в свойство "game.playerList".*/
      .leftJoinAndSelect('game.playerList', 'player')
      /*К таблице "players" присоединяем таблицу "users" при помощи клаузы "LEFT JOIN" и для каждого игрока кладем его
      пользователя в свойство "player.user".*/
      .leftJoinAndSelect('player.user', 'user')
      /*К таблице "players" присоединяем таблицу "player_answers" при помощи клаузы "LEFT JOIN" и для каждого игрока
      кладем его ответы в свойство "player.playerAnswerList".*/
      .leftJoinAndSelect('player.playerAnswerList', 'playerAnswer')
      /*К таблице "player_answers" присоединяем таблицу "game_questions" при помощи клаузы "LEFT JOIN" и для каждого
      ответа игрока кладем вопрос в игре, на который он был дан, в свойство "playerAnswer.gameQuestion".*/
      .leftJoinAndSelect('playerAnswer.gameQuestion', 'answerGameQuestion')
      /*К таблице "games" присоединяем таблицу "game_questions" при помощи клаузы "LEFT JOIN" и для каждой игры кладем
      ее вопросы в свойство "game.gameQuestionList".*/
      .leftJoinAndSelect('game.gameQuestionList', 'gameQuestion')
      /*К таблице "game_questions" присоединяем таблицу "questions" при помощи клаузы "LEFT JOIN" и для каждого вопроса
      в игре кладем сам вопрос в свойство "gameQuestion.question".*/
      .leftJoinAndSelect('gameQuestion.question', 'question')
      /*Оставляем только те игры, в которых участвует пользователь. Проверка сделана подзапросом "EXISTS", а не строгим
      условием по "player.userId", так как такое условие отфильтровало бы и список игроков, что привело бы к пропаже
      соперника из свойства "game.playerList".*/
      .where('EXISTS (SELECT 1 FROM public.players p WHERE p.game_id = game.id AND p.user_id = :userId)', { userId })
      /*Делаем сортировку по выбранному полю и направлению.*/
      .orderBy(`game.${sortField}`, sortDirection);

    /*Если выбранным полем сортировки была не "createdAt", то игры с одинаковым значением по этому полю дополнительно
    сортируем по дате создания игры по убыванию.*/
    if (sortField !== 'createdAt') queryBuilder.addOrderBy('game.createdAt', 'DESC');
    /*Добавляем последнее поле сортировки по "id", чтобы порядок игр был всегда одинаковым, иначе игры с совпадающими
    датами могут повторяться или пропадать между страницами, и применяем пагинацию.*/
    queryBuilder.addOrderBy('game.id', 'ASC').skip(skip).take(dto.pageSize);
    /*Последовательно выполняем запрос данных и подсчет общего количества элементов.*/
    const [items, totalCount]: [GameList, number] = await queryBuilder.getManyAndCount();
    /*Возвращаем данные по играм.*/
    return { items, totalCount };
  }

  /*Метод для поиска игровой статистики пользователя по ID пользователя в БД.*/
  public async findUserGameStatistics(userId: string): Promise<UserGameStatisticsOutputDTO> {
    /*Считаем в одном запросе по таблице "players" агрегаты для каждого завершенного игрока пользователя.*/
    const rawStatistics: {
      sumScore: string;
      avgScores: string;
      gamesCount: string;
      winsCount: string;
      lossesCount: string;
      drawsCount: string;
    } = (await this.playersRepository
      /*Создаем запрос к таблице "players" с псевдонимом "player".*/
      .createQueryBuilder('player')
      /*Считаем сумму очков по всем найденным строкам таблицы "players" (0, если строк нет) и кладем в свойство
      "sumScore".*/
      .select('COALESCE(SUM(player.score), 0)', 'sumScore')
      /*Считаем среднее количество очков по всем найденным строкам таблицы "players", округляем до 2 знаков (0, если
      строк нет) и кладем в свойство "avgScores".*/
      .addSelect('COALESCE(ROUND(AVG(player.score), 2), 0)', 'avgScores')
      /*Считаем количество всех найденных строк таблицы "players" и кладем в свойство "gamesCount".*/
      .addSelect('COUNT(*)', 'gamesCount')
      /*Считаем количество найденных строк таблицы "players", у которых "winStatus" равен значению параметра "win", и
      кладем в свойство "winsCount".*/
      .addSelect('COUNT(*) FILTER (WHERE player.winStatus = :win)', 'winsCount')
      /*Считаем количество найденных строк таблицы "players", у которых "winStatus" равен значению параметра "loss", и
      кладем в свойство "lossesCount".*/
      .addSelect('COUNT(*) FILTER (WHERE player.winStatus = :loss)', 'lossesCount')
      /*Считаем количество найденных строк таблицы "players", у которых "winStatus" равен значению параметра "draw", и
      кладем в свойство "drawsCount".*/
      .addSelect('COUNT(*) FILTER (WHERE player.winStatus = :draw)', 'drawsCount')
      /*Оставляем только строки таблицы "players", у которых "userId" равен ID пользователя.*/
      .where('player.userId = :userId', { userId })
      /*Дополнительно оставляем только строки таблицы "players" завершенных игр.*/
      .andWhere('player.winStatus IS NOT NULL')
      /*Передаем значения параметров "win", "loss" и "draw", которые используются в условиях клаузы "FILTER".*/
      .setParameters({
        win: PlayerWinStatusDomainDTO.Win,
        loss: PlayerWinStatusDomainDTO.Lose,
        draw: PlayerWinStatusDomainDTO.Draw,
      })
      /*Выполняем запрос и получаем сырую строку в виде обычного объекта, а не сущности. Поскольку клауза "GROUP BY" не
      используется, то строка всегда приходит одна, поэтому указываем что она всегда есть.*/
      .getRawOne())!;

    return {
      sumScore: Number(rawStatistics.sumScore),
      avgScores: Number(rawStatistics.avgScores),
      gamesCount: Number(rawStatistics.gamesCount),
      winsCount: Number(rawStatistics.winsCount),
      lossesCount: Number(rawStatistics.lossesCount),
      drawsCount: Number(rawStatistics.drawsCount),
    };
  }

  /*Создаем метод, который ставит символ "\" перед символами "\", "%" и "_" в строке. Это нужно, так как в SQL-операторе
  "ILIKE" символы "%" и "_" являются командами поиска, а символ "\" является символом экранирования по умолчанию в
  PostgreSQL, и если пользователь введет любой из них в строке поиска, то БД воспримет их как команды, а не как обычные
  символы, что сломает логику поиска.*/
  private _escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, '\\$&');
  }
}
