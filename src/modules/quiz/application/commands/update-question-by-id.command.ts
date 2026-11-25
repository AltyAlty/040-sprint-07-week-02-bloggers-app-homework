import { Command } from '@nestjs/cqrs';
import { UpdateQuestionByIdDTO } from './dto/update-question-by-id.dto';

/*Команда для изменения вопроса по ID.*/
export class UpdateQuestionByIdCommand extends Command<void> {
  public constructor(public readonly dto: UpdateQuestionByIdDTO) {
    super();
  }
}
