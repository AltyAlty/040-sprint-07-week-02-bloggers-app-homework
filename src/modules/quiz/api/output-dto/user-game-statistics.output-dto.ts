import { ApiProperty } from '@nestjs/swagger';

/*Output DTO для игровой статистики пользователя.*/
export class UserGameStatisticsOutputDTO {
  @ApiProperty({ example: 0, description: 'Total score' })
  public sumScore: number;

  @ApiProperty({ example: 0, description: 'Average score' })
  public avgScores: number;

  @ApiProperty({ example: 0, description: 'Game count' })
  public gamesCount: number;

  @ApiProperty({ example: 0, description: 'Win count' })
  public winsCount: number;

  @ApiProperty({ example: 0, description: 'Loss count' })
  public lossesCount: number;

  @ApiProperty({ example: 0, description: 'Draw count' })
  public drawsCount: number;
}
