import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Question } from '../../domain/question.entity';
import { UpdateQuestionByIdCommand } from './update-question-by-id.command';
import { QuizzesRepository } from '../../infrastructure/quizzes.repository';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';

/*Обработчик команды для изменения вопроса по ID.*/
@CommandHandler(UpdateQuestionByIdCommand)
export class UpdateQuestionByIdCommandHandler implements ICommandHandler<UpdateQuestionByIdCommand> {
  public constructor(private readonly quizzesRepository: QuizzesRepository) {}

  public async execute({ dto }: UpdateQuestionByIdCommand): Promise<void> {
    /*Просим репозиторий "QuizzesRepository" найти вопрос по ID в БД.*/
    const question: Question | null = await this.quizzesRepository.findQuestionById(dto.id);

    /*Если вопрос не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!question)
      throw new DomainException({
        code: DomainExceptionCode.QuestionNotFoundWhileUpdating,
        message: 'Question to update not found',
        field: 'id',
      });

    /*Если вопрос является опубликованным, то выбрасываем исключение с информацией об этом.*/
    if (question.isPublished)
      throw new DomainException({
        code: DomainExceptionCode.CannotUpdatePublishedQuestion,
        message: 'Cannot update published question',
        field: 'id',
      });

    /*Если вопрос не является опубликованным, то изменяем его.*/
    question.update(dto);
    /*Просим репозиторий "QuizzesRepository" сохранить измененный вопрос в БД.*/
    await this.quizzesRepository.saveQuestion(question);
  }
}
