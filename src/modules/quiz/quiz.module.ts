import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './domain/game.entity';
import { GameQuestion } from './domain/game-question.entity';
import { Player } from './domain/player.entity';
import { PlayerAnswer } from './domain/player-answer.entity';
import { Question } from './domain/question.entity';
import { CoreModule } from '../../core/core.module';
import { UserModule } from '../user/user.module';
import { PairGameQuizController } from './api/pair-quiz-game.controller';
import { QuizQuestionsSaController } from './api/quiz-questions-sa.controller';
import { CreateQuestionCommandHandler } from './application/commands/create-question.command-handler';
import { JoinOrCreateGameCommandHandler } from './application/commands/join-or-create-game.command-handler';
import { MarkQuestionAsDeletedByIdCommandHandler } from './application/commands/mark-question-as-deleted-by-id.command-handler';
import { PublishOrUnpublishQuestionByIdCommandHandler } from './application/commands/publish-or-unpublish-question-by-id.command-handler';
import { SendPlayerAnswerToGameQuestionCommandHandler } from './application/commands/send-player-answer-to-game-question.command-handler';
import { UpdateQuestionByIdCommandHandler } from './application/commands/update-question-by-id.command-handler';
import { GetCurrentGameQueryHandler } from './application/queries/get-current-game.query-handler';
import { GetGameByGameIdAndUserIdQueryHandler } from './application/queries/get-game-by-game-id-and-user-id.query-handler';
import { GetGameListByUserIdQueryHandler } from './application/queries/get-game-list-by-user-id.query-handler';
import { GetQuestionListQueryHandler } from './application/queries/get-question-list.query-handler';
import { GetUserGameStatisticsByUserIdQueryHandler } from './application/queries/get-user-game-statistics-by-user-id.query-handler';
import { QuizzesRepository } from './infrastructure/quizzes.repository';
import { QuizzesQueryRepository } from './infrastructure/quizzes.query-repository';

/*Модуль для квизов.*/
@Module({
  imports: [
    CoreModule,
    PassportModule.register({ defaultStrategy: 'access-jwt' }),
    TypeOrmModule.forFeature([Question, Game, Player, GameQuestion, PlayerAnswer]),
    UserModule,
  ],
  controllers: [PairGameQuizController, QuizQuestionsSaController],
  providers: [
    CreateQuestionCommandHandler,
    GetQuestionListQueryHandler,
    UpdateQuestionByIdCommandHandler,
    PublishOrUnpublishQuestionByIdCommandHandler,
    MarkQuestionAsDeletedByIdCommandHandler,
    JoinOrCreateGameCommandHandler,
    SendPlayerAnswerToGameQuestionCommandHandler,
    GetCurrentGameQueryHandler,
    GetGameByGameIdAndUserIdQueryHandler,
    GetGameListByUserIdQueryHandler,
    GetUserGameStatisticsByUserIdQueryHandler,
    QuizzesRepository,
    QuizzesQueryRepository,
  ],
})
export class QuizModule {}
