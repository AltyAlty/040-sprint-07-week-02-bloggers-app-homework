import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, Length } from 'class-validator';
import { QUESTION_VALIDATION_CONSTRAINTS } from '../../../../core/validation/constraints/question.validation-constraints';
import { Trim } from '../../../../core/decorators/transformation/trim.transformation-decorator';

/*Валидационный Input DTO для создания вопроса с валидацией при помощи библиотеки class-validator.*/
export class CreateQuestionInputDTO {
  @ApiProperty({ example: 'body', description: 'Question body' })
  @Length(QUESTION_VALIDATION_CONSTRAINTS.BODY.MIN_LENGTH, QUESTION_VALIDATION_CONSTRAINTS.BODY.MAX_LENGTH, {
    message: 'Field "$property" must be between $constraint1 and $constraint2 characters',
  })
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsString({ message: 'Field "$property" must be a string' })
  @Trim()
  public body: string;

  @ApiProperty({
    example: `["a", "123"]`,
    description: 'String array of correct answers to the question',
    type: [String],
  })
  @IsArray({ message: 'Field "$property" must be an array' })
  @IsString({ each: true, message: 'Each element of field "$property" must be a string' })
  public correctAnswers: string[];
}
