import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Question } from '../../domain/question.entity';
import { QuestionOutputDTO } from '../../api/output-dto/question.output-dto';
import { CreateQuestionCommand } from './create-question.command';
import { QuizzesRepository } from '../../infrastructure/quizzes.repository';

/*Обработчик команды для создания вопроса.*/
@CommandHandler(CreateQuestionCommand)
export class CreateQuestionCommandHandler implements ICommandHandler<CreateQuestionCommand> {
  public constructor(private readonly quizzesRepository: QuizzesRepository) {}

  public async execute({ dto }: CreateQuestionCommand): Promise<QuestionOutputDTO> {
    /*Просим сущность "Question" создать вопрос.*/
    const question: Question = Question.create(dto);
    /*Просим репозиторий "QuizzesRepository" сохранить вопрос в БД.*/
    await this.quizzesRepository.saveQuestion(question);
    /*Преобразовываем вопрос из БД в подготовленный для отправки клиенту вопрос и возвращаем его.*/
    return QuestionOutputDTO.mapFromQuestionToQuestionOutputDTO(question);
  }
}
