import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { SETTINGS } from '../../../core/settings/settings';
import { Game } from '../domain/game.entity';
import { GameQuestion, GameQuestionList } from '../domain/game-question.entity';
import { Player, PlayerList } from '../domain/player.entity';
import { PlayerAnswer } from '../domain/player-answer.entity';
import { Question, QuestionList } from '../domain/question.entity';
import { GameStatusDomainDTO } from '../domain/domain-dto/game-status.domain-dto';

/*Репозиторий для квизов.*/
@Injectable()
export class QuizzesRepository {
  public constructor(
    @InjectRepository(Question) private questionsRepository: Repository<Question>,
    @InjectRepository(Game) private gamesRepository: Repository<Game>,
    @InjectRepository(Player) private playersRepository: Repository<Player>,
    @InjectRepository(GameQuestion) private gameQuestionsRepository: Repository<GameQuestion>,
    @InjectRepository(PlayerAnswer) private playerAnswersRepository: Repository<PlayerAnswer>
  ) {}

  /*Метод для сохранения вопроса в БД.*/
  public async saveQuestion(question: Question): Promise<void> {
    await this.questionsRepository.save(question);
  }

  /*Метод для сохранения вопросов в БД.*/
  public async saveQuestionList(questionList: QuestionList): Promise<void> {
    await this.questionsRepository.save(questionList);
  }

  /*Метод для сохранения игры в БД.*/
  public async saveGame(game: Game): Promise<void> {
    await this.gamesRepository.upsert(game, ['id']);
  }

  /*Метод для сохранения игрока в БД.*/
  public async savePlayer(player: Player): Promise<void> {
    await this.playersRepository.upsert(player, ['id']);
  }

  /*Метод для сохранения вопросов в игре в БД.*/
  public async saveGameQuestionList(gameQuestionList: GameQuestionList): Promise<void> {
    await this.gameQuestionsRepository.insert(gameQuestionList);
  }

  /*Метод для сохранения ответа игрока в БД.*/
  public async savePlayerAnswer(playerAnswer: PlayerAnswer): Promise<void> {
    await this.playerAnswersRepository.upsert(playerAnswer, ['id']);
  }

  /*Метод для поиска вопроса по ID в БД.*/
  public async findQuestionById(id: string): Promise<Question | null> {
    return await this.questionsRepository.findOneBy({ id });
  }

  /*Метод для поиска случайных опубликованных вопросов в БД.*/
  public async findRandomPublishedQuestionList(limit: number): Promise<QuestionList> {
    return await this.questionsRepository
      .createQueryBuilder('question')
      .where('question.isPublished = :isPublished', { isPublished: true })
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();
  }

  /*Метод для поиска случайной игры, которая еще не началась, в БД.*/
  public async findRandomPendingGame(): Promise<Game | null> {
    return await this.gamesRepository
      .createQueryBuilder('game')
      .where('game.status = :status', { status: GameStatusDomainDTO.PendingSecondPlayer })
      .orderBy('RANDOM()')
      .limit(1)
      .getOne();
  }

  /*Метод для поиска незавершенной игры по ID пользователя в БД.*/
  public async findUnfinishedGameByUserId(userId: string): Promise<Game | null> {
    return await this.gamesRepository.findOne({ where: { playerList: { userId, winStatus: IsNull() } } });
  }

  /*Метод для поиска игрока с активной игрой по ID пользователя в БД.*/
  public async findPlayerWithActiveGameByUserId(userId: string): Promise<Player | null> {
    return await this.playersRepository.findOne({
      where: { userId, winStatus: IsNull(), game: { status: GameStatusDomainDTO.Active } },
      relations: { game: true },
    });
  }

  /*Метод для поиска первого игрока по ID игры в БД.*/
  public async findFirstPlayerByGameId(gameId: string): Promise<Player | null> {
    return await this.playersRepository.findOneBy({
      gameId,
      position: SETTINGS.QUIZ_GAME_SETTINGS_HOST_PLAYER_POSITION,
    });
  }

  /*Метод для поиска игроков в игре по ID игры в БД.*/
  public async findPlayerListByGameId(gameId: string): Promise<PlayerList> {
    return await this.playersRepository.find({ where: { gameId }, order: { position: 'ASC' } });
  }

  /*Метод для поиска вопроса в игре вместе с вопросом по ID игры и позиции вопроса в игре в БД.*/
  public async findGameQuestionByGameIdAndGameQuestionPosition(
    gameId: string,
    position: number
  ): Promise<GameQuestion | null> {
    return await this.gameQuestionsRepository.findOne({
      where: { gameId, position },
      relations: { question: true },
      withDeleted: true,
    });
  }

  /*Метод для подсчета ответов игрока по ID игрока в БД.*/
  public async countPlayerAnswersByPlayerId(playerId: string): Promise<number> {
    return await this.playerAnswersRepository.countBy({ playerId });
  }

  /*Метод для soft удаления вопроса по ID в БД.*/
  public async markQuestionAsDeletedById(id: string): Promise<void> {
    await this.questionsRepository.softDelete(id);
  }
}
