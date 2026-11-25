import { Command } from '@nestjs/cqrs';
import { PublishOrUnpublishQuestionByIdDTO } from './dto/publish-or-unpublish-question-by-id.dto';

/*Команда для опубликования или распубликования вопроса по ID.*/
export class PublishOrUnpublishQuestionByIdCommand extends Command<void> {
  public constructor(public readonly dto: PublishOrUnpublishQuestionByIdDTO) {
    super();
  }
}
