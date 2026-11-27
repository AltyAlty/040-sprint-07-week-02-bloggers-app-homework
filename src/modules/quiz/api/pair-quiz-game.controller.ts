import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { SETTINGS } from '../../../core/settings/settings';
import { GetGameListQueryInputDTO } from './input-dto/query/get-game-list-query.input-dto';
import { SendPlayerAnswerToGameQuestionInputDTO } from './input-dto/send-player-answer-to-game-question.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { GameListOutputDTO, GameOutputDTO } from './output-dto/game.output-dto';
import { PlayerAnswerOutputDTO } from './output-dto/player-answer.output-dto';
import { UserGameStatisticsOutputDTO } from './output-dto/user-game-statistics.output-dto';
import { UserAccessJwtAuthContextDTO } from '../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';
import { UuidParam } from '../../../core/decorators/validation/uuid-param.validation-decorator';
import { ExtractUserDataFromRequest } from '../../user/api/auth/decorators/param-extraction/extract-user-data-from-request.param-decorator';
import { AccessJwtAuthGuard } from '../../../core/guards/access-jwt-auth/access-jwt-auth.guard';
import { JoinOrCreateGameCommand } from '../application/commands/join-or-create-game.command';
import { SendPlayerAnswerToGameQuestionCommand } from '../application/commands/send-player-answer-to-game-question.command';
import { GetCurrentGameQuery } from '../application/queries/get-current-game.query';
import { GetGameByGameIdAndUserIdQuery } from '../application/queries/get-game-by-game-id-and-user-id.query';
import { GetGameListByUserIdQuery } from '../application/queries/get-game-list-by-user-id.query';
import { GetUserGameStatisticsByUserIdQuery } from '../application/queries/get-user-game-statistics-by-user-id.query';

/*Контроллер для квизов.*/
@ApiTags(SETTINGS.PAIR_GAME_QUIZ_API_TAG)
@UseGuards(AccessJwtAuthGuard)
@Controller(SETTINGS.PAIR_GAME_QUIZ_PREFIX)
export class PairGameQuizController {
  public constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  /*001. POST-запрос по подключению пользователя к игре или создания новой игры для него.*/
  @Post(SETTINGS.PAIR_GAME_QUIZ_JOIN_OR_CREATE_GAME_PATH)
  @HttpCode(HttpStatus.OK)
  public async joinOrCreateGame(
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO | null
  ): Promise<GameOutputDTO> {
    /*Просим шину "CommandBus" подключить пользователя к игре или создать новую игру для него.*/
    return this.commandBus.execute(new JoinOrCreateGameCommand(userAccessJwtAuthContext!.id));
  }

  /*002. POST-запрос по отправке ответа игрока на вопрос в игре.*/
  @Post(SETTINGS.PAIR_GAME_QUIZ_SEND_PLAYER_ANSWER_TO_GAME_QUESTION_PATH)
  @HttpCode(HttpStatus.OK)
  public async sendPlayerAnswerToGameQuestion(
    @Body() body: SendPlayerAnswerToGameQuestionInputDTO,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO | null
  ): Promise<PlayerAnswerOutputDTO> {
    /*Просим шину "CommandBus" отправить ответ игрока на вопрос в игре.*/
    return this.commandBus.execute(
      new SendPlayerAnswerToGameQuestionCommand({ answer: body.answer, userId: userAccessJwtAuthContext!.id })
    );
  }

  /*003. GET-запрос по получению текущей игры пользователя.*/
  @Get(SETTINGS.PAIR_GAME_QUIZ_GET_CURRENT_GAME_PATH)
  @HttpCode(HttpStatus.OK)
  public async getCurrentGame(
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO | null
  ): Promise<GameOutputDTO> {
    /*Просим шину "QueryBus" найти текущую игру пользователя.*/
    return this.queryBus.execute(new GetCurrentGameQuery(userAccessJwtAuthContext!.id));
  }

  /*004. GET-запрос по поиску игр по ID пользователя с пагинацией, используя query-параметры.*/
  @Get(SETTINGS.PAIR_GAME_QUIZ_GET_GAME_LIST_BY_USER_ID_PATH)
  @HttpCode(HttpStatus.OK)
  public async getGameListByUserId(
    @Query() query: GetGameListQueryInputDTO,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO | null
  ): Promise<PaginationMetaDataOutputDTO<GameListOutputDTO>> {
    /*Просим шину "QueryBus" найти игры по ID пользователя.*/
    return this.queryBus.execute(new GetGameListByUserIdQuery(userAccessJwtAuthContext!.id, query));
  }

  /*005. GET-запрос по получению игры по ID игры и ID пользователя, используя URI-параметры.*/
  @Get(SETTINGS.PAIR_GAME_QUIZ_GET_GAME_BY_GAME_ID_AND_USER_ID_PATH)
  @HttpCode(HttpStatus.OK)
  public async getGameByGameIdAndUserId(
    @UuidParam() id: string,
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO | null
  ): Promise<GameOutputDTO> {
    /*Просим шину "QueryBus" найти игру по ID игры и ID пользователя.*/
    return this.queryBus.execute(
      new GetGameByGameIdAndUserIdQuery({ gameId: id, userId: userAccessJwtAuthContext!.id })
    );
  }

  /*006. GET-запрос по получению игровой статистика пользователя по ID пользователя.*/
  @Get(SETTINGS.PAIR_GAME_QUIZ_GET_USER_GAME_STATISTICS_BY_USER_ID_PATH)
  @HttpCode(HttpStatus.OK)
  public async getUserGameStatisticsByUserId(
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO | null
  ): Promise<UserGameStatisticsOutputDTO> {
    /*Просим шину "QueryBus" найти игровую статистику пользователя по ID пользователя.*/
    return this.queryBus.execute(new GetUserGameStatisticsByUserIdQuery(userAccessJwtAuthContext!.id));
  }
}
