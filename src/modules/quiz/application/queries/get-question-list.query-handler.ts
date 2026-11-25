import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QuestionList } from '../../domain/question.entity';
import { PaginationMetaDataOutputDTO } from '../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { QuestionListOutputDTO, QuestionOutputDTO } from '../../api/output-dto/question.output-dto';
import { GetQuestionListQuery } from './get-question-list.query';
import { QuizzesQueryRepository } from '../../infrastructure/quizzes.query-repository';

/*Обработчик запроса для поиска вопросов.*/
@QueryHandler(GetQuestionListQuery)
export class GetQuestionListQueryHandler implements IQueryHandler<GetQuestionListQuery> {
  public constructor(private readonly quizzesQueryRepository: QuizzesQueryRepository) {}

  public async execute({ dto }: GetQuestionListQuery): Promise<PaginationMetaDataOutputDTO<QuestionListOutputDTO>> {
    /*Просим query-репозиторий "QuizzesQueryRepository" найти вопросы в БД.*/
    const { items, totalCount }: { items: QuestionList; totalCount: number } =
      await this.quizzesQueryRepository.findQuestionList(dto);

    /*Преобразовываем вопросы из БД в подготовленные для отправки клиенту вопросы.*/
    const questionListOutput: QuestionListOutputDTO =
      QuestionOutputDTO.mapFromQuestionListToQuestionListOutputDTO(items);

    /*Преобразовываем подготовленные для отправки клиенту вопросы в подготовленные для отправки клиенту с пагинацией
    вопросы и возвращаем их.*/
    return PaginationMetaDataOutputDTO.mapToOutputDTO({
      page: dto.pageNumber,
      pageSize: dto.pageSize,
      totalCount,
      items: questionListOutput,
    });
  }
}
