import { Command } from '@nestjs/cqrs';

/*Команда для soft удаления вопроса по ID.*/
export class MarkQuestionAsDeletedByIdCommand extends Command<void> {
  public constructor(public readonly id: string) {
    super();
  }
}
