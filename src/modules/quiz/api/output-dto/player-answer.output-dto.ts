import { ApiProperty } from '@nestjs/swagger';

/*Output DTO для статуса ответа игрока.*/
export enum PlayerAnswerStatusOutputDTO {
  Correct = 'Correct',
  Incorrect = 'Incorrect',
}

/*Output DTO для ответа игрока.*/
export class PlayerAnswerOutputDTO {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Question ID' })
  public questionId: string;

  @ApiProperty({
    enum: PlayerAnswerStatusOutputDTO,
    enumName: 'PlayerAnswerStatus',
    example: PlayerAnswerStatusOutputDTO.Correct,
    description: 'Answer status',
  })
  public answerStatus: PlayerAnswerStatusOutputDTO;

  @ApiProperty({ example: '2026-08-28T04:16:49.315Z', description: 'Answer date' })
  public addedAt: Date;
}
