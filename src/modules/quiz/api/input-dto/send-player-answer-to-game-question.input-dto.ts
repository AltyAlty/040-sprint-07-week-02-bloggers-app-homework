import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../../core/decorators/transformation/trim.transformation-decorator';

/*Валидационный Input DTO для отправки ответа игрока на вопрос в игре с валидацией при помощи библиотеки
class-validator.*/
export class SendPlayerAnswerToGameQuestionInputDTO {
  @ApiProperty({ example: 'playerAnswerBody', description: 'Player answer body' })
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsString({ message: 'Field "$property" must be a string' })
  public answer: string;
}
