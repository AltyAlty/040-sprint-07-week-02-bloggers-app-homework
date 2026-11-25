import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SETTINGS } from '../../../../core/settings/settings';
import { GameQuestion } from '../../domain/game-question.entity';
import { Player, PlayerList } from '../../domain/player.entity';
import { PlayerAnswer } from '../../domain/player-answer.entity';
import { PlayerAnswerOutputDTO, PlayerAnswerStatusOutputDTO } from '../../api/output-dto/player-answer.output-dto';
import { PlayerAnswerStatusDomainDTO } from '../../domain/domain-dto/player-answer-status.domain-dto';
import { PlayerWinStatusDomainDTO } from '../../domain/domain-dto/player-win-status.domain-dto';
import { SendPlayerAnswerToGameQuestionCommand } from './send-player-answer-to-game-question.command';
import { QuizzesRepository } from '../../infrastructure/quizzes.repository';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';

/*Обработчик команды для отправки ответа игрока на вопрос в игре.*/
@CommandHandler(SendPlayerAnswerToGameQuestionCommand)
export class SendPlayerAnswerToGameQuestionCommandHandler implements ICommandHandler<SendPlayerAnswerToGameQuestionCommand> {
  public constructor(private readonly quizzesRepository: QuizzesRepository) {}

  public async execute({ dto }: SendPlayerAnswerToGameQuestionCommand): Promise<PlayerAnswerOutputDTO> {
    /*Просим репозиторий "QuizzesRepository" найти игрока с активной игрой по ID пользователя в БД.*/
    const player: Player | null = await this.quizzesRepository.findPlayerWithActiveGameByUserId(dto.userId);

    /*Если у пользователя нет активной игры, то выбрасываем исключение с информацией об этом.*/
    if (!player)
      throw new DomainException({
        code: DomainExceptionCode.CannotSendPlayerAnswerWithoutActiveGame,
        message: 'Cannot send an answer because the user has no active game',
      });

    /*Если у пользователя есть активная игра, то просим репозиторий "QuizzesRepository" посчитать количество ответов
    игрока по ID игрока в БД.*/
    const answeredCount: number = await this.quizzesRepository.countPlayerAnswersByPlayerId(player.id);

    /*Если игрок уже ответил на все вопросы, то выбрасываем исключение с информацией об этом.*/
    if (answeredCount >= SETTINGS.QUIZ_GAME_SETTINGS_QUESTIONS_PER_GAME)
      throw new DomainException({
        code: DomainExceptionCode.CannotSendPlayerAnswerWhenAllQuestionsAreAnswered,
        message: 'Cannot send an answer because the player has already answered all questions',
      });

    /*Если игрок еще не ответил на все вопросы, то просим репозиторий "QuizzesRepository" найти следующий вопрос в игре
    вместе с вопросом по ID игры и позиции вопроса в игре в БД.*/
    const gameQuestion: GameQuestion | null =
      await this.quizzesRepository.findGameQuestionByGameIdAndGameQuestionPosition(player.gameId, answeredCount + 1);

    /*Просим сущность "Question" проверить ответ игрока.*/
    const playerAnswerStatus: PlayerAnswerStatusDomainDTO = gameQuestion!.question.checkAnswer(dto.answer);

    /*Просим сущность "PlayerAnswer" создать ответ игрока.*/
    const playerAnswer: PlayerAnswer = PlayerAnswer.create({
      playerId: player.id,
      gameQuestionId: gameQuestion!.id,
      body: dto.answer,
      status: playerAnswerStatus,
    });

    /*Просим репозиторий "QuizzesRepository" сохранить ответ игрока в БД.*/
    await this.quizzesRepository.savePlayerAnswer(playerAnswer);

    /*Если ответ правильный, то просим сущность "Player" добавить очки.*/
    if (playerAnswerStatus === PlayerAnswerStatusDomainDTO.Correct) {
      player.addScore(SETTINGS.QUIZ_GAME_SETTINGS_POINTS_PER_CORRECT_ANSWER);
      /*Просим репозиторий "QuizzesRepository" сохранить измененного игрока в БД.*/
      await this.quizzesRepository.savePlayer(player);
    }

    /*Если этот ответ был последним для игрока, то проверяем, не пора ли завершать игру.*/
    if (answeredCount + 1 === SETTINGS.QUIZ_GAME_SETTINGS_QUESTIONS_PER_GAME) {
      /*Просим репозиторий "QuizzesRepository" найти игроков в игре по ID игры в БД.*/
      const playerList: PlayerList = await this.quizzesRepository.findPlayerListByGameId(player.gameId);
      /*Получаем список оппонентов текущего игрока. В случае двух игроков в списке будет только один оппонент.*/
      const opponentList: PlayerList = playerList.filter((otherPlayer: Player) => otherPlayer.id !== player.id);
      /*Создаем переменную, которая будет хранить сколько оппонентов уже ответили на все вопросы.*/
      let finishedOpponentCount: number = 0;

      /*Перебираем оппонентов.*/
      for (const opponent of opponentList) {
        /*Просим репозиторий "QuizzesRepository" посчитать количество ответов оппонента по ID игрока в БД.*/
        const otherAnsweredCount: number = await this.quizzesRepository.countPlayerAnswersByPlayerId(opponent.id);
        /*Если оппонент ответил на все вопросы, то увеличиваем счетчик "finishedOpponentCount".*/
        if (otherAnsweredCount >= SETTINGS.QUIZ_GAME_SETTINGS_QUESTIONS_PER_GAME) finishedOpponentCount++;
      }

      /*Если все оппоненты ответили на все вопросы, то завершаем игру.*/
      if (opponentList.length > 0 && finishedOpponentCount === opponentList.length) {
        /*Создаем переменную, которая будет хранить игрока, первого ответившего на все вопросы. Поскольку текущий игрок
        закончил последним, то бонус получит его оппонент.*/
        const bonusPlayer: Player = opponentList[0];

        /*Бонусные очки даем, только если у первого закончившего игрока есть хотя бы один правильный ответ.*/
        if (bonusPlayer.score > 0) {
          /*Просим сущность "Player" добавить бонусные очки.*/
          bonusPlayer.addScore(SETTINGS.QUIZ_GAME_SETTINGS_BONUS_POINTS);
          /*Просим репозиторий "QuizzesRepository" сохранить игрока, получившего бонусные очки, в БД.*/
          await this.quizzesRepository.savePlayer(bonusPlayer);
        }

        /*Находим максимальный счет среди игроков.*/
        const maxScore: number = Math.max(...playerList.map((gamePlayer: Player) => gamePlayer.score));
        /*Считаем сколько игроков набрали максимальный счет.*/
        const topPlayerCount: number = playerList.filter((gamePlayer: Player) => gamePlayer.score === maxScore).length;

        /*Перебираем всех игроков.*/
        for (const gamePlayer of playerList) {
          /*Если у игрока не максимальный счет, то он проигрывает, иначе если только у него максимальный счет, то он
          выигрывает, в остальных случаях ничья.*/
          if (gamePlayer.score !== maxScore) {
            gamePlayer.setWinStatus(PlayerWinStatusDomainDTO.Lose);
          } else if (topPlayerCount === 1) {
            gamePlayer.setWinStatus(PlayerWinStatusDomainDTO.Win);
          } else {
            gamePlayer.setWinStatus(PlayerWinStatusDomainDTO.Draw);
          }

          /*Просим репозиторий "QuizzesRepository" сохранить измененного игрока в БД.*/
          await this.quizzesRepository.savePlayer(gamePlayer);
        }

        /*Завершаем игру.*/
        player.game.finish();
        /*Просим репозиторий "QuizzesRepository" сохранить завершенную игру в БД.*/
        await this.quizzesRepository.saveGame(player.game);
      }
    }

    /*Возвращаем данные об ответе игрока.*/
    return {
      questionId: gameQuestion!.questionId,
      answerStatus:
        playerAnswerStatus === PlayerAnswerStatusDomainDTO.Correct
          ? PlayerAnswerStatusOutputDTO.Correct
          : PlayerAnswerStatusOutputDTO.Incorrect,
      addedAt: playerAnswer.createdAt,
    };
  }
}
