import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

/*Валидационный Input DTO для опубликования или распубликования вопроса по ID.*/
export class PublishOrUnpublishQuestionByIdInputDTO {
  @ApiProperty({
    example: true,
    description: 'Flag determining whether the question should be published or unpublished',
  })
  @IsBoolean({ message: 'Field "$property" must be a boolean' })
  public published: boolean;
}
