/*Domain DTO для создания вопроса.*/
export class CreateQuestionDomainDTO {
  public body: string;
  public correctAnswers: string[];
  public isPublished?: boolean;
}
