import { Query } from '@nestjs/cqrs';
import { GetQuestionListQueryInputDTO } from '../../api/input-dto/query/get-question-list-query.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { QuestionListOutputDTO } from '../../api/output-dto/question.output-dto';

/*Запрос для поиска вопросов.*/
export class GetQuestionListQuery extends Query<PaginationMetaDataOutputDTO<QuestionListOutputDTO>> {
  public constructor(public readonly dto: GetQuestionListQueryInputDTO) {
    super();
  }
}
