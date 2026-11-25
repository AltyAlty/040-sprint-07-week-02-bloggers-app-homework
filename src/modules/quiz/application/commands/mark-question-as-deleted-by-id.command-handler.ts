import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Question } from '../../domain/question.entity';
import { MarkQuestionAsDeletedByIdCommand } from './mark-question-as-deleted-by-id.command';
import { QuizzesRepository } from '../../infrastructure/quizzes.repository';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';

/*Обработчик команды для soft удаления вопроса по ID.*/
@CommandHandler(MarkQuestionAsDeletedByIdCommand)
export class MarkQuestionAsDeletedByIdCommandHandler implements ICommandHandler<MarkQuestionAsDeletedByIdCommand> {
  public constructor(private readonly quizzesRepository: QuizzesRepository) {}

  public async execute({ id }: MarkQuestionAsDeletedByIdCommand): Promise<void> {
    /*Просим репозиторий "QuizzesRepository" найти вопрос по ID в БД.*/
    const question: Question | null = await this.quizzesRepository.findQuestionById(id);

    /*Если вопрос не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!question)
      throw new DomainException({
        code: DomainExceptionCode.QuestionNotFoundWhileDeleting,
        message: 'Question to delete not found',
        field: 'id',
      });

    /*Если вопрос является опубликованным, то выбрасываем исключение с информацией об этом.*/
    if (question.isPublished)
      throw new DomainException({
        code: DomainExceptionCode.CannotDeletePublishedQuestion,
        message: 'Cannot delete a published question',
        field: 'id',
      });

    /*Если вопрос не является опубликованным, то просим репозиторий "QuizzesRepository" soft удалить его в БД.*/
    await this.quizzesRepository.markQuestionAsDeletedById(id);
  }
}
