/*Input DTO для разрешенных значений query-параметра "publishedStatus", используемого при фильтрации вопросов по статусу
публикации.*/
export enum PublishedStatusQueryInputDTO {
  All = 'all',
  Published = 'published',
  NotPublished = 'notPublished',
}
