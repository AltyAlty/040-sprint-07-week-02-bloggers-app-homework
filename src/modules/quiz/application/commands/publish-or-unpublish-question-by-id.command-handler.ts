import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Question } from '../../domain/question.entity';
import { PublishOrUnpublishQuestionByIdCommand } from './publish-or-unpublish-question-by-id.command';
import { QuizzesRepository } from '../../infrastructure/quizzes.repository';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';

/*Обработчик команды для опубликования или распубликования вопроса по ID.*/
@CommandHandler(PublishOrUnpublishQuestionByIdCommand)
export class PublishOrUnpublishQuestionByIdCommandHandler implements ICommandHandler<PublishOrUnpublishQuestionByIdCommand> {
  public constructor(private readonly quizzesRepository: QuizzesRepository) {}

  public async execute({ dto }: PublishOrUnpublishQuestionByIdCommand): Promise<void> {
    /*Просим репозиторий "QuizzesRepository" найти вопрос по ID в БД.*/
    const question: Question | null = await this.quizzesRepository.findQuestionById(dto.id);

    /*Если вопрос не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!question)
      throw new DomainException({
        code: DomainExceptionCode.QuestionNotFoundWhilePublishingOrUnpublishing,
        message: 'Question to publish or unpublish not found',
        field: 'id',
      });

    /*Если вопрос не содержит правильных ответов при попытке опубликовать его, то выбрасываем исключение с информацией
    об этом.*/
    if (dto.published && question.correctAnswers.length === 0)
      throw new DomainException({
        code: DomainExceptionCode.CannotPublishQuestionWithoutCorrectAnswers,
        message: 'Cannot publish a question without correct answers',
        field: 'correctAnswers',
      });

    /*Если вопрос уже опубликован или уже распубликован, то ничего не делаем.*/
    if (question.isPublished === dto.published) return;
    /*Если вопрос еще не опубликован или еще не распубликован, то опубликовываем или распубликовываем вопрос.*/
    question.publish(dto.published);
    /*Просим репозиторий "QuizzesRepository" сохранить измененный вопрос в БД.*/
    await this.quizzesRepository.saveQuestion(question);
  }
}
