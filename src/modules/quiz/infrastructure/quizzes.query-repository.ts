import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';
import { SETTINGS } from '../../../core/settings/settings';
import { Game } from '../domain/game.entity';
import { GameQuestion, GameQuestionList } from '../domain/game-question.entity';
import { Player } from '../domain/player.entity';
import { PlayerAnswer, PlayerAnswerList } from '../domain/player-answer.entity';
import { Question, QuestionList } from '../domain/question.entity';
import { SortDirectionInputDTO } from '../../../core/pagination/input-dto/sort-direction.input-dto';
import { GetQuestionListQueryInputDTO } from '../api/input-dto/query/get-question-list-query.input-dto';
import { PublishedStatusQueryInputDTO } from '../api/input-dto/query/published-status-query.input-dto';

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

  /*Создаем метод, который ставит символ "\" перед символами "\", "%" и "_" в строке. Это нужно, так как в SQL-операторе
  "ILIKE" символы "%" и "_" являются командами поиска, а символ "\" является символом экранирования по умолчанию в
  PostgreSQL, и если пользователь введет любой из них в строке поиска, то БД воспримет их как команды, а не как обычные
  символы, что сломает логику поиска.*/
  private _escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, '\\$&');
  }
}
