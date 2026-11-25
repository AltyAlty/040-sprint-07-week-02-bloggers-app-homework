import { ApiProperty } from '@nestjs/swagger';
import { Question, QuestionList } from '../../domain/question.entity';

/*Output DTO для вопроса.*/
export class QuestionOutputDTO {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Question ID' })
  public id: string;

  @ApiProperty({ example: 'body', description: 'Question body' })
  public body: string;

  @ApiProperty({
    example: ['a', '123'],
    description: 'String array of correct answers to the question',
    type: [String],
  })
  public correctAnswers: string[];

  @ApiProperty({ example: true, description: 'Question publication status' })
  public published: boolean;

  @ApiProperty({ example: '2026-08-28T04:16:49.315Z', description: 'Question creation date' })
  public createdAt: Date;

  @ApiProperty({ example: '2026-08-28T04:16:49.315Z', description: 'Question update date', nullable: true })
  public updatedAt: Date | null;

  /*Маппер для преобразования вопроса из БД в подготовленный для отправки клиенту вопрос.*/
  public static mapFromQuestionToQuestionOutputDTO(question: Question): QuestionOutputDTO {
    const questionOutputDTO: QuestionOutputDTO = new QuestionOutputDTO();
    questionOutputDTO.id = question.id;
    questionOutputDTO.body = question.body;
    questionOutputDTO.correctAnswers = question.correctAnswers;
    questionOutputDTO.published = question.isPublished;
    questionOutputDTO.createdAt = question.createdAt;

    if (question.updatedAt.getTime() === question.createdAt.getTime()) {
      questionOutputDTO.updatedAt = null;
    } else {
      questionOutputDTO.updatedAt = question.updatedAt;
    }

    return questionOutputDTO;
  }

  /*Маппер для преобразования вопросов из БД в подготовленные для отправки клиенту вопросы.*/
  public static mapFromQuestionListToQuestionListOutputDTO(questionList: QuestionList): QuestionListOutputDTO {
    return questionList.map((question: Question): QuestionOutputDTO =>
      this.mapFromQuestionToQuestionOutputDTO(question)
    );
  }
}

/*Output DTO для списка вопросов.*/
export type QuestionListOutputDTO = QuestionOutputDTO[];
