import { Command } from '@nestjs/cqrs';
import { QuestionOutputDTO } from '../../api/output-dto/question.output-dto';
import { CreateQuestionDTO } from './dto/create-question.dto';

/*Команда для создания вопроса.*/
export class CreateQuestionCommand extends Command<QuestionOutputDTO> {
  public constructor(public readonly dto: CreateQuestionDTO) {
    super();
  }
}
