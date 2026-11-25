import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { SETTINGS } from '../../../core/settings/settings';
import { CreateQuestionInputDTO } from './input-dto/create-question.input-dto';
import { PublishOrUnpublishQuestionByIdInputDTO } from './input-dto/publish-or-unpublish-question-by-id.input-dto';
import { GetQuestionListQueryInputDTO } from './input-dto/query/get-question-list-query.input-dto';
import { UpdateQuestionByIdInputDTO } from './input-dto/update-question-by-id.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { QuestionListOutputDTO, QuestionOutputDTO } from './output-dto/question.output-dto';
import { BasicAuthGuard } from '../../../core/guards/basic-auth/basic-auth.guard';
import { CreateQuestionCommand } from '../application/commands/create-question.command';
import { MarkQuestionAsDeletedByIdCommand } from '../application/commands/mark-question-as-deleted-by-id.command';
import { PublishOrUnpublishQuestionByIdCommand } from '../application/commands/publish-or-unpublish-question-by-id.command';
import { UpdateQuestionByIdCommand } from '../application/commands/update-question-by-id.command';
import { GetQuestionListQuery } from '../application/queries/get-question-list.query';

/*SA-Контроллер для вопросов.*/
@ApiTags(SETTINGS.QUIZ_QUESTIONS_SA_API_TAG)
@UseGuards(BasicAuthGuard)
@Controller(SETTINGS.QUIZ_QUESTIONS_SA_PREFIX)
export class QuizQuestionsSaController {
  public constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  /*001. POST-запрос по созданию вопроса.*/
  @Post(SETTINGS.QUIZ_QUESTIONS_SA_CREATE_QUESTION_PATH)
  @HttpCode(HttpStatus.CREATED)
  public async createQuestion(@Body() body: CreateQuestionInputDTO): Promise<QuestionOutputDTO> {
    /*Просим шину "CommandBus" создать вопрос.*/
    return this.commandBus.execute(new CreateQuestionCommand(body));
  }

  /*002. GET-запрос по поиску вопросов с пагинацией, используя query-параметры.*/
  @Get(SETTINGS.QUIZ_QUESTIONS_SA_GET_QUESTION_LIST_PATH)
  @HttpCode(HttpStatus.OK)
  public async getQuestionList(
    @Query() query: GetQuestionListQueryInputDTO
  ): Promise<PaginationMetaDataOutputDTO<QuestionListOutputDTO>> {
    /*Просим шину "QueryBus" найти вопросы.*/
    return this.queryBus.execute(new GetQuestionListQuery(query));
  }

  /*003. PUT-запрос по изменению вопроса по ID, используя URI-параметры.*/
  @Put(SETTINGS.QUIZ_QUESTIONS_SA_UPDATE_QUESTION_BY_ID_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async updateQuestionById(@Param('id') id: string, @Body() body: UpdateQuestionByIdInputDTO): Promise<void> {
    /*Просим шину "CommandBus" изменить вопрос по ID.*/
    await this.commandBus.execute(new UpdateQuestionByIdCommand({ id, ...body }));
  }

  /*004. PUT-запрос по опубликованию или распубликованию вопроса по ID, используя URI-параметры.*/
  @Put(SETTINGS.QUIZ_QUESTIONS_SA_PUBLISH_OR_UNPUBLISH_QUESTION_BY_ID_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async publishOrUnpublishQuestionById(
    @Param('id') id: string,
    @Body() body: PublishOrUnpublishQuestionByIdInputDTO
  ): Promise<void> {
    /*Просим шину "CommandBus" опубликовать или распубликовать вопрос по ID.*/
    await this.commandBus.execute(new PublishOrUnpublishQuestionByIdCommand({ id, ...body }));
  }

  /*005. DELETE-запрос по удалению вопроса по ID, используя URI-параметры.*/
  @Delete(SETTINGS.QUIZ_QUESTIONS_SA_DELETE_QUESTION_BY_ID_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteQuestionById(@Param('id') id: string): Promise<void> {
    /*Просим шину "CommandBus" удалить вопрос по ID.*/
    await this.commandBus.execute(new MarkQuestionAsDeletedByIdCommand(id));
  }
}
