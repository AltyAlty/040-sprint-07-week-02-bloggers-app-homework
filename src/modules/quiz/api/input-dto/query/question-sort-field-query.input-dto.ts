/*Input DTO для разрешенных значений query-параметра "sortBy", используемого при сортировке вопросов с пагинацией.*/
export enum QuestionSortFieldQueryInputDTO {
  Body = 'body',
  Published = 'published',
  CreatedAt = 'createdAt',
  UpdatedAt = 'updatedAt',
}
