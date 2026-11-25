/*DTO для изменения вопроса по ID.*/
export class UpdateQuestionByIdDTO {
  public id: string;
  public body: string;
  public correctAnswers: string[];
}
